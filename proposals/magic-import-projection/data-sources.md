# 万智牌数据源 API 结构复查

> 本文档与 `design.md` 并列，记录四个数据源的 API/数据形态，作为导入管线实现的字段映射依据。
> 「✅」= 已由代码库 schema 或公开文档确认；「❓」= 待核对。

## 0. 来源总览

来源配置来自 `packages/model/src/magic/schema/data/import.ts` 的 `magicImportSources`：

| sourceId | 官方 | 信任 | 状态 | 角色 | URL |
|---|---|---|---|---|---|
| `magic/gatherer` | ✅ | high | enabled | 官方规则、英文 oracle 文本、裁定、multiverse id | https://gatherer.wizards.com |
| `magic/scryfall` | ❌ | high | enabled | 印刷元数据、图片 URI、外部平台 id、结构化合法性 | https://scryfall.com |
| `magic/mtgch` | ❌ | medium | enabled | 简中名称/类别栏/规则文本、本地化印刷表面 | https://mtgch.com |
| `magic/mtgjson` | ❌ | medium | reconcile_only | 批量 JSON 快照、对账、回填候选、诊断 | https://mtgjson.com |

分工结论（来自 design.md §2.4）：
- Scryfall = 主体 + 骨架。
- Gatherer = 官方本地化补充（multiverseId 钩子）。**无官方 API，走逆向 Nuxt hydration**（旧代码 `GathererData` 即逆向结果）。
- MTGCH = 非官方本地化（导出 JSONL 数据集，无网页 API）。
- MTGJSON = 仅 Set 数据。**不作简中来源**：探测（`probe-mtgjson-zhs.ts`）显示其简中覆盖仅 33.9%、2024 后系列几乎全 0%。

---

## 1. Scryfall — 数据主体与骨架

**API 基础**：`https://api.scryfall.com`，GET-only，无鉴权。

### 1.1 Bulk 数据文件 ✅

Bulk data 对象通过 `GET /bulk-data` 获取清单，每个文件有 `download_uri`（每日变化的时间戳），每 12 小时收集一次：

| 文件 | 内容 | 大小（约） |
|---|---|---|
| `oracle_cards` | 每个 oracle_id 一张卡，选最具辨识度的印刷 | 163 MB |
| `default_cards` | 每张卡英文（或仅一种语言的印刷语言） | 509 MB |
| `all_cards` | 每种语言每张卡 | 2.31 GB |
| `rulings` | 全部裁定，通过 `oracle_id` 关联卡牌 | 23.8 MB |
| `unique_artwork` | 含全部独有画作的最小子集 | — |

Bulk data 对象字段：`id`(UUID)、`uri`、`type`、`name`、`description`、`download_uri`、`updated_at`、`size`/`compressed_size`、`content_type`、`content_encoding`（对应 `scryfall/bulk.ts` 的 `IBulkData`）。

**注意**：价格数据 24h 后过期；玩法数据（名称/oracle 文本/费用）更新很慢，按需周更即可。批量文件不分页，整体加载。

### 1.2 Card 对象结构 ✅

对应 `scryfall/card.ts` 的 `RawCard`（单面印刷含全部字段；多面卡含 `card_faces[]`）：

**核心字段**：`id`(UUID)、`oracle_id`(UUID)、`lang`、`multiverse_ids[]`、`arena_id`、`mtgo_id`、`object='card'`、`prints_search_uri`、`ruling_uri`

**玩法字段**：`name`、`oracle_text`、`type_line`、`cmc`、`mana_cost`、`colors`、`color_identity`、`color_indicator`、`power`、`toughness`、`loyalty`、`defense`、`hand_modifier`、`life_modifier`、`keywords[]`、`produced_mana[]`、`layout`、`legalities`、`reserved`、`oversized`、`edhrec_rank`、`penny_rank`、`all_parts[]`、`card_faces[]`

**印刷字段**：`set`、`set_id`、`set_name`、`set_type`、`collector_number`、`rarity`、`released_at`、`frame`、`frame_effects[]`、`border_color`、`card_back_id`、`artist`、`flavor_text`、`flavor_name`、`illustration_id`、`image_uris`、`image_status`、`highres_image`、`finishes[]`、`games[]`、`booster`、`promo`、`promo_types[]`、`full_art`、`textless`、`story_spotlight`、`reprint`、`digital`、`variation`、`variation_of`、`security_stamp`、`watermark`、`prices`、`purchase_uris`、`related_uris`、`preview`

