# FarmGame 执行计划

更新时间：2026-07-17

## 状态说明

- `[x]` 已完成并有验证记录
- `[ ]` 未开始
- `[~]` 进行中，仍有已记录的人工操作或验收

## 当前执行与文档治理

- 阶段 0～9 是已经完成的技术 MVP 历史记录；除修正事实错误外，不再把新需求追加到这些历史阶段。
- 当前产品执行从阶段 10 开始，以 `docs/DEMO_SCOPE.md` 为产品范围、`docs/NARRATIVE_BIBLE.md` 为内部剧透边界、`AGENTS.md` 为硬性护栏。
- `docs/GAME_DESIGN.md` 描述完整产品愿景，但不能绕过 `docs/DEMO_SCOPE.md` 自动增加完整矿洞生态、Boss、经济、恋爱线或地图。
- 专业规格分别由 `docs/TECH_SPEC.md`、`docs/PLATFORM.md`、`docs/DATA_SCHEMA.md`、`docs/ART_BIBLE.md`、`docs/UI_SPEC.md` 与 `docs/DIALOGUE_SPEC.md` 负责；`PLANS.md` 只负责依赖顺序、交付物和完成门槛。
- 旧阶段记录若与当前路线冲突，以当前阶段 10～20 和上述权威文档为准；新文档尽量使用里程碑名，避免阶段号调整后再次漂移。
- 阶段 10A Demo 需求基线已于提交 `c98103b` 建立并推送；阶段 10B 及以后不回写该历史提交。
- 美术、音乐、环境声和音效的创作、选型与风格定稿默认使用独立任务/对话。当前主线任务只维护需求、资源 ID、数据契约和验收接口，不顺带生产视听资源。需要资源时必须按 `docs/RESOURCE_CREATION_WORKFLOW.md` 告知用户并提供已填写的新对话/外部工具简报；可使用 Codex、即梦或其他工具，但输出必须按来源、授权与回接规则处理。

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
- 当前没有微信小游戏 AppID；不阻塞技术 MVP、阶段 10 和阶段 11 的编辑器/Windows 视觉样片，但在首个微信内存烟测与阶段 18 正式构建验收前必须准备。

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
- 初始化本地 Git `main` 分支；`origin` 后续已按用户授权迁移为 `git@github.com:Kasakukiko-s-Company/AI-game-FarmGame.git`。

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

状态：`[x]`，阶段 4A“纯坐标与面向瓦片规则”、阶段 4B“场景交互目标调试框”、阶段 4C“纯可耕作瓦片查询”和阶段 4D“屏幕/触控坐标适配”均已完成。真实微信设备触控仍按平台验收边界留到微信构建阶段回归。

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

### 阶段 4C：纯可耕作瓦片查询（已完成）

2026-07-14 已完成的自动部分：

- 新增无 Cocos 依赖的 `TileFarmability` 公共规则；调用方提供有限地图尺寸、包含边界的可耕作矩形和底部原点阻挡查询。
- `isTileFarmable` 只接受地图内整数瓦片；`null`、负坐标、地图外坐标和非整数坐标统一返回 `false`。
- 可耕作范围继续以 `assets/data/maps.json` 的 `farmableArea` 为数据源，不在 TMX 中复制第二份范围配置。
- 位于可耕作矩形内但被 `Blocking` 标记的瓦片仍返回 `false`，为阶段 5 禁止在墙体上锄地提供单一入口。
- 按三个 red-green 循环建立公开接口测试，覆盖包含边界的矩形、非法/越界输入和阻挡格排除。
- 本子任务不修改 TMX、场景或农田状态，也不实现锄地、屏幕点击或可见表现。

2026-07-14 Creator 与浏览器验收：

- Creator 3.8.8 已导入 `TileFarmability.ts`，生成 importer 为 `typescript`、状态为 imported 的 `.meta`；项目资源 UUID 检查无重复。
- 该纯规则没有绑定到节点或组件，`Main.scene` 未产生阶段 4C 改动。
- WASD、方向键、石墙碰撞、相机与地图边界、阶段 4B 黄色目标框回归均正常。
- Creator Console 无新错误或重复警告；阶段 4C 验收通过。

阶段 4C 已完成。下一子任务只在收到明确指令后开始；当前不进入锄地、农田状态或屏幕坐标适配。

### 阶段 4D：屏幕/触控坐标适配（已完成）

2026-07-14 已完成的自动部分：

- 对照本机 Cocos Creator 3.8.8 事件分发与 Camera 源码确认：`Camera.screenToWorld()` 接收 `getLocation()` 的左下角原点原始游戏屏幕坐标，并负责实际视口、设备旋转和投影换算；已经过适配的 `getUILocation()` 不能再次传入 Camera。
- 新增 `ScreenTileMapper` Creator adapter，只公开 `screenToTile(point)`；内部集中完成屏幕坐标、Camera 世界坐标、TiledMap 局部坐标和阶段 4A 有限瓦片网格的转换。
- mapper 不监听输入、不执行交互动作，也不访问 `wx`、`window` 或 `localStorage`；未来 PC 鼠标和微信触控调用相同 interface。
- 扩展开发期 `TileInteractionDebugView`：`MOUSE_UP` 和 `TOUCH_END` 共用 mapper，蓝色半透明框显示最近一次屏幕指针对应的瓦片；原黄色朝向框保持独立。
- 指针位于地图外或坐标非有限值时返回 `null`；不把无效点击夹取到地图边缘。
- Creator 组件元数据兼容测试已覆盖 `ScreenTileMapper`，继续禁止数组形式的 `@requireComponent`。
- 本子任务不实现点击锄地、农田状态、触控摇杆或平台专属 API。

2026-07-15 Creator 与浏览器验收：

- Creator 3.8.8 已导入 `ScreenTileMapper.ts`，并生成 importer 为 `typescript`、状态为 imported 的 `.meta`。
- `ScreenTileMapper` 已由编辑器添加到现有 Camera，Tiled Map=`World`；`InteractionDebug/TileInteractionDebugView` 的 Screen Tile Mapper 已绑定该 Camera 组件，场景序列化引用检查通过。
- 浏览器预览确认鼠标点击蓝框正常；移动相机后和切换到另一横屏尺寸后仍能准确定位所点瓦片。
- 截图确认黄色朝向框保持正常；蓝框与黄色框落在同一格时，由于蓝框后绘制而覆盖黄色框，属于预期表现。
- Creator Console 无新错误或重复警告；预览截图保持 60 FPS。
- 本轮没有执行浏览器设备触控模拟，因此不声称触控事件已通过；`TOUCH_END` 与鼠标共用 mapper 的代码已纳入类型和静态检查，真实微信设备触控留到微信构建阶段回归。

阶段 4D 与阶段 4 均已完成。下一阶段只在收到明确指令后开始；当前不把指针点击连接到锄地命令。

## 阶段 5：耕地

状态：`[x]`，阶段 5A“纯耕地状态规则”、阶段 5B“锄头输入与真实地图适配”和阶段 5C“已耕土地视觉”均已完成。

范围：锄头选择、土地状态从普通到已耕作、重复操作幂等、视觉反馈。只修改允许耕作的瓦片。

完成门槛：耕地状态由瓦片坐标保存，不能在阻挡区或地图外耕作。

### 阶段 5A：纯耕地状态规则（已完成）

2026-07-15 已完成的自动部分：

- 新增无 Cocos 依赖的 `FarmState` 领域模块；未被开垦的普通地面不写入状态，已进入农田系统的瓦片按底部原点整数坐标保存。
- `tillTile(farm, target, isFarmable)` 只通过注入的可耕作查询接触 world 边界，不读取 TiledMap、JSON 或平台 API。
- 成功开垦返回 `tilled` 和新的农田状态；新增瓦片固定初始化为 `isTilled=true`、`wateredOnDay=null`、`crop=null`，输入状态不被修改。
- 重复开垦同一坐标返回 `already_tilled`，不追加重复地块；地图外、阻挡格、可耕作区外或缺失目标返回 `not_farmable`，状态保持不变。
- 按三个独立 red-green 循环建立公开接口测试，并使用真实 `isTileFarmable` seam 验证阶段 4C 与 5A 的组合行为。
- Creator 3.8.8 已重新启动并导入 `FarmState.ts`，自动生成 importer 为 `typescript`、状态为 imported 的 `.meta`；资源 UUID 检查无重复，`Main.scene` 未产生改动。
- 本子任务不监听输入、不选择锄头、不修改场景，也不绘制土地；5B 和 5C 只在 5A 验收后开始。

2026-07-15 Creator 与浏览器验收：

- Creator 3.8.8 成功导入 `FarmState.ts` 并生成 `.meta`；该纯规则没有绑定节点，`Main.scene` 无新改动。
- 清理临时文件后的首次预览曾因 Cocos 内置 Box2D 外部模块尚未就绪而显示加载错误；对应资源恢复为 HTTP 200 后，`Ctrl+F5` 和重新打开预览均恢复正常，未修改项目代码。
- 清空 Creator Console 后旧的 `msg not exist!` 未再次出现；没有其他新错误或重复警告。
- WASD、方向键、石墙碰撞、相机与地图边界、黄色/蓝色调试框回归均正常。

阶段 5A 已完成。

### 阶段 5B：锄头输入与真实地图适配（已完成）

2026-07-15 已完成：

