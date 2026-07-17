# Data Schema

本文件定义当前 JSON 契约。初始化数据已写入 `assets/data`，TypeScript 类型位于 `assets/scripts/data/GameDataTypes.ts`，跨文件不变量校验位于 `assets/scripts/data/GameDataValidator.ts`。数据尚未接入启动流程；接入时仍必须先解码未知输入，再运行结构和引用校验。

## 通用规则

- ID 使用稳定的英文 `snake_case`，发布后不因显示名称变化而修改。
- 用户可见文本只存本地化键。
- JSON 不包含注释、函数、引擎对象或平台路径。
- 金额和计数使用整数。
- 引用的 ID 必须在启动时验证存在。
- 未知字段的处理策略由 `schemaVersion` 决定，不静默吞掉关键错误。

## `items.json`

```json
{
  "schemaVersion": 1,
  "items": [
    {
      "id": "mistleaf_seed",
      "displayNameKey": "item.mistleaf_seed.name",
      "type": "seed",
      "maxStack": 99,
      "buyPrice": 20,
      "sellPrice": 10,
      "cropId": "mistleaf"
    },
    {
      "id": "mistleaf",
      "displayNameKey": "item.mistleaf.name",
      "type": "crop",
      "maxStack": 99,
      "buyPrice": 0,
      "sellPrice": 30
    }
  ]
}
```

`buyPrice`/`sellPrice` 仅为未来兼容字段，MVP 不实现交易。`mistleaf`（雾叶草）已确认为 MVP 原创开发代号。

当前类型：`tool | seed | crop | material`。锄头和水壶既在 `items.json` 中占背包槽，也通过稳定 `toolId` 引用 `tools.json` 的行为定义。

阶段 15A 接入旧矿道前，`items.json` 增加 `tool_pickaxe`、`academy_practice_wand` 与材料 `mist_iron_ore`；两件工具仍使用 `type: "tool"`，矿石使用 `type: "material"`。当前 Demo 不因矿石存在而启用 `buyPrice`、`sellPrice`、锻造或装备栏。

## `crops.json`

```json
{
  "schemaVersion": 1,
  "crops": [
    {
      "id": "mistleaf",
      "seedItemId": "mistleaf_seed",
      "harvestItemId": "mistleaf",
      "growthStages": [1, 1, 1],
      "harvestQuantity": 1,
      "requiresWater": true,
      "allowedSeasons": ["all"]
    }
  ]
}
```

`growthStages` 表示每个阶段需要的有效生长日，不在数据中存贴图路径；表现资源通过独立映射或 Cocos 资源引用管理。

## `tools.json`

```json
{
  "schemaVersion": 1,
  "tools": [
    {
      "id": "hoe_basic",
      "displayNameKey": "tool.hoe_basic.name",
      "action": "till",
      "rangeTiles": 1
    },
    {
      "id": "watering_can_basic",
      "displayNameKey": "tool.watering_can_basic.name",
      "action": "water",
      "rangeTiles": 1
    }
  ]
}
```

MVP 不实现耐久、升级、水量或范围强化。

阶段 15A 在 schema 演进中增加工具动作 `mine` 与 `attack`。`tool_pickaxe` 使用 `mine/rangeTiles=1`；`academy_practice_wand` 使用 `attack/rangeTiles=3`。动作 ID 是领域语义，不是键盘键名或 Cocos 按钮节点名。

## `maps.json`

```json
{
  "schemaVersion": 1,
  "maps": [
    {
      "id": "mvp_farm",
      "displayNameKey": "map.mvp_farm.name",
      "widthTiles": 30,
      "heightTiles": 30,
      "tileSizePixels": 32,
      "spawnTile": { "x": 15, "y": 18 },
      "sleepTile": { "x": 15, "y": 22 },
      "farmableArea": {
        "min": { "x": 5, "y": 5 },
        "max": { "x": 14, "y": 14 }
      }
    }
  ]
}
```

上述 schema 1 和 `mvp_farm` 是技术 MVP 历史事实。`tileSizePixels: 32` 继续作为地图基准，但 `mvp_farm` 不得直接改名冒充正式 Demo 地图。

阶段 10B 已锁定计划中的 schema 2 地图身份和连接语义：

