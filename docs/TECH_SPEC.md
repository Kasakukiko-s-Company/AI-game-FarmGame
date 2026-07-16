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
Platform Interfaces ← Steam Windows / WeChat Adapters
```

组件负责把引擎事件翻译为领域命令，再把领域结果投影到节点。存档序列化领域状态，不序列化节点树。

## Platform Separation

平台身份拆成运行环境与发行渠道，避免把 Steam 误建模为与 Windows 并列的运行时：

```text
wechat-minigame + wechat
windows-native  + steam
```

已建立接口：

- `IPlatformService`：平台描述、生命周期和安全区；平台描述同时包含 runtime 与 distribution。
- `ISaveService`：读、写、删除存档；返回显式成功/失败结果。
- `IInputService`：移动向量、动作、选择与取消的语义输入。
- `IAudioService`：播放、停止、静音和音量。
- `IAnalyticsService`：可选事件上报；MVP 默认空实现。

核心模块禁止直接使用 `wx`、`window`、`localStorage`、键码或触摸坐标。

当前平台 seam 位于 `assets/scripts/platform`：

- `PlatformContracts.ts` 定义五个接口和统一结果类型。
- `PlatformAdapters.ts` 只提供初始化期可验证的 Desktop/WeChat 身份、安全区注入、内存存档、中性输入和空音频/分析实现。
- `PlatformComposition.ts` 是发行目标的唯一 composition root；它把 `steam-windows` 映射为 `windows-native + steam`，把 `wechat-minigame` 映射为 `wechat-minigame + wechat`。
- composition root 强制调用者提供 `ISaveService` 与 `IInputService`，不允许发行包静默使用 `MemorySaveService`；音频和分析可在 MVP 使用空 adapter。
- `ISaveService` 只读写不透明字符串，不理解 `SaveData`，因此平台存储不会拥有农场规则。
- 微信适配器当前不直接访问 `wx`；真实生命周期、触控和持久化只在对应玩法阶段接入。
- Steamworks 原生调用不得进入共享 TypeScript；阶段 12 通过 Windows 原生/JSB adapter 接入。Steam 专属能力按成就、身份等独立 capability seam 扩展，不把 `IPlatformService` 变成浅层大接口。

这个接口边界同时服务两个实际目标平台，因此保留；没有为尚不存在的子系统继续拆分空接口。

阶段 7D 增加架构护栏测试：`core`、`data`、`farming`、`inventory`、`player`、`ui` 和 `world` 不得出现 `wx.*`、`window.*`、`localStorage`、`SteamAPI_*` 或 Node 文件系统 import。平台差异必须保持在 `assets/scripts/platform` seam 后面。

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

## Player Movement Slice

阶段 2 的移动依赖方向为：

```text
Cocos Keyboard Events → KeyboardInputBridge → IInputService
                                             ↓
                                      PlayerController
                                             ↓
                                    PlayerMovement rules
