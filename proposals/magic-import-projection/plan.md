# 万智牌卡牌导入与投影 — 实现计划

## TODO

- [x] 1. Schema：事实表主键加入 version/source
- [x] 2. Schema：新增 slug 标注表（magic_data）
- [x] 3. Schema：扩充 magic_data.scryfall 导入表 + 事实表新列
- [x] 4. 更新 Zod model 定义
- [ ] 5. 生成数据库迁移（commit 前生成，合并为一次）
- [ ] 6. 数据源接入：Scryfall 拉取与解析
- [ ] 7. 数据源接入：Gatherer / MTGCH / MTGJSON
- [ ] 8. 匹配与 cardId 分配（含冲突预识别）
- [ ] 9. 投影纯函数 + 单卡测试
- [ ] 10. 导入管线接入任务系统（runs / change sets / apply）
- [ ] 11. 控制台 UI（data-source 页）
- [ ] 12. API 复查与数据来源分工定稿

---

## 1. Schema：事实表主键加入 version/source

位置：`packages/db/src/schema/shared/magic/card.ts`、`print.ts`

- `cards`：新增 `version` text NOT NULL default `''`，主键 `(cardId, version)`。
- `card_localizations`：新增 `version`、`source` text NOT NULL default `''`，主键 `(cardId, version, locale, source)`。
- `card_parts`：新增 `version`，主键 `(cardId, version, partIndex)`。
- `card_part_localizations`：新增 `version`、`source`，主键 `(cardId, version, locale, source, partIndex)`。
- `prints`：新增 `version`、`source`，主键 `(cardId, version, set, number, lang, source)`。
- `print_parts`：新增 `version`、`source`，主键 `(cardId, version, set, number, lang, source, partIndex)`。

同步更新 join view（`card_print_view`、`card_editor_view`）的 join 键与 select 列。

## 2. Schema：新增 slug 标注表（magic_data）

位置：`packages/db/src/schema/local/magic/`

新增 `card_slug_annotations` 表（dataSchema）：

- `slug` text PK
- `oracleId` uuid NOT NULL
- `reason` text（如 `split_of_nature` / `duplicate_name`）
- `notes` text
- `createdAt` / `updatedAt` timestamp

用于记录人工拆卡的语义化 slug 与 oracle 对象的映射，供匹配阶段查询。

## 3. Schema：扩充 magic_data.scryfall 导入表 + 事实表新列

### 3.1 扩充导入表 `magic_data.scryfall`

位置：`packages/db/src/schema/local/magic/scryfall.ts`

从仅 `cardId`/`oracleId`/`legalities` 三列，扩为 Scryfall card 对象全字段显式列（对照旧代码 mongoose schema）：

- 核心：`lang`、`arenaId`、`mtgoId`、`mtgoFoilId`、`multiverseIds`、`tcgplayerId`、`tcgplayerEtchedId`、`cardmarketId`
- 玩法：`layout`、`name`、`oracleText`、`typeLine`、`manaCost`、`cmc`、`colors`、`colorIdentity`、`colorIndicator`、`keywords`、`producedMana`、`legalities`、`power`、`toughness`、`loyalty`、`defense`、`handModifier`、`lifeModifier`、`reserved`、`oversized`、`gameChanger`、`contentWarning`、`edhrecRank`、`pennyRank`、`allParts`、`cardFaces`、`resourceId`
- 印刷：`set`、`setId`、`setName`、`setType`、`collectorNumber`、`rarity`、`releasedAt`、`frame`、`frameEffects`、`borderColor`、`cardBackId`、`artist`、`artistIds`、`flavorText`、`flavorName`、`illustrationId`、`imageUris`、`imageStatus`、`highresImage`、`finishes`、`games`、`booster`、`promo`、`promoTypes`、`fullArt`、`textless`、`storySpotlight`、`reprint`、`digital`、`variation`、`variationOf`、`securityStamp`、`watermark`、`attractionLights`、`printedName`、`printedText`、`printedTypeLine`、`preview`、`prices`、`purchaseUris`、`relatedUris`
- `createdAt` / `expiresAt`

