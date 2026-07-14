# FarmGame

一个面向微信小游戏和 Windows PC 的原创 2D 像素风农场生活模拟游戏项目。

阶段 0、工具安装验收、阶段 1“工程初始化”和阶段 2“角色移动原型”已经完成；尚未进入地图、碰撞或农田阶段。

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
| Git 仓库 | 已初始化 | `main` 分支；`origin` 为 `git@github.com:kasakukiko/AI-game-FarmGame.git`；阶段 1 基线 `9108c8e`、阶段 2 基线 `cbbfa29` 均已推送 |

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

## 文档索引

- [开发规范](AGENTS.md)
- [执行计划](PLANS.md)
- [游戏设计](docs/GAME_DESIGN.md)
- [MVP 范围与验收](docs/MVP.md)
- [技术规格](docs/TECH_SPEC.md)
- [数据结构](docs/DATA_SCHEMA.md)
- [平台要求](docs/PLATFORM.md)
- [美术规范](docs/ART_GUIDE.md)
- [知识产权与素材来源](docs/LEGAL_AND_IP.md)
- [编辑器手动步骤](docs/MANUAL_STEPS.md)
- [开发说明](docs/DEVELOPMENT.md)
- [参考资料使用规则](references/README.md)

## 当前阶段边界

阶段 2 的移动垂直切片已经完成。下一阶段候选为阶段 3“Tiled 地图与碰撞”；在正式开始前不提前实现摄像机跟随、农田、NPC、商店、任务或完整 UI。

当前没有微信小游戏 AppID，这不阻塞编辑器原型、PC 预览和核心玩法开发；进入微信小游戏构建验收前必须申请。安装仍应保留且只从各工具官方网站更新，MVP 期间不得升级 Cocos Creator。
