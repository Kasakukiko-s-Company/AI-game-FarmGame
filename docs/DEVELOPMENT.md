# Development Guide

## 固定工具版本

- Cocos Creator：`3.8.8`，`C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe`
- Tiled：`1.12.2`，`D:\lzq\Tiled\tiled.exe`
- 微信开发者工具：稳定版 `2.01.2510290`
- 项目目录：`D:\lzq\AI游戏\FarmGame`

MVP 期间不要让 Dashboard 升级或迁移 Creator 版本。当前没有微信小游戏 AppID，不阻塞编辑器与浏览器预览。

## 打开项目

在 Cocos Dashboard 中选择 Creator 3.8.8 并导入本目录，或在 PowerShell 中运行：

```powershell
& 'C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe' --project 'D:\lzq\AI游戏\FarmGame'
```

首次导入会生成 `library`、`temp`、`profiles` 等本机目录。它们已被 `.gitignore` 排除；`assets`、`.creator`、`settings`、`package.json` 和 `tsconfig.json` 必须纳入版本控制。

## TypeScript 检查

项目不额外安装 TypeScript，直接使用锁定编辑器自带的 5.8.2：

```powershell
node 'C:\ProgramData\cocos\editors\Creator\3.8.8\resources\app.asar.unpacked\node_modules\typescript\lib\tsc.js' -p tsconfig.json --noEmit
```

`tsconfig.json` 继承编辑器在 `temp/tsconfig.cocos.json` 生成的引擎配置，所以必须至少成功打开并导入一次项目后再运行。`skipLibCheck` 用于忽略 Cocos 自带声明文件的内部兼容诊断，不会关闭项目 TypeScript 文件的严格检查。

## 数据检查

初始化数据位于 `assets/data`。至少确认所有 JSON 可解析：

```powershell
Get-ChildItem -LiteralPath 'assets\data' -Filter '*.json' | ForEach-Object {
  Get-Content -Raw -Encoding UTF8 -LiteralPath $_.FullName | ConvertFrom-Json | Out-Null
}
```

跨文件规则由 `assets/scripts/data/GameDataValidator.ts` 表达；数据接入启动流程时必须在结构解码后调用它。当前地图基线是 30×30 瓦片、每格 32 像素、10×10 可耕作矩形。

## 自动化测试

当前纯移动、网格碰撞和相机边界规则使用 Node.js 24 内置测试运行器，不需要下载第三方测试框架。在 PowerShell 中使用 `npm.cmd`，避免本机执行策略拦截 `npm.ps1`：

```powershell
npm.cmd test
```

只运行玩家移动测试：

```powershell
npm.cmd run test:player
```

只运行平台输入生命周期测试：

```powershell
npm.cmd run test:platform
```

只运行 world 网格碰撞与 Tiled 地图结构测试：

```powershell
npm.cmd run test:world
```

测试位于 `tests/player`、`tests/platform` 和 `tests/world`，不进入 Cocos 资源数据库；`tsconfig.json` 只包含 `assets/**/*.ts`，项目脚本仍由 Creator 自带 TypeScript 严格检查。

## 模块边界

- `core/save`：版本化、平台无关的存档数据。
- `data`：JSON 类型、结构解码后的跨文件校验。
- `platform`：平台接口与适配器，不包含游戏规则。
- `farming`：阶段 5A 已加入纯 `FarmState` 与 `tillTile` 命令规则；阶段 5B 加入动作键按下沿会话和 `TiledTillingController` 应用组件；阶段 5C 加入纯可耕/已耕矩形投影和只读 `TilledSoilView`；阶段 6A 加入纯 `plantCrop` 播种命令和配置驱动的 `calculateCropGrowthStage`；阶段 6B 通过 E 键语义、严格 `crops.json` 解码和 `TiledPlantingController` 复用唯一农田状态；阶段 6C 加入纯 `CropProjection` 和只读原创几何 `CropView`；阶段 7A 以纯 `FarmDayCycle` 统一日期、浇水与单日成长结算；阶段 7B 通过 F 键语义、`TiledWateringController` 和纯湿土投影接入唯一 `FarmDayState`。状态、输入适配和视觉保持单向依赖。
- `inventory`、`ui`：仅建立目录，等待对应垂直切片，不提前填充空架构。
- `player`：阶段 2 已实现纯移动规则、节点控制器和原创几何占位视图；阶段 3B 只通过接口接受 world 碰撞约束，不直接查询 Tiled。
- `world`：阶段 3A 已完成 Tiled 导入链路；阶段 3B 已完成网格碰撞；阶段 3C 已完成有界相机；阶段 4A 已完成纯瓦片交互规则；阶段 4B 已完成只读交互目标调试视图；阶段 4C 已完成纯可耕作查询；阶段 4D 已完成屏幕/触控到瓦片的 Camera adapter 与浏览器鼠标验收，真实微信设备触控留到平台构建阶段回归。

