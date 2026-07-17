# Platform Requirements

## Shared

以下能力由两端共享：

- 核心玩法和游戏数据
- 地图、农田、作物、背包、采矿、生命与基础战斗规则
- 时间与日结算
- 存档模型和数据校验
- UI 语义和本地化键

共享不意味着直接使用同一种系统 API；输入、存储、生命周期、音频和分析必须经平台接口提供。

## Target Model

平台身份必须区分两个维度：

```text
RuntimeKind: windows-native | wechat-minigame
DistributionChannel: steam | standalone | wechat
```

已确认的两个发行目标是：

- 微信小游戏：`wechat-minigame + wechat`
- Steam Windows：`windows-native + steam`

Steam 是 Windows 原生版本的发行渠道和可选能力集合，不是与 Windows 并列的运行环境。共享玩法不得通过 `if (steam)` 或 `if (wechat)` 选择规则；差异必须留在 platform seam 后面的 adapter 中。

## WeChat Mini Game

需要考虑：

- 触控输入、手指遮挡和安全区。
- 微信小游戏文件系统与用户数据路径。
- 主包、分包、远程资源、下载域名和缓存淘汰。
- 前后台切换、音频中断、锁屏和进程回收。
- 手机宽高比、横竖屏、高 DPI 和弱性能设备。
- 基础库版本、开发者工具与真机行为差异。
- AppID、构建设置、审核和隐私合规。

已确认的交互基线：横屏、640×360 逻辑设计分辨率、左侧虚拟摇杆、右侧动作按钮。更宽屏幕优先扩展横向可见区域，最终缩放与安全区策略由微信真机原型验证。

Cocos 3.8 文档说明微信小游戏环境不是标准浏览器，资源包、远程资源和缓存有特殊限制；开发者工具也不能完全模拟真机缓存限制。该文档当前提到 4 MB 包体限制，但平台规则会更新，因此每次发布前必须以微信官方当期文档和实际构建报告复核，而不是把数值硬编码进项目规则。

参考：<https://docs.cocos.com/creator/3.8/manual/en/editor/publish/publish-wechatgame.html>

## Steam / Windows

需要考虑：

- WASD、方向键和鼠标/键盘焦点。
- Windows 可写用户数据目录，不写安装目录。
- 窗口大小、全屏、缩放和分辨率策略。
- 原生构建工具链、运行库和冷启动。
- Steam 客户端不可用时的平台能力降级策略。
- Steamworks SDK 初始化、打包文件、成就和覆盖层均留在 Windows 原生桥接层。
- 不假定编辑器或 Node.js 已安装在玩家电脑上。

参考：<https://docs.cocos.com/creator/3.8/manual/en/editor/publish/publish-native-index.html>

## Visual Quality Profiles

正式美术使用同一套纯 2D 玩法、稳定资源 ID 和表现接口，不按发行平台分叉核心逻辑：

- 微信小游戏默认使用 `wechat-low`：限制屏幕内粒子和局部柔光数量，关闭草木共享 Shader、高成本后处理、实时阴影、景深和体积雾。
- Steam/Windows 默认使用 `pc-high`：可以提高轻量粒子、柔光 Sprite 和共享简单 Shader 的预算，但第一版仍不启用高成本 Bloom、景深、体积雾或多个实时灯光。
- 用户设置可以覆盖默认档位；昼夜覆盖、假阴影、灯光 Sprite、天气/环境粒子、草木动态、水面和异常效果都必须能单独关闭。
- 画质只影响表现预算。当前 Demo 的雨景与昼夜只是视觉验证预设；未来若升级为权威天气/时间，关闭雨粒子或夜间色层也只能改变表现，不能改变领域结果。关闭异常 Shader 始终不能改变剧情状态。
- 第一版两个目标共用 96×96 角色和 32×32 Tile；未来 PC 高分辨率替换通过稳定 ID 的资源映射完成，不修改玩法代码或存档。

详细开关、初始预算和视觉规则见 `docs/ART_BIBLE.md`。这些档位目前是设计方案，尚未实现运行时设置组件，也没有经过微信真机性能验证。

## Interfaces

```text
IPlatformService
  - descriptor.runtime
  - descriptor.distribution
  - getSafeArea()
  - subscribeLifecycle(listener)

IInputService
  - getSnapshot()

ISaveService
  - read(slot)
  - write(slot, payload)
  - remove(slot)

IAudioService
  - playMusic(id)
  - playSfx(id)
  - setMuted(value)

IAnalyticsService
  - track(eventName, properties)
```

