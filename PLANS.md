# FarmGame 执行计划

更新时间：2026-07-14

## 状态说明

- `[x]` 已完成并有验证记录
- `[ ]` 未开始
- `[~]` 进行中，仍有已记录的人工操作或验收

## 阶段 0：环境、文档与范围基线

状态：`[x]`

已完成：

- 检查空工作区、Git 状态与已有文件。
- 实测 Git、Node.js、npm 版本。
- 从 PATH、卸载注册表、常见安装路径和开始菜单探测 Cocos Creator、微信开发者工具、Tiled。
- 建立项目规范、MVP、技术、平台、数据、美术和知识产权文档。
- 对照 Cocos Creator 3.8 LTS 官方文档确认微信小游戏、Windows 和 Tiled/TMX 的能力与主要风险。

2026-07-13 首次检查记录：

- 当前目录不是 Git 仓库。
- Git `2.49.0.windows.1`、Node.js `v24.11.0`、npm `11.6.1` 可调用。
- 未发现 Cocos Creator、微信开发者工具和 Tiled。
- 本阶段未创建代码、引擎配置或第三方素材。

## 阶段 0.5：工具安装验收

状态：`[x]`

2026-07-14 实测：

- Cocos Dashboard `2.2.1`：路径存在，Xiamen Yaji Software 数字签名有效。
- Cocos Creator `3.8.8`：路径存在，产品/文件版本均为 3.8.8，Xiamen Yaji Software 数字签名有效。
- 微信开发者工具稳定版 `2.01.2510290`：路径存在，Tencent Technology 数字签名有效；官方 `cli.bat` 可执行。
- Tiled `1.12.2`：路径存在，产品版本为 1.12.2，SignPath Foundation 数字签名有效。
- 用户报告安装和首次启动无错误或警告。
- 当前没有微信小游戏 AppID；不阻塞阶段 1，但阶段 11 前必须准备。

## 阶段 1：工程初始化

状态：`[x]`

范围：

1. 使用 Cocos Creator 3.8.8 创建空白 2D 项目，并在 MVP 期间锁定该版本。
2. 让编辑器生成项目设置、资源元数据、初始场景和 TypeScript 配置。
3. 检查生成结构后，建立 `assets/scripts` 下的模块目录。
4. 建立平台抽象接口、领域基础类型、JSON 示例和存档模型。
5. 建立不含玩法的最小启动场景。
6. 添加与实际 Cocos 版本匹配的 `.gitignore`。
7. 初始化本地 Git；按用户提供的 GitHub 地址设置 `origin`，本阶段不提交、不推送。
8. 运行编辑器导入、TypeScript 检查和空场景预览。

建议目录（最终以编辑器生成项目为准）：

```text
assets/
  animations/
  audio/
  data/
  maps/
  prefabs/
  scenes/
  scripts/
    core/
    data/
    farming/
    inventory/
    platform/
    player/
    ui/
    world/
  textures/
docs/
references/
```

不包含：角色移动、农田、NPC、商店、任务、战斗和完整 UI。

2026-07-14 已完成：

- 从本机 Cocos Creator 3.8.8 安装目录复制该版本真实的 `empty-2d` 模板，没有伪造引擎配置。
- 使用 Cocos Creator 3.8.8 实际打开并导入项目；编辑器生成 30 个资源元数据文件和 `settings/v2` 配置。
- 最新 `asset-db` 日志只有 `debug`/`log` 级记录，没有 `error`/`warn` 级记录；其中一次内置 `primitives.fbx` 转换状态文件的 debug 级 `ENOENT` 后导入继续进行，暂未观察到项目资源导入失败。
- 建立职责目录、严格 TypeScript 配置、五个平台接口、Desktop/WeChat 平台边界、内存/空实现适配器、版本化单槽存档模型。
- 建立 `items.json`、`tools.json`、`crops.json`、`maps.json`、`localization.json` 和配套 TypeScript 类型/跨文件校验器。
- 使用 Creator 自带 TypeScript 5.8.2 执行项目级 `--noEmit` 检查并通过；JSON 解析、引用关系、30×30 地图、32 像素瓦片和 10×10 可耕作区检查通过。
- 初始化本地 Git `main` 分支，并设置 `origin` 为 `git@github.com:kasakukiko/AI-game-FarmGame.git`；没有提交、联网读取远程或推送。

人工验收进度：