- `KeyboardInputBridge` 将空格键转换为平台无关的 `primaryAction`；玩法代码仍不读取物理键码。
- `updateTillingSession` 只在动作键由松开变为按下时执行一次；持续按住不会跨瓦片重复耕作，松开后可再次触发。
- `createTiledFarmabilityMap` 将 `maps.json` 的 `farmableArea`、真实 Tiled 尺寸和 `Blocking` 图层组合成阶段 5A 所需的查询，并集中处理 Tiled 顶部行号与领域底部原点坐标的转换。
- 地图尺寸或瓦片尺寸与 JSON 配置不一致时拒绝建立查询，避免静默错位。
- 新增 `TiledTillingController` Creator 组件：使用 Player 的世界位置与最后朝向选择黄色框对应瓦片，调用纯耕地状态规则，并在开发期 Console 输出 `tilled`、`already_tilled` 或 `not_farmable`。
- 当前默认锄头已选中；真正的快捷栏工具选择留到背包阶段。蓝色鼠标框仍只用于坐标调试，阶段 5C 才绘制土地变化。
- 四个新增行为测试和 Creator 3.8.8 类型检查已通过；Creator 已自动生成新组件 `.meta`，不手写场景序列化数据。
- Creator 场景已把组件添加到 Player，并绑定 `World`、`maps.json`、`mvp_farm` 与 `Blocking`。
- 浏览器运行时 Console 已验证可耕格首次空格输出 `tilled`、同格再次输出 `already_tilled`，区域外输出 `not_farmable`。
- Creator 曾因清理临时文件无法打开 `temp/logs/project.log`；完整重启后 EPERM 消失。浏览器预览运行时日志以浏览器开发者工具为准，Creator 底部 Console 不保证转发。

阶段 5B 已完成。

### 阶段 5C：已耕土地视觉（已完成）

2026-07-15 已完成：

- 新增纯 `createTilledSoilPatches` 投影，把权威 `FarmState` 转换为 TiledMap 局部坐标矩形；非法或地图外的持久化瓦片会被安全忽略。
- 新增 `createFarmableGroundPatches` 投影，把 `maps.json` 的包含边界可耕矩形裁剪到有限地图并生成未耕药圃底地；普通草地、可耕未耕地和已耕地由此形成三种视觉状态。
- 新增 `TilledSoilView` Creator 组件，只读取 Player 上 `TiledTillingController.farmState`，不反向修改状态或根据画面推断玩法结果。
- 视图使用项目内原创 `Graphics`：浅黄绿色网格表示可耕但未耕的药圃，深棕色土块与三条耕沟表示已耕地；不引入外部素材，后续可替换正式像素资源而不修改耕地规则。
- `FarmState` 使用不可变引用；视图只在状态引用变化时重绘，重复锄地、不可耕操作和普通帧不会重复绘制。
- 新增两个纯投影测试，并把新组件加入 Creator 3.8.8 `requireComponent` 元数据兼容检查。
- Creator 场景已创建 `TilledSoil` 节点并保存 Source=Player、Tiled Map=World；首轮已耕土地视觉与现有玩法回归由用户验收通过。
- Creator 当前会针对 TMX 头部 `version="1.10"` 输出既有兼容警告，但地图、碰撞和本阶段视觉均能正常运行；此警告不是阶段 5C 新错误，后续单独处理。

2026-07-15 Creator 与浏览器验收：

- 浅黄绿色未耕药圃与外围绿色草地可一眼区分；首次耕地正确变为深棕色，重复操作不叠加，不可耕位置保持不变。
- 相邻土块对齐，角色渲染在土块上方；重新预览后未耕药圃仍存在，运行时已耕状态按预期清空。
- 相机移动、横屏尺寸、角色移动、碰撞、黄色/蓝色调试框回归均正常。
- 除已记录的 TMX 1.10 兼容警告外，没有新的浏览器或 Creator 错误。

阶段 5 已完成。下一阶段只在收到明确指令后开始；当前不进入播种与作物成长。

## 阶段 6：播种与作物成长

状态：`[x]`，阶段 6A“纯播种规则”、阶段 6B“播种输入适配”和阶段 6C“已播种作物视觉”均已完成。

范围：一种原创种子、一种作物、播种校验、跨天成长状态。数据从 JSON 加载，不硬编码内容表。

完成门槛：无种子、未耕地、已有作物时不能播种；成长阶段可由配置计算。

2026-07-15 阶段 6A 完成记录：

- `FarmTileState` 现在可以保存内嵌 `CropState`：稳定作物 ID、播种日、成长进度、阶段索引和最后成长结算日；没有作物时仍为 `null`。
- 新增纯 `plantCrop` 命令 seam：只接收农田、目标格、最小种子堆、当前天数和经过验证的 `CropDefinition` 列表，不读取 Cocos、JSON 文件路径或平台全局对象。
- 成功播种只修改目标地块并消耗 1 粒种子；无种子、未耕地、已有作物或种子无法映射配置时返回明确状态，保持输入状态引用不变。
- `calculateCropGrowthStage` 按 `growthStages` 的累计天数计算零基阶段和成熟状态；作物内容与时长不硬编码。
- `SeedStack` 只是阶段 6 的最小数量输入，阶段 8 将由真实背包提供；本阶段不提前实现背包、快捷栏或 UI。
- 本切片不添加播种按键、Cocos 组件、场景绑定、作物视觉、浇水或日结束结算；这些分别留给阶段 6B、6C 和阶段 7。
- 新增 7 项播种/成长规则测试；完整项目测试 `45/45` 通过，Creator 3.8.8 自带 TypeScript 5.8.2 `--noEmit` 检查通过。

人工验收结果：

- `[x]` Creator 3.8.8 已导入 `CropPlanting.ts` 并自动生成 `.meta`；importer=`typescript`、imported=`true`，UUID 无重复，Console 除 TMX 1.10 已知提示外无新错误。
- `[x]` `Main.scene` 无新绑定或文件改动；现有移动、碰撞、相机、锄地视觉与调试框浏览器回归正常。

2026-07-15 阶段 6B 完成记录：

- `KeyboardInputBridge` 将 PC 的 `E` 键翻译为平台无关的 `secondaryAction`；`Space/primaryAction` 仍只负责锄地，同时按下时锄地优先。
- 新增 `decodeCropsData`，在运行时把 `JsonAsset` 的未知 JSON 解码为严格的 `CropsDataFile`，拒绝错误版本、非法成长天数以及重复作物或种子 ID。
- `TiledTillingController.plantFacingCrop` 是现有权威 `FarmState` 的命令专用 seam；播种不会在新组件里创建第二份农场状态，`TilledSoilView` 继续读取同一状态引用。
- 新增 `TiledPlantingController`：只处理 E 键按下沿、临时 3 粒 `mistleaf_seed`、`crops.json` 适配与开发日志；成功播种消耗 1 粒，长按 E 只执行一次。
- 运行时日志覆盖 `planted`、`not_tilled`、`occupied`、`no_seed` 和 `invalid_seed`，包含目标瓦片与剩余种子数。
- 本切片不绘制作物；阶段 6C 才把已播种状态投影为原创幼苗占位视觉。
- 新增 JSON 解码、键盘语义和 adapter 结构测试；Creator 3.8.8 TypeScript 5.8.2 严格检查已通过。
- Creator 3.8.8 已自动生成两个新脚本 `.meta`，UUID 唯一；`Main.scene` 已在现有 Player 上添加 `TiledPlantingController`，绑定 `crops.json` 并保存 `mistleaf_seed / 3 / day 1`。
- 浏览器已实测 `not_tilled`、`planted`、`occupied`、种子按 `3→2→1→0` 消耗和耗尽后的 `no_seed`；按住 E 不重复，同时按空格与 E 时锄地优先。
- 作物视觉未出现符合阶段边界；移动、碰撞、相机、锄地和调试框回归正常，除 TMX 1.10 已知提示外无项目新错误。

2026-07-15 阶段 6C 完成记录：

- 新增纯 `createCropPatches(farm, grid)` 投影，把权威 `FarmState` 中合法的已播种格转换为 TiledMap 局部渲染坐标；空地、非法阶段和地图外坏状态只在视觉输出中跳过，不修复或反写状态。
- 新增只读 `CropView` Creator 组件：比较 `FarmState` 引用，仅在成功播种等状态变化后重绘；普通帧、`occupied`、`not_tilled` 和 `no_seed` 不会重复绘制。
- 幼苗是项目内原创 `Graphics` 像素几何占位：深绿茎、雾绿色双叶与浅色高光；不使用外部图片、商业游戏资源或来源不明素材。
- 投影保留 `cropId` 和 `stageIndex`，并为 0～2 阶预留不同高度与芽苞大小；当前没有跨天结算，所以人工验收只会看到第 0 阶幼苗。
- 本切片只负责表现，不改播种输入、种子数量、成长规则、浇水、日期或存档。
- 新增 3 项纯投影测试，并把 `CropView` 纳入 Creator 3.8.8 组件元数据兼容测试；完整项目测试 `54/54` 与 Creator TypeScript 严格检查已通过。
- Creator 3.8.8 已自动生成 `CropProjection.ts.meta` 和 `CropView.ts.meta`；importer 均为 `typescript`、imported 均为 `true`，UUID 分别为 `c0457e9f-49f7-4e85-ade5-eb66b2915e9d` 与 `337ff7a0-81ab-4c41-ad49-4fa26f924a26`，全资源 UUID 无重复。
- `Main.scene` 已保存独立 `Crops` 节点和 `CropView` 组件；层级位于 `TilledSoil` 后、Player 前，`Source=Player`、`Tiled Map=World` 绑定正确。
- 浏览器已实测锄地后不提前出现幼苗、首次 E 出现一株、第 0 阶幼苗不叠加、三株位置与大小正确；无种子和不可播种位置不会出现幼苗。
- 角色与调试框层级、相机移动、横屏尺寸、移动、碰撞、锄地和播种日志回归均正常；除已知 TMX 1.10 提示外无项目新错误。

## 阶段 7：浇水、睡觉与跨天

