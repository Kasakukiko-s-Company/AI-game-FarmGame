# 工具安装来源核验

核验日期：2026-07-13

范围：Windows 64 位环境下安装 Cocos Creator、微信开发者工具和 Tiled。仅记录一手官方来源，不下载、不安装。

## 本机前提

- 已通过系统 API 实测当前 Windows 为 x64/64 位操作系统。
- 因此微信开发者工具和 Tiled 均应选择 Windows 64 位稳定安装器。

## Cocos Creator

结论：MVP 锁定 Cocos Creator 3.8.8，通过 Cocos Dashboard 安装。

一手来源：

- Cocos Creator 官方下载页：<https://www.cocos.com/creator-download>
  - 页面在 2026-07-13 将 3.8.8 列为最新 3.8 补丁版，发布日期为 2025-12-16，并标注“从 Dashboard 安装”。
- Cocos Creator 3.8 官方安装说明：<https://docs.cocos.com/creator/3.8/manual/zh/getting-started/install/index.html>
  - 官方要求先下载并安装 Cocos Dashboard；Windows 安装器为 `.exe`，Dashboard 可管理多个 Creator 版本。
- Cocos Dashboard 官方说明：<https://docs.cocos.com/creator/3.8/manual/zh/getting-started/dashboard/index.html>
  - Dashboard 的编辑器页面可以导入本地编辑器或选择版本下载安装。

版本策略：安装 3.8.8 后记录路径，MVP 期间不升级，避免项目格式或构建行为漂移。

## 微信开发者工具

结论：从腾讯官方页面选择安装当天的 Windows 64 位“稳定版”，不锁定文档中的滚动版本号。

一手来源：

- 腾讯微信开发者工具官方下载页：<https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html>
- Cocos Creator 3.8 微信小游戏发布说明：<https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-wechatgame.html>
  - Cocos 官方流程要求安装微信开发者工具，并在 Creator 中设置其程序路径后进行微信小游戏构建和运行。

核验限制：腾讯下载页面由动态站点提供，本次网页抓取器无法读取其正文，因此没有在仓库中声称一个未经页面读取确认的微信开发者工具版本号。安装后应从“关于/版本信息”或可执行文件属性记录完整版本。

## Tiled

结论：安装 Tiled 1.12.2 的 Windows 10+ 64 位稳定安装器。

一手来源：

- Tiled 官方下载页：<https://www.mapeditor.org/download.html>
  - 2026-07-13 页面列出的最新发布为 Tiled 1.12.2，发布日期为 2026-05-27。
- Tiled 官方作者下载页：<https://thorbjorn.itch.io/tiled>
  - 页面提供 `Tiled installer for Windows 10+ (64-bit)`，版本为 1.12.2。
- Tiled 官方 GitHub 仓库：<https://github.com/mapeditor/tiled>
  - 官方仓库说明可从 GitHub Releases 或作者的 itch.io 页面下载。

## 安全边界

- 只使用上述官方域名和官方作者页面。
- 不使用第三方下载站、软件管家、网盘转载、破解包或开发快照。
- 安装前如出现签名异常、文件损坏或未知发布者提示，应停止并核验，而不是直接绕过。