```json
{
  "schemaVersion": 2,
  "maps": [
    {
      "id": "home_interior",
      "displayNameKey": "map.home_interior.name",
      "widthTiles": 20,
      "heightTiles": 12,
      "tileSizePixels": 32,
      "safeAnchorId": "home_bed"
    },
    {
      "id": "hometown_main",
      "displayNameKey": "map.hometown_main.name",
      "widthTiles": 64,
      "heightTiles": 48,
      "tileSizePixels": 32,
      "safeAnchorId": "main_safe_spawn"
    },
    {
      "id": "boundary_pass",
      "displayNameKey": "map.boundary_pass.name",
      "widthTiles": 40,
      "heightTiles": 24,
      "tileSizePixels": 32,
      "safeAnchorId": "boundary_entry"
    },
    {
      "id": "old_mine",
      "displayNameKey": "map.old_mine.name",
      "widthTiles": 32,
      "heightTiles": 24,
      "tileSizePixels": 32,
      "safeAnchorId": "mine_safe_return"
    }
  ],
  "portals": [
    {
      "id": "home_to_main",
      "fromMapId": "home_interior",
      "toMapId": "hometown_main",
      "targetAnchorId": "main_home_door",
      "conditionId": "opening.elderConversationCompleted"
    },
    {
      "id": "main_to_boundary",
      "fromMapId": "hometown_main",
      "toMapId": "boundary_pass",
      "targetAnchorId": "boundary_entry",
      "conditionId": "world.boundaryRouteAvailable"
    },
    {
      "id": "main_to_old_mine",
      "fromMapId": "hometown_main",
      "toMapId": "old_mine",
      "targetAnchorId": "mine_entry",
      "conditionId": "world.oldMineAvailable"
    }
  ]
}
```

示例只表达稳定 ID、初始灰盒预算和单向入口；实现时必须同时配置反向入口、锚点唯一性与目标存在校验。地图最终尺寸可在阶段 11 按 4 格倍数微调。碰撞、可耕区、入口和锚点优先来自明确对象层或独立配置，不能在多个组件中重复维护坐标。`old_mine` 不连接 `boundary_pass` 或 `home_interior`。

## 计划中的矿脉与敌人数据

阶段 15A 冻结实际文件名和 schema 版本前，以下只表达已确认字段语义，不授权现在创建运行时 JSON：

```json
{
  "oreNodes": [
    {
      "id": "ore_vein_common",
      "requiredToolAction": "mine",
      "hitPoints": 3,
      "yieldItemId": "mist_iron_ore",
      "yieldQuantity": 1
    }
  ],
  "enemies": [
    {
      "id": "enemy_cave_mote",
      "maxHealth": 3,
      "contactDamage": 1,
      "perceptionRangeTiles": 5
    }
  ]
}
```

- 地图实例必须另有稳定 `nodeId` 或 `encounterId`；定义 ID 不能代替实例 ID。
- 矿脉产物必须引用 `items.json` 的材料，命中次数为正整数。
- 敌人生命和伤害为正整数；普通敌人数据不得引用战争残响或隐藏真相分类。
- 表现资源、动画、声音和 Cocos UUID 不进入领域定义。
- 当前切片只有一类矿脉和一类敌人；新增定义属于范围变更，不是简单补数据。

## 计划中的第一处异常配置与叙事状态

阶段 10D 已锁定 `boundary_pass` 的第一处异常，但当前尚未创建运行时 JSON、解码器或通用事件系统。阶段 15B 实现时应使用稳定语义配置连接地图锚点、叙事状态与表现配置，不把世界坐标、Cocos UUID、文件路径或音频路径写进剧情状态机。

建议的最小配置形状：

```json
{
  "schemaVersion": 1,
  "anomalies": [
    {
      "id": "anomaly.first_barrier_fold",
      "mapId": "boundary_pass",
      "triggerZoneId": "boundary_probe",
      "requiredFacing": "up",
      "actionId": "interact",
      "conditionId": "world.boundaryRouteAvailable",
      "observedFlagId": "mystery.firstBarrierObserved",
      "presentationId": "presentation.boundary.first_fold",
      "returnAnchorId": "boundary_return",
      "clueId": "clue.boundary.returned_ribbon",
      "clueAnchorId": "boundary_clue"
    }
  ]
}
```

该配置只描述稳定引用和触发契约。完整节拍、晏巡对白、旧界碑/路标布状态、画质回退和中断恢复见 `docs/FIRST_BARRIER_ANOMALY.md`。