状态：`[x]`，阶段 7A“纯浇水与单日结算规则”、阶段 7B“浇水输入/湿土视觉”和阶段 7C“睡觉与跨天结算”均已完成。

范围：已耕地浇水、每日浇水标记、睡觉确认、日结束结算、次日重置、作物成长。

完成门槛：每次跨天只结算一次；当天未浇水的作物停止成长但不枯死；重复点击睡觉不会跳过多天。

2026-07-15 阶段 7A 完成记录：

- 新增 `FarmDayState`，把正整数 `currentDay` 与权威 `FarmState` 配对，避免播种日、浇水日与成长结算日由多个运行时组件各自维护。
- 新增纯 `waterTile(state, target)` interface：首次浇水返回 `watered`，同日重复返回 `already_watered`，未耕地或空目标返回 `not_tilled`；拒绝路径保持原状态引用。
- 新增纯 `advanceFarmDay(state, crops)` interface：成功时只推进一天；需水作物仅在 `wateredOnDay` 等于结算日时成长，未浇水作物停长但不枯死，不需水作物按配置成长。
- 每株作物通过 `lastGrowthDay` 防止同日重复结算；成熟作物的进度和阶段封顶，旧 `wateredOnDay` 保留为历史日期并在新一天自然失效。
- 农田中存在无法匹配配置的作物时返回 `invalid_crop`，日期和全部地块保持不变，避免部分结算；非法日期明确抛出 `RangeError`。
- 按 8 个 red-green 循环验证公开 interface；本切片不接按键、Cocos 组件、湿土视觉、睡觉点、日期 UI 或存档。
- Creator 3.8.8 已自动生成 `FarmDayCycle.ts.meta`；importer=`typescript`、imported=`true`、UUID=`e71efb02-d8af-4d29-9200-83d97ccdb2a2`，全资源 UUID 无重复，`Main.scene` 无改动。
- Creator 与浏览器人工验收已通过：`Main.scene` 无新绑定；移动、碰撞、相机、锄地、播种、幼苗和黄色/蓝色调试框回归正常。
- 画面未出现浇水、湿土或跨天表现符合阶段边界；除 TMX 1.10 已知提示外没有项目新错误。

2026-07-15 阶段 7B 完成记录：

- `InputSnapshot.wateringAction` 提供平台无关的浇水语义；`KeyboardInputBridge` 暂以 F 键输出该动作，触控端仍通过同一 interface 预留。
- `TiledTillingController` 继续作为唯一农田状态拥有者并公开只读 `farmDayState` 与命令式 `waterFacingTile()`；播种改为读取同一状态中的日期，不再维护第二个 `currentDay`。
- 新增 `TiledWateringController`，只在 F 的按下沿调用状态拥有者；持续按住不重复，动作优先级保持空格锄地 > E 播种 > F 浇水。
- 新增纯 `createWateredSoilPatches(state, grid)`，只投影 `wateredOnDay === currentDay` 且位于有限地图内的格子；非法日期不会误显示湿土。
- 现有 `TilledSoilView` 在同一节点上覆盖原创冷调深棕湿土，不新增场景节点；作物与 Player 仍位于土地视觉上方。
- 10 项阶段定向测试、68 项全量测试及 Creator TypeScript 5.8.2 严格检查已通过。
- Creator 3.8.8 已自动生成并导入两个 `.meta`：`TiledWateringController` UUID=`210fa190-c333-424c-bbbd-51692c5a5a68`，`WateredSoilProjection` UUID=`32f7f074-b5a9-4f0f-b9d9-1d9db86ecae0`；全资源 UUID 无重复。
- `Main.scene` 已由 Creator 保存 `TiledWateringController`、`Starting Day=1`，并移除旧的播种组件独立日期序列化字段。
- 浏览器已实测首次浇水、同日重复、未耕拒绝、按住去重和空格/E/F 优先级；湿土不叠加，移动、碰撞、相机、锄地、播种和视觉层级回归正常。
- 浏览器扩展的 QoderWork/Immersive Translate 连接提示不属于项目；除 TMX 1.10 已知提示外没有项目新错误。
- 本切片不推进日期、不结算成长、不加入睡觉点、水壶容量、工具栏、存档或触控按钮 UI。

2026-07-15 阶段 7C 完成记录：

- `InputSnapshot.sleepAction` 提供平台无关的睡觉确认语义；PC 的 `KeyboardInputBridge` 暂映射 Enter。
- `sleepAtTile` 只允许正前方目标等于 `maps.json.sleepTile` 时调用既有单日结算；错误位置和未知作物都不改变日期或农田状态。
- `TiledTillingController.sleepFacingTile()` 继续独占日期与农田状态；成功时一次性替换两者，并提供配置出生点的世界坐标。
- 新增 `TiledSleepingController`：按下沿去重、动作优先级、严格 crops JSON 解码、跨天日志和成功后的出生点传送均集中在该 adapter。
- 新增纯 `SleepPointProjection` 与原创 `SleepPointView`，从 `maps.json.sleepTile=(15,22)` 绘制室外休息标记；场景节点与绑定必须由 Creator 完成。
- 成功睡觉后传送到 `spawnTile=(15,18)`，因此不会停留在睡觉点连续跳日；湿土和作物视图通过同一权威快照自动刷新。
- 20 项阶段定向测试、76 项全量测试和 Creator TypeScript 5.8.2 严格检查均已通过。
- Creator 3.8.8 已自动生成并导入三个 `.meta`：`SleepPointProjection` UUID=`67acf03a-48e2-46be-ad64-dbc378234100`、`SleepPointView` UUID=`d6a0b1f4-0e30-4546-ae89-8e7528bbcaaf`、`TiledSleepingController` UUID=`381f3914-a259-43c8-a1b9-418cdd112273`；全资源 UUID 无重复。
- `Main.scene` 已由 Creator 保存 Player 的 `TiledSleepingController/Crops Data`，以及位于 `Crops` 与 `Player` 之间的 `SleepPoint` 节点、`SleepPointView`、Source=Player、Tiled Map=World。
- 浏览器已实测错误位置不跨天、正确位置 day 1→2、出生点传送、湿土次日变干、已浇水成长、未浇水停长不枯死、按住和出生点重复 Enter 不跳日；全部输入优先级和现有移动/碰撞/相机/耕种/调试框回归正常。
- 除 TMX 1.10 已知提示外没有项目新错误。

## 阶段 7D：双平台架构护栏

状态：`[x]`

范围：把目标平台正式固定为“微信小游戏 + Steam Windows”，分离运行环境与发行渠道，建立统一 composition root，并防止微信、浏览器、Node 文件系统或 Steamworks 调用渗入共享玩法。

完成记录：

- 新增 `RuntimeKind`、`DistributionChannel` 与受约束的 `PlatformDescriptor`：Steam 被建模为 `windows-native` 的发行渠道，微信目标为 `wechat-minigame + wechat`。
- `IPlatformService` 公开 `descriptor`，不加入成就、覆盖层或云存档等尚未落地的 Steam 专属方法。
- 新增 `composePlatformServices(target, adapters)` 作为唯一发行 composition root；`saves` 与 `input` 必须显式提供，避免发行包误用 `MemorySaveService`。
- `steam-windows` 映射到 `DesktopPlatformService('steam')`；`wechat-minigame` 映射到 `WeChatPlatformService` 和注入的安全区。
- 新增架构护栏测试，禁止共享 module 直接使用 `wx.*`、`window.*`、`localStorage`、`SteamAPI_*` 或 Node 文件系统 import。
- Steamworks SDK、成就、覆盖层和 Steam Auto-Cloud 不在本阶段接入；Windows 原生存储与运行时装配留在阶段 19，Steamworks/JSB 与发行配置留在阶段 20。
- 平台定向测试 `7/7`、全量测试 `79/79` 和 Creator 3.8.8 TypeScript 严格检查均已通过。
- Creator 3.8.8 已自动导入 `PlatformComposition.ts` 并生成 `.meta`，importer=`typescript`、imported=`true`、UUID=`f8667f45-63a1-4a81-a911-a2e3fbe14fdc`；全资源 UUID 无重复。
- `Main.scene` 无新绑定；用户已完成 PC 输入、现有玩法、碰撞、相机和视觉回归，除 TMX 1.10 已知提示外无新错误。

完成门槛：Creator 成功导入新 composition 脚本、Console 无新错误，现有 PC 预览回归正常，全部自动测试和严格类型检查通过。

## 阶段 8：收获、背包与快捷栏

状态：`[x]`，阶段 8A～8D 已完成并推送 Git 基线；阶段 8D 基线提交为 `07261f8`。

范围：锄头、水壶、种子、收获物；固定容量的简单背包；快捷栏选择；成熟作物收获。

完成门槛：物品堆叠、容量不足、消耗种子和添加收获物的结果可预测且有测试。

2026-07-16 阶段 8A 实现记录：