- `[x]` 默认 Canvas 已设为 `640×360`、`Fit Height = true`、`Fit Width = false`；已从编辑器生成设置文件复核。
- `[x]` `assets/scenes/Main.scene` 及 `.meta` 已由编辑器生成；场景包含 Canvas、Camera、Canvas/Camera 组件关联和 640×360 UITransform。
- `[x]` 清空旧的 Creator 内置服务错误后执行浏览器预览；预览成功，清空后红色错误计数为 0，没有新项目错误。

错误诊断记录：

- 截图中的 `msg not exist!` 记录于 10:37:37，早于 `Main.scene` 的 11:11:22 保存时间。
- 堆栈来源为 Creator 安装目录内的 `resources/app.asar/extension/cocos-service`，没有项目 `assets` 堆栈帧；它不是场景或项目脚本产生的错误。
- “About plug-in migration” 是编辑器通知；当前项目没有 `packages` 或 `extensions` 插件目录，不需要执行插件迁移。
- 为避免用旧错误掩盖真实预览结果，验收时先清空 Console 再重新预览；干净预览已经通过。

最终验收记录（2026-07-14）：

- 用户在 Cocos Creator 3.8.8 浏览器预览器中以 `640×360` 设计分辨率成功运行最小场景，截图显示运行帧率 60 FPS。
- 用户确认清空 Console 后红色错误计数为 0，且没有出现新错误。
- 再次执行 Creator 自带 TypeScript 5.8.2 项目级 `--noEmit`：通过。
- 再次解析场景、项目设置、5 个 JSON 文件及跨文件引用：通过。
- 阶段 1 完成；没有进入角色移动或其他玩法阶段。

完成门槛：

- Cocos Creator 能打开项目且控制台无未解释错误。
- 最小场景能在浏览器预览。
- TypeScript 检查可执行并通过，或所有阻塞均已记录。
- `wx`、`window` 和 `localStorage` 未进入核心模块。
- `docs/MANUAL_STEPS.md` 记录用户实际操作和验证结果。

## 阶段 2：角色移动原型

状态：`[x]`，代码、自动化测试、Cocos 场景绑定和浏览器预览全部通过。

范围：四方向移动、WASD/方向键、统一输入接口、触控输入端口、可配置速度、归一化移动向量、朝向状态。只使用占位几何图形或原创占位图。

完成门槛：

- PC 键盘两套按键都能操作。
- 同时按两个方向不会产生更高速度。
- `PlayerController` 不直接监听平台 API。
- 停止移动后仍保留最后朝向。
- 编辑器节点与组件绑定步骤可复现。

2026-07-14 已完成：

- 新增纯 TypeScript `PlayerMovement`：输入有限值处理、单位圆归一化、可配置速度、帧位移和四方向最后朝向。
- 新增 `PlayerController`：只读取 `IInputService` 语义快照，不注册键盘或触摸事件。
- 新增 `KeyboardInputBridge`：将 WASD 和方向键映射为统一移动轴，按键注册/注销由 Cocos 组件生命周期管理。
- 新增 `TouchInputPort`：为后续虚拟摇杆提供 `setMoveVector`/`releaseMovement` 语义入口，不接触 `wx` 或原始触摸坐标。
- 新增 `PlayerPlaceholderView`：使用 Cocos Graphics 绘制项目内原创几何占位角色，并以黄色标记显示最后朝向。
- 存档中的 `FacingDirection` 改为复用玩家领域类型，避免朝向定义漂移。
- Node 24 内置测试运行器执行 7 项移动规则测试：全部通过。
- Creator 3.8.8 自带 TypeScript 5.8.2 项目检查：通过。
- 核心/玩法模块扫描未发现 `wx`、`window` 或 `localStorage`。
- Creator 3.8.8 已为 6 个新脚本生成 `.meta`；已检查 importer 均为 `typescript`，UUID 无重复。
- 修复 Creator 3.8.8 场景面板无法处理数组形式 `requireComponent` 元数据的问题；占位视图只声明单一 `Graphics` 依赖，节点既有的 `UITransform` 和键盘桥自动添加的 `PlayerController` 继续复用。
- 新增对应回归测试，可稳定捕获 `Right-hand side of 'instanceof' is not callable`。

人工验收结果：

