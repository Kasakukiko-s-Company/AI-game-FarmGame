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

`tileSizePixels: 32` 已确认为地图基准；示例中的出生点、睡觉点和耕作区坐标仍需在地图阶段确定。碰撞和可耕作区可以从 TMX 对象层导入，避免重复维护。

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

### 计划中的 `characters.json`

角色数据保存稳定状态 ID 与逻辑资源 ID，不保存磁盘路径、Cocos UUID 或平台路径：

```json
{
  "schemaVersion": 1,
  "characters": [
    {
      "id": "npc_anna",
      "displayNameKey": "character.anna.name",
      "portrait": {
        "defaultState": {
          "characterId": "npc_anna",
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
            "assetId": "portrait.npc_anna.default.default.neutral",
            "mirrorSafe": true
          },
          {
            "expression": "shy",
            "pose": "hands_together",
            "costume": "default",
            "effect": "blush",
            "assetId": "portrait.npc_anna.default.hands_together.shy.blush",
            "mirrorSafe": true
          }
        ]
      }
    }
  ]
}
```

第一版运行时 `assetId` 通常映射到一张合成 PNG；未来即使 PC 使用更高分辨率导出，对话 JSON 和角色状态 ID 也不变。角色默认状态引用的资源必须实际存在。

### 计划中的 `dialogues/*.json`

```json
{
  "schemaVersion": 1,
  "dialogueId": "anna_friend_thanks",
  "lines": [
    {
      "id": "anna_friend_thanks_01",
      "speakerId": "npc_anna",
      "textKey": "dialogue.anna.friend.thanks_01",
      "portrait": {
        "characterId": "npc_anna",
        "expression": "shy",
        "pose": "hands_together",
        "effect": "blush",
        "direction": "left"
      }
    },
    {
      "id": "anna_friend_thanks_02",
      "speakerId": "npc_anna",
      "textKey": "dialogue.anna.friend.thanks_02",
      "portrait": {
        "characterId": "npc_anna",
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
- 阶段 10E 先确认三档存档、调查前恢复点、Demo 结束方式以及日内时段/天气是否属于权威状态。
- 阶段 12B 建立 SaveData v2 迁移框架、档位元数据、最近档位、损坏档隔离与旧 `autosave` 导入。
- NPC、关系、当前目标与叙事状态分别在阶段 13～15 的 schema 确认后进入版本化存档；不得在数据结构尚未定义时预填无语义的通用字典。
- 每次迁移必须从真实旧版本样例开始测试；读取失败不得覆盖原档，单个损坏档不得阻塞其他档位。
- 三个普通档位不能代替未来的“调查前恢复点”。如果阶段 10E 把恢复点列为 Demo 必须项，它必须是同档位内受保护、不会被普通自动保存覆盖的独立快照。

## Required Validation

当前初始化校验器已覆盖 schema 版本、ID 唯一性、物品/作物/工具交叉引用、正整数成长阶段、地图内坐标、可耕作矩形和默认语言显示键。运行时 `decodeItemsData` 与 `decodeCropsData` 还会在对应玩法 adapter 使用前校验不可信 JSON 的结构、价格/计数和重复 ID；工具、地图、本地化与完整 bundle 的运行时解码仍留在后续数据加载阶段，不能把 TypeScript 接口本身当作验证。

- ID 唯一且格式合法。
- `seedItemId`、`harvestItemId`、`cropId` 引用存在且类型匹配。
- 数量、价格、尺寸和天数为非负整数；堆叠上限大于零。
- 成长阶段非空且每段至少一天。
- 农田矩形位于地图边界内。
- 本地化默认语言覆盖所有 MVP 可见键。
- 角色 ID、对白 ID、对白行 ID、立绘状态 ID 与逻辑资源 ID 格式合法且在各自作用域内唯一。
- 非旁白对白的 `speakerId` 存在；`portrait.characterId` 通常与说话者一致；`textKey` 在默认语言中存在。
- 每名使用立绘的角色都有可解析的默认状态；目录中的 `assetId` 能映射到已导入资源；`direction` 仅为 `left` 或 `right`。
- 对白引用的精确状态不存在时给出包含对白行 ID 的诊断，并按固定规则回退；禁止通过正文猜测表情。
- 存档版本受支持，保存时间为标准 UTC ISO 时间，玩家地图与农田地图一致。
- 背包固定为 8 格；选中槽、物品 ID、正数量和 `maxStack` 必须合法。
- 已耕地必须位于对应地图可耕区内且坐标不可重复；浇水日期不得晚于当前日期。
- 作物 ID、种植日、成长进度、视觉阶段和最后结算日必须与 `crops.json` 及当前日期一致。