以上是当前职责摘要，精确签名以 `assets/scripts/platform/PlatformContracts.ts` 为准。当前 `InputSnapshot` 已覆盖移动、工具、快捷栏和暂停；阶段 12A 再加入确认、取消、对白推进与选项导航等 UI 语义，并通过输入上下文抑制世界动作。阶段 15A 的锄镐和练习杖必须复用 `primaryAction` 与当前选中物品语义，不增加平台专属“攻击键”。接口返回值必须能表达失败，异步能力不能伪装成同步。

阶段 10E 已确认 `ISaveService` 会承载三个独立档位的当前快照、未来受保护恢复点和全局应用数据，但共享存档领域仍只传稳定语义 ID 与不透明载荷。平台 adapter 不决定最近档位、迁移、生日、Demo 结束或恢复资格；这些由应用/领域事务负责。微信与 Windows 可以使用不同物理后端，但三个档位与损坏隔离语义必须一致。

## Dependency Rule

核心玩法模块不得直接读取或调用：

- `wx`
- `window`
- `localStorage`
- Node.js 文件系统
- Steamworks/`SteamAPI_*` 原生调用
- 平台键码或原始触摸事件

只有 `platform` 适配器和 Cocos 输入桥接组件可以接触这些 API。

## Save Strategy

- 领域层产生纯 JSON 存档载荷。
- `DesktopSaveService` 负责桌面持久化。
- `WeChatSaveService` 负责微信用户数据文件或经确认的同步/异步存储能力。
- `MemorySaveService` 用于测试。
- 发行 composition root 必须显式接收真实 `ISaveService`，不得自动退回 `MemorySaveService`。
- MVP 不实现自研跨平台云存档；Steam 版本优先评估用 Auto-Cloud 同步 Windows 本地存档文件，不让 Steam 云同步拥有游戏规则。

## Composition Strategy

```text
Shared game modules
        ↓
PlatformContracts
        ↓
composePlatformServices(target, adapters)
        ├─ wechat-minigame → WeChatPlatformService
        └─ steam-windows  → DesktopPlatformService('steam')
```

- `saves` 与 `input` 是必需 adapter；缺失时不得启动发行 composition。
- `audio` 与 `analytics` 在 MVP 可使用显式空 adapter。
- Steam 成就、覆盖层、身份或云接口只有在出现真实调用方和至少两个 adapter 后才建立独立 capability seam，不扩张 `IPlatformService`。
- 当前 `PlatformComposition` 只完成接口与架构护栏；Creator 场景仍由 `KeyboardInputBridge` 和本地自动存档组件直接装配，没有真实调用 `composePlatformServices`。阶段 12A 必须增加运行时 bootstrap，阶段 17 和阶段 19 分别接入微信与 Windows 发行 adapter。
- 当前场景里的 `KeyboardInputBridge` 仍是开发/PC 输入 adapter；阶段 12C 先做触控安全区与布局原型，阶段 17 的正式触控 UI 写入同一语义输入 interface。

## Input Strategy

所有平台输出同一语义：

- `move: Vec2Like`
- `primaryAction`
- `secondaryAction`
- `wateringAction`
- `sleepAction`
- `quickbarSlotIndex`
- `selectPrevious` / `selectNext`
- `pause`
- 阶段 12A 计划加入 `confirm`、`cancel`、`dialogueAdvance` 与选项导航，并由 `gameplay`/`dialogue`/`menu`/`modal` 输入上下文决定哪些动作可见。

阶段 15A 的采矿与战斗不扩张输入词汇：`primaryAction` 根据快捷栏当前物品解析为锄镐采矿或练习杖攻击。微信动作按钮与 PC 键盘必须输出相同语义；前后台切换、窗口失焦、菜单打开和场景切换时都要清空按压状态，避免持续移动或连续攻击。

游戏逻辑不知道输入来自键盘、虚拟摇杆还是触控按钮。

## Verification Gates

微信开发者工具通过不等于微信真机通过。平台阶段至少记录：

- Cocos Creator 版本与构建参数。
- 微信开发者工具版本和基础库版本。
- 真机型号、系统、微信版本和网络条件。
- Windows 版本、CPU/GPU、Steam 客户端状态和是否安装开发工具。
- 首次启动、恢复、前后台、断网、存档与完整闭环结果。