- `Main.scene/Canvas/Player` 已由 Creator 编辑器生成并保存；位置 `(0, 0, 0)`、层 `UI_2D`，包含 `UITransform`、`PlayerController`、`KeyboardInputBridge`、`Graphics`、`PlayerPlaceholderView`。
- 浏览器以 `640×360` 设计分辨率预览成功，原创几何角色正常显示。
- 用户实测 WASD、方向键、斜向移动和停止后朝向保留均成功；刷新并清空旧记录后红色错误计数为 0。
- Creator 最新编译产物已确认使用单一 `requireComponent(Graphics)`，修复后没有产生新的同类错误。

## 阶段 3：Tiled 地图与碰撞

状态：`[~]`，阶段 3A“Tiled 导入冒烟测试”、阶段 3B“最小阻挡层与角色碰撞”和阶段 3C“摄像机跟随与地图边界”均已完成；房屋、可耕作区和睡觉点尚未加入。

范围：使用 32×32 像素瓦片制作 30×30 农场、10×10 可耕作区、不可进入的房屋外观、屋外睡觉交互点、阻挡层和摄像机跟随。地图与图块必须原创或有明确授权。

完成门槛：

- `.tmx`、必要的 `.tsx` 与纹理同目录并可由 Cocos 正确导入。
- 玩家无法穿越阻挡层，摄像机不展示地图外区域。
- 检查像素接缝、纹理过滤和不同分辨率下的表现。

2026-07-14 阶段 3A“Tiled 导入冒烟测试”完成记录：

- 使用项目内 TypeScript 工具确定性生成原创 `32×32` 草地占位 PNG；来源、色板、哈希和用途已记录到 `docs/ASSET_SOURCES.md`。
- 由 Tiled 1.12.2 实际导出 `30×30`、正交、单一 `Ground` 图层、未压缩 CSV、嵌入 tileset 的 `mvp_farm.tmx`。
- Cocos Creator 3.8.8 已自动导入 TMX 和 PNG，生成的 importer 分别为 `tiled-map` 与 `image`；asset-db 日志没有导入错误。
- Node 自动测试固定 PNG 尺寸、TMX 版本、地图/瓦片尺寸、图层名、纹理相对路径、CSV 编码和 900 个 GID；当前 9 项测试全部通过。
- Creator 已将 `Main.scene/Canvas/World`、`cc.TiledMap`、`Ground` 和 `mvp_farm.tmx` 引用写入场景，节点顺序为 `Camera`、`World`、`Player`。
- `mvp_farm_ground` 保持 `sprite-frame`；隐藏的内部纹理为 Mip None、Wrap Clamp To Edge、Min/Mag Linear。浏览器实测没有明显图块接缝或模糊，因此本冒烟基线不切换资源类型或手改 `.meta`。
- 640×360 浏览器预览显示草地图覆盖视口，Player 位于地图上方且移动正常，Creator Console 没有新红色错误。

下一子任务才会逐步加入阻挡层与碰撞；当前验收完成不代表阶段 3 整体完成。

### 阶段 3B：最小阻挡层与角色碰撞（已完成）

2026-07-14 已完成的自动部分：

- 项目生成器新增原创 `32×32` 石墙占位图块，并由 Tiled 1.12.2 实际导出可见 `Obstacles` 和不可见 `Blocking` 图层；出生点右侧放置一列 4 格石墙用于验收。
- 新增纯 TypeScript 网格碰撞规则：地图外视为阻挡，AABB 分轴解析支持沿墙滑动，扫掠子步避免大帧位移穿墙。
- `TiledCollisionBridge` 负责把 Tiled 顶部原点行号、地图中心锚点和 Cocos 世界坐标转换后注入 `PlayerController`；核心规则不依赖 Cocos、`wx` 或浏览器 API。
- world 测试覆盖有限地图边界、占用瓦片、斜向滑墙、防穿透、Tiled 行号转换和三层 TMX 结构。
- Creator 3.8.8 已为石墙 PNG、`GridCollision` 和 `TiledCollisionBridge` 生成 `.meta`，importer 分别为 `image` 和 `typescript`，均标记为 imported。

2026-07-14 Creator 人工验收记录：

- `Main.scene` 已由 Creator 保存 `Ground`、`Obstacles` 和未激活 `Blocking` 三个 Tiled 子图层。
- `Player` 已绑定 `TiledCollisionBridge`，其 `Tiled Map` 指向 `World` 上的实际 `cc.TiledMap`，图层名为 `Blocking`；碰撞半宽/半高保持 `8/11`。
- 浏览器预览中 Player 正面无法穿过 4 格石墙，斜向贴墙可以滑动，离墙后普通移动正常。
- Creator Console 没有新红色错误或重复缺失绑定警告。