阶段 14～15 冻结叙事 schema 时，SaveData v2 至少需要能区分以下稳定事实：

```text
world.boundaryRouteAvailable
mystery.firstBarrierObserved
mystery.boundaryRibbonInspected
demo.milestoneReached
```

`armed`、`presenting`、当前雾层进度、摄像机偏移、音频淡化和 NPC 演出控制权都是瞬态表现状态，不得保存。若事件在提交前中断，可以从上次稳定存档重新触发；若 `mystery.firstBarrierObserved=true`，读档不得重播完整首次演出，并应在位置无效时回退 `boundary_return`。

`mystery.firstBarrierObserved` 只表示玩家见过第一处异常，不等于已经进入主动调查期，更不能自动设置最终真相期。后续调查必须使用新的显式事件和玩家选择。

## `localization.json`

```json
{
  "schemaVersion": 1,
  "defaultLocale": "zh-CN",
  "locales": {
    "zh-CN": {
      "item.mistleaf_seed.name": "雾叶草种子",
      "item.mistleaf.name": "雾叶草",
      "tool.hoe_basic.name": "旧锄头",
      "tool.watering_can_basic.name": "小水壶",
      "map.mvp_farm.name": "山雾药圃"
    }
  }
}
```

实现时可拆分每种语言文件，避免单文件膨胀。

## 计划中的角色与对话数据

以下契约属于阶段 13 的已确认设计，当前尚未写入 `assets/data`，也没有运行时解码器。实现时必须像现有物品/作物数据一样先把 JSON 当作未知输入解码，再进行跨文件引用校验。

### `PortraitState`

```ts
export type PortraitDirection = 'left' | 'right';

export interface PortraitState {
  readonly characterId: string;
  readonly expression: string;
  readonly pose?: string;
  readonly costume?: string;
  readonly effect?: string;
  readonly direction?: PortraitDirection;
  readonly dimmed?: boolean;
}
```

`dimmed` 是可选的 UI 焦点覆盖值，不参与立绘资源身份或文件命名。正常对白不需要逐行填写：当前说话者默认正常亮度，其他显示中的角色默认 dim。关系和剧情状态可以选择不同对白行，但程序禁止分析 `textKey` 对应的正文来猜测表情。

### 计划中的主角身份

```ts
export type PlayerGenderForm = 'male' | 'female';

export interface PlayerIdentityProfile {
  readonly genderForm: PlayerGenderForm;
}
```

`genderForm` 表示玩家选择的男性或女性主角形态，影响场景 Sprite、立绘/头像、称谓和显式配置的对白差分，但不得作为 NPC 恋爱资格过滤条件。技术 MVP 可以继续使用现有男性占位形态；正式支持第二种形态时，该值必须进入版本化存档并由新游戏流程明确选择。

### 计划中的 `characters.json`

角色数据保存稳定状态 ID 与逻辑资源 ID，不保存磁盘路径、Cocos UUID 或平台路径：

`characters.json` 只允许保存玩家可见或日常运行必需的数据。`originType`、`truthKnowledgeLevel`、`concealmentStance` 等内部字段不得出现；幸存者/重构村民分类和真相立场按 `docs/adr/0003-separate-public-npc-data-from-hidden-origin.md` 与通用角色目录隔离。角色的默认地图锚点属于地图出现规则，内容制作层级属于内部生产清单，也不塞进立绘目录。

```json
{
  "schemaVersion": 1,
  "characters": [
    {
      "id": "npc_shen_he",
      "displayNameKey": "character.shen_he.name",
      "gender": "female",
      "ageProfile": {
        "ageAtOpening": 23,
        "birthdayDayOfYear": 1
      },
      "adultMaritalStatus": "unmarried",
      "priorBondId": "farm_work_familiar",
      "relationshipRules": {
        "affinityEnabled": true,
        "playerRomancePolicy": "standard"
      },
      "portrait": {
        "defaultState": {
          "characterId": "npc_shen_he",
          "expression": "neutral",
          "pose": "default",
          "costume": "default",
          "direction": "left"
        },
        "variants": [
          {
            "expression": "neutral",
            "pose": "default",
            "costume": "default",
            "assetId": "portrait.npc_shen_he.default.default.neutral",
            "mirrorSafe": true
          },
          {
            "expression": "shy",
            "pose": "hands_together",
            "costume": "default",
            "effect": "blush",
            "assetId": "portrait.npc_shen_he.default.hands_together.shy.blush",
            "mirrorSafe": true
          }
        ]
      }
    }
  ]
}
```