- 新增纯 `InventoryState` module：`slots` 是固定容量的持久化物品格，`selectedSlotIndex` 始终指向其中一个格子；MVP 默认容量为 8，全部格子同时构成快捷栏。
- `addInventoryItem` 只从已校验的 `ItemDefinition.maxStack` 读取堆叠上限，先填充已有同类堆，再使用低索引空格；请求数量必须完整容纳，否则返回 `inventory_full` 并复用原状态。
- `removeInventoryItem` 从低索引同类堆开始扣除，只有总数量充足才返回 `removed`；不足时返回 `insufficient_item` 且不产生部分修改。
- 未知物品返回 `invalid_item`；非法容量、数量、选择索引、重复配置、未知持久化物品或超过 `maxStack` 的损坏状态明确抛出 `RangeError`。
- `selectInventorySlot` 对有效格返回不可变新状态，同格返回 `already_selected`，越界输入返回 `invalid_slot`；`getSelectedItemStack` 只读取当前选择。
- 本 module 是进程内纯规则，不增加只有单一 implementation 的 `IInventoryService`，也不依赖 Cocos、平台 API 或场景节点。
- 新增 8 项库存定向测试；`test:inventory` 已通过 `8/8`，Creator 3.8.8 TypeScript 5.8.2 严格检查已通过。
- 本切片不替换临时 `SeedStack`、不创建初始背包、不接按键、不绘制快捷栏，也不实现收获；这些分别留给阶段 8B～8D。
- Creator 3.8.8 已自动导入 `InventoryState.ts` 并生成 `.meta`；importer=`typescript`、imported=`true`、UUID=`47db9b39-9394-458a-81b5-cffe724561de`，全资源 UUID 无重复。
- `Main.scene` 无新绑定；用户已完成 PC 输入和现有玩法回归，背包/快捷栏未出现符合阶段边界，除 TMX 1.10 已知提示外无新错误。

阶段 8A 完成门槛：Creator 3.8.8 自动导入 `InventoryState.ts` 并生成唯一 `.meta`，`Main.scene` 无新绑定，Console 无新错误，现有 PC 玩法回归正常。

2026-07-16 阶段 8B 实现记录：

- 新增纯 `HarvestState`，把一次命令需要共同提交的 `FarmState` 与 `InventoryState` 放入一个不可变快照，不提前引入完整 `GameState` 或新状态所有者。
- `harvestCrop(state, target, crops, items)` 是唯一公开收获命令 seam；它从作物配置读取成长阶段、收获物 ID 和产量，从物品配置读取堆叠上限，不硬编码雾叶草或数值。
- 成熟判定复用 `calculateCropGrowthStage`：只有 `growthProgress` 达到 `growthStages` 总天数才允许收获，最终视觉阶段但尚差成长天数时仍返回 `not_mature`。
- 成功收获先通过 `addInventoryItem` 完整加入配置产量，再把目标格 `crop` 清空；土地继续保持已耕状态，当日 `wateredOnDay` 也保留。
- 目标缺失、空地、未成熟、背包不足、未知作物和未知物品分别返回 `not_tilled`、`no_crop`、`not_mature`、`inventory_full`、`invalid_crop` 和 `invalid_item`。
- 所有普通失败都复用原 `HarvestState`，因此不会部分加入产物或提前清除成熟作物；损坏成长进度、非法产量或损坏库存继续明确抛出 `RangeError`。
- 新增 Node 测试用 Creator 相对 import 解析 hook，只作用于测试运行时，不改变项目脚本的 Creator 模块写法或生产行为。
- 新增 7 项收获事务定向测试；`test:harvesting` 已通过 `7/7`，全量测试已通过 `94/94`，Creator 3.8.8 TypeScript 5.8.2 严格检查已通过。
- 本切片不添加收获输入、Cocos 组件、初始背包、快捷栏 HUD 或场景绑定；浏览器中实际收获留到阶段 8C～8D。
- Creator 3.8.8 已自动导入 `CropHarvesting.ts` 并生成 `.meta`；importer=`typescript`、imported=`true`、UUID=`b1351487-86e7-4a89-a477-74e8fc65e48b`。
- `Main.scene` 无新绑定；用户已完成 PC 输入和现有玩法回归，实际收获/背包画面未出现符合阶段边界，除 TMX 1.10 已知提示外无新错误。

阶段 8B 完成门槛：Creator 3.8.8 自动导入 `CropHarvesting.ts` 并生成唯一 `.meta`，`Main.scene` 无新绑定，Console 无新错误，现有 PC 玩法回归正常。

2026-07-16 阶段 8C 实现记录：

- 新增 `decodeItemsData(value)`，在 Cocos `JsonAsset.json` 进入玩法前校验 schema 版本、稳定 ID、物品类型、堆叠上限、非负价格、工具/种子引用字段和 ID 唯一性。
- 新增纯 `useCropInventoryAction(...)`：同一个 E 语义动作优先处理面前已有作物；成熟时收获、未成熟时返回 `not_mature`，空的已耕地才尝试从真实背包扣除一粒种子并播种。
- `TiledTillingController` 继续作为唯一运行时状态拥有者，并新增 8 格 `InventoryState`；默认按顺序装入基础锄头、基础水壶和 3 粒雾叶草种子，物品 ID 由 Creator 属性配置并通过 `items.json` 验证。
- `useFacingCropAction` 在状态拥有者内部同时提交 `FarmState` 与 `InventoryState`，没有暴露任意 setter；背包满、无种子、未成熟或配置无效时不会产生半完成状态。
- 既有 `TiledPlantingController` 现在是 E 的上下文作物输入 adapter，不再持有临时 `SeedStack`；开发日志输出动作状态、目标格和 8 格背包快照。
- 物理输入和优先级不变：E 继续映射平台无关的 `secondaryAction`，空格锄地 > E 播种/收获 > F 浇水 > Enter 睡觉；微信触控以后可输出同一语义。
- 新增 7 项物品解码/真实背包作物事务测试，并更新 3 项 adapter 测试；`test:crop-actions` 已通过 `10/10`，全量测试已通过 `101/101`，Creator 3.8.8 TypeScript 5.8.2 严格检查已通过。
- Creator 3.8.8 已自动生成并导入两个 `.meta`：`ItemDataDecoder` UUID=`dccbfe75-c36f-4014-8370-a9476eae509a`，`CropInventoryActions` UUID=`341717c6-6191-4380-a7a2-7bc49b51e8d0`；当前 68 个资源 UUID 无重复。
- Creator 已把 `items.json` 绑定到 Player 现有 `TiledTillingController.Items Data`，并保存 8 格真实背包的默认工具与 3 粒雾叶草种子配置；旧的临时种子属性已从 `TiledPlantingController` 场景数据中移除。
- 本切片不绘制背包或快捷栏，不接选择槽输入，也不让选中槽决定锄头/水壶行为；这些留到阶段 8D。
- 2026-07-16 浏览器验收通过：E 播种使种子 `3→2`，三粒耗尽后返回 `no_seed`；未成熟作物返回 `not_mature` 且状态不变，成熟作物返回 `harvested`、从地块消失并向背包加入 `mistleaf=1`。
- 按住 E 不重复，空格/E/F/Enter 优先级正常；移动、碰撞、相机、跨天、耕种和黄色/蓝色调试框全部回归正常。快捷栏/背包画面尚未出现符合阶段边界；除 TMX 1.10 已知提示外没有新错误。

阶段 8C 完成门槛：Creator 自动导入 `ItemDataDecoder.ts` 与 `CropInventoryActions.ts` 并生成唯一 `.meta`；Player 的 `TiledTillingController.Items Data` 绑定 `items.json`；E 可从真实背包播种并收获成熟作物；现有输入、碰撞、相机、跨天和视觉回归正常，Console 无新项目错误。

2026-07-16 阶段 8D 实现记录：

- 新增纯 `Quickbar` module，把固定背包投影为 8 个顺序槽，并把物品解析为 `till`、`water`、`plant`、`carry` 或 `empty`；UI 和玩法动作共享同一个解析规则，不在两个地方硬编码类型判断。
- `InputSnapshot.quickbarSlotIndex` 是平台无关的绝对选槽语义；PC `KeyboardInputBridge` 将数字键 `1～8` 映射为零基槽位。纯选择 reducer 同时保留前一格/后一格输入 seam，供后续微信触控 adapter 使用。
- 选槽按下沿执行且不会因按住重复；同一帧先提交选槽，再处理动作。直接槽位选择优先于循环选择，循环选择在固定容量内首尾相接。
- `TiledTillingController` 仍是唯一 `InventoryState` 拥有者：选中锄头时空格可耕地，选中水壶时 F 可浇水，选中种子时 E 可播种；错误工具/物品返回 `wrong_tool` 或 `wrong_item` 且状态不变。
- E 面对已有作物时仍先处理作物：成熟作物可用任意选中槽收获，未成熟作物返回 `not_mature`；只有空的已耕地才要求选中种子。
- 新增只读 `QuickbarView` Cocos 组件，使用原创 `Graphics` 几何图标绘制 8 格 HUD、选中框、槽位数字和堆叠数量；它跟随 Camera 底部，不拥有第二份背包状态，也不引入外部素材。
- `selectQuickbarSlot(slotIndex)` 是未来触控快捷栏的绝对选择 seam；共享玩法代码不直接依赖鼠标、键盘、`wx` 或具体屏幕坐标。
- 新增快捷栏纯规则、adapter、键盘生命周期、作物选择门控和 Creator 元数据测试；`test:quickbar` 已通过 `18/18`，全量测试已通过 `110/110`。
- Creator 安装位置已从旧的 `C:\ProgramData\cocos\...` 迁移到 `D:\lzq\cocos\...`；当前 Creator 3.8.8 已重新打开工程并把 `temp/tsconfig.cocos.json` 刷新到有效路径，项目级 TypeScript 5.8.2 `--noEmit` 严格检查通过。
- Creator 已自动生成并导入两个 `.meta`：`Quickbar` UUID=`a2a534be-e140-48df-bda1-b01515f03c33`、`QuickbarView` UUID=`ae2f8cda-4788-4dcc-a2f9-92f9ba3f617e`；全资源 UUID 无重复。
- 清理临时空间后出现的一次 `msg not exist!` 已定位为 Creator 内置 `cocos-service` 的失效异步消息，不是项目脚本错误；关闭多余 Dashboard/Creator 会话、轮换旧 `project.log` 并干净重启后，新日志该错误和项目 error 计数均为 0，`Main.scene` 保持不变。
- Creator 已保存 `Quickbar` 节点及 `QuickbarView` 组件，`Source=Player`、`Camera Node=Camera`；场景中的组件引用、8 格尺寸和底部间距均已实际写入 `Main.scene`。
- 2026-07-16 浏览器验收通过：初始 8 格与数量显示、数字键 `1～8` 选槽、锄头/水壶/种子正确槽动作、错误槽拒绝、种子数量同步、任意槽收获和收获物进入快捷栏均正常。
- 快捷栏随相机移动和另一横屏尺寸保持正常；移动、碰撞、跨天和黄色/蓝色调试框回归正常，除 TMX 1.10 已知提示外没有新错误。
- 验收后再次运行阶段 8D 定向测试 `18/18` 和全量测试 `110/110`，70 个资源 UUID 无重复。严格类型检查曾在 Creator 重建缓存前通过；本次空间清理后直接复查仅因编辑器生成的 `temp/declarations` 尚未恢复而返回 TS2688，没有报告项目源码类型错误。