**多面卡**：`card_faces[]` 每个 face 含 `name`、`oracle_text`、`type_line`、`mana_cost`、`power`、`toughness`、`colors`、`color_indicator`、`printed_*` 等。

### 1.3 Set 对象结构 ✅

对应 `scryfall/set.ts` 的 `RawSet`：

`id`(UUID)、`code`、`mtgo_code`、`tcgplayer_id`、`name`、`set_type`、`released_at`、`block_code`、`block`、`parent_set_code`、`card_count`、`printed_size`、`digital`、`foil_only`、`nonfoil_only`、`scryfall_uri`、`uri`、`icon_svg_uri`、`search_uri`

### 1.4 Ruling 对象结构 ✅

对应 `scryfall/card.ts` 的 `RawRuling`：`oracle_id`、`source`、`published_at`、`comment`

### 1.5 分页 List 结构 ✅

对应 `scryfall/basic.ts` 的 `List<T>`：`object='list'`、`has_more`、`next_page`、`data[]`、`warning[]`

### 1.6 映射到本地表

| Scryfall 数据 | 本地表 | 说明 |
|---|---|---|
| oracle_cards | `magic.cards`（version=''） | 结构化 oracle 内容 |
| default_cards | `magic.prints`（version=''，source=''） | 印刷元数据 |
| rulings | `magic.rulings` | 通过 oracle_id |
| sets | `magic.sets` | 骨架 |
| Scryfall `foreign`/多语言 | — | Scryfall 不提供多语言，官方本地化走 Gatherer |

---

## 2. Gatherer — 官方本地化补充

**定位**：Scryfall 缺失的官方各语言本地化，以 `multiverseId` 为钩子。

### 2.1 API 形态 ✅（2026-08-25 探测确认）

Gatherer **没有官方 JSON API**，前端是 **Next.js App Router**，卡数据嵌在 **RSC Flight Data**（`self.__next_f.push`，无 `__NEXT_DATA__`）。

**逆向技术**（探测脚本 `scripts/magic/probe-gatherer-hydration.ts` 验证）：

1. 抓卡页：`https://gatherer.wizards.com/{SET}/{locale}/{number}/{name-kebab}`（如 `/KTK/en-us/217/bribers-purse`；语言段**小写**，`zh-cn` 200 / `zh-CN` 404）。
2. 正则提取所有 `self.__next_f.push([N, "..."])`，JSON 解码每个字符串，按 N 拼接。
3. 在解码后的 flight 数据里定位 `CardData` JSON（brace 匹配），结构与旧代码 `GathererData` 完全一致。
4. **官方本地化（重大发现）**：抓 **EN 页一次**，flight 数据里就嵌入了**全部 10 种语言**的 CardData（各语言自带 multiverseId + 本地化 `instanceName`/`instanceText`，如 zh-cn = 行贿者钱包），**无需逐语言抓页**。
5. 卡页还嵌有 **8-key 列表包装**（`items[]`）——该卡的所有印刷版本（如 KTK 217 + FRF_UGIN 闪传 promo）各有独立 CardData；一个页面可提取 30+ 个 CardData 对象。

卡图仍走：`https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=<id>&type=card`（待确认新站点是否保留）。

### 2.2 Card 数据结构（旧代码 GathererData）✅

对应 `packages/db/src/schema/local/magic/gatherer.ts` 的 `GathererData`：

`resourceId`、`multiverseId`、`kind='CardData'`、`id`、`convertedManaCost`、`cardColor`、`cardNumber`、`cardNumberVariant`、`englishLanguageName`、`instanceName`、`language`（含 `code`、`isoLanguageCode`、`englishName`、`originalName`）、`languageCode`、`nativeLanguageName`、`oracleName`、`nameKebab`、`rarityCode`、`rarityName`、`setCode`、`setName`、`artistName`、`flavorText`、`instanceManaText`、`instanceSubtype`、`instanceText`、`instanceType`、`instanceTypeLine`、`oracleManaText`、`oracleSubtype`、`oracleText`、`oracleType`、`oracleTypeLine`、`oracleTypes[]`、`oracleSubtypes[]`、`oracleSupertypes[]`、`instanceTypes[]`、`instanceSubtypes[]`、`instanceSupertypes[]`、`imageUrls`、`colors[]`、`formatLegalities[]`、`relatedCardInstances[]`、`rulings[]`、`setReleaseDate`、`otherLanguages[]`