`priorBondId` 只声明主角为何与该人物熟悉，供开场对白选择器使用；它不是好感数值，不会自动授予亲密阶段。第一章后的关系进度另行存储为新生关系状态。

`gender`、`ageProfile`、`adultMaritalStatus` 和 `playerRomancePolicy` 是玩家可见人物资料的权威输入，不是隐藏真相分类。`gender` 用于人物身份和表现差分，不决定能否与主角恋爱。当前年龄由世界日期计算，不能把开场年龄当作永久常量；是否属于老年长辈的非恋爱内容边界则由人物设定显式声明，不能只靠年龄数字猜测。当前 15 名角色以及未来加入正式角色目录的每一名可交谈 NPC，其 `affinityEnabled` 都必须为 `true`。

```ts
export type CharacterGender = 'female' | 'male';
export type AdultMaritalStatus =
  | 'unmarried'
  | 'married'
  | 'widowed';

export type PlayerRomancePolicy =
  | 'standard'
  | 'platonic_only';

export interface CharacterAgeProfile {
  readonly ageAtOpening: number;
  readonly birthdayDayOfYear: number;
}
```

阶段 10E 已锁定四季、每季 30 天、`daysPerYear=120`、`openingDayOfYear=1` 和 `openingWorldDay=1`。`ageAtOpening` 表示开场时刻已经成立的年龄；当前年龄等于该值加上 `(openingWorldDay, currentWorldDay]` 半开半闭区间内跨过的生日次数。开场日自身不重复结算生日，因此 `birthdayDayOfYear=1` 的乔苓在 `worldDay=120` 仍为 17 岁，只在 `worldDay=121` 进入第 2 年春季第 1 日时满 18 岁。其他角色具体生日在阶段 13 数据落地前逐一确认。

`playerRomancePolicy` 是稳定的人物内容边界，不是随年龄或性别组合自动改变的资格缓存。当前罗岑山、陈蕴及未来明确定位为老年长辈的角色使用 `platonic_only`；他们仍保留完整好感，但不进入暧昧、告白、恋爱或求婚。其他可能在成年后发展恋爱的 NPC 使用 `standard`，已有关系不会因角色在长期存档中自然变老或玩家选择另一主角形态而被自动解除。

亲近表现范围和告白结果都不作为容易过期的静态布尔值写入角色 JSON，而由共享关系规则根据人物边界、角色资料、当前日期、好感和关系状态计算：

- `ageAtOpening` 必须是非负整数，`birthdayDayOfYear` 必须位于世界历法范围；
- `playerRomancePolicy: 'platonic_only'` 时只允许非恋爱关系内容，告白固定返回 `unavailable`；
- `playerRomancePolicy: 'standard'` 且当前没有配偶时，可以进入与年龄相符的亲近表现；NPC 性别和主角性别形态不参与资格过滤，`adultMaritalStatus: 'unmarried'` 和 `'widowed'` 都属于当前无配偶，`'married'` 不属于；
- 当前年龄低于 18 岁时，当前婚姻状态由查询返回 `not_applicable`；告白必须先返回 `rejected_minor`，不能继续用好感覆盖该结果；
- 当前年龄不低于 18 岁且当前无配偶时，好感低于配置门槛返回 `rejected_low_affinity`，达到门槛返回 `accepted` 并由事务建立 `dating`；
- `platonic_only` 或当前已有配偶者返回 `unavailable`；运行时不得根据主角/NPC 性别组合、名字、对白文字或幸存者/重构村民分类改变结果。

游戏开场时，宁昭、晏巡、杜蘅、乔榆、沈禾、文澍、穆原、唐米、何舟、黎青和池雀十一名成年人按好感判定告白。罗岑山和陈蕴使用 `playerRomancePolicy: 'platonic_only'`，不出现暧昧且告白固定为 `unavailable`。乔苓使用 `ageAtOpening: 17`，其生日序号必须与开场日在历法中的序号一致，因此经过一个完整游戏年后，下一次告白从 `rejected_minor` 改为按好感判定；阿桃使用 `ageAtOpening: 10`，未来跨过第八次生日后同理。两人的 `adultMaritalStatus` 都是 `unmarried`，但成年前当前婚姻状态始终为 `not_applicable`。