阶段 8D 完成门槛：Creator 自动导入 `Quickbar.ts` 与 `QuickbarView.ts` 并生成唯一 `.meta`；`Main.scene` 新建并绑定 Quickbar 节点；数字键选槽、选中物品门控、快捷栏数量更新与成熟作物收获通过浏览器验收；全部自动测试和严格类型检查通过，Console 无新项目错误。

## 阶段 9：存档与读取

状态：`[x]`，阶段 9A～9C 已完成并推送 Git 基线；阶段 9C 基线提交为 `4e6c175`。

范围：版本化存档模型、保存触发点、桌面适配器、内存适配器、损坏存档回退、最小迁移策略。

完成门槛：保存后退出并重新载入，玩家位置、日期、背包、地块和作物状态一致；失败不会静默覆盖有效存档。

2026-07-16 阶段 9A 实现记录：

- 收紧早期 `SaveData` 脚手架为当前真实 MVP 权威状态：版本与保存时间、玩家地图/世界坐标/朝向、当前日期、8 格背包与选中槽、农田及作物；尚未实现的日内时间和设置不再提前进入版本 1。
- `SaveCodec` 是版本 1 JSON 的唯一编解码 interface。编码前和读取后使用同一套校验，防止写入一个自己无法恢复的存档。
- 解码不信任平台字符串：明确区分 `invalid_json`、`unsupported_version` 与 `invalid_data`；普通损坏返回结果，不以异常冒充“没有存档”。
- 校验覆盖 ISO 保存时间、玩家地图与有限世界坐标、正日期、固定 8 格背包、合法选中槽、物品 ID/堆叠上限、农田地图一致性、可耕区坐标、地块唯一性、浇水日期、作物 ID、成长进度与视觉阶段一致性。
- `SaveGame` 把单一 `autosave` 槽、JSON 编解码和 `ISaveService` 结果映射隐藏在三个小 interface 后：`writeAutosave`、`readAutosave`、`removeAutosave`。平台 adapter 继续只读写不透明字符串。
- 使用 `MemorySaveService` 穿过真实 `ISaveService` seam 验证保存、读取、删除、缺失和存储失败；没有在共享 module 中加入 `localStorage`、`wx`、Steamworks 或文件系统依赖。
- 新增阶段 9A 定向测试 `9/9`；全量测试通过 `119/119`，平台架构护栏通过 `8/8`，Creator 3.8.8 TypeScript 严格检查通过。
- Creator 3.8.8 已自动生成并导入两个 `.meta`：`SaveCodec` UUID=`c95b5a17-4ec2-4e99-b6e0-4fce6412c65c`，`SaveGame` UUID=`2123c7a4-873d-412c-9f54-bf2abd46d640`；`Main.scene` 无改动。
- 2026-07-16 人工验收通过：现有玩法回归正常，重新预览后状态按阶段 9A 预期重置，除 TMX 1.10 已知提示外无新错误。
- 本切片不修改 `Main.scene`，不建立运行时状态导出/恢复，不在睡觉后自动保存，也不添加真实桌面/微信持久化 adapter；这些按阶段 9B～9C 分开完成。

阶段 9A 完成门槛：Creator 自动导入 `SaveCodec.ts` 与 `SaveGame.ts` 并生成唯一 `.meta`；`Main.scene` 无新绑定；现有 PC 玩法回归正常；Console 除 TMX 1.10 已知提示外无新错误。

2026-07-16 阶段 9B 实现记录：

- 新增纯 `RuntimeSaveState` module。`captureRuntimeSave` 把玩家、日期、农田和背包权威状态复制为独立 `SaveData`，并穿过阶段 9A 的同一解码校验；运行时状态不一致时明确返回 `invalid_runtime`。
- `prepareRuntimeRestore` 在任何 Cocos 状态被修改前完整验证存档、活动地图和跨字段约束，只在成功后返回一个独立的恢复计划；损坏存档与地图不匹配不会部分覆盖当前游戏。
- `PlayerController` 新增玩家位置/朝向采集与恢复入口；`TiledTillingController` 新增日期/农田/背包采集与恢复入口。农田恢复会清除锄地按住状态、快捷栏选择门闩和旧动作状态，避免读取后自动重复操作。
- 新增 `RuntimeSaveBridge` Cocos adapter，外部 interface 只有 `captureSnapshot()` 与 `restoreSnapshot()`；它读取现有两个权威状态拥有者，不持有第二份玩家、日期、农田或背包状态。
- bridge 仅依赖现有 `maps.json`、`items.json` 和新绑定的 `crops.json` 进行验证；不访问 `ISaveService`、`wx`、`localStorage`、Steamworks 或文件系统。真实读写、启动加载和睡觉后自动保存留到阶段 9C。
- 新增 7 项阶段 9B 定向测试；阶段 9A～9B 存档测试通过 `16/16`，全量测试通过 `126/126`，平台架构护栏通过 `8/8`，Creator 3.8.8 TypeScript 严格检查通过。
- Creator 3.8.8 已自动生成并导入元数据：`RuntimeSaveState` UUID=`682c910c-af6d-474e-bdca-ebb9c695c48e`、`save` 文件夹 UUID=`d5eb92e7-9341-49e1-9715-c97ee8a28d89`、`RuntimeSaveBridge` UUID=`eba4db28-0c49-44ca-aa77-35a478de672b`；当前 75 个资源 UUID 无重复。
- `Main.scene` 已在 Player 上保存且仅保存一个 `RuntimeSaveBridge`，`Crops Data=crops`；Creator 同时按当前编辑器视口轻微重写 Camera `Ortho Height`，未手工回退用户保存的场景结果。
- 2026-07-16 人工验收通过：现有玩法回归正常，重新预览后状态按阶段 9B 预期重置，除 TMX 1.10 已知提示外无新错误。

阶段 9B 完成门槛：Creator 自动导入 `RuntimeSaveState.ts` 与 `RuntimeSaveBridge.ts` 并生成唯一 `.meta`；在 Player 添加一个 `RuntimeSaveBridge`，绑定 `Crops Data=crops`；现有 PC 玩法回归正常；重新预览仍重置属于本阶段预期；Console 除 TMX 1.10 已知提示外无新错误。

2026-07-16 阶段 9C 实现记录：

- 新增 `LocalKeyValueSaveService`，把现有 `ISaveService` 适配到注入的 key-value 存储，并用稳定 namespace 隔离 `autosave` 键；空字符串仍是有效载荷，读/写/删除异常都返回明确失败。
- 新增 `CocosLocalSaveService` 平台 factory，只在 `platform` 边界调用 `sys.localStorage`；共享玩法和存档 module 不直接访问 `window`、浏览器 `localStorage`、`wx`、Steamworks 或 Node 文件系统。
- 新增纯 `AutosaveSession` deep module，统一执行启动读取、版本/内容校验、运行时恢复和串行写入。只有“没有存档”或完整恢复成功后才允许写入；损坏存档、未知版本、存储失败和恢复失败会阻止本会话写入，避免静默覆盖。
- `RuntimeSaveBridge` 新增只读验证 catalog seam，继续复用现有地图、物品与作物配置，不把游戏数据校验下放给平台存储。
- `TiledSleepingController` 新增成功睡觉订阅 seam，通知发生在跨天结算与出生点传送之后；失败睡觉、按住 Enter 或普通工具动作不会触发保存。
- 新增 `LocalAutosaveController` Cocos composition component：`start` 时读取一个本地 autosave，成功后订阅睡觉完成事件；每次成功睡觉后采集最终权威状态并写入。普通移动、锄地、播种、浇水和收获不会即时写入。
- 平台架构扫描已扩展到 `assets/scripts/save`，继续禁止共享存档/场景装配代码直接依赖 vendor 全局或文件系统。
- 新增 9 项阶段 9C 定向测试；阶段 9A～9C 存档测试通过 `25/25`，全量测试通过 `135/135`，平台测试通过 `11/11`，Creator 3.8.8 TypeScript 严格检查通过。
- Creator 3.8.8 已自动生成并导入三个 `.meta`：`AutosaveSession` UUID=`e1112183-a947-4938-a1ac-8fe51277dbfd`、`CocosLocalSaveService` UUID=`ded8c7fd-4cd2-4539-897c-fccc51d549ce`、`LocalAutosaveController` UUID=`182732a9-9f8f-4a88-b554-cb25ea21329a`；当前 78 个资源 UUID 无重复。
- `Main.scene/Canvas/Player` 已保存且只保存一个启用的 `LocalAutosaveController`，`Storage Namespace=farm-game`；场景其余差异是新增组件导致的序列化引用编号顺延。
- 2026-07-16 浏览器人工验收通过：首次启动记录 `startup new_game`，成功睡觉进入第 2 天后记录 `autosaved day 2`，重新预览记录 `startup loaded`。
- 读取后日期、玩家位置/朝向、农田、作物、湿土、背包数量和选中槽均与保存时一致；现有玩法回归正常，除 TMX 1.10 已知提示外没有新错误。
- 浏览器预览完成了一个完整保存/读取闭环；微信小游戏与 Windows 原生环境的稳定存储和生命周期留到 Demo 内容形成后的平台阶段验证。