核心模块不得直接访问 `wx`、`window` 或 `localStorage`。场景、资源 `.meta`、项目设置和组件绑定必须由 Cocos Creator 3.8.8 生成。

Creator 3.8.8 的场景面板会错误处理数组形式的自定义 `@requireComponent([...])` 元数据，并抛出 `Right-hand side of 'instanceof' is not callable`。项目组件只声明单个自动依赖；其余依赖由同节点的其他组件或手动步骤保证。`tests/player/CocosComponentMetadata.test.mts` 用于防止该问题回归。

## Tiled 冒烟地图再生成

先生成原创草地/石墙占位 PNG 和被 Git 忽略的 Tiled JSON 源文件：

```powershell
npm.cmd run generate:map-smoke
```

再由锁定的 Tiled 1.12.2 导出最终 TMX：

```powershell
$source = 'D:\lzq\AI游戏\FarmGame\temp\stage3-tiled\mvp_farm.tmj'
$output = 'D:\lzq\AI游戏\FarmGame\assets\maps\mvp_farm.tmx'
$process = Start-Process -FilePath 'D:\lzq\Tiled\tiled.exe' `
  -ArgumentList @('--export-map', 'tmx', $source, $output) `
  -Wait -PassThru -WindowStyle Hidden
$process.ExitCode
```

退出码必须为 `0`。最终 TMX 使用 Cocos 3.8.8 源码已确认支持的正交、未压缩 CSV 基础功能，包含 `Ground`、`Obstacles` 和隐藏的 `Blocking` 三层；不要启用无限地图、模板、脚本、自定义图块动画或非 gzip/zlib 压缩。

## Git