第一版运行时 `assetId` 通常映射到一张合成 PNG；未来即使 PC 使用更高分辨率导出，对话 JSON 和角色状态 ID 也不变。角色默认状态引用的资源必须实际存在。

### 计划中的关系状态

```ts
export type AffinityRank =
  | 'strained'
  | 'neutral'
  | 'friendly'
  | 'trusted'
  | 'close';

export type RomanceState =
  | 'none'
  | 'dating'
  | 'married';

export type ConfessionStatus =
  | 'accepted'
  | 'rejected_minor'
  | 'rejected_low_affinity'
  | 'unavailable'
  | 'already_dating';

export type ProposalStatus =
  | 'accepted'
  | 'not_dating'
  | 'affinity_not_maxed'
  | 'already_has_spouse'
  | 'unavailable';

export interface CharacterRelationshipState {
  readonly characterId: string;
  readonly affinityPoints: number;
  readonly affinityRank: AffinityRank;
  readonly romanceState: RomanceState;
  readonly eventFlags: ReadonlyArray<string>;
}

export interface RelationshipState {
  readonly entries: ReadonlyArray<CharacterRelationshipState>;
  readonly spouseCharacterId: string | null;
}
```

关系状态遵守以下不变量：

- 当前 15 名 NPC 每人都有且只有一份 `CharacterRelationshipState`；未来角色进入正式目录时也必须同时建立关系记录，角色内容层级不能省略它。
- 新存档的 `affinityPoints` 从 `0`、`affinityRank: 'neutral'` 开始。旧日熟悉由 `priorBondId` 保留，不能转成免费好感。
- `affinityPoints` 使用有符号整数，允许因失信、冲突或拒绝下降；具体等级阈值留到阶段 13 的数值配置，不散落在对白或 UI 中。
- `romanceState: 'none'` 只表示告白尚未被接受，不兼任亲近表现或告白资格字段；轻微暧昧、高好感和告白拒绝都仍保持 `none`。
- 存档保存权威的世界日期或累计天数以及角色出生资料，不单独保存 `currentAge`；读取后统一推导当前年龄，避免改历法、迁移旧档或跨年结算时出现年龄漂移。
- 同一 `RelationshipState` 可以有多个 `dating`，不使用全局单一“恋人 ID”。
- 告白事务按“是否 `standard` 且为当前无配偶 NPC → 是否年满 18 岁 → 是否已经 `dating` → 是否达到告白好感门槛”的固定顺序返回 `ConfessionStatus`；主角与 NPC 性别均不参与资格判定，`platonic_only` 返回 `unavailable`，重复告白返回 `already_dating`，只有 `accepted` 可以把 `none` 改成 `dating`。
- 求婚只能针对 `dating` 且好感达到配置上限的成年 NPC；好感达到上限只开放求婚，不自动写入婚姻。
- `spouseCharacterId` 为空时不得有 `married`；非空时必须存在且只存在一个与之相同的 `married` 条目，并且目标在求婚事务发生时必须仍为成年、`standard` 且当前无配偶，不限制目标性别。
- 已有 `spouseCharacterId` 时第二次结婚事务必须返回拒绝结果，不得覆盖原值。
- 结婚事务不自动清除其他 `dating` 或好感记录；后续剧情可以通过显式事务改变它们，但不能由存档解码器或 UI 静默处理。
- 恋爱和婚姻都需要专属事件与玩家确认；好感达到门槛只影响告白或求婚是否可成功，不自动修改 `romanceState`。
- 未成年角色的普通好感和非恋爱人物事件可以保存，但其 `romanceState` 必须为 `none`，且 `eventFlags` 不得包含告白成功、约会、恋爱或婚姻进度。单方面稚嫩好感只能作为适龄对白内容，跨过 18 岁生日也不能自动转成恋爱。
- 当前不建立 NPC 与 NPC 之间的 `dating`、`married` 或告白事务；他们之间的友情、信任、竞争和厌恶属于后续独立关系数据，不复用玩家恋爱状态。

阶段 13 需要为上述状态提供纯 TypeScript 事务、迁移与不变量测试。当前阶段只冻结契约，不提前修改技术 MVP 的 save schema 1。

