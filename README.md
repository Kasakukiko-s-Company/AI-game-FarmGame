# FarmGame

一个面向微信小游戏和 Windows PC 的原创 2D 像素风农场生活模拟游戏项目。

阶段 0、工具安装验收、阶段 1“工程初始化”、阶段 2“角色移动原型”、阶段 3A～3C、阶段 4A～4D、阶段 5A～5C“耕地”以及阶段 6A～6C“播种与作物视觉”均已完成。

## 目标

先完成一条很小但完整的游戏闭环：

> 移动 → 锄地 → 播种 → 浇水 → 睡觉 → 成长 → 收获 → 保存 → 退出 → 重新加载

闭环通过 PC、微信开发者工具和至少一台真机验证后，才讨论 NPC、商店、任务等扩展内容。

## 技术方向

- Cocos Creator 3.8.8（3.8 LTS，MVP 期间不升级）
- TypeScript
- Tiled 1.12.2 / TMX 地图
- JSON 数据配置
- Git

已确认的产品基线：横屏、640×360 逻辑设计分辨率、32×32 像素瓦片、东方幻想药圃主题、一个自动存档槽。MVP 不加入货币、出售和可进入房屋。

不得手写猜测性的 Cocos 场景、`.meta`、项目设置或组件绑定文件；这些文件由锁定版本的 Cocos Creator 创建。本轮产生的 `.meta` 和 `settings` 均来自实际的 3.8.8 编辑器导入。

## 当前环境（2026-07-14）

| 工具 | 状态 | 实测信息 |
| --- | --- | --- |
| Git | 已安装 | `2.49.0.windows.1` |
| Node.js | 已安装 | `v24.11.0` |
| npm | 已安装 | `11.6.1` |
| Cocos Dashboard | 已安装并验签 | `2.2.1`，`D:\lzq\cocos\CocosDashboard\CocosDashboard.exe` |
| Cocos Creator | 已安装并验签 | `3.8.8`，`C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe` |
| 微信开发者工具 | 已安装并验签 | 稳定版 `2.01.2510290`，`D:\lzq\微信小程序开发工具\微信web开发者工具\微信开发者工具.exe` |
| Tiled | 已安装并验签 | `1.12.2`，`D:\lzq\Tiled\tiled.exe` |
| Git 仓库 | 已初始化 | `main` 分支；`origin` 为 `git@github.com:kasakukiko/AI-game-FarmGame.git`；阶段 1 基线 `9108c8e`、阶段 2 基线 `cbbfa29`、阶段 3A 基线 `7cfb514`、阶段 3B 基线 `39beb78` 均已推送 |

四个 GUI 工具的可执行文件均存在且 Authenticode 签名有效。用户报告安装和首次启动没有错误或警告。

工程类型检查使用 Cocos Creator 3.8.8 自带的 TypeScript 5.8.2，避免把系统 Node.js 版本误当成编辑器工具链版本。具体命令见[开发说明](docs/DEVELOPMENT.md)。

## 当前工程状态

