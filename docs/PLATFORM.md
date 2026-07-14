# Platform Requirements

## Shared

以下能力由两端共享：

- 核心玩法和游戏数据
- 地图、农田、作物和背包规则
- 时间与日结算
- 存档模型和数据校验
- UI 语义和本地化键

共享不意味着直接使用同一种系统 API；输入、存储、生命周期、音频和分析必须经平台接口提供。

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

## Desktop / Windows

需要考虑：

- WASD、方向键和鼠标/键盘焦点。
- Windows 可写用户数据目录，不写安装目录。
- 窗口大小、全屏、缩放和分辨率策略。
- 原生构建工具链、运行库和冷启动。
- 不假定编辑器或 Node.js 已安装在玩家电脑上。

参考：<https://docs.cocos.com/creator/3.8/manual/en/editor/publish/publish-native-index.html>

## Interfaces

```text
IPlatformService
  - platformKind
  - getSafeArea()
  - subscribeLifecycle(listener)

IInputService
  - getMoveVector()
  - consumeAction(action)

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

这是职责草案，不是现在就要创建的最终签名。接口返回值必须能表达失败，异步能力不能伪装成同步。

## Dependency Rule

核心玩法模块不得直接读取或调用：

- `wx`
- `window`
- `localStorage`
- Node.js 文件系统
- 平台键码或原始触摸事件

只有 `platform` 适配器和 Cocos 输入桥接组件可以接触这些 API。

## Save Strategy

- 领域层产生纯 JSON 存档载荷。
- `DesktopSaveService` 负责桌面持久化。
- `WeChatSaveService` 负责微信用户数据文件或经确认的同步/异步存储能力。
- `MemorySaveService` 用于测试。
- MVP 不实现云存档。

## Input Strategy

所有平台输出同一语义：

- `move: Vec2Like`
- `primaryAction`
- `secondaryAction`
- `selectPrevious` / `selectNext`
- `pause`

游戏逻辑不知道输入来自键盘、虚拟摇杆还是触控按钮。

## Verification Gates

微信开发者工具通过不等于微信真机通过。平台阶段至少记录：

- Cocos Creator 版本与构建参数。
- 微信开发者工具版本和基础库版本。
- 真机型号、系统、微信版本和网络条件。
- Windows 版本、CPU/GPU 和是否安装开发工具。
- 首次启动、恢复、前后台、断网、存档与完整闭环结果。