### 计划中的 `dialogues/*.json`

```json
{
  "schemaVersion": 1,
  "dialogueId": "shen_he_farm_reacquaintance",
  "lines": [
    {
      "id": "shen_he_farm_reacquaintance_01",
      "speakerId": "npc_shen_he",
      "textKey": "dialogue.shen_he.farm_reacquaintance_01",
      "portrait": {
        "characterId": "npc_shen_he",
        "expression": "shy",
        "pose": "hands_together",
        "effect": "blush",
        "direction": "left"
      }
    },
    {
      "id": "shen_he_farm_reacquaintance_02",
      "speakerId": "npc_shen_he",
      "textKey": "dialogue.shen_he.farm_reacquaintance_02",
      "portrait": {
        "characterId": "npc_shen_he",
        "expression": "smile",
        "direction": "left"
      }
    }
  ]
}
```

- `portrait` 省略时使用该角色 `defaultState`。
- `pose`、`costume`、`effect` 或 `direction` 省略时使用角色默认值或无效果。
- 每一行都可以切换状态，因此同一段对话可连续多次改变表情和姿势。
- 旁白使用 `speakerId: null`，默认不激活人物立绘。
- 精确资源不存在时按 `docs/DIALOGUE_SPEC.md` 的确定性顺序回退；发布数据仍应在构建检查中报告缺失状态，不能把运行时回退当作正常生产流程。
- 对白分支条件、关系阈值和剧情标记在阶段 13 单独确定；无论分支如何选择，最终行都必须显式表达立绘意图，不能由正文情感推断。

## Save Schema

示意：

```json
{
  "saveVersion": 1,
  "savedAt": "2026-07-16T08:00:00.000Z",
  "player": {
    "mapId": "mvp_farm",
    "worldPosition": { "x": 16, "y": -24 },
    "facing": "left"
  },
  "currentDay": 3,
  "inventory": {
    "selectedSlotIndex": 0,
    "slots": [
      { "itemId": "hoe_basic", "quantity": 1 },
      { "itemId": "watering_can_basic", "quantity": 1 },
      { "itemId": "mistleaf_seed", "quantity": 2 },
      { "itemId": "mistleaf", "quantity": 1 },
      null,
      null,
      null,
      null
    ]
  },
  "farm": {
    "mapId": "mvp_farm",
    "tiles": [
      {
        "x": 7,
        "y": 8,
        "isTilled": true,
        "wateredOnDay": 3,
        "crop": {
          "cropId": "mistleaf",
          "plantedOnDay": 1,
          "growthProgress": 2,
          "stageIndex": 2,
          "lastGrowthDay": 2
        }
      }
    ]
  }
}
```

版本 1 只保存已经存在的权威玩法状态，不提前加入尚未实现的日内时钟或设置。`player.worldPosition` 是 Cocos 逻辑世界坐标；农田始终保存整数瓦片坐标。MVP 背包固定为 8 格且全部同时构成快捷栏；`selectedSlotIndex` 使用零基索引并必须指向现有槽位。

平台 `ISaveService` 只存储这份 JSON 的不透明字符串。共享 `SaveCodec` 负责版本和领域一致性，平台 adapter 不得解释或修改字段。MVP 固定使用一个名为 `autosave` 的自动存档槽。

### Demo 存档演进约束

