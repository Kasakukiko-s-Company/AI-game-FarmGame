# 《雾乡如昨》 / FarmGame

一个面向微信小游戏和 Steam Windows 的原创 2D 像素风农场生活模拟与可选悬疑探索游戏项目。

技术 MVP 的移动、地图碰撞、相机、耕地、播种、浇水、跨天成长、收获、背包、快捷栏和本地自动存档均已完成。当前产品里程碑是一个不限定固定时长、可公开试玩的原创游戏 Demo。

## 目标

已经完成的技术闭环：

> 移动 → 锄地 → 播种 → 浇水 → 睡觉 → 成长 → 收获 → 保存 → 退出 → 重新加载

当前在该闭环上加入第一章日常、代表性的村民关系、正式美术与 UI，以及第一处结界异常。Demo 只让玩家意识到故乡边界不正常，不揭露屠村、三个愿望或愿境真相。详细范围见[游戏 Demo 范围](docs/DEMO_SCOPE.md)，完整剧透设定见[叙事设定基线](docs/NARRATIVE_BIBLE.md)，15 名角色的内部设计见[NPC 设定基线](docs/NPC_BIBLE.md)，第一处异常的触发与双状态目标见[界碑回折规格](docs/FIRST_BARRIER_ANOMALY.md)。

## 技术方向

- Cocos Creator 3.8.8（3.8 LTS，Demo 期间不升级）
- TypeScript
- Tiled 1.12.2 / TMX 地图
- JSON 数据配置
- Git

已确认的产品基线：正式名称《雾乡如昨》，横屏、640×360 逻辑设计分辨率、32×32 像素瓦片，表层是东方幻想农场生活，隐藏真相线具有悬疑微恐气质。Demo 至少包含主角住宅室内、故乡日常主区域和结界边界区域三张可独立加载的地图。正式美术采用“原创 HD 像素增强版”：首版 96×96 场景角色、高清像素地图、轻量光照、粒子氛围和少量共享 Shader；对话使用精美 2D 静态立绘差分，并由对白 JSON 显式指定表情与姿势，不从文字自动猜测情绪。技术 MVP 当前仍是一个自动存档槽；Demo 的三档存档与调查前恢复点为待实现方案。

不得手写猜测性的 Cocos 场景、`.meta`、项目设置或组件绑定文件；这些文件由锁定版本的 Cocos Creator 创建。本轮产生的 `.meta` 和 `settings` 均来自实际的 3.8.8 编辑器导入。

## 当前环境（2026-07-14）