阶段 3B 已完成；下一子任务才处理摄像机跟随，当前不加入房屋、可耕作区或其他玩法。

### 阶段 3C：摄像机跟随与地图边界（已完成）

2026-07-14 已完成的自动部分：

- 新增纯 TypeScript `CameraBounds` 规则，根据目标位置、地图世界边界和实际正交视口尺寸计算相机中心。
- 边界规则覆盖地图内部跟随、四边夹取、宽屏视口、视口大于地图时居中，以及带 Canvas 世界偏移的地图。
- 新增 `BoundedCameraFollow` Creator 组件，在 `lateUpdate` 中跟随 Player；视口尺寸来自运行时 `Camera.orthoHeight × Camera.aspect`，不硬编码 `640×360`。
- 地图边界由 TiledMap 的 `UITransform` 四角转换到世界坐标得到，窗口或设计分辨率变化后会使用当前相机参数重新计算。
- Creator 3.8.8 已为 `CameraBounds` 和 `BoundedCameraFollow` 生成 `.meta`，importer 均为 `typescript` 且标记为 imported。
- 分辨率切换回归覆盖地图内部目标在 `640×360`、`800×360` 和 `360×800` 视口下保持居中。
- 修复运行中切换预览尺寸时可能丢失 `KEY_UP`、导致角色持续朝旧方向移动的问题；`KeyboardInputBridge` 现在在 Creator 的 `canvas-resize` 事件中清空旧按键状态。

2026-07-14 人工验收记录：

- `Main.scene` 已由 Creator 保存 `Canvas/Camera/BoundedCameraFollow`，Target 指向 `Player`，Tiled Map 指向 `World` 的 `cc.TiledMap`。
- 浏览器预览已确认地图内部跟随、石墙碰撞和地图左/右/上边界正常，不显示地图外区域；Console 无新错误或重复警告。
- 单独用 `OPPO Reno2 (360×800)` 打开时正常；运行中切换尺寸曾暴露旧按键状态残留，修复后“切换尺寸 → 松开 W”会立即停止，其他方向仍正常。
- 切换尺寸后地图内部重新居中正常；到达地图边缘时 Player 会偏离屏幕中心，这是相机停止于边界、不显示地图外区域的预期行为。
- 回归预览保持 60 FPS，Creator Console 无新错误或重复警告；阶段 3C 验收通过。

阶段 3C 已完成。下一阶段只在收到明确指令后开始；当前不提前加入房屋、可耕作区、睡觉点或其他玩法。

## 阶段 4：瓦片坐标与交互检测

状态：`[~]`，阶段 4A“纯坐标与面向瓦片规则”和阶段 4B“场景交互目标调试框”均已完成；屏幕坐标适配与可耕作性查询尚未开始。

范围：世界坐标、屏幕坐标和瓦片坐标转换；面向瓦片选择；交互距离；可耕作性查询。先写纯逻辑测试，再接场景表现。

完成门槛：边界瓦片、负坐标和地图外输入均有确定行为，交互目标与玩家朝向一致。

### 阶段 4A：纯坐标与面向瓦片规则（已完成）

2026-07-14 已完成的自动部分：

- 新增无 Cocos 依赖的 `TileInteraction` 公共规则，瓦片坐标与现有碰撞系统统一使用左下角原点，向右、向上递增。
- `worldToTile` 使用 `floor` 处理负方向和边界；地图外返回 `null`，不把非法位置夹取到边缘瓦片。
- `tileToWorldCenter` 只接受地图内整数瓦片，并返回对应格子的世界坐标中心。
- `getFacingTile` 复用 Player 的四方向朝向，从玩家所在瓦片固定选择正前方一格；玩家或目标越界时返回 `null`。
- 通过三个逐步建立的纯逻辑测试固定坐标边界、中心点、四方向选择和一格交互距离。

2026-07-14 Creator 人工验收记录：

- Creator 3.8.8 已成功导入 `TileInteraction.ts`，生成 importer 为 `typescript`、状态为 imported 的 `.meta`；该纯规则没有绑定到场景节点。
- 浏览器预览确认 WASD、方向键、石墙碰撞、相机跟随和地图边界均正常。
- Creator Console 无新错误或重复警告；阶段 4A 验收通过。