**多语言**：`otherLanguages[]` 仅列出该卡可用官方语言（含 code/名称）；各语言的名称/文本需按语言段抓页获取（见 2.1）。

### 2.3 映射到本地表

- 以 `multiverseId` 匹配 `prints` → 写入 `card_localizations` / `card_part_localizations` / `prints` 文本（source = `''`）。

---

## 3. MTGCH (mtgch.com) — 非官方简中本地化

**定位**：民间简中翻译。

### 3.1 数据形态 ✅/❓

两种数据：

1. **每印刷卡数据**（set+number 键）：`MtgchCard`——Scryfall 卡结构 + `zhs_*` 简中字段 + 官方/民间翻译字段。旧代码 `getMtgchCard(set, number)` 按 set+number 取。
2. **`atomic_zhs.json`**（JSONL）：每 oracle 卡的简中数据，含官方与民间翻译。旧代码 `ImportAtomicZhsTask` 导入。

❓ 具体下载端点/文件位置（mtgch.com 站点结构）需实现时核对。

### 3.2 MtgchCard 结构 ✅

对应 `mtgch/card.ts`：

**Scryfall 同构字段**：`id`、`oracle_id`、`name`、`oracle_text`、`type_line`、`mana_cost`、`cmc`、`power`、`toughness`、`loyalty`、`defense`、`colors`、`color_indicator`、`color_identity`、`keywords`、`layout`、`legalities`、`rarity`、`set`、`collector_number`、`released_at`、`frame`、`border_color`、`games`、`finishes`、`image_uris`、`prices`、`related_uris`、`purchase_uris`、`all_parts`、`card_faces`→`other_faces`

**简中字段（zhs_*）**：`zhs_multiverse_id`、`zhs_name`、`zhs_face_name`、`zhs_flavor_name`、`zhs_type_line`、`zhs_text`、`zhs_flavor_text`、`zhs_language`、`zhs_image`、`zhs_image_uris`（small/normal/large）、`zhs_extra`

**官方/民间翻译字段**：`atomic_official_name`、`full_official_name`、`atomic_translated_name`、`full_translated_name`、`atomic_translated_type`、`atomic_translated_text`、`atomic_translated_flavor_name`、`atomic_translated_flavor_text`、`atomic_name_translated_from`、`atomic_text_translated_from`、`atomic_flavor_translated_from`

**内部字段**：`set_translated_name`、`keyrune_code`、`is_extras`、`is_default`、`int_collector_number`、`pinyin`、`pinyin_first_letter`

### 3.3 atomic_zhs 结构 ✅

对应 `mtgch/atomic-zhs.ts` 的 `atomicZhs`：

`oracle_id`、`name`、`released_at`、`set`、`collector_number`、`type_line`、`oracle_text`、`text_updated_at`

- **官方翻译**：`official_name`、`official_text`、`official_updated_at`
- **民间翻译**：`translated_name`、`name_translated_at`、`name_translated_from`、`translated_type`、`translated_text`、`text_translated_at`、`text_translated_from`
- `extra`

### 3.4 映射到本地表

- 民间翻译（`translated_*` / `zhs_*` 中的民间部分）→ `card_localizations`（source = `mtgch`）。
- ❓ **重叠问题**：MTGCH 数据内嵌 `atomic_official_*` / `official_*`（官方翻译），与 Gatherer 提供的官方来源重叠。design.md 分工是「官方→Gatherer、民间→MTGCH」，实现时需决定是否忽略 MTGCH 内的官方字段，还是也利用。

---

## 4. MTGJSON (mtgjson.com) — Set 数据补充

**定位**：Set 相关数据（以 Scryfall 为骨架），`reconcile_only`，暂不涉 card。

### 4.1 文件模型 ✅

单集文件：`https://mtgjson.com/api/v5/{SET_CODE}.json`（如 `HTR.json`）。

通用文件模型：`{ meta: Meta, data: Record<string, Set> }`（Set 数据模型按 set code 索引）。

常用全量文件：`AllPrintings`（全部集含印刷）、`AtomicCards`（按 name 索引）、`SetList`（集元数据）、`AllIdentifiers`（按 uuid 索引）。

### 4.2 Set 数据结构

Set 级：`name`、`code`、`block`、`releaseDate`、`isFoilOnly`、`isNonFoilOnly`、`baseSetSize`、`totalSetSize`、`cardCount` 等。