```

- `PlayerMovement` 是无 Cocos 依赖的纯规则，负责输入归一化、速度、位移和最后朝向。
- 键盘桥支持 WASD 与方向键；同时按两个方向时规则把向量限制在单位圆内，不产生斜向加速。
- Creator 浏览器预览运行中改变画布尺寸可能丢失原尺寸中的 `KEY_UP`；键盘桥监听引擎 `canvas-resize` 事件并清空旧按键集合，避免切换后持续移动。
- `TouchInputPort` 是后续虚拟摇杆写入语义移动向量的入口，本阶段不实现触控 UI。
- `PlayerController` 只消费接口并移动节点，不监听物理按键。
- `PlayerPlaceholderView` 只负责 Graphics 占位表现和朝向标记，不拥有移动规则。

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
- 游戏屏幕坐标：`EventTouch/EventMouse.getLocation()` 返回的左下角原点原始窗口位置，供 Camera 投影使用。
- UI 坐标：`getUILocation()` 返回的适配后位置，供 UI 布局使用；不能再次传给 `Camera.screenToWorld()`。
- 瓦片坐标：整数 `(x, y)`，用于农田、碰撞查询与存档。

所有转换集中在 `world` 模块。地图原点、Y 轴方向、瓦片中心偏移和边界规则必须由测试固定，不能在各组件中重复计算。

## Tile Interaction Slice

阶段 4A 固定平台无关的坐标与面向规则：

- `TileGridGeometry` 描述有限地图宽高、瓦片尺寸和世界坐标左下原点；瓦片 `(0,0)` 位于地图左下角。
- `worldToTile` 对相对地图原点的坐标使用 `Math.floor`，因此负方向、精确最大边界和地图外输入不会被错误截断或夹取；地图外统一返回 `null`。
- `tileToWorldCenter` 只接受地图内整数瓦片，使用半格偏移返回世界坐标中心。
- `getFacingTile` 先定位玩家所在瓦片，再按 `FacingDirection` 选择上、下、左或右相邻一格；固定交互距离为一格，越界返回 `null`。
- 屏幕坐标到世界坐标属于后续 Cocos 适配层职责；可耕作性属于地图查询职责，均不进入本纯规则模块。

## Tile Interaction Debug View Slice

阶段 4B 只把阶段 4A 的目标瓦片变为可观察的场景结果：

- `TileInteractionDebugView` 在 `lateUpdate` 读取 Player 世界位置与 `PlayerController.facing`，确保移动和朝向更新后再绘制。
- Player 世界位置先通过 TiledMap 的 `UITransform` 转为地图局部坐标；纯规则计算瓦片后，瓦片中心再经世界坐标转换到调试节点局部坐标。
- 调试节点使用独立 `Graphics`，避免与 `PlayerPlaceholderView` 共用画笔并互相 `clear()`。
- 调试框使用半透明填充和描边，仅表达“当前交互目标”；它不代表可通行、可耕作或可执行工具动作。
- 面向地图外时纯规则返回 `null`，调试视图清空；缺少 Target 或 Tiled Map 时只警告一次。

## Tile Farmability Query Slice

阶段 4C 只回答目标瓦片是否允许后续农田操作，不创建或修改农田状态：

- `TileFarmabilityMap` 接收有限地图尺寸、包含边界的可耕作矩形和底部原点 `isBlocked(x, y)` 查询；纯规则不依赖 Cocos、Tiled 或平台 API。
- `isTileFarmable` 对 `null`、负坐标、地图外坐标和非整数瓦片统一返回 `false`。
- 地图内整数瓦片必须同时位于配置矩形内且未被阻挡才返回 `true`；边界瓦片属于矩形内部。
- `assets/data/maps.json` 的 `farmableArea` 是 MVP 可耕作范围的唯一内容配置；TMX 不再维护重复的 `Farmable` 图层。
- 阶段 5 通过适配层提供真实 `Blocking` 查询并消费这个布尔结果；本切片不读取 JSON、不监听输入，也不执行锄地。

## Screen-to-Tile Adapter Slice

阶段 4D 把原始游戏屏幕指针坐标接到既有世界与瓦片规则，不引入平台专属输入：

- `ScreenTileMapper` 是 Cocos seam 上的 adapter，interface 只有 `screenToTile(point)`；`GameScreenPoint` 明确要求调用方传入 `getLocation()` 的原始游戏屏幕坐标，不需要了解 Camera 视口、Canvas 缩放或 TiledMap 锚点。
- `Camera.screenToWorld()` 处理实际视口、设备旋转与正交投影，再由 TiledMap `UITransform` 转为地图局部坐标；`getUILocation()` 已执行 UI 适配，禁止作为 mapper 输入。
- 地图局部点最终交给阶段 4A `worldToTile`，因此地图外、负方向和最大边界继续返回 `null`，不会夹取到边缘格。
- mapper 不监听 `MOUSE_UP` 或 `TOUCH_END`；开发期 `TileInteractionDebugView` 是当前 caller，并让两种物理事件共用同一个 interface。
- 蓝色半透明框只证明屏幕定位，黄色框继续证明玩家朝向；两者都不修改游戏状态，也不代表可耕作或执行工具动作。
- 当前只支持已经锁定的 2D 正交 Camera 和轴对齐、缩放为 1 的 World；真实微信设备触控仍须在后续微信构建阶段回归。
- 阶段 4D 的 Creator 绑定、浏览器鼠标点击、相机移动后点击和另一横屏尺寸点击已验收；浏览器设备触控模拟未执行，不计入已通过项目。

## Farm State Slice

阶段 5A 只建立可持久化的耕地状态变更，不接输入和渲染：

- `FarmState` 以 `mapId` 和按底部原点整数瓦片坐标保存的 `tiles` 作为权威领域状态；普通未开垦地面不写入数组。
- `tillTile(farm, target, isFarmable)` 是公开命令 seam；world 的可耕作性通过查询函数注入，farming 不直接读取 TiledMap 或 `maps.json`。
- 成功结果为 `tilled`，创建 `isTilled=true`、尚未浇水且没有作物的地块；输入状态不被修改。
- 已存在的同坐标返回 `already_tilled`，不可耕作或缺失目标返回 `not_farmable`；两种结果都保持原状态，不抛出正常玩法错误。
- 阶段 5B 负责锄头语义输入和真实地图适配，阶段 5C 才负责已耕地视觉；5A 不修改场景。
- 阶段 5A 已通过 Creator 导入和浏览器回归；首次预览出现的 Box2D 外部缓存加载失败在资源重建后通过强制刷新恢复，不属于 farming 代码错误。

## Tilling Input and Tiled Adapter Slice

阶段 5B 把阶段 5A 规则连接到真实输入和地图，但不绘制土地：

- `KeyboardInputBridge` 仅把 `KeyCode.SPACE` 翻译为 `InputSnapshot.primaryAction`；farming 不依赖键码，后续微信动作按钮可输出同一语义。
- `PlayerController.getInputSnapshot()` 只公开平台无关的输入快照，让同节点玩法组件复用现有输入服务。
- `updateTillingSession(session, primaryActionPressed, target, isFarmable)` 保存动作键门闩；只有松开到按下的边沿执行耕地，持续按住返回 `idle`。
- `createTiledFarmabilityMap` 要求 Tiled 地图宽高和瓦片尺寸与选定 `MapDefinition` 完全一致，再把 JSON 可耕作矩形与 Tiled 顶部原点 `Blocking` 行查询组合为底部原点领域查询。
- `TiledTillingController` 位于 Player 节点，读取 Player 最后朝向和 World 变换，选择正前方一格并更新内存中的 `FarmState`；预览重启后状态清空，持久化留到存档阶段。
- 当前 `primaryAction` 暂时等同于使用默认锄头；快捷栏与选中工具路由留到背包阶段。蓝色指针框仍只调试屏幕坐标，阶段 5C 才投影已耕地视觉。
- 开发期每次有效动作按下在 Console 记录 `tilled`、`already_tilled` 或 `not_farmable`，用于阶段 5B 无视觉切片验收。

## Tilled Soil Rendering Slice

阶段 5C 只把阶段 5A/5B 的权威状态投影为画面，不改变耕地规则：

- `createFarmableGroundPatches(area, grid)` 和 `createTilledSoilPatches(farm, grid)` 是无 Cocos 依赖的只读投影 seam；前者从 JSON 包含边界矩形生成未耕药圃底地，后者从 `FarmState` 生成覆盖其上的已耕地。
- 投影不会修复或写回状态；非法、非整数或当前地图外的瓦片只在渲染输出中忽略，避免坏存档坐标污染画面。
- `TilledSoilView` 通过 Inspector 引用 Player 的 `TiledTillingController` 和 World `TiledMap`，只消费 `farmState`。
- `FarmState` 每次成功耕地创建新引用；视图比较引用并只在变化时重绘。`already_tilled`、`not_farmable` 和普通帧不会触发重复绘制。
- MVP 视觉使用原创 `Graphics` 三态表现：绿色 Ground 是普通草地，浅黄绿色网格是可耕但未耕的药圃，深棕色矩形、边框和三条耕沟是已耕地。它是可替换的占位表现，不是存档来源，也不修改 TMX 或阻挡层。
- `TilledSoil` 在 Canvas 中位于 World 之后、Player 和 InteractionDebug 之前，保证土块覆盖草地但不遮挡角色与调试框。

## Planting Domain Slice

阶段 6A 在纯 farming module 内建立播种规则，不接输入、场景或渲染：

- `plantCrop(farm, target, seeds, currentDay, crops)` 是公开命令 seam；调用方提供经过验证的只读 `CropDefinition` 列表，implementation 通过 `seedItemId` 解析作物，因而不硬编码雾叶草或内容表。
- `SeedStack` 只表达阶段 6 所需的稳定物品 ID 与数量。成功时消耗 1 粒并返回新种子堆；阶段 8 的背包将提供相同数据并接收结果，不需要重写播种规则。
- 目标必须已经存在于 `FarmState.tiles` 且 `crop === null`。无种子、未耕地、已有作物和未知种子分别返回 `no_seed`、`not_tilled`、`occupied`、`invalid_seed`，正常玩法拒绝不会抛异常或修改输入。
- 非法天数、负数/非整数种子数量和非法成长配置属于状态或数据错误，会明确抛出 `RangeError`，不使用默认值掩盖。
- 成功播种创建内嵌 `CropState`，初始 `growthProgress=0`、`stageIndex=0`；`lastGrowthDay=currentDay-1` 表示播种日尚未结算，为阶段 7 的单次日结束结算保留语义。
- `calculateCropGrowthStage` 按 `growthStages` 的累计正整数天数选择零基视觉阶段；成熟后停在最后一个阶段并返回 `isMature=true`。
- 阶段 6A 不定义播种键、不加载 `JsonAsset`、不绘制作物，也不执行浇水或跨天成长。Cocos/JSON adapter 属于阶段 6B，视觉属于阶段 6C，日结算属于阶段 7。

## Planting Input and JSON/Tiled Adapter Slice

阶段 6B 把阶段 6A 规则接入现有输入、JSON 和唯一农田状态，但仍不绘制作物：

- `KeyboardInputBridge` 把 `KeyCode.KEY_E` 翻译为 `InputSnapshot.secondaryAction`；farming 组件不读取物理键码，后续触控按钮可复用同一语义。
- `decodeCropsData(value)` 把 `JsonAsset.json` 当作 `unknown` 校验：只接受 schema 1、非空稳定 ID、正整数成长阶段/产量、合法季节，以及不重复的作物 ID 和种子 ID。
- `TiledTillingController` 继续独占权威 `TillingSession/FarmState`。公开的 `plantFacingCrop` 只允许执行“在当前面对格播种”命令，不暴露任意状态 setter；成功后保留锄头按键门闩并替换同一会话中的 farm 引用。
- `TiledPlantingController` 与 Player 同节点，只拥有临时 `SeedStack` 和 `secondaryAction` 门闩；它从现有 `PlayerController` 读语义输入，从 `crops.json` 取作物配置，再调用状态拥有者的命令 seam。
- E 从松开到按下的边沿只执行一次；同时按下空格和 E 时锄地优先，避免同一帧先耕后种。成功消耗 1 粒种子，普通拒绝不消耗。
- 开发日志统一输出状态、底部原点目标瓦片和剩余种子数。临时库存默认是 3 粒 `mistleaf_seed`，阶段 8 将以真实背包替换，不改变 `plantCrop` 领域接口。
- 本切片不创建作物节点或图片；阶段 6C 只读投影 `FarmState` 中的 `crop`。

## Planted Crop Rendering Slice

阶段 6C 只把权威作物状态投影到画面，不拥有或修改玩法状态：

- `createCropPatches(farm, grid)` 输出底部原点瓦片坐标、TiledMap 局部中心/底边、稳定 `cropId` 和 `stageIndex`；空地、非法阶段、非法坐标和地图外坏状态不进入渲染输出。
- `CropView` 通过 Inspector 引用 Player 的 `TiledTillingController` 与 World `TiledMap`，只读取 `source.farmState`。成功播种创建新的 farm 引用后重绘，拒绝操作保持旧引用且不叠加图形。
- `Crops` 独立节点位于 `TilledSoil` 之后、Player 之前，使幼苗覆盖土块而角色与调试框保持在上层。
- 当前原创占位表现由 `Graphics` 的整数矩形组成：阴影、深绿茎、雾绿色双叶、叶片高光和后续阶段芽苞。没有外部图片、SpriteFrame 或商业游戏素材。
- `stageIndex` 0～2 会改变茎、叶和芽苞尺寸，为阶段 7 的成长结算保留显示接口；阶段 6C 本身不推进日期或成长。
- 表现层不会查找种子库存、消费物品、修复坏存档或直接调用播种命令。

## Tiled Import Smoke Baseline

阶段 3 先锁定最保守的导入边界，再实现地图玩法：

- Tiled 1.12.2、正交有限地图、`30×30`、每格 `32×32`。
- 单一 `Ground` 图层，未压缩 CSV，嵌入单图块 tileset，纹理与 TMX 同目录。
- 占位图块由项目内 TypeScript 工具确定性生成，不包含外部或商业游戏素材。
- Cocos 3.8.8 本地解析源码已确认支持 CSV；冒烟测试不使用无限地图、复杂对象模板、脚本或图块动画。
- Creator 导入、场景绑定和 640×360 浏览器预览已经通过，未观察到图块接缝；后续子任务才逐步加入阻挡、房屋、可耕作区、睡觉点、碰撞与摄像机。

## Grid Collision Slice

阶段 3B 使用一条小而完整的阻挡切片：

- Tiled 的 `Obstacles` 图层负责可见石墙，隐藏 `Blocking` 图层以非零 GID 表示不可通行瓦片；两层坐标必须一致。
- `GridCollision` 使用底部原点的整数瓦片坐标，地图范围外始终视为阻挡；Tiled 顶部原点行号只在适配层转换。
- 玩家使用轴对齐包围盒、先 X 后 Y 的分轴解析，允许斜向输入沿墙滑动；位移按不超过半个瓦片的子步扫掠并在接触处二分，避免大帧穿墙。
- `PlayerController` 只依赖 `IPlayerCollisionService`，`TiledCollisionBridge` 才访问 Cocos `TiledMap`、节点变换和 `Blocking` 图层。
- 当前地图和 World 保持位置 `(0, 0, 0)`、缩放 `(1, 1, 1)`；旋转或非等比缩放不属于本阶段支持范围。

## Bounded Camera Follow Slice

阶段 3C 只实现即时跟随和有限地图夹取：

- `CameraBounds` 是无 Cocos 依赖的纯规则；目标位于安全范围内时相机中心跟随目标，接近边界时夹取到“地图边缘减去半个视口”。
- 某个地图轴小于当前视口时，该轴固定显示地图中心；地图外留白在这种情况下不可避免，但行为保持对称和确定。
- `BoundedCameraFollow` 在 `lateUpdate` 执行，确保 Player 当帧移动完成后再更新 Camera，不引入平滑延迟或每平台差异参数。
- Canvas 可能在 resize 时修改正交高度，因此每帧读取 `Camera.orthoHeight` 和底层 camera aspect；禁止硬编码设计分辨率作为实际视口。
- 地图四角经 `UITransform.convertToWorldSpaceAR` 转换后计算世界 AABB，支持当前 Canvas 世界偏移；非轴对齐地图只按其世界 AABB 约束。

## Farming Rules

当前地块状态：

- `isTilled`
- `wateredOnDay`，使用天数而不是依赖场景颜色判断。
- 内嵌 `CropState | null`。

当前作物状态：

- `cropId`
- `plantedOnDay`
- `growthProgress`
- `stageIndex`
- `lastGrowthDay`

阶段 7A 以 `FarmDayState` 把 `currentDay` 和 `FarmState` 放在同一个纯规则 interface 后面：

- `waterTile(state, target)` 只接受已经进入农田状态的地块；首次浇水写入当前日，同日重复或未耕目标保持输入状态引用。
- `advanceFarmDay(state, crops)` 是唯一单日成长结算入口。成功调用只把日期加一；`lastGrowthDay >= currentDay` 的作物不会重复结算。
- `requiresWater=true` 的作物只有 `wateredOnDay === currentDay` 时增加一天进度；未浇水时只记录已结算日，进度不变且不会枯死。不需水作物不依赖浇水标记。
- 成长进度封顶于 `growthStages` 总天数，视觉阶段封顶于最后一阶；旧 `wateredOnDay` 不清空，新日期通过不相等语义自然视为未浇水。
- 任一持久化作物缺少对应 `CropDefinition` 时返回 `invalid_crop`，整次操作保持原状态；非法日期属于损坏状态并抛出 `RangeError`。
- 阶段 7A 不接输入、Tiled、Cocos 场景、湿土视觉、睡觉点或存档。阶段 7B/7C adapter 将只穿过以上两个 interface 改变权威状态。

阶段 7B 通过现有状态拥有者接入浇水输入和只读湿土表现：

- `InputSnapshot.wateringAction` 是独立于物理设备的浇水动作；PC 的 `KeyboardInputBridge` 暂映射 F，未来微信触控按钮输出同一语义。
- `TiledTillingController.farmDayState` 是运行时唯一日期/农田快照；`waterFacingTile()` 选择 Player 正前方一格并调用纯 `waterTile`。播种也读取该拥有者的日期，adapter 不复制 `FarmState` 或 `currentDay`。
- `TiledWateringController` 只处理动作按下沿和日志，持续按住不重复。空格、E、F 同时出现时按锄地 > 播种 > 浇水处理，避免一次输入写入多个工具结果。
- `createWateredSoilPatches` 只返回当前日浇水且位于有限地图内的格子；旧日期标记自然显示为干土，非法日期安全返回空投影。
- `TilledSoilView` 依次绘制可耕地、干燥已耕地和当前日湿土；它仍只读权威状态，层级继续位于作物和 Player 下方。
- 阶段 7B 不推进日期或成长。睡觉、`advanceFarmDay` adapter、次日湿土失效与成长视觉回归属于阶段 7C。

阶段 7C 把睡觉点连接到同一个日结算入口，不增加第二份日期状态：

- `InputSnapshot.sleepAction` 是平台无关的睡觉确认动作；PC 暂映射 Enter，未来微信触控按钮仍输出相同语义。
- `sleepAtTile(state, target, sleepTile, crops)` 只在正前方目标等于配置睡觉格时调用 `advanceFarmDay`。普通位置返回 `not_at_sleep_point`，未知持久化作物返回 `invalid_crop`，两者都保持原状态引用。
- `TiledTillingController.sleepFacingTile()` 是唯一运行时命令 seam：它原子替换 `currentDay` 与 `FarmState`，同时把已验证的 `spawnTile` 转成世界坐标交给输入 adapter；不暴露任意状态 setter。
- `TiledSleepingController` 只处理 Enter 按下沿、JSON 解码、动作优先级、日志和成功传送。空格、E、F、Enter 同时出现时仍按锄地 > 播种 > 浇水 > 睡觉处理。
- 成功睡觉后 Player 被移到出生点，因此长按只触发一次，松开后立即再次按 Enter 也因不再面对睡觉点而不能连续跳日。
- `SleepPointProjection` 和 `SleepPointView` 只把 `maps.json.sleepTile` 显示为原创几何休息标记。它们不拥有日期，也不触发结算。
- `TilledSoilView` 在日期变化后让旧 `wateredOnDay` 自然显示为干土，`CropView` 在不可变 `FarmState` 被替换后自动显示新成长阶段，视图之间不互相调用。
- 阶段 7C 不加入正式确认弹窗、日期 HUD、自动存档、收获、背包或微信触控按钮。

## Inventory Rules Slice

阶段 8A 先建立纯进程内库存 module，不接 Cocos 场景、输入或存档：

- `InventoryState` 只包含固定长度的 `slots` 与合法的 `selectedSlotIndex`。MVP 默认 8 格，背包与快捷栏共用同一组格子，避免两份物品位置状态。
- `ItemStack` 只保存稳定 `itemId` 与正整数 `quantity`；堆叠上限来自已校验的 `ItemDefinition.maxStack`，领域代码不硬编码工具或作物 ID。
- `addInventoryItem` 与 `removeInventoryItem` 都是原子命令 seam：请求必须完整成功，否则返回原状态引用。这样后续收获可以在背包容量不足时保留成熟作物，不会出现部分奖励或物品丢失。
- 添加时先填低索引已有同类堆，再占用低索引空格；移除时从低索引同类堆开始。排序规则固定，因此测试、UI 和存档结果可预测。
- 未知动作物品是普通拒绝，返回 `invalid_item`；损坏的持久化状态或内容配置属于不变量破坏并抛出 `RangeError`，不静默修复。
- `selectInventorySlot` 负责维护选择范围，`getSelectedItemStack` 是后续工具路由、播种和快捷栏视图共享的读取 interface。
- 库存只有一个进程内 implementation，因此不增加 `IInventoryService` seam。阶段 9 会直接序列化 `InventoryState`，平台存储差异继续留在既有 `ISaveService` 后面。
- 阶段 8A 不替换临时 `SeedStack`、不创建起始物品、不接快捷栏输入、不绘制 HUD，也不实现收获；集成按阶段 8B～8D 分步完成。

## Harvest Transaction Slice

阶段 8B 只增加跨农田与背包的纯收获事务，不接输入、Cocos 场景或存档：

- `HarvestState` 把本次命令必须共同提交的 `FarmState` 与 `InventoryState` 配对；它不是完整运行时根状态，也不拥有生命周期。
- `harvestCrop(state, target, crops, items)` 是单一收获 interface。implementation 内部完成目标查找、作物配置解析、成熟判定、产量解析、背包容量检查和两份新状态构造。
- 成熟度由既有 `calculateCropGrowthStage` 根据 `growthProgress` 与 `growthStages` 计算，不信任视觉 `stageIndex` 作为可收获标志，避免最终外观提前一日可收获。
- 收获物 ID 和数量只来自 `CropDefinition.harvestItemId/harvestQuantity`；实际堆叠继续穿过 `addInventoryItem`，因此与快捷栏、后续存档共享同一库存不变量。
- 成功先确认全部产量能进入背包，再清空目标格作物；地块仍保持 `isTilled=true`，当日浇水标记保留。普通失败返回原 `HarvestState` 引用，调用方无法得到半完成状态。
- `not_tilled`、`no_crop`、`not_mature`、`inventory_full`、`invalid_crop` 和 `invalid_item` 是可预期玩法拒绝；损坏计数和内容不变量继续抛出 `RangeError`。
- 本 module 是纯进程内规则，不新增 `IHarvestService` 或 adapter。阶段 8C/8D 才建立运行时背包所有者、输入路由和 HUD。

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
- 手工矩阵：编辑器预览、Steam Windows 构建、微信开发者工具、微信真机。
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