阶段 4A 已完成。下一子任务只在收到明确指令后开始；当前不提前加入交互调试框、可耕作层、锄地或农田状态。

### 阶段 4B：场景交互目标调试框（已完成）

2026-07-14 已完成的自动部分：

- 新增 `TileInteractionDebugView` Creator 组件，在 `lateUpdate` 中读取 Player 的世界位置和最后朝向，并复用阶段 4A 规则选择正前方一格。
- 组件通过 TiledMap 的 `UITransform` 在地图局部坐标、世界坐标和调试节点局部坐标之间转换，不复制瓦片索引计算。
- 使用项目现有原创黄色色板绘制 `32×32` 半透明填充与描边；玩家或目标位于地图外时清空显示。
- 组件只负责开发期可视化，不监听输入、不改变游戏状态、不判断可耕作性。
- Creator 组件元数据兼容测试已纳入该组件，继续禁止数组形式的 `@requireComponent`。

2026-07-14 Creator 与浏览器验收：

- Creator 3.8.8 已导入 `TileInteractionDebugView.ts`，并生成 importer 为 `typescript`、状态为 imported 的 `.meta`。
- `Main.scene/Canvas/InteractionDebug` 已由编辑器创建并保存；节点包含独立 `Graphics` 和 `TileInteractionDebugView`，Target=`Player`、Tiled Map=`World`。
- 四方向目标格与跨瓦片更新正常；面向地图外时调试框消失，黄色框只表示当前交互目标。
- 石墙碰撞、相机跟随和地图边界回归正常；浏览器截图保持 60 FPS，Creator Console 无新错误或重复警告。

阶段 4B 已完成。下一子任务只在收到明确指令后开始；当前不提前加入可耕作层、锄地、农田状态或屏幕点击交互。

## 阶段 5：耕地

状态：`[ ]`

范围：锄头选择、土地状态从普通到已耕作、重复操作幂等、视觉反馈。只修改允许耕作的瓦片。

完成门槛：耕地状态由瓦片坐标保存，不能在阻挡区或地图外耕作。

## 阶段 6：播种与作物成长

状态：`[ ]`

范围：一种原创种子、一种作物、播种校验、跨天成长状态。数据从 JSON 加载，不硬编码内容表。

完成门槛：无种子、未耕地、已有作物时不能播种；成长阶段可由配置计算。

## 阶段 7：浇水、睡觉与跨天

状态：`[ ]`

范围：已耕地浇水、每日浇水标记、睡觉确认、日结束结算、次日重置、作物成长。

完成门槛：每次跨天只结算一次；当天未浇水的作物停止成长但不枯死；重复点击睡觉不会跳过多天。

## 阶段 8：收获、背包与快捷栏

状态：`[ ]`

范围：锄头、水壶、种子、收获物；固定容量的简单背包；快捷栏选择；成熟作物收获。

完成门槛：物品堆叠、容量不足、消耗种子和添加收获物的结果可预测且有测试。

## 阶段 9：存档与读取

状态：`[ ]`

范围：版本化存档模型、保存触发点、桌面适配器、内存适配器、损坏存档回退、最小迁移策略。

完成门槛：保存后退出并重新载入，玩家位置、日期、背包、地块和作物状态一致；失败不会静默覆盖有效存档。

## 阶段 10：微信触控适配

状态：`[ ]`

范围：为横屏 640×360 逻辑画面实现左侧虚拟摇杆、右侧动作按钮、快捷栏、安全区、前后台生命周期和微信存档适配器。

完成门槛：微信开发者工具和至少一台低至中档真机可完成整个 MVP 闭环；前后台切换不重复结算或丢档。

## 阶段 11：微信小游戏构建验证

状态：`[ ]`

范围：AppID、构建设置、包体报告、资源分包/远程资源、缓存、真机性能、提交前检查。

完成门槛：开发者工具无未解释错误；真机首包、加载、存档和完整闭环通过；记录基础库版本、设备与构建参数。

## 阶段 12：Windows 构建验证

状态：`[ ]`

范围：Windows 原生构建环境、窗口设置、本地存档路径、打包和冷启动验证。

完成门槛：在一台未运行编辑器的 Windows 机器上可启动、完成闭环并恢复存档。

## 贯穿所有阶段的验证