- 当前分支：`main`
- 远程：`origin = git@github.com:Kasakukiko-s-Company/AI-game-FarmGame.git`
- 工程初始化基线已在提交 `9108c8e` 中创建并推送到 `origin/main`。
- 阶段 2 的移动切片已通过编辑器导入、组件绑定和预览验收；基线提交 `cbbfa29` 已推送到 `origin/main`。
- 阶段 3A 的 Tiled 冒烟测试已完成 Creator 场景绑定和浏览器预览验收；基线提交 `7cfb514` 已推送到 `origin/main`。
- 阶段 3B 的阻挡地图与碰撞代码已完成 Creator 组件绑定和浏览器预览验收；基线提交 `39beb78` 已推送到 `origin/main`。
- 阶段 3C 的有界摄像机跟随、尺寸切换输入修复和浏览器验收已完成；基线提交 `874076c` 已推送到 `origin/main`。
- 阶段 4A 的纯坐标与面向瓦片规则、Creator 导入和预览回归已完成；基线提交 `c0c83bc` 已推送到 `origin/main`。
- 阶段 4B 的 `TileInteractionDebugView`、Creator 元数据、场景绑定和浏览器预览均已验收；基线提交 `0a0d0c2` 已推送到 `origin/main`。
- 阶段 4C 的纯可耕作查询、Creator 元数据和浏览器预览均已验收；基线提交 `4ec6340` 已推送到 `origin/main`。
- 阶段 4D 的 `ScreenTileMapper`、Creator 元数据、场景绑定和浏览器鼠标预览均已验收；基线提交 `37af268` 已推送到 `origin/main`，浏览器触控模拟未验证。
- 阶段 5A 的纯耕地状态规则、三个自动测试、Creator 元数据和浏览器回归均已验收，并已纳入阶段 5A Git 基线。
- 阶段 5B 的空格语义动作、按住去重、真实地图可耕作适配、Creator 组件与场景绑定均已完成；浏览器运行时 Console 已验证 `tilled`、`already_tilled` 和 `not_farmable`。
- 阶段 5C 的纯可耕/已耕地投影、原创 Graphics 占位视图、Creator 元数据和 `TilledSoil` 场景绑定已完成；三态地面、相机尺寸和现有玩法回归均已通过浏览器验收。
- 阶段 6A 的纯播种规则和成长阶段计算已通过 7 项目标测试；它使用最小 `SeedStack` 连接未来背包，不添加 Cocos 组件、按键或作物视觉。Creator 已生成 `CropPlanting.ts.meta`，现有玩法回归无异常。
- 阶段 6B 的 E 键语义、严格作物 JSON 解码和 `TiledPlantingController` 已接入唯一农田状态；Creator 场景绑定与播种状态/种子消耗浏览器验收均已完成。
- 阶段 6C 的纯作物投影、原创 `Graphics` 幼苗视图、Creator 元数据和 `Crops` 场景绑定已完成；显示、去重、拒绝路径、层级、相机尺寸和现有玩法回归均已通过浏览器验收。
- 阶段 7A 的 `FarmDayState`、`waterTile` 与 `advanceFarmDay` 已通过 8 项目标测试；Creator 已自动生成并导入 `FarmDayCycle.ts.meta`，`Main.scene` 无改动。现有移动、碰撞、相机、耕地、播种、幼苗和调试框浏览器回归均已通过。
- 阶段 7B 的 F 键语义、单一日期/农田拥有者、按下沿浇水适配和当前日湿土投影已通过定向测试及 Creator TypeScript 检查；Creator 已生成元数据、保存 Player 组件绑定，首次/重复/非法浇水、按住去重、输入优先级、湿土和现有玩法回归均已通过浏览器验收。
- 阶段 7C 的 Enter 睡觉语义、配置睡觉点判定、单日结算、出生点传送和原创休息点投影已通过 76 项全量测试及 Creator TypeScript 检查；Creator 元数据、场景绑定和浏览器预览均已人工验收。
- 阶段 7D 的双平台装配护栏基线提交 `4692fba` 已推送到 `origin/main`。
- 阶段 8A 的固定容量库存规则基线提交 `1e2ae9f` 已推送到 `origin/main`。
- 阶段 8B 的成熟作物收获事务基线提交 `73b2f18` 已推送到 `origin/main`。
- 阶段 8C 的真实背包播种/收获适配基线提交 `0ee5d39` 已推送到 `origin/main`。
- 阶段 8D 的快捷栏显示、数字键选槽和选中物品驱动操作基线提交 `07261f8` 已推送到 `origin/main`；Creator 声明缓存恢复后严格类型检查通过。
- 阶段 9A 的版本化 `SaveData`、严格 `SaveCodec` 和单槽 `SaveGame` 事务已完成；9 项定向测试、119 项全量测试、平台架构护栏和 Creator 3.8.8 严格类型检查通过。Creator 已自动生成两个新 `.meta`，`Main.scene` 无改动，现有玩法和 Console 人工回归通过。
- 阶段 9A 基线提交 `7a6b5c1` 已推送到 `origin/main`。
- 阶段 9B 的纯运行时快照/恢复计划、Player/Farming 权威状态入口和 `RuntimeSaveBridge` 已完成；16 项阶段 9A～9B 存档测试、126 项全量测试、8 项平台架构护栏与 Creator 3.8.8 严格类型检查通过。Creator 已生成三个唯一元数据记录，Player 已保存一个 `RuntimeSaveBridge` 且 `Crops Data=crops`，现有玩法和 Console 人工回归通过。

不要提交 AppSecret、登录凭据、二维码、`.env`、构建缓存或来源不明素材。