| 工具 | 状态 | 实测信息 |
| --- | --- | --- |
| Git | 已安装 | `2.49.0.windows.1` |
| Node.js | 已安装 | `v24.11.0` |
| npm | 已安装 | `11.6.1` |
| Cocos Dashboard | 已安装并验签 | `2.2.1`，`D:\lzq\cocos\CocosDashboard\CocosDashboard.exe` |
| Cocos Creator | 已安装并验签 | `3.8.8`，`D:\lzq\cocos\editors\Creator\3.8.8\CocosCreator.exe` |
| 微信开发者工具 | 已安装并验签 | 稳定版 `2.01.2510290`，`D:\lzq\微信小程序开发工具\微信web开发者工具\微信开发者工具.exe` |
| Tiled | 已安装并验签 | `1.12.2`，`D:\lzq\Tiled\tiled.exe` |
| Git 仓库 | 已初始化 | `main` 分支；`origin` 为 `git@github.com:Kasakukiko-s-Company/AI-game-FarmGame.git`；阶段 9C 基线 `4e6c175` 已推送 |

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
- 阶段 7A 已通过：`FarmDayState` 统一日期与农田状态，`waterTile` 处理首次/重复/非法浇水，`advanceFarmDay` 以配置驱动单日成长、未浇水停长、成熟封顶与未知作物全量拒绝。Creator 元数据、无场景改动结论和现有玩法浏览器回归均已验收；当前不含浇水按键、湿土视觉或睡觉交互。
- 阶段 7B 已通过：F 键输出平台无关的 `wateringAction`，`TiledWateringController` 通过唯一状态拥有者浇灌角色面前的已耕地，`TilledSoilView` 只把当天浇过的格子显示为原创冷调深棕湿土。Creator 元数据、Player 绑定、首次/重复/非法浇水、按住去重、锄地/播种优先级及现有玩法回归均已验收；尚未接入睡觉或日期推进。
- 阶段 7C 已通过：Enter 输出平台无关的 `sleepAction`；面对 `maps.json` 睡觉点时只结算一天，成功后传送到出生点，湿土和作物视图从同一权威状态自动刷新。原创休息点视图、Creator 元数据、场景绑定、76 项全量测试和浏览器预览均已验收；错误位置、按住、出生点重复 Enter 都不会连续跳日。
- 阶段 7D 已建立微信/Windows 运行环境与发行渠道的接口、目标映射和架构护栏；真实发行 composition 尚未接管 Creator 场景，留在 Demo 应用外壳与平台交付阶段完成。
- 阶段 8A～8D 已完成固定容量背包、成熟作物收获事务、真实物品 JSON 适配、8 格快捷栏、槽位选择和选中物品驱动操作。
- 阶段 9A～9C 已完成版本 1 存档、严格编解码、运行时快照/恢复以及浏览器本地自动存档；当前仍是一个固定 `autosave` 槽，只在成功睡觉后保存。
- 阶段 10A 已完成 Demo 规划与文档治理，并以提交 `c98103b` 建立新的需求基线。
- 阶段 10B 已确认纸面流程与三地图拓扑：`home_interior` 承担开场和床铺睡觉，`hometown_main` 合并农场与村庄，`boundary_pass` 承担可选的第一处结界异常；本阶段不创作或定稿美术、音乐与声音资源。
- 阶段 10C 已以提交 `4742e35` 建立 NPC/关系规则基线：固定 5 名幸存者与 10 名重构村民，按 4 名核心、5 名支撑、6 名氛围控制内容深度；15 人全部拥有好感记录。完整产品预留男性/女性主角形态，允许恋爱的当前无配偶 NPC 不分性别均可拥有适龄亲近表现；成年人按好感决定是否接受告白，未成年人 18 岁前必须拒绝；罗岑山、陈蕴等老年长辈只发展非恋爱关系。恋爱对象满好感后才可求婚，同一存档可有多条恋爱关系但最多一名不限性别的配偶；当前不模拟 NPC-NPC 恋爱。
- 阶段 10D 已完成验收并建立 Git 基线：第一处异常采用 `boundary_pass` 旧界碑后的“道路回折”，只有玩家主动继续前进才触发；返回后可检查仍打着完整布结的路标布，也可立即回到日常。晏巡承担克制回应，事件不读取好感或恋爱状态。本阶段只建立事件、双状态构图和资源语义简报，没有创作美术、音乐或声音成品。

## 文档索引

- [开发规范](AGENTS.md)
- [领域词汇表](CONTEXT.md)
- [执行计划](PLANS.md)
- [游戏设计](docs/GAME_DESIGN.md)
- [MVP 范围与验收](docs/MVP.md)
- [游戏 Demo 范围](docs/DEMO_SCOPE.md)
- [Demo 开场流程与三地图拓扑](docs/DEMO_MAP_FLOW.md)
- [叙事设定基线（内部剧透）](docs/NARRATIVE_BIBLE.md)
- [NPC 设定基线（内部剧透）](docs/NPC_BIBLE.md)
- [第一处结界异常规格（内部叙事与资源简报）](docs/FIRST_BARRIER_ANOMALY.md)
- [技术规格](docs/TECH_SPEC.md)
- [数据结构](docs/DATA_SCHEMA.md)
- [平台要求](docs/PLATFORM.md)
- [美术规范](docs/ART_GUIDE.md)
- [正式美术基线](docs/ART_BIBLE.md)
- [美术资源需求清单](docs/ART_ASSET_LIST.md)
- [UI 规格](docs/UI_SPEC.md)
- [对话与立绘规格](docs/DIALOGUE_SPEC.md)
- [视听资源独立任务工作流](docs/RESOURCE_CREATION_WORKFLOW.md)
- [素材来源记录](docs/ASSET_SOURCES.md)
- [知识产权与素材来源](docs/LEGAL_AND_IP.md)
- [编辑器手动步骤](docs/MANUAL_STEPS.md)
- [开发说明](docs/DEVELOPMENT.md)
- [参考资料使用规则](references/README.md)

## 当前阶段边界

阶段 9C 已完成并推送 Git 基线；阶段 10A～10D 已建立需求 Git 基线，下一项是阶段 10E 的存档、结束方式与可选系统决策。后续只按 `docs/DEMO_SCOPE.md`、`docs/NPC_BIBLE.md`、`docs/FIRST_BARRIER_ANOMALY.md` 和 `docs/ART_ASSET_LIST.md` 锁定的小阶段推进，不因完整游戏愿景自动进入完整恋爱、矿洞、战斗、商店经济、大规模 NPC 或批量美术生产。

当前没有微信小游戏 AppID，这不阻塞编辑器原型、PC 预览和核心玩法开发；进入微信小游戏构建验收前必须申请。安装仍应保留且只从各工具官方网站更新，MVP 期间不得升级 Cocos Creator。