### 3.2 事实表新列（API 复查确认的稳定字段）

- `cards`：`resourceId` text 可空（Scryfall `resource_id`，文档化）。
- `prints`：`variation` boolean、`variationOf` uuid 可空、`artistIds` uuid[]、`illustrationId` uuid 可空、`resourceId` text 可空。

> 不纳入：`foil`/`nonfoil`（`finishes` 覆盖）、`image_updated_at`（未文档化）、MTGJSON 独有字段（本轮不涉卡）、频繁变化数据（edhrec/prices）。

## 4. 更新 Zod model 定义

位置：`packages/model/src/magic/schema/`

- `card.ts` / `print.ts`：各事实表 schema 加入 `version` / `source` 字段。
- `card.ts`：`card` 加入 `resourceId`；`print.ts`：`print` 加入 `variation` / `variationOf` / `artistIds` / `illustrationId` / `resourceId`。
- 新增 slug 标注相关 schema。

## 5. 生成数据库迁移（commit 前生成）

- 使用 `drizzle-kit generate` 生成迁移 SQL，确认包含：fact 表加列 + 主键变更、新标注表、view 重建。
- **合并为一次迁移**（schema 改动全部就绪后再生成）。

## 6. 数据源接入：Scryfall 拉取与解析

位置：`apps/service-desktop-runtime/src/lib/magic/`

- bulk 拉取（oracle_cards / default_cards / rulings / sets）。
- 解析为原始记录，写入 `import_raw_records`（sourceId = `magic/scryfall`）。
- 参考旧代码 loader（BulkGetter / CardLoader / RulingLoader / SetGetter）。

## 7. 数据源接入：Gatherer / MTGCH / MTGJSON

- Gatherer：按 multiverseId 拉取官方本地化，写入 `card_localizations`（source = `''`）。
- MTGCH：民间简中本地化，写入 `card_localizations`（source = `mtgch`）。
- MTGJSON：仅 Set 数据，以 Scryfall 为骨架补充。

## 8. 匹配与 cardId 分配（含冲突预识别）

- `cardId = slug(normalized 英文名)`。
- 批次内构建 `slug → oracle 对象` 映射；同名不同 oracle 对象 → 冲突候选进审核。
- 审核确认后：合并或拆卡（分配语义化 slug，写入标注表）。

## 9. 投影纯函数 + 单卡测试

位置：`apps/service-desktop-runtime/src/lib/magic/project/`

- 实现 `projectExtractedCard` 式纯函数：输入快照 + 上下文 → 输出事实表投影结果。
- 配套单卡测试夹具（bun:test，无数据库）。

## 10. 导入管线接入任务系统

- 定义 magic 导入任务（阶段：拉取 → 解析 → 匹配 → 投影 → 变更集 → 应用）。
- 复用现有任务系统与导入 schema（runs / change sets / field changes / apply logs）。
- 字段规则 / 决策模式（auto_apply / batch_review / manual_review）。

## 11. 控制台 UI（data-source 页）

位置：`apps/site-console/app/pages/magic/data-source.vue`（或现有页扩展）

- 导入源管理、导入运行、冲突审核、变更集审阅。

## 12. API 复查与数据来源分工定稿

- 逐源核对 Scryfall / Gatherer / MTGCH / MTGJSON API 字段与钩子。
- 定稿 §2.4 数据来源分工，更新设计文档与 CONTEXT.md。

---

## 实现顺序

**Phase 1 — 数据层**（task 1-5）：schema + model + 迁移
**Phase 2 — 数据源**（task 6-7）：各源拉取与解析
**Phase 3 — 匹配与投影**（task 8-9）：cardId 分配 + 投影纯函数 + 单卡测试
**Phase 4 — 管线与审核**（task 10-11）：任务系统接入 + 控制台 UI
**Phase 5 — 定稿**（task 12）：API 复查后更新分工