阶段 9C 完成门槛：Creator 自动导入三个新脚本并生成唯一 `.meta`；Player 添加且只添加一个 `LocalAutosaveController`，保持 `Storage Namespace=farm-game`；首次启动记录 `new_game`，成功睡觉后记录 `autosaved`，重新预览记录 `loaded`；日期、玩家保存点位置/朝向、背包、选中槽、农田和作物一致；损坏或读取失败不覆盖原存档；现有玩法回归正常，Console 无新项目错误。

## 阶段 10：Demo 产品与叙事定义

状态：`[~]`。阶段 10A 文档治理、10B 三张核心地图拓扑、10C NPC/关系规则和 10D 第一处结界异常设计均已完成用户验收并建立 Git 基线；阶段 10E 已把档位、恢复点、历法、Demo 结束方式以及新增旧矿道/战斗切片整合为一份待验收基线。

范围：先把新增需求转成一组可执行、互不循环依赖的产品决定，再允许地图、美术、UI、NPC 或叙事实现开始。阶段 10 不制作批量正式资源，也不修改现有玩法代码。

已确认且不得在后续子阶段重新降级的基线：

- Demo 包含四张可独立加载的地图：主角住宅室内、故乡日常主区域、第一处结界异常所在的边界区域，以及阶段 10E 新增的固定单层旧矿道。
- 第一章从主角在住宅内醒来开始；技术 MVP 的“房屋不可进入”只属于旧占位地图。
- 当前人口固定为五名幸存者和十名重构村民，但不等于十五名角色都制作同等深度内容。
- Demo 只展示第一处结界异常，不揭露屠村、三个愿望、愿境本质或重构村民来源。

### 阶段 10A：规划与文档治理

状态：`[x]`，2026-07-17 已完成审查、文档修正与用户确认，并以提交 `c98103b` 建立新的 Demo 需求 Git 基线。

交付物：

- 明确文档权威顺序，区分技术 MVP 历史、当前实现、完整产品愿景与 Demo 承诺。
- 修正旧阶段号、AppID 时点、MVP 已完成/延期验证、composition root、地图数量和美术生产顺序冲突。
- 把阶段 10 拆成 10A～10E，把阶段 11～20 的地图、输入、存档、平台和内容依赖重新排序。
- 清理不应进入产品基线的空本机工具配置；保留 `.codegraph/.gitignore`，不提交 CodeGraph 数据库。

完成门槛：相关权威文档之间没有已知范围或阶段矛盾；自动化测试和类型检查继续通过；用户确认差异后才提交基线。

### 阶段 10B：纸面流程、开场与三张核心地图拓扑

状态：`[x]`，2026-07-17 已完成纸面流程、三地图功能拓扑和场景切换契约，用户已确认按 `docs/DEMO_MAP_FLOW.md` 建立阶段 10B Git 基线。

历史交付物：第一章从标题到自由生活、关系片段和第一处异常的纸面流程；`home_interior`、`hometown_main`、`boundary_pass` 三张核心地图的职责、连接、出生点、床铺、NPC 锚点、农田、异常路径和场景切换规则。阶段 10E 的用户范围变更新增 `old_mine`，但不改变这三张地图的既有职责。

完成门槛：三张核心地图均有不依赖正式美术的平面草图、初始灰盒尺寸预算和玩家动线；开场不再与房屋能力矛盾；第一日建立日常、第二日可选前往边界且不调查可长期生活。新增旧矿道的补充拓扑和范围门槛由阶段 10E/ADR-0006 管理。

### 阶段 10C：NPC 名单、内容分层与关系预览

状态：`[x]`，2026-07-17 已完成设计、用户验收与文档同步，并以提交 `4742e35` 建立阶段 10C Git 基线。

交付物：

- `docs/NPC_BIBLE.md` 已锁定 15 名 NPC：5 名幸存者、10 名重构村民，以及 4 名 `core`、5 名 `support`、6 名 `ambient` 的内容预算。
- 已区分玩家可见身份、内部真相分类和 `K0`～`K4` 知情层级；通用 `characters.json` 不保存隐藏来源分类，见 ADR-0003。
- 已为三张 NPC 活动地图分配稳定 NPC 锚点，建立人物关系图，并明确第一章是“主角重逢、玩家初识”；`old_mine` 当前不配置常驻 NPC。
- 15 名 NPC 全部拥有独立好感记录；完整产品预留男性/女性主角形态，允许恋爱的当前无配偶 NPC 不分性别均可拥有适龄亲近表现。未满 18 岁告白必须拒绝，成年人再按好感判定；罗岑山、陈蕴等老年长辈采用“仅非恋爱关系”边界。开场按好感判定者为宁昭、晏巡、杜蘅、乔榆、沈禾、文澍、穆原、唐米、何舟、黎青和池雀。只有告白被接受才建立 `dating`，恋爱对象满好感后才可求婚；同一存档允许多条 `dating`，但唯一配偶最多指向一名不限性别的角色，见 `docs/adr/0004-all-npcs-have-affinity-and-one-spouse.md`。
- 当前不模拟未婚 NPC 之间的恋爱；NPC-NPC 关系先只使用友情、信任、竞争、厌恶等非恋爱类型。
- 沈禾承担恋爱可能性预览和首个立绘试制输入，宁昭当前承担友谊/信任预览但在完整产品中同样是恋爱候选；两者都不在 Demo 中锁定恋爱，也不影响边界异常入口。
- 乔榆与乔苓固定保留“幸存父亲—重构女儿”关系，用于证明重构村民是拥有独立意识的新生命。
- 沈禾已有像素 Sprite/立绘一致性简报，但本阶段没有生成美术、立绘、配音或音乐；正式制作必须另开资源任务。

完成门槛：核心、支撑和氛围角色的制作预算明确；全员基础好感与内容深度不再混淆；主角形态/NPC 性别不限制恋爱、亲近表现、仅非恋爱人物边界、年龄优先的告白判定、满好感求婚、多恋爱/单配偶不变量和 NPC-NPC 非恋爱边界已经锁定；不会因为人口下限自动产生十五条个人线或十五套八状态立绘；立绘试制角色已有与像素 Sprite 一致的外观简报。

### 阶段 10D：第一处结界异常节拍与双状态目标

状态：`[x]`，2026-07-17 已完成“界碑回折”节拍、主动触发、晏巡对白、可选路标布线索、安全恢复、双状态构图与独立资源任务交接设计，并经用户确认建立阶段 10D Git 基线。

交付物：`docs/FIRST_BARRIER_ANOMALY.md` 已锁定异常在 `boundary_pass` 北侧旧界碑后的相对位置；玩家主动提交“继续沿旧山路往前”才触发道路回折；事件包含前置日常、晏巡语义对白、返回的路标布、视听转变、安全恢复、重复接近、忽略线索和 Demo 保密检查；同一机位的日常目标图与异常目标图已有文字/构图简报和稳定表现资源 ID。

完成门槛：异常不按日数、进入地图或普通关系进度强制触发；取消/忽略线索不会写入错误状态或阻塞日常；首次演出只播放一次，重复接近和中断均能安全恢复；关闭粒子、Shader、镜头移动和音频后仍能理解“道路无法抵达”；美术资源清单包含旧界碑回折、路标布状态、冷暗覆盖、轻雾、环境声抽离和关键脚步/布料音效，并明确正式创作必须另开资源任务。

### 阶段 10E：存档、历法、结束方式与矿洞/战斗范围决策

状态：`[x]`，2026-07-17 已完成并经用户通过进入阶段 10F 的方式确认；三档存档、120 日历法、第四张固定旧矿道与基础战斗垂直切片均已锁定，尚未单独建立 Git 基线。

交付物：`docs/DEMO_SAVE_AND_CALENDAR.md` 与 ADR-0005 已把三档存档锁定为 Demo 必须项；定义最近档位、损坏档隔离、可重建摘要、稳定自动保存点、旧 `autosave` 全事务迁移，以及未来同档受保护调查前恢复点。Demo 达成第一处异常里程碑后自动保存，并允许继续自由生活或返回标题。历法固定为四季、每季 30 天、每年 120 天，开场为第 1 年春季第 1 日。`docs/MINE_COMBAT_SLICE.md` 与 ADR-0006 增加第四张固定地图 `old_mine`、锄镐采矿、学院练习杖、单一基础敌人、5 点生命、安全撤离和当日矿洞状态；不加入随机楼层、Boss、装备或经济。白天/黄昏/夜晚/下雨仍只作为阶段 11 视觉验证。

完成门槛：三档彼此不串档，最近档损坏不静默跳档，单个损坏档不阻塞其他档；旧 v1 只有在 v2 完整验证后才标记迁移成功；普通自动保存不覆盖未来受保护恢复点；`worldDay=1/30/31/120/121` 与乔苓成年边界可确定性验证；Demo 里程碑不强制退标题；SaveData v2 不加入天气或连续时钟字段，但明确包含玩家生命与当日矿洞状态。矿洞可以独立进入/离开，失败不跨天、不丢物，且不成为关系或异常前置。阶段 12B 只实现已确认容器和迁移，不预填尚未冻结的 NPC 事件正文。

### 阶段 10F：双轨生产排程与首轮资源任务启动