- Cocos Creator 3.8.8 已实际打开并导入项目，编辑器生成了资源 `.meta` 和 `settings/v2` 配置。
- `assets/scripts` 已建立 `core`、`data`、`farming`、`inventory`、`platform`、`player`、`ui`、`world` 职责目录。
- 已建立五个必需平台接口以及 Desktop/WeChat 平台边界；当前仅提供不会访问平台全局对象的初始化适配器。
- 已建立版本化单槽存档模型，以及物品、工具、作物、地图和本地化 JSON。
- 严格 TypeScript 项目检查已通过；JSON 解析和当前跨文件引用检查已通过。
- 默认设计分辨率已经由编辑器改为 `640×360`，`assets/scenes/Main.scene` 已由 3.8.8 编辑器生成并包含 Canvas/Camera。用户已完成空场景浏览器预览，清空旧编辑器服务错误后红色错误计数为 0，预览成功。
- 阶段 2 已加入纯移动规则、PC 键盘输入桥、触控语义输入端口、PlayerController 和原创几何占位视图；7 项移动规则测试及 1 项 Creator 组件元数据兼容测试通过。Creator 场景绑定与浏览器预览已验收，两套键位、斜向移动和最后朝向均正常，红色错误计数为 0。操作记录见[编辑器手动步骤](docs/MANUAL_STEPS.md)。
- 阶段 3A 已通过：Tiled 1.12.2 生成的 `30×30` 正交 TMX、单一 `Ground` 图层和原创 `32×32` 草地图块已由 Creator 3.8.8 成功导入并绑定到 `Main.scene/Canvas/World`。自动检查及浏览器预览均通过，Player 显示与移动正常，无明显图块接缝，Console 无新红色错误。
- 阶段 3B 已通过：原创石墙图块、可见 `Obstacles`、不可见 `Blocking`、纯网格碰撞规则和 `TiledCollisionBridge` 均已接入。Creator 场景绑定与浏览器预览已验收，Player 正面不能穿墙、斜向可以滑墙、离墙后移动正常，Console 无新错误。
- 阶段 3C 已通过：纯相机边界规则和 `BoundedCameraFollow` 使用运行时正交视口与 TiledMap 世界边界进行跟随夹取；地图内部跟随、三侧边界、碰撞和尺寸切换均已人工验收。运行中切换预览尺寸暴露的键盘状态残留已修复并有自动回归测试，Console 无新错误或重复警告。
- 阶段 4A 已通过：纯 `TileInteraction` 规则统一左下角瓦片坐标、世界坐标互转和四方向正前方一格选择；地图外不夹取并返回 `null`。Creator 导入及移动、碰撞、相机回归均正常，Console 无新错误；本阶段不包含调试框、可耕作性或锄地。
- 阶段 4B 已通过：`TileInteractionDebugView` 复用阶段 4A 规则，把 Player 最后朝向的相邻瓦片绘制为原创黄色半透明调试框。Creator 已生成 `.meta`、保存独立调试节点与 Player/World 绑定；四方向、跨瓦片、地图边缘、碰撞和相机回归均正常，Console 无新错误或重复警告。该框尚不代表瓦片可耕作。
- 阶段 4C 已通过：纯 `TileFarmability` 规则只在地图内整数格同时位于 JSON 配置的包含边界可耕作矩形内且不属于 `Blocking` 时返回可耕作；`null`、负数、地图外和非整数坐标均安全拒绝。Creator 导入与现有玩法回归正常，Console 无新错误或重复警告；尚未接入锄地或可见表现。
- 阶段 4D 已通过：`ScreenTileMapper` 使用 Creator Camera 把鼠标/触控原始游戏屏幕坐标转换到世界空间，再复用阶段 4A 规则得到有限地图瓦片。Creator 已生成 `.meta` 并保存 Camera/World/InteractionDebug 绑定；鼠标点击、相机移动后点击和另一横屏尺寸点击均正常，黄色朝向框与 Console 回归正常。浏览器触控模拟本轮未验证，真实微信设备触控留到微信构建阶段回归。
- 阶段 5A 已通过：`FarmState` 纯规则以整数瓦片坐标保存耕地，重复操作返回 `already_tilled` 且不重复写入，不可耕作目标返回 `not_farmable`。三个 red-green 循环、Creator 导入和现有玩法浏览器回归均正常；本切片没有可见土地变化。
- 阶段 5B 已通过：空格键映射为语义 `primaryAction`，按住只触发一次；`TiledTillingController` 将 Player 朝向目标、`maps.json` 可耕作矩形和真实 `Blocking` 图层连接到 `FarmState`。Creator 场景绑定和浏览器日志验收均已完成，`tilled`、`already_tilled` 与 `not_farmable` 正常；土地外观仍不会改变。
- 阶段 5C 已通过：纯投影分别生成浅黄绿色未耕药圃和深棕色已耕土块，`TilledSoilView` 以原创 `Graphics` 显示三态地面且不修改玩法状态。场景绑定、可耕区区分、耕地覆盖、相机尺寸和现有玩法回归均正常。
- 阶段 6A 已通过：`plantCrop` 以不可变状态校验种子数量、已耕地和已有作物，并从 `CropDefinition` 解析种子对应作物；`calculateCropGrowthStage` 按 JSON 配置的累计天数计算阶段与成熟状态。Creator 导入、`.meta` 生成和现有玩法回归均正常；本切片不含播种按键或作物视觉。
- 阶段 6B 已通过：E 键输出语义 `secondaryAction`，`decodeCropsData` 严格解码真实 `crops.json`，`TiledPlantingController` 通过现有 `TiledTillingController` 的命令 seam 修改唯一 `FarmState`。Creator 元数据和 Player 场景绑定已保存；浏览器实测未耕拒绝、成功播种、重复占用、三粒种子消耗、耗尽拒绝、长按去重和锄地优先均正常。作物视觉仍留给阶段 6C。
- 阶段 6C 已通过：`createCropPatches` 只读投影已播种状态，`CropView` 使用原创像素几何幼苗并仅在 `FarmState` 引用变化时重绘。Creator 元数据和 `Crops` 场景绑定已保存；浏览器实测首次播种显示、重复/拒绝操作不叠加、三株对齐、层级、相机尺寸及现有玩法回归均正常。

## 文档索引

- [开发规范](AGENTS.md)
- [执行计划](PLANS.md)
- [游戏设计](docs/GAME_DESIGN.md)
- [MVP 范围与验收](docs/MVP.md)
- [技术规格](docs/TECH_SPEC.md)
- [数据结构](docs/DATA_SCHEMA.md)
- [平台要求](docs/PLATFORM.md)
- [美术规范](docs/ART_GUIDE.md)
- [素材来源记录](docs/ASSET_SOURCES.md)
- [知识产权与素材来源](docs/LEGAL_AND_IP.md)
- [编辑器手动步骤](docs/MANUAL_STEPS.md)
- [开发说明](docs/DEVELOPMENT.md)
- [参考资料使用规则](references/README.md)

## 当前阶段边界

阶段 6 已完成并通过人工验收，当前等待建立阶段 6C Git 基线；只有收到明确指令后才进入阶段 7“浇水、睡觉与跨天”，不自行加入完整背包、NPC、商店、任务或完整 UI。

当前没有微信小游戏 AppID，这不阻塞编辑器原型、PC 预览和核心玩法开发；进入微信小游戏构建验收前必须申请。安装仍应保留且只从各工具官方网站更新，MVP 期间不得升级 Cocos Creator。
