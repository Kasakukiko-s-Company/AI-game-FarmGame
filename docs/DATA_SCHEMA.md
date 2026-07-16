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

## Required Validation

当前初始化校验器已覆盖 schema 版本、ID 唯一性、物品/作物/工具交叉引用、正整数成长阶段、地图内坐标、可耕作矩形和默认语言显示键。运行时 `decodeItemsData` 与 `decodeCropsData` 还会在对应玩法 adapter 使用前校验不可信 JSON 的结构、价格/计数和重复 ID；工具、地图、本地化与完整 bundle 的运行时解码仍留在后续数据加载阶段，不能把 TypeScript 接口本身当作验证。

- ID 唯一且格式合法。
- `seedItemId`、`harvestItemId`、`cropId` 引用存在且类型匹配。
- 数量、价格、尺寸和天数为非负整数；堆叠上限大于零。
- 成长阶段非空且每段至少一天。
- 农田矩形位于地图边界内。
- 本地化默认语言覆盖所有 MVP 可见键。
- 存档版本受支持，保存时间为标准 UTC ISO 时间，玩家地图与农田地图一致。
- 背包固定为 8 格；选中槽、物品 ID、正数量和 `maxStack` 必须合法。
- 已耕地必须位于对应地图可耕区内且坐标不可重复；浇水日期不得晚于当前日期。
- 作物 ID、种植日、成长进度、视觉阶段和最后结算日必须与 `crops.json` 及当前日期一致。