状态：`[x]`，2026-07-17 已完成主线工程轨/独立资源轨排程、写入边界、资源闸门和 `VISUAL-PILOT-001` 完整 Brief；独立资源任务已实际启动并完成 A～F 六张第一轮候选、总览和逐张评审，当前等待用户明确选择两个入围编号。本阶段尚未单独建立 Git 基线。

交付物：`docs/DUAL_TRACK_PRODUCTION.md` 把阶段 11～16 改为可并行的工程/资源双轨；主线唯一修改代码、数据、场景、`.meta`、`assets/` 和权威文档，资源任务只写入批次专属 `art-source`/`audio-source` 目录并回交 `HANDOFF.md`。AI 关键视觉选择每批至少 5 张、默认 6 张；先从 6 张整体方向中选 2 个，再各做至少 3 张优化变体；男性主角和沈禾进入角色候选时各至少 5 套。首轮可复制任务位于 `docs/resource-briefs/VISUAL_PILOT_001.md`；A～F 原图、总览、逐张评审、生成记录、来源记录和确认日志已写入批次目录，资源任务状态为 `round_1_generated_awaiting_user_shortlist`，尚未进入第二轮或运行时制作。

完成门槛：已满足——用户已实际启动 `VISUAL-PILOT-001`，资源任务只写入批次目录且未修改主线文件；主线可在不等待候选确认的情况下进入阶段 11A。视觉方向未通过用户明确确认和技术样片检查前，不得开始第二轮之后的角色/表情制作，不得批量生产 15 名 NPC、四张正式地图或直接写入 `assets/art/`。

阶段 10 总完成门槛：10A～10F 全部确认；四地图拓扑、NPC 分层、异常节拍、关系预览、存档方案、矿洞/战斗切片、Demo 结束点和双轨生产规则均有可验证交付物；后续每项需求都能追溯到一个阶段、验收标准或资源 Brief。

## 阶段 11：四地图灰盒、双状态视觉样片与资源管线

状态：`[~]`，原创 HD 像素增强版的生产规格、目录、首批资源清单与双平台画质档位已经落盘；尚未制作或导入正式美术，也未完成运行样片。

范围按三个主线切片执行，独立资源轨按 `docs/DUAL_TRACK_PRODUCTION.md` 并行：

- 11A，场景与资源基础设施：建立四地图清单、场景切换、命名锚点、安全回退、稳定资源 ID、资源解析和缺失回退，以一张代表性灰盒验证流程。11A 不等待 `VISUAL-PILOT-001`。
- 11B，四地图灰盒：搭建住宅室内、故乡主区域、边界区域和旧矿道，验证相机、碰撞、遮挡、玩家动线、NPC/异常锚点与矿洞入口/安全点；本阶段不实现采矿或战斗。11B 可以与资源 R0 并行，正式地图资产等待对应灰盒尺寸与遮挡冻结。
- 11C，运行时视觉实验室：把用户确认的视觉方向整理为一个 96×96 玩家、一套 32×32 草地/泥土、一栋小屋、一棵树和雾叶草成长阶段，验证图集、层级、白天/黄昏/夜晚/下雨、最小异常覆盖、`wechat-low`/`pc-high` 和来源登记。11C 必须等待视觉方向确认，但不等待全员角色或四张正式地图。

完成门槛：11A/11B 的四张地图灰盒能够串联第一章、可选矿洞和第一处异常纸面流程；旧矿道战斗区不堵住唯一出口，命名安全点可恢复。11C 的首批五类资源在 Cocos 中形成一致画面，相同基础资产可以表现四种环境状态以及温暖日常/微恐渗漏；640×360 与另一横屏比例清晰可读；`wechat-low` 关闭增强后仍可读；资源来源完整。阶段 11 通过不等于完成四张正式地图、矿洞战斗资源或十五名 NPC 的批量美术。

2026-07-17 美术规格记录：

- `docs/ART_BIBLE.md` 已定义 96×96 首版角色、3～4 头身、四方向 4～6 帧、四类独立工具动作、32×32 Tile、地图渲染层、64×64 图标源画布、中文字体策略、语义色板、左上主光和 Sprite Sheet 命名。
- 已确认不采用完整 3D HD-2D；第一版不加入实时动态阴影、多个实时灯光、景深、体积雾、高成本 Bloom、大面积扭曲、复杂反射或逐物体 Shader。
- `wechat-low`/`pc-high` 只改变效果开关与表现预算；玩法代码、资源 ID、存档和输入语义保持一致。
- 已创建 `assets/art`、`assets/materials`、`assets/shaders` 与 `art-source` 目录骨架。由于 Creator 3.8.8 当时正在运行，它已自动生成 `assets/art.meta`、部分子目录和 `README.md` 的 `.meta`；`effects`、`lighting`、`materials` 与 `shaders` 仍等待编辑器刷新生成，未手写或复制 UUID。
- `docs/ART_ASSET_LIST.md` 只开放首批五类正式资源和白天/黄昏/夜晚/下雨验证，不允许直接批量生产 NPC、建筑、作物或家具。
- 已补充“HD 像素场景 + 精美 2D 对话立绘”的双层角色表现；首版立绘使用静态合成 PNG 差分，不使用 Live2D。`docs/ART_BIBLE.md`、`docs/UI_SPEC.md`、`docs/DIALOGUE_SPEC.md`、`docs/DATA_SCHEMA.md` 和 `docs/ART_ASSET_LIST.md` 已锁定状态字段、焦点淡化、资源命名与确定性回退。

## 阶段 12：应用外壳、输入上下文、存档框架与基础 UI

状态：`[ ]`

范围按三个切片执行：

- 12A：建立 `gameplay`、`dialogue`、`menu`、`modal` 输入上下文，以及确认、取消、对白推进、选项导航等语义动作；增加真正调用 `PlatformComposition` 的运行时 bootstrap；建立本地化加载与中文字体回退。
- 12B：按阶段 10E 决策建立 SaveData v2 迁移框架、可重建档位摘要、三个独立档位/最近档位/损坏档隔离、旧单槽全事务导入和空的受保护恢复点角色；实现创建新档、继续最近档、读取指定档、稳定自动保存和保存并返回标题。权威 `worldDay` 必须能还原世界年份、年内日和角色年龄；显式加入满生命默认值与当日矿洞状态结构，v1 导入时不得伪造矿洞进度。全局设置与 `lastPlayedProfileId` 不进入玩法档。为未来男性/女性主角形态预留版本化身份字段，并按阶段 10C 关系契约预留 15 份关系记录、多个 `dating` 和唯一 `spouseCharacterId`，NPC 事件、目标和叙事状态继续走版本化扩展。
- 12C：《雾乡如昨》标题、开始/继续/档位管理、删除与覆盖确认、最小设置、日期、当前目标、快捷栏、互动提示、生命 HUD、工具不符/背包已满/安全撤离反馈、自动保存反馈和暂停；同时完成一轮触控安全区与主动作按钮的早期布局原型，完整微信输入留到阶段 17。

完成门槛：对话或模态界面可抑制世界动作；运行时服务从 composition/bootstrap 注入；旧单槽存档不会静默丢失；首次启动、继续最近档位、选择其他档位、删除/覆盖和损坏档案都有明确结果；键盘和触控布局共享语义而非伪造物理键。

## 阶段 13：NPC 数据、对白与关系预览基础

状态：`[ ]`

范围：先建立覆盖全部 15 人的关系账本、出生日期资料、按世界日期计算的年龄、告白/求婚事务和存档不变量，再按“一名核心角色的完整垂直切片，然后扩展基础人口”的顺序，建立角色 JSON/校验、三张 NPC 活动地图出现规则、世界交互、对白选择、关系状态、立绘解析与 UI、存档迁移。`old_mine` 当前不配置常驻 NPC。对白行通过 `PortraitState` 显式指定 `expression`、`pose`、`costume`、`effect` 与 `direction`，关系/剧情只负责选择对白分支，运行时不得从正文猜测情绪。

完成门槛：15 人都有且只有一份可升可降的好感记录；仅非恋爱角色不可用、未成年告白必拒、成年低好感拒绝、成年达标接受、重复告白和满好感求婚均有事务测试；男性/女性主角形态面对男性/女性 `standard` NPC 得到相同资格结果；开场、乔苓 18 岁生日前后、保存重读和旧档迁移都得到一致结果；多条 `dating` 与唯一不限性别配偶不变量经过测试。先以 `npc_shen_he` 完成成年亲近表现、告白判定、关系变化、连续对白、立绘回退和存读档闭环，再用 `npc_ning_zhao` 验证男性 NPC 恋爱资格不被性别过滤，然后按罗岑山、晏巡、支撑角色、氛围角色的顺序扩展。十五人都有稳定 ID、明确身份、地图存在、原创基础对白与好感反馈；宁昭的 Demo 内容仍为友谊/信任片段，罗岑山与陈蕴验证老年长辈只走非恋爱关系。Demo 不建设完整告白/恋爱/求婚线、第二套主角正式美术、成年换装、婚礼/婚后、完整日程或全员八状态立绘。

## 阶段 14：第一章日常与可持续引导

状态：`[ ]`

范围：在住宅室内完成醒来与村长解释，通过住宅、故乡主区域和边界动线呈现学院无限期封校背景、基础农务引导、关系互动、跨天提示和自由生活入口；基础农务完成后开放可选旧矿道入口，但不强迫玩家进入。建立最小目标/章节进度状态并纳入版本化存档。跨天结算同时推进权威 `worldDay`、重置当日矿洞状态并恢复生命，按四季×30 日历法生成幂等生日/成年事件；当前 Demo 不实现连续日内时钟或随机天气玩法。