Card 级（Set 数据模型内）：`uuid`、`id`、`layout`、`name`、`names`、`manaCost`、`cmc`、`colors`、`colorIdentity`、`type`、`superTypes`、`types`、`subtypes`、`rarity`、`text`、`flavor`、`artist`、`number`、`power`、`toughness`、`loyalty`、`multiverseId`、`variations`、`watermark`、`border`、`keywords`、`frameEffects`、`isFullArt`、`isPromo`、`isFoil`、`edhrecRank`、`faceConvertedManaCost`、`releaseDate`、`starter`、`reserved` 等。

### 4.3 映射

- Set 级 → `magic.sets`（以 Scryfall 为骨架，MTGJSON 补充字段/对账）。
- Card 级：P0 不写，写入需字段 allowlist（`reconcile_only`）。

### 4.4 简中充分性探测（2026-08-24 数据）

`scripts/magic/probe-mtgjson-zhs.ts` 全量扫描 AllPrintings 结果：

- 868 系列、英文卡 110,198 张，简中可用 37,360 张（**整体 33.9%**）。
- 仅 **155/868** 系列含任何简中，且全部集中在 2018-2023 窗口（RIX/DOM/M19/ONE/MOM ≈ 82-100%）。
- **2024+ 无简中 = 正常**：官方已停止发售简中版。
- **2017 之前（含上世纪历史系列）MTGJSON 几乎无简中 = 数据缺口**：官方简中上个世纪就有，MTGJSON foreignData 只覆盖了近期一小段。

**结论**：MTGJSON 缺了绝大多数历史系列的官方简中，**不能作为官方简中来源**。官方简中走 Gatherer 逆向；民间简中走 MTGCH 导出；两者正好互补。

---

## 5. 映射总览（source/version 维度）

| 目标 | 结构化内容 | 本地化（source=''） | 本地化（source='mtgch'） |
|---|---|---|---|
| `cards`（version=''） | Scryfall oracle | — | — |
| `card_localizations` | — | Gatherer（multiverseId 钩子） | MTGCH `translated_*` |
| `prints`（version=''） | Scryfall default | Gatherer | MTGCH `zhs_*` |
| `sets` | Scryfall + MTGJSON | — | — |
| `rulings` | Scryfall | — | — |

## 6. 待确认项

- ❓ mtgch.com 具体下载端点 / atomic_zhs.json 位置与更新频率。
- ❓ Gatherer 结构化 JSON 源的可用性（旧代码 `GathererData` 对应端点）。
- ❓ MTGCH 内嵌 `atomic_official_*` 与 Gatherer 官方来源的重叠处理。
- ❓ Scryfall bulk 文件选择：`oracle_cards` + `default_cards`（+`rulings`）即可，还是需要 `all_cards`。
- ❓ MTGJSON Set 数据是否与 Scryfall sets 并集，还是仅对账补充。

---

## 7. 字段增量对比（Scryfall / MTGJSON vs 当前 schema）

> 依据：Scryfall Card/Set 对象文档（`/docs/api/cards`、`/docs/api/sets`）、MTGJSON Set/Card(Set) Data Model（`/data-models/set/`、`/data-models/card/card-set/`）。
> 当前事实表：`shared/magic/card.ts`、`print.ts`、`set.ts`、`ruling.ts`。

### 7.0 分类原则（用户确认）

- **一次性布尔标志** → 归入 `cards.tags` 数组（如 `reserved`、`game_changer`、`oversized`），不加独立列。
- **频繁变化的数据**（排名/评分类）→ 暂不收录，或独立表收录（不放入事实表主行）。
- **稳定的事实字段** → 才考虑作为列加入事实表。

### 7.1 tags / 合法性归属（照旧代码 `source/`）

| 字段 | 归属 | 说明 |
|---|---|---|
| `reserved` | 卡级 `cards.tags` | Reserved List |
| `full_art` | 印刷级 `prints.printTags` → `full-art` | |
| `oversized` | 印刷级 `prints.printTags` → `oversized` | 超大牌 |
| `story_spotlight` | 印刷级 `prints.printTags` → `story-spotlight` | |
| `textless` | 印刷级 `prints.printTags` → `textless` | |
| `game_changer` | **合法性状态**（banlistStatusOrder） | 非 tags |

