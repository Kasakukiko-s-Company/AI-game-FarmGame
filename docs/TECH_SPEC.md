# Technical Specification

本文是架构基线。Cocos Creator 3.8.8 已安装并实际导入项目；当前目录、`tsconfig`、资源元数据和项目设置均已按这个补丁版本复核。MVP 期间不得升级引擎。

## Engine

- Cocos Creator 3.8.8（3.8 LTS），MVP 期间锁定该版本。
- 2D 项目，TypeScript 脚本。
- Tiled 1.12.2 输出 TMX 地图；只使用经 Cocos 3.8.8 冒烟测试通过的基础 TMX 功能。
- JSON 内容配置。
- 横屏，640×360 逻辑设计分辨率，32×32 像素基础瓦片。

不手写猜测性的 Cocos 场景、`.meta`、项目设置和组件序列化数据。

## Architecture

当前按职责划分：

- `core`：游戏生命周期、事件、时间、命令调度、存档编排。
- `player`：玩家领域状态、移动意图、朝向、交互意图。
- `farming`：地块、工具动作、作物种植、浇水、成长、收获。
- `inventory`：物品堆叠、容量、添加与移除。
- `world`：地图查询、坐标转换、碰撞和交互目标。
- `ui`：视图状态、快捷栏和 HUD，不承载领域规则。
- `platform`：输入、存储、音频、生命周期和分析适配器。
- `data`：JSON 加载、类型定义、校验和 ID 引用解析。

### 依赖方向

领域规则不依赖 Cocos 节点、微信 API 或具体存储：

```text
UI / Cocos Components
        ↓
Application Services
        ↓
Domain State + Rules
        ↑
Platform Interfaces ← Desktop / WeChat Adapters
```

组件负责把引擎事件翻译为领域命令，再把领域结果投影到节点。存档序列化领域状态，不序列化节点树。

## Platform Separation

已建立接口：

- `IPlatformService`：平台类型、生命周期、安全区、能力查询。
- `ISaveService`：读、写、删除存档；返回显式成功/失败结果。
- `IInputService`：移动向量、动作、选择与取消的语义输入。
- `IAudioService`：播放、停止、静音和音量。
- `IAnalyticsService`：可选事件上报；MVP 默认空实现。

核心模块禁止直接使用 `wx`、`window`、`localStorage`、键码或触摸坐标。

当前平台 seam 位于 `assets/scripts/platform`：

- `PlatformContracts.ts` 定义五个接口和统一结果类型。
- `PlatformAdapters.ts` 只提供初始化期可验证的 Desktop/WeChat 身份、安全区注入、内存存档、中性输入和空音频/分析实现。
- `ISaveService` 只读写不透明字符串，不理解 `SaveData`，因此平台存储不会拥有农场规则。
- 微信适配器当前不直接访问 `wx`；真实生命周期、触控和持久化只在对应玩法阶段接入。

这个接口边界同时服务两个实际目标平台，因此保留；没有为尚不存在的子系统继续拆分空接口。

## Runtime State

建议唯一权威状态：

- `GameState`
  - `saveVersion`
  - `player`
  - `clock`
  - `inventory`
  - `farm`
  - `settings`

场景节点只保存渲染缓存和组件引用。改变状态必须通过明确命令，例如 `TillTile`、`PlantCrop`、`WaterTile`、`EndDay`、`HarvestCrop`。

## Save Design

存档至少包含：

- `saveVersion`
- `savedAt`
- `playerPosition`
- `playerFacing`
- `currentDay`
- `timeOfDay`
- `inventory`
- `selectedSlot`
- `farmTiles`
- `cropStates`
- `settings`

规则：

- 使用稳定 ID 和纯 JSON 数据，不保存 Cocos 对象引用。
- 写入采用临时数据校验后替换，避免半写入覆盖有效档。
- 读取先解析、校验版本，再迁移或拒绝。
- MVP 只需要一个槽位和最小迁移入口，不建立复杂迁移框架。

## Coordinate System

明确区分：

- 世界坐标：Cocos 场景中的位置。
- 屏幕/UI 坐标：触控和 UI 使用的位置。
- 瓦片坐标：整数 `(x, y)`，用于农田、碰撞查询与存档。

所有转换集中在 `world` 模块。地图原点、Y 轴方向、瓦片中心偏移和边界规则必须由测试固定，不能在各组件中重复计算。

## Farming Rules

建议地块状态：

- `isTilled`
- `wateredOnDay`，使用天数而不是依赖场景颜色判断。
- 可选 `cropInstanceId` 或内嵌作物状态引用。

建议作物状态：

- `cropId`
- `tile`
- `plantedOnDay`
- `growthProgress`
- `stageIndex`
- `lastGrowthDay`

`EndDay` 是唯一成长结算入口，必须防止同一天重复结算。
只有 `wateredOnDay` 等于结算日的作物获得一天成长；未浇水作物保持原进度且不会枯死。

## Event Examples

- `GAME_LOADED`
- `DAY_STARTED`
- `DAY_ENDED`
- `ITEM_ADDED`
- `ITEM_REMOVED`
- `TILE_TILLED`
- `TILE_WATERED`
- `CROP_PLANTED`
- `CROP_GROWN`
- `CROP_HARVESTED`
- `SAVE_COMPLETED`
- `SAVE_FAILED`

事件用于解耦表现和副作用，不应代替清晰的同步领域调用。MVP 不引入网络事件总线。

## Data Loading

1. 平台适配器读取 JSON 资源。
2. `data` 模块进行结构和引用校验。
3. 生成只读注册表，例如 `ItemCatalog`、`CropCatalog`。
4. 领域服务仅通过 ID 查询注册表。
5. 数据错误在启动时明确失败，不用默认值掩盖关键缺失。

## Testing Strategy

- 纯 TypeScript 单元测试：坐标、背包、作物成长、日结算、存档序列化与迁移。
- Cocos 组件集成测试：输入桥接、节点同步、碰撞和场景加载。
- 手工矩阵：编辑器预览、Windows 构建、微信开发者工具、微信真机。
- 每个缺陷先尽量在纯逻辑层建立回归测试。

当前未引入第三方测试框架。初始化阶段使用 Creator 3.8.8 自带 TypeScript 5.8.2 执行项目级 `--noEmit`；`skipLibCheck` 仅跳过引擎自带声明文件的内部诊断，项目代码仍启用 `strict`、`noImplicitOverride`、`noUncheckedIndexedAccess` 等检查。纯逻辑测试框架在第一个需要测试的玩法切片中按兼容性选择。

## Performance Budgets

MVP 初期先记录而非猜测固定数值：

- 首包和远程资源大小。
- 首屏加载时间。
- 纹理内存和峰值内存。
- 场景 Draw Call、节点数和每帧分配。
- 低端真机帧率与长帧。

预算在首个微信真机构建后根据测量确定。

## Official References

- Cocos Creator 3.8 LTS：<https://docs.cocos.com/creator/3.8/manual/en/>
- 微信小游戏构建：<https://docs.cocos.com/creator/3.8/manual/en/editor/publish/publish-wechatgame.html>
- TiledMap：<https://docs.cocos.com/creator/3.8/manual/en/asset/tiledmap.html>
- 原生平台构建：<https://docs.cocos.com/creator/3.8/manual/en/editor/publish/publish-native-index.html>