- 上述 schema 1 是已经实现的技术 MVP 事实，不直接改写成多档位或 NPC 存档。
- SaveData v2 必须把 `player.mapId` 限制为地图目录中的稳定 ID，并增加明确的叙事/目标状态；旧 `mvp_farm` 存档迁移到 `home_interior` 的 `home_bed`，不能按原世界坐标投射到新地图。
- 阶段 10E 已确认三个稳定档位 `profile-1`～`profile-3`、最近档位、单档损坏隔离、未来同档受保护恢复点、Demo 结束方式和 120 日历法。SaveData v2 使用一基累计 `worldDay`，不保存可推导的年份/季节，也不加入 `timeOfDay`、`dayPhase` 或 `weatherId`；后续范围变更同时确认了玩家生命和当日矿洞状态。
- 阶段 12B 建立 SaveData v2 迁移框架、可重建档位摘要、最近档位、损坏档隔离与旧 `autosave` 全事务导入，并为阶段 10C 已确认的 `PlayerIdentityProfile` 与 `RelationshipState` 提供明确版本槽位；权威累计世界日必须能确定性还原当前年份、年内日和角色年龄。v1 导入默认满生命、空矿洞状态，不根据旧地图或日期猜测矿洞进度。
- 阶段 13 实现并迁移 15 份关系记录、多个 `dating`、唯一 `spouseCharacterId`、告白/求婚事务与动态年龄查询；阶段 14 的跨天结算负责生日/成年事件，当前目标与叙事状态分别在阶段 14～15 的 schema 确认后进入版本化存档。阶段 10D 已提供第一处异常的四个稳定状态语义，但仍不得预填无语义的通用字典或保存演出瞬态。
- 每次迁移必须从真实旧版本样例开始测试；读取失败不得覆盖原档，单个损坏档不得阻塞其他档位。
- 三个普通档位不能代替未来的“调查前恢复点”。档位容器必须区分 `currentSnapshot` 与可空的 `protectedRecoverySnapshot`；当前 Demo 后者保持为空，普通自动保存永远不能覆盖它。
- 全局设置与 `lastPlayedProfileId` 不属于 SaveData v2；它们使用独立应用数据。档位摘要可以从当前快照重建，不能成为三个档位共同失效的单点。
- 旧 v1 `currentDay` 同值迁移为 `worldDay`；玩家落到 `home_bed`。旧 10×10 农田只能通过阶段 11 锁定的命名导入区域整体平移，任一格无法安全映射时整次迁移失败并保留旧载荷。

### SaveData v2 的生命与矿洞状态

```ts
export interface PlayerVitalsState {
  readonly health: number;
  readonly maxHealth: 5;
}

export interface MineRunState {
  readonly mapId: 'old_mine';
  readonly worldDay: number;
  readonly brokenNodeIds: readonly string[];
  readonly defeatedEncounterIds: readonly string[];
}
```

- 稳定快照中的 `health` 必须为 `1～5`；生命为 0 只能存在于尚未完成的安全撤离事务中。
- `mineRun.worldDay` 必须等于存档 `worldDay`；跨天先清空 ID 列表并恢复满生命，再提交新日快照。
- 两类 ID 各自唯一，并能解析到 `old_mine` 的稳定实例目录；未知或重复 ID 使快照验证失败。
- 不保存矿脉中间命中次数、敌人当前生命/位置、投射物、冷却、无敌计时、击退或动画帧。
- 完整规则和恢复点见 `docs/MINE_COMBAT_SLICE.md`。

### 计划中的档位容器

```ts
export type PlayerProfileId = 'profile-1' | 'profile-2' | 'profile-3';

export interface PlayerProfileMetadata {
  readonly profileId: PlayerProfileId;
  readonly savedAt: string;
  readonly worldDay: number;
  readonly mapId: string;
  readonly demoMilestoneReached: boolean;
}

export interface PlayerProfileSlot {
  readonly metadata: PlayerProfileMetadata;
  readonly currentSnapshot: SaveDataV2;
  readonly protectedRecoverySnapshot: SaveDataV2 | null;
}
```

该接口表达逻辑角色，不要求平台把三部分写进一个 JSON。实际存储必须让单档损坏隔离，并允许在摘要损坏时通过稳定档位 ID 扫描/重建。完整交互和事务见 `docs/DEMO_SAVE_AND_CALENDAR.md`。

## Required Validation

当前初始化校验器已覆盖 schema 版本、ID 唯一性、物品/作物/工具交叉引用、正整数成长阶段、地图内坐标、可耕作矩形和默认语言显示键。运行时 `decodeItemsData` 与 `decodeCropsData` 还会在对应玩法 adapter 使用前校验不可信 JSON 的结构、价格/计数和重复 ID；工具、地图、本地化与完整 bundle 的运行时解码仍留在后续数据加载阶段，不能把 TypeScript 接口本身当作验证。