> 旧代码还推导 `dev:token`、`dev:counter` 两个卡级 tags（oracle 文本正则）。

### 7.2 稳定事实字段（最终确认）

**`cards`**
| 字段 | 类型 | 来源 | 说明 |
|---|---|---|---|
| `resourceId` | text | Scryfall `resource_id`（文档化，探测 5.87%，滚动上线中） | 稳定资源 id，可空列 |

**`prints`**
| 字段 | 类型 | 来源 | 说明 |
|---|---|---|---|
| `resourceId` | text | Scryfall `resource_id` | 稳定资源 id，可空列 |
| `artistIds` | uuid[] | Scryfall `artist_ids`（文档化，探测 99.8%） | |
| `illustrationId` | uuid | Scryfall `illustration_id`（文档化，探测 98.3%） | 单面卡画作 id |
| `variation` | boolean | Scryfall `variation`（文档化，探测 100%） | 变体印刷 |
| `variationOf` | uuid | Scryfall `variation_of`（文档化，探测 0.03%） | 变体指向，可空列 |

**已剔除**
- `foil`/`nonfoil`：已被 `finishes` 覆盖。
- `image_updated_at`：**未文档化**（疑似内部/兼容字段），不加。
- `asciiName`/`otherFaceIds`/`hasAlternativeDeckLimit`/`leadershipSkills`：MTGJSON 独有，本轮 MTGJSON 暂不涉卡，不加。

### 7.3 频繁变化数据（暂不收或独立表）

| 字段 | 来源 | 说明 |
|---|---|---|
| `edhrecRank` | Scryfall `edhrec_rank` / MTGJSON | EDHREC 排名 |
| `edhrecSaltiness` | MTGJSON | EDHREC 争议度 |
| `pennyRank` | Scryfall `penny_rank` | Penny 排名 |
| `prices` | Scryfall | 价格，24h 过期 |

> 若收录，倾向独立表（如 `card_stats`/`card_rankings`），按快照时间刷新，不进事实表主行。

### 7.4 其余 MTGJSON 印刷标志（未定）

`is_timeshifted`、`is_funny`、`is_online_only`、`is_alternative` —— 旧代码无先例，未定是否收录/走 printTags。

> 注：`reserved`（Scryfall）/`isReserved`（MTGJSON）是**同一概念**（Reserved List），卡牌级属性，仅一条，入 `cards.tags`。

### 7.5 版本相关（未来版本功能用，暂不进列）

MTGJSON：`isRebalanced`、`rebalancedPrintings[]`、`originalPrintings[]`、`originalReleaseDate`、`originalText`、`originalType`。

> 与「性质分裂 → 两张牌」/ 未来版本相关，暂定不加入本轮。

### 7.6 `sets` 新增候选

| 字段 | 类型 | 来源 | 说明 |
|---|---|---|---|
| `isOnlineOnly` / `isPaperOnly` / `isForeignOnly` | boolean | MTGJSON | 分发渠道 |
| `keyruneCode` | text | MTGJSON | |
| `mcmId` / `mcmName` | integer/text | MTGJSON | cardmarket |
| `cardsphereSetId` | integer | MTGJSON | |
| `tcgplayerGroupId` | integer | MTGJSON | |
| `tokenSetCode` | text | MTGJSON | |
| `isPartialPreview` | boolean | MTGJSON | |

### 7.7 已修改字段（MTGJSON 弃用）

- `convertedManaCost` → `manaValue`（我们已用 `manaValue` ✅）
- `faceConvertedManaCost` → `faceManaValue`（我们 `card_parts.manaValue` 对应，无冲突 ✅）

### 7.8 明确不纳入

- `prices` / `purchase_uris` / `related_uris`：价格过期、链接属前端展示。
- `foreignData`（MTGJSON 多语言）：官方本地化走 Gatherer。

---

**参考资料**
- [Scryfall Bulk Data 文档](https://scryfall.com/docs/api/bulk-data)
- [Scryfall API — Card 对象](https://scryfall.com/docs/api/cards)
- [Scryfall API — Set 对象](https://scryfall.com/docs/api/sets)
- [MTGJSON Data Models — Set](https://mtgjson.net/data-models/set/)
- [MTGJSON Data Models — Card (Set)](https://mtgjson.net/data-models/card/card-set/)
- [MTGJSON Getting Started](https://mtgjson.net/getting-started/)
- [MTGJSON All Files](https://mtgjson.net/downloads/all-files/)
