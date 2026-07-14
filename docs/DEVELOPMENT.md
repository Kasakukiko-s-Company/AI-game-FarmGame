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
- `farming`、`inventory`、`ui`：仅建立目录，等待对应垂直切片，不提前填充空架构。
- `player`：阶段 2 已实现纯移动规则、节点控制器和原创几何占位视图；阶段 3B 只通过接口接受 world 碰撞约束，不直接查询 Tiled。
- `world`：阶段 3A 已完成 Tiled 导入链路；阶段 3B 已完成网格碰撞；阶段 3C 已完成有界相机；阶段 4A 已完成纯瓦片坐标互转、面向交互目标规则和 Creator 导入验收。

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
- 远程：`origin = git@github.com:kasakukiko/AI-game-FarmGame.git`
- 工程初始化基线已在提交 `9108c8e` 中创建并推送到 `origin/main`。
- 阶段 2 的移动切片已通过编辑器导入、组件绑定和预览验收；基线提交 `cbbfa29` 已推送到 `origin/main`。
- 阶段 3A 的 Tiled 冒烟测试已完成 Creator 场景绑定和浏览器预览验收；基线提交 `7cfb514` 已推送到 `origin/main`。
- 阶段 3B 的阻挡地图与碰撞代码已完成 Creator 组件绑定和浏览器预览验收；基线提交 `39beb78` 已推送到 `origin/main`。
- 阶段 3C 的有界摄像机跟随、尺寸切换输入修复和浏览器验收已完成；基线提交 `874076c` 已推送到 `origin/main`。
- 阶段 4A 的纯坐标与面向瓦片规则、Creator 导入和预览回归已完成；基线提交 `c0c83bc` 已推送到 `origin/main`。

不要提交 AppSecret、登录凭据、二维码、`.env`、构建缓存或来源不明素材。