- ID 唯一且格式合法。
- `seedItemId`、`harvestItemId`、`cropId` 引用存在且类型匹配。
- 数量、价格、尺寸和天数为非负整数；堆叠上限大于零。
- 成长阶段非空且每段至少一天。
- 农田矩形位于地图边界内。
- 本地化默认语言覆盖所有 MVP 可见键。
- 角色 ID、对白 ID、对白行 ID、立绘状态 ID 与逻辑资源 ID 格式合法且在各自作用域内唯一。
- 角色目录中的 15 人都启用好感；`ageAtOpening` 和 `birthdayDayOfYear` 合法，当前年龄只能由角色年龄资料、历法配置和权威累计游戏日计算。
- 每个日期快照都满足：`standard` 的当前无配偶 NPC 可进入适龄亲近内容；成年人按好感判定告白，未成年人固定返回 `rejected_minor`。开场按好感判定者为宁昭、晏巡、杜蘅、乔榆、沈禾、文澍、穆原、唐米、何舟、黎青和池雀；乔苓在一个完整游戏年后的 18 岁生日之后才改用好感判定。
- `platonic_only` 角色无论好感、年龄或婚姻状态如何都返回 `unavailable`，不得拥有暧昧、告白成功、约会、恋爱、求婚或婚姻事件标记；当前样例必须覆盖罗岑山和陈蕴。
- 当前未成年角色不得处于 `dating` 或 `married`，告白无论好感多高都返回 `rejected_minor`；跨生日、保存、重读和旧档迁移后结果必须一致。
- 好感低于门槛的成年无配偶 NPC 返回 `rejected_low_affinity`，达到门槛且尚未恋爱时返回 `accepted`；切换主角性别形态不得改变相同状态的结果，亲近表现本身不改变 `romanceState`。
- 对已经 `dating` 的角色重复告白返回 `already_dating`，不重复写事件标记，也不改变好感。
- 只有 `dating` 且好感达到配置上限的对象可以进入求婚；成功结婚后其他 `dating` 不被系统自动清除。
- 关系条目与角色目录一一对应；好感值是整数，等级与配置阈值一致，事件标记不重复。
- 可以同时存在多个 `dating`；最多一个 `married`，且必须与唯一 `spouseCharacterId` 双向一致，不限制配偶性别。已有配偶时不得覆盖为第二人。
- 非旁白对白的 `speakerId` 存在；`portrait.characterId` 通常与说话者一致；`textKey` 在默认语言中存在。
- 每名使用立绘的角色都有可解析的默认状态；目录中的 `assetId` 能映射到已导入资源；`direction` 仅为 `left` 或 `right`。
- 对白引用的精确状态不存在时给出包含对白行 ID 的诊断，并按固定规则回退；禁止通过正文猜测表情。
- 第一处异常配置引用存在的地图、触发区、返回锚点、线索锚点、条件、表现与对白 ID；只有面向出口的单次语义交互能启动，进入地图或日期变化不会启动。
- `old_mine` 只与 `hometown_main` 双向连接；矿脉 `nodeId`、遭遇 `encounterId` 和命名安全锚点存在且不重复。
- 锄镐、练习杖和矿石引用存在且类型/动作匹配；背包满时采矿事务不提交破碎状态。
- `mystery.firstBarrierObserved` 与 `mystery.boundaryRibbonInspected` 可以独立表示“见过但未检查”和“稍后检查”；演出瞬态、粒子、摄像机和音频进度不进入存档。
- 存档版本受支持，保存时间为标准 UTC ISO 时间，玩家地图与农田地图一致。
- `worldDay` 为正整数；`1/30/31/120/121` 必须分别推导为第 1 年春 1 日、春 30 日、夏 1 日、冬 30 日和第 2 年春 1 日。
- 玩家生命和矿洞当日状态满足上述 v2 不变量；安全撤离不推进 `worldDay`、不减少背包，也不清空当日完成 ID。
- 档位 ID 只能是三个稳定值；最近档位只在成功载入后更新；当前快照和受保护恢复点角色不能混淆。
- 一个档位的损坏、未来版本或存储失败不得改变另两个档位；摘要损坏时可以从有效快照重建。
- v1→v2 迁移必须全有或全无，失败时保留旧 `autosave`；乔苓在 `worldDay=120` 仍未成年、在 `worldDay=121` 进入成年规则，生日事件不可重复。
- 背包固定为 8 格；选中槽、物品 ID、正数量和 `maxStack` 必须合法。
- 已耕地必须位于对应地图可耕区内且坐标不可重复；浇水日期不得晚于当前日期。
- 作物 ID、种植日、成长进度、视觉阶段和最后结算日必须与 `crops.json` 及当前日期一致。