- TypeScript 类型检查与纯逻辑单元测试。
- Cocos 编辑器导入、预览和控制台检查。
- PC 输入回归。
- 微信开发者工具检查，但不把模拟器结果等同于真机结果。
- 真机弱性能设备测试、前后台切换、断网和缓存压力测试。
- 存档 round-trip、损坏数据和版本兼容测试。
- 资源来源清单与许可证检查。

## 主要技术风险

| 风险 | 影响 | 处理策略 |
| --- | --- | --- |
| Cocos Creator 在 MVP 期间意外升级 | 项目格式、API 或构建行为可能漂移 | 锁定已验收的 3.8.8；升级必须单独评估和备份 |
| Node.js 24 与编辑器工具链兼容性未知 | CLI 或依赖脚本可能失败 | 遵循选定 Cocos 版本要求；必要时使用独立 LTS Node.js，不替换系统版本 |
| 状态分散在场景节点 | 难以保存、测试和跨平台 | 以领域状态为真相源，节点只负责表现和输入转发 |
| Tiled 坐标与 Cocos 坐标差异 | 错位、边界和交互缺陷 | 集中转换函数并覆盖边界测试 |
| Tiled 1.12.2 新特性超出 Cocos TMX 解析能力 | 导入失败或属性丢失 | 只使用正交地图、基础图层/对象层等保守功能，并在地图阶段先做最小导入冒烟测试 |
| TMX 图集像素接缝 | 地图出现黑线或串色 | 按 Cocos 版本文档配置边缘扩展、过滤和图集间距 |
| 存档模型过早耦合表现层 | 后续迁移困难 | 使用纯 JSON、`saveVersion`、稳定 ID 与显式迁移入口 |
| 两平台输入/存档混写 | 微信构建失败或桌面行为异常 | 所有平台能力通过接口注入 |
| 过早扩展系统 | 闭环迟迟无法运行 | 每阶段设完成门槛，未通过不进入下一阶段 |

## 微信小游戏兼容风险

- 运行环境不是标准浏览器，不能假定任意 DOM、`window` 或浏览器存储 API 可用。
- 主包体积、分包、远程资源与脚本加载受平台限制；具体限额在构建阶段重新核对官方文档。
- 远程资源缓存有空间和淘汰行为，开发者工具不会完整模拟真机限制。
- 前后台、来电、锁屏和系统回收会影响暂停、存档与日结算。
- 触控安全区、横竖屏、不同宽高比和高 DPI 会影响 UI 与输入。
- 低端设备的内存、纹理、Draw Call、GC 和首屏加载需要真机预算。
- 微信 API、基础库与审核政策会变化，适配器必须集中且构建前复核。
- Cocos 对微信小游戏并非覆盖所有浏览器/组件能力；避免依赖非 MVP 的 WebView、VideoPlayer 等能力。

## 已确认的产品基线

用户于 2026-07-13 确认：

1. 使用 Cocos Creator 3.8.8（3.8 LTS），并在 MVP 期间锁定该版本。
2. 使用横屏和双手触控布局。
3. 使用 640×360 逻辑设计分辨率；保持高度并适配更宽屏幕，最终适配策略由编辑器原型验证。
4. 基础瓦片为 32×32 像素。
5. 采用东方幻想药圃方向；《云岚药圃》为开发代号，雾叶草为 MVP 作物。
6. 使用一个自动存档槽。
7. MVP 不实现货币、出售、商店或加工。
8. 房屋不可进入，只保留屋外睡觉交互点。
9. 当天未浇水的作物停止成长，但不会枯死。
10. 美术先使用项目内原创占位资源。

## 外部状态

- 当前没有微信小游戏 AppID；应在阶段 11 前申请，不阻塞编辑器原型。
- 是否已有自制或授权素材仍未知；在收到明确来源和许可证前，项目只使用原创占位资源。
- Cocos Dashboard、Cocos Creator、微信开发者工具和 Tiled 的版本、路径与签名已于 2026-07-14 验收。

## 官方参考基线

- Cocos Creator 3.8 LTS 手册：<https://docs.cocos.com/creator/3.8/manual/en/>
- 发布到微信小游戏：<https://docs.cocos.com/creator/3.8/manual/en/editor/publish/publish-wechatgame.html>
- TiledMap 资源：<https://docs.cocos.com/creator/3.8/manual/en/asset/tiledmap.html>
- 原生/Windows 发布入口：<https://docs.cocos.com/creator/3.8/manual/en/editor/publish/publish-native-index.html>

以上链接是规划基线，不替代最终所选 Cocos 版本和微信平台的当期文档。