完成门槛：不依赖开发者口头说明，玩家可以从住宅出门、理解第一章处境、完成基础耕种、与熟悉的村民重新碰面并读懂当前目标；玩家能从对白理解人物，但主角不会把所有人当作陌生人。引导结束后可继续生活，不因日数或关系进度自动触发最终真相线。

## 阶段 15：旧矿道采矿/战斗与第一处结界异常

状态：`[ ]`

范围按两个切片执行：

- 15A：按 `docs/MINE_COMBAT_SLICE.md` 先实现纯规则的矿脉/背包事务、生命/伤害/无敌/安全撤离和当日状态，再接入 `old_mine`、快捷栏锄镐与学院练习杖、固定敌人、HUD、存读档和输入上下文。敌人只属于普通魔法生态，不接战争残响或异常状态。
- 15B：在阶段 10D 锁定的边界地图位置实现可选的轻微渗漏、第一处结界异常、相关对白/线索、短暂视听转变和回到日常的路径；建立未来不可逆调查点所需的叙事状态接口，但不进入最终真相期。

完成门槛：15A 中锄镐采矿、背包满回滚、练习杖攻击、固定敌人、生命归零安全撤离、同日去重、跨日重置和存读档均可验证，且矿洞不是日常/关系/异常前置；15B 中玩家能够确认边界异常并理解调查是主动选择，不直接泄露屠村、三个愿望、愿境或重构村民来源，忽略线索后仍可继续正常生活。

## 阶段 16：正式美术、音频与 Demo 内容打磨

状态：`[ ]`

范围：收束并回接从阶段 10F 起已经按批次并行生产、且通过用户确认和技术闸门的正式资源；补齐 Demo 最低资源缺口，统一四地图、玩家/NPC、两种作物、矿洞战斗、物品/UI、日常/异常状态的比例、色板、灯光和反馈。完成真实 `IAudioService` adapter、音乐/环境声/SFX 管理、音量设置和前后台暂停，并导入已通过的最小正式音频；依据试玩调整节奏。阶段 16 不是第一次启动美术，矿洞视觉和战斗音频仍须等待阶段 15A 规则/灰盒验收后独立生产。

完成门槛：四张地图的主要玩家可见画面不再依赖纯色几何占位；日常、矿洞与异常状态各自可读且风格一致；战斗在 `wechat-low` 关闭高成本反馈后仍可判断；音频设置和生命周期行为正确；完成内部重复试玩和至少一次陌生玩家观察；时长由实际内容验证，不设固定分钟门槛。

## 阶段 17：微信触控、安全区与生命周期

状态：`[ ]`

范围：在阶段 12 的语义输入和安全区原型上完成左侧虚拟摇杆、右侧动作按钮、触控快捷栏、对话/选择触控、多点触控、安全区、前后台输入释放、微信生命周期、微信存档 adapter 和微信发行 composition/bootstrap。

完成门槛：浏览器触控模拟、微信开发者工具和至少一台真机可以完成四地图 Demo 核心流程，包括采矿、攻击、受伤和撤离；前后台切换触发明确的安全保存策略，不重复结算、不残留输入且不丢档；运行时确实由微信 composition 提供 adapter。

## 阶段 18：微信小游戏构建验证

状态：`[ ]`

范围：AppID、构建设置、包体报告、资源分包/远程资源、缓存、真机性能、隐私与提交前检查。

完成门槛：开发者工具无未解释错误；真机首包、四地图加载/切换、矿洞战斗、存档和完整 Demo 核心流程通过；记录基础库版本、设备与构建参数。

## 阶段 19：Windows 独立构建验证

状态：`[ ]`

范围：Windows x64 原生构建、窗口与高 DPI、焦点/输入释放、稳定本地文件存档、Windows 发行 composition/bootstrap、打包和未运行编辑器环境下的冷启动验证。

完成门槛：一台干净 Windows 环境可启动、完成四地图 Demo 核心流程并恢复矿洞/生命存档；运行时确实注入 Windows adapter；权限失败和损坏存档有明确结果。

## 阶段 20：Steam 测试分支与公开 Demo 候选

状态：`[ ]`

范围：Steamworks 原生/JSB adapter、Steam 客户端初始化与降级、depot/测试分支、Auto-Cloud 评估、版本信息、许可证、性能与公开试玩检查。

完成门槛：Steam 客户端存在和不可用两种路径均有明确结果；微信构建不包含 Steamworks 依赖；至少 5 次非开发者试玩中目标 4 人无需口头指导完成 Demo 核心体验。

## Demo 完成后的决策门

完成阶段 10～20 并收集试玩反馈后，再决定完整商业版的范围，包括：

1. NPC 日程、十五人完整个人好感事件、完整告白/恋爱/求婚线、成年外观与婚后内容规模；
2. 当前固定旧矿道之外的随机楼层、更多敌人、装备、秘境与 Boss 深度；
3. 商店、货币、加工与经济系统；
4. 倒叙章、最终真相期和结局数量；
5. 地图、年份、节日与长期内容量。

在该决策前，上述完整系统属于产品愿景，不是当前任务的默认实现范围。

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
| Steamworks 调用进入共享脚本 | 微信构建失败或原生依赖扩散 | 只允许 Windows/Steam adapter 与 JSB 层接触 SDK，并用架构测试守护 |
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

## 历史技术 MVP 基线与当前产品基线

用户于 2026-07-13 确认的技术 MVP 历史基线如下；其中“房屋不可进入”和“单张技术地图”等限制不再约束当前 Demo：

1. 使用 Cocos Creator 3.8.8（3.8 LTS），并在 MVP 期间锁定该版本。
2. 使用横屏和双手触控布局。
3. 使用 640×360 逻辑设计分辨率；保持高度并适配更宽屏幕，最终适配策略由编辑器原型验证。
4. 基础瓦片为 32×32 像素。
5. 采用东方幻想农场生活方向；雾叶草为技术 MVP 作物。
6. 技术 MVP 使用一个自动存档槽。
7. MVP 不实现货币、出售、商店或加工。
8. 房屋不可进入，只保留屋外睡觉交互点。
9. 当天未浇水的作物停止成长，但不会枯死。
10. 美术先使用项目内原创占位资源。

用户于 2026-07-17 进一步确认：

1. 正式名称改为《雾乡如昨》，《云岚药圃》退出玩家可见名称。
2. 完整游戏以温暖种田、交友与恋爱为表层，以玩家主动调查的悬疑微恐真相线为差异化方向。
3. 重构村民是从死者记忆产生、会形成新记忆和选择的独立新生命。
4. 第二愿望把保护扭曲成封闭，第一愿望把战争残响固定在现世。
5. 玩家可长期停留在平静/轻微渗漏阶段；最终真相期有明确不可逆确认和恢复保障。
6. 故事从第一章开始，学院、原本日常、秘境、袭击与许愿留到后续倒叙章。
7. 当前里程碑定位为不限定固定时长的游戏 Demo，只展示第一处结界异常，不揭露核心真相。
8. Demo 固定五名幸存者和十名重构村民；稳定 ID、知情层级、关系图和内容预算见 `docs/NPC_BIBLE.md`。
9. 15 名 NPC 全部拥有好感；男性/女性主角形态均可与允许恋爱的当前无配偶 NPC 发展适龄亲近关系，未成年告白必拒，成年人按好感判定，罗岑山、陈蕴等老年长辈仅发展非恋爱关系，恋爱对象满好感后才可求婚；允许多条恋爱关系但最多一名不限性别的配偶，当前不模拟 NPC-NPC 恋爱；乔榆—乔苓固定为幸存父亲与重构女儿。
10. 三档存档、继续最近档位和未来同档调查前恢复点已经在阶段 10E 锁定；阶段 12B 实现交互、SaveData v2 与旧单槽迁移。
11. 场景角色采用 HD 像素 Sprite，对话采用精美 2D 静态立绘差分；立绘状态必须由对白数据显式配置，当前说话者保持正常亮度，其他角色 dim，首版不实现 Live2D。
12. Demo 固定包含主角住宅室内、故乡日常主区域、结界边界区域和旧矿道四张可独立加载的玩法地图；前三张核心地图由阶段 10B 确认，`old_mine` 的拓扑、初始尺寸和玩法边界由阶段 10E 与 ADR-0006 补充确认。
13. 当前矿洞只实现固定单层采矿与基础战斗垂直切片：一类矿脉、一种矿石、锄镐、学院练习杖、一类普通魔法生态敌人、5 点生命与安全撤离；随机楼层、Boss、装备成长、技能树和完整掉落经济不在当前 Demo。

## 外部状态

- 当前没有微信小游戏 AppID；不阻塞阶段 10 与阶段 11 前半段的编辑器原型，但首个微信内存烟测和阶段 18 正式构建验收前必须申请。
- 当前没有已确认的 Steamworks App ID 或合作伙伴后台状态；阶段 20 前准备，不把 SDK、App ID 或凭据提前写入共享玩法。
- 是否已有自制或授权素材仍未知；在收到明确来源和许可证前，项目只使用原创占位资源。
- Cocos Dashboard、Cocos Creator、微信开发者工具和 Tiled 的版本、路径与签名已于 2026-07-14 验收。

## 官方参考基线

- Cocos Creator 3.8 LTS 手册：<https://docs.cocos.com/creator/3.8/manual/en/>
- 发布到微信小游戏：<https://docs.cocos.com/creator/3.8/manual/en/editor/publish/publish-wechatgame.html>
- TiledMap 资源：<https://docs.cocos.com/creator/3.8/manual/en/asset/tiledmap.html>
- 原生/Windows 发布入口：<https://docs.cocos.com/creator/3.8/manual/en/editor/publish/publish-native-index.html>

以上链接是规划基线，不替代最终所选 Cocos 版本和微信平台的当期文档。
