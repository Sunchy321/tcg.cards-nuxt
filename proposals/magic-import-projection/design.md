# 万智牌卡牌导入与投影 — 设计文档

## 1. 背景与目标

万智牌（magic）站点目前只移植了基础 schema，卡牌数据的**导入 + 投影**尚未实现。本次设计需要同时解决三个问题：

1. **导入 + 投影**：从数据源拉取并投影到事实表，尚未实现。
2. **版本**：少数卡牌存在「效果被多次修改」的情况（hearthstone 式增强/削弱），投影需要预留版本维度。
3. **同语言多来源**：同一语言可能来自不同来源（官方简中 vs 民间简中），需要区分、共存，且方案要通用到游戏王等更多来源的游戏。

本文档固化领域模型与目标 schema，供后续评审与实现。

## 2. 核心概念（领域模型）

### 2.1 cardId（卡牌身份）

- cardId 是卡牌跨版本的**稳定身份**，默认由英文名 normalize 后取 slug 得到。
- 不变量：**同 cardId 必须逻辑上视为同一张牌**。即使 slug 无法可靠推导（重名、改名），该不变量仍成立。
- 同名冲突（不同 oracle 对象归到同一 slug）时，整组进入导入审核，由人工确认是合并还是拆卡，绝不静默合并、也不允许主键冲突。

### 2.2 card version（卡牌版本）

- 「版本」= 一张牌的效果被多次修改（hearthstone 式前后对比），**不是**「同一张牌的多个印刷」。
- base 版本不带日期；后续版本各带一个生效日期。日期即版本标识。
- 纸牌被重平衡成线上牌属于**性质分裂**（线上用线上版、线下用纸质版），应作为**两张独立卡牌**，不是版本。
- 版本数据来源：Scryfall 不记录纯线上牌的平衡改动历史，因此**版本数据由未来手工录入，不属于本次导入任务**。本次导入只产生 base 状态（version 为空串）。
- 每个版本是**完整记录**（全套字段），不做 delta 存储。

### 2.3 localization source（本地化来源）

- `source` 维度**只挂在本地化层**（名称/类别栏/异能文本），结构化字段（费用/攻防/颜色/关键词）不区分来源。
- `source` 为 text 列，`''` = 官方（前端不显示标记），`mtgch` = 民间简中（前端显示来源标签）。
- 来源集合**每游戏固定**，不是导入来源清单；新增来源不迁移（纯文本行）。
- 前端**并排显示所有（语言 × 来源）组合**，不自动只选一个。
- 印刷的本地化保持平铺行（可参与查询），不使用 JSON。

### 2.4 data source ownership（数据来源分工）

| 来源 | 职责 | 状态 |
|------|------|------|
| Scryfall | 绝大多数卡牌数据 + 数据骨架（oracle 卡、印刷、系列、裁定） | 确认 |
| Gatherer | Scryfall 缺失的**官方本地化**，以 multiverseId 为钩子；无官方 API，**逆向 Nuxt hydration** 提取 | 确认 |
| MTGCH | 非官方本地化（导出 JSONL 数据集，无网页 API） | 确认 |
| MTGJSON | Set 相关数据（仍以 Scryfall 为骨架）；**不作简中来源**（简中覆盖仅 33.9%，且局限 2018-2023 窗口，缺历史与 2024 后） | 确认 |

> 探测依据：`scripts/magic/probe-mtgjson-zhs.ts`（见 data-sources.md §4.4）。

## 3. 目标 Schema

### 3.1 事实表主键（version + source 进主键）

| 表 | 主键 |
|---|---|
| `magic.cards` | `(cardId, version)` |
| `magic.card_localizations` | `(cardId, version, locale, source)` |
| `magic.card_parts` | `(cardId, version, partIndex)` |
| `magic.card_part_localizations` | `(cardId, version, locale, source, partIndex)` |
| `magic.prints` | `(cardId, version, set, number, lang, source)` |
| `magic.print_parts` | `(cardId, version, set, number, lang, source, partIndex)` |

- `version`：base = `''`，未来版本 = 日期字符串。**本次迁移即加入**（即使当前导入只写空串），以减少未来迁移次数。
- `source`：官方 = `''`，民间 = `mtgch`。仅本地化相关表包含。
- 结构化字段仍单一权威来源，`cards` 的 Oracle 内容不分来源。

### 3.2 slug 手动标注表（magic_data）

新增 `magic_data.card_slug_annotations`（slug ↔ oracle_id 手动标注）：

- 用于解决同名冲突：匹配阶段发现同一 slug 对应多个不同 oracle 对象时，整组进入审核，不自动落库。
- 人工确认拆卡后，指定语义化 slug（如 `-alchemy`、`-token` 后缀），记录在本表。
- 保证主键永不冲突、且同 cardId = 同一张牌。

## 4. 导入管线设计

### 4.1 运行位置

- 与 hearthstone 对齐：跑在 `service-desktop-runtime` + 本地数据库，使用现有任务系统（executor/scheduler/worker），控制台触发。

### 4.2 阶段划分

完整管线，走现有导入 schema（`magic_data.import_sources` / `import_rule_sets` / `import_field_rules` / `import_runs` / `import_raw_records` / `import_change_sets` / `import_field_changes` / `import_apply_logs`）：

1. **拉取**：从 Scryfall bulk / Gatherer / MTGCH 拉取原始数据（MTGJSON 仅 Set）。
2. **解析**：解析为原始记录（`import_raw_records`）。
3. **匹配**：将记录归并到 cardId / print / set；同名冲突预识别（见 4.3）。
4. **投影**：纯函数将「卡牌快照 + 上下文」投影为事实表行（见 4.4）。
5. **变更集与审核**：生成 `import_change_sets` / `import_field_changes`，按字段规则与决策模式走审核/自动应用。
6. **应用**：通过 `import_apply_logs` 写入事实表。

### 4.3 匹配与 cardId 分配

- 默认 `cardId = slug(normalized 英文名)`。
- 批次内建立 `slug → oracle 对象` 映射：
  - 同一 slug 仅一个 oracle 对象 → 直接归属该 cardId。
  - 同一 slug 多个**不同** oracle 对象 → 整组标记「cardId 待定 + 冲突候选」，进入审核，不自动落库。
- 审核决策：合并（同卡，scryfallOracleId 累积）或拆卡（分配语义化 slug，写入标注表）。

### 4.4 投影（纯函数 + 单卡测试）

- 沿用 hearthstone 的投影模式：`projectExtractedCard` 式纯函数，输入卡牌快照 + 上下文，输出完整投影结果。
- 配套「单卡测试」夹具（bun:test，无数据库），投影行为变更时重新生成夹具。

## 5. 待确认项

- **API 复查**：逐源核对 Scryfall / Gatherer / MTGCH / MTGJSON 的具体字段与钩子（multiverseId、oracle_id、set 数据形态），再最终定稿数据来源分工与字段映射。
- **版本手工功能**：未来设计（`version` 列已预留；公告如需前后对比，在 `card_update` 条目内部设计，不加公告级 version/lastVersion）。
- **印刷本地化拆分细节**：`prints` 平铺行 + `source` 的写入路径。

## 6. 关联文档

- `CONTEXT.md` — Magic 段（cardId / card version / localization source / data source ownership / slug annotation）。
- `docs/adr/0001-magic-cardid-identity.md` — cardId 身份模型决策。
