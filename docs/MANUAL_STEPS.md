# Manual Steps

## 当前阶段

阶段 0 与工具安装验收已经完成。Cocos Creator 3.8.8 工程、代码基线、数据文件和本地 Git 已初始化。

阶段 1 已完成。工程、`640×360` 默认设计分辨率、最小 `Main` 场景和浏览器预览都已通过验收。

阶段 2 已完成。代码、自动化测试、Cocos Creator 3.8.8 脚本导入、组件绑定和浏览器预览均已通过验收。

阶段 3 已开始，目前只执行“Tiled 导入冒烟测试”。TMX 和原创占位纹理已由 Tiled/项目工具生成并被 Creator 导入；等待以下纹理设置、场景绑定和预览验收。

## 阶段 3A：Tiled 导入冒烟测试（已完成）

本节只验证地图能正确显示，不添加阻挡、碰撞、房屋、可耕作区、睡觉点或摄像机跟随。

### A. 确认纹理导入状态

1. 停止浏览器预览，回到 Cocos Creator 3.8.8。
2. 在 Assets/资源管理器中展开 `assets/maps`，确认能看到 `mvp_farm` 和 `mvp_farm_ground`，底部 Console 没有新红色导入错误。
3. 单击顶层 `mvp_farm_ground` 图片，保持右侧 **类型** 为 `sprite-frame`。在 Creator 3.8.8 中，该模式只显示 `spriteFrame` 子资源，内部 `texture` 不出现在资源树里，属于正常现象。
4. 不要为了寻找过滤选项而切换顶层 **类型**，也不要直接编辑 `.meta`；这两种操作都可能改变 TMX 当前引用的资源结构。
5. 当前内部纹理已经由 Codex 实际检查：`Mip Filter = None`，横纵 Wrap 均为 `Clamp To Edge`；Min/Mag 仍为 `Linear`，但在此版本的 `sprite-frame` Inspector 中没有可直接修改的入口。
6. 本次导入冒烟测试先保持现状，在浏览器预览中实际观察是否有接缝或模糊。若出现问题，再在后续像素地图资源流程中处理稳定的 Nearest/图集边缘扩展方案。

### B. 创建 World 并绑定 TMX

1. 双击打开 `assets/scenes/Main.scene`。
2. 在左上角 Hierarchy/层级管理器中右键 `Canvas`，选择 **Create Empty Node / 创建空节点**，命名为 `World`。
3. 将 `World` 拖到 `Canvas` 子节点列表中 `Player` 的上方；最终顺序应为 `Camera`、`World`、`Player`，这样玩家绘制在地图上方。
4. 选中 `World`，在 Inspector 中设置 Position 为 `X=0`、`Y=0`、`Z=0`，Layer 为 `UI_2D`。
5. 滚动到 Inspector 底部，点击 **Add Component / 添加组件**，搜索并添加内置组件 `TiledMap`。
6. 在新增的 `cc.TiledMap` 组件中找到 **Tmx Asset** 空槽。
7. 从左下角 Assets 面板把 `mvp_farm` 拖到 **Tmx Asset** 空槽中。
8. 等待地图生成；Hierarchy 中 `World` 下应出现名为 `Ground` 的子节点。不要手动创建 `Ground`。
9. 按 `Ctrl+S` 保存场景。

### C. 浏览器预览验收

1. 清空 Console，点击顶部三角形预览按钮。
2. 预期游戏区域出现绿色草地图，Player 仍显示在地图上方。
3. 点击游戏画面后测试 WASD 和方向键，确认移动仍正常。
4. 观察草地图块之间是否出现明显黑线、白线、模糊边缘或闪烁。
5. 本子任务没有碰撞，玩家可在草地任意移动或走出地图，属于正常现象。
6. 返回 Creator，确认红色错误计数为 0。
7. 回复 Codex：

```text
纹理类型保持 sprite-frame：是/否
Tmx Asset 绑定：成功/失败
World 下出现 Ground：是/否
草地图预览：成功/失败
Player 显示在地图上方：是/否
移动仍正常：是/否
明显图块接缝或模糊：无/具体表现
  Console 新错误：无/完整错误文本
  ```

### D. 验收记录

- 验收日期：2026-07-14。
- `Tmx Asset` 绑定成功，Creator 在 `World` 下自动生成 `Ground`，Console 没有新导入或场景错误。
- 640×360 浏览器预览成功：草地图覆盖视口，Player 显示在地图上方，WASD/方向键移动仍正常。
- 未观察到明显黑线、白线、模糊边缘、图块接缝或闪烁。
- 本子任务只证明基础 TMX 导入链路可用；阻挡层、碰撞和摄像机跟随尚未实现。

## 阶段 2：角色移动原型（已完成）

### A. 让编辑器导入新脚本（已完成）

2026-07-14 12:53，Creator 3.8.8 已为 6 个新脚本生成 `.meta`。已检查 importer 均为 `typescript`，UUID 无重复。

1. 停止浏览器预览并返回 Cocos Creator 3.8.8。
2. 在 Assets/资源管理器面板点击右上角圆形“刷新”按钮。
3. 等待导入完成，展开 `assets/scripts/player` 和 `assets/scripts/platform`。
4. 确认能看到 `PlayerController`、`PlayerMovement`、`PlayerPlaceholderView`、`KeyboardInputBridge` 和 `TouchInputPort`，Console 没有新红色错误。
5. 如果组件搜索列表里暂时没有这些脚本，等待编译结束后再搜索；不要自行创建 `.meta`。

### B. 创建 Player 节点并绑定组件

1. 双击打开 `assets/scenes/Main.scene`。
2. 在 Hierarchy/层级管理器中右键 `Canvas`，选择 **Create Empty Node / 创建空节点**，命名为 `Player`。
3. 选中 `Player`，在 Inspector 中设置：
   - Position：`X = 0`、`Y = 0`、`Z = 0`
   - Layer：`UI_2D`
4. 点击 **Add Component / 添加组件**，搜索并添加 `KeyboardInputBridge`。
5. 确认 `PlayerController` 被自动添加；将其 `Move Speed` 保持为 `96`。
6. 再添加 `PlayerPlaceholderView`。
7. 确认 `Graphics` 被自动添加，并确认节点已有 `UITransform`；占位视图保持 `Width = 18`、`Height = 24`。
8. 同一个 `Player` 节点只保留一份上述组件，不要添加第二个 Camera、Canvas 或键盘桥。
9. 按 `Ctrl+S` 保存场景。

### C. 浏览器预览验收

1. 如果曾在添加 `PlayerPlaceholderView` 时看到 `Right-hand side of 'instanceof' is not callable`，先点击 Assets 面板刷新按钮并等待脚本重新编译。该兼容问题已在代码中修复，不需要删除或重建现有组件。
2. 清空 Console 中的旧记录，点击顶部三角形预览按钮。
3. 如果键盘第一次没有响应，先用鼠标点击一次黑色游戏画面，让浏览器获得焦点。
4. 分别验证：
   - `W/A/S/D` 可向上/左/下/右移动。
   - 四个方向键产生相同方向移动。
   - 同时按两个垂直方向键可以斜向移动，但不会比单方向更快；自动化测试已精确覆盖速度长度。
   - 角色边缘的黄色朝向标记会随主方向变化，松开按键后保持最后朝向。
5. 本阶段没有碰撞或边界限制，角色可以走出画面；停止并重新预览可重置位置。
6. 返回编辑器确认红色错误计数为 0。
7. 回复 Codex：

```text
新脚本导入：成功/失败
WASD：成功/失败
方向键：成功/失败
斜向移动：成功/失败
停止后朝向保留：成功/失败
Console 新错误：无/完整错误文本
```

### D. 验收记录

- 验收日期：2026-07-14。
- `Main.scene/Canvas/Player` 已由 Creator 保存，位置 `(0, 0, 0)`、层 `UI_2D`，5 个所需组件齐全。
- 浏览器以 `640×360` 设计分辨率预览成功，原创几何角色正常显示。
- WASD、方向键、斜向移动和停止后朝向保留：用户实测全部成功。
- 修复组件元数据兼容问题并刷新后，红色错误计数为 0。

## 阶段 1：编辑器操作（已完成）

只执行本节，不添加角色、地图、农田、按钮、脚本组件或其他玩法节点。

### A. 打开正确的项目和版本

1. 如果 Cocos Creator 当前没有打开，运行 `C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe`。
2. 打开项目目录 `D:\lzq\AI游戏\FarmGame`。
3. 在编辑器标题栏或“帮助 → 关于”确认版本是 **3.8.8**。如果不是 3.8.8，立即关闭，不要保存或升级项目。
4. 等待资源导入结束；“控制台”中不应继续刷出红色错误。

### B. 设置默认 Canvas

1. 打开顶部菜单 **项目 → 项目设置**。
2. 进入 **项目数据** 页签。
3. 在“默认 Canvas 设置”中设置：
   - 设计分辨率宽度：`640`
   - 设计分辨率高度：`360`
   - **Fit Height / 适配高度：勾选**
   - **Fit Width / 适配宽度：取消勾选**
4. 项目设置会自动保存，关闭面板即可。不要直接编辑 `settings/v2/packages/project.json`。

这个选择保持 360 的逻辑高度，并让更宽屏幕显示更多横向世界；后续 UI 还要结合安全区和 Widget 验证。

### C. 创建最小启动场景

1. 在“资源管理器”选择 `assets/scenes` 文件夹。
2. 右键该文件夹，选择 **创建 → Scene（场景）**，命名为 `Main`。不要使用文本编辑器创建场景文件。
3. 双击 `Main.scene` 打开它。
4. 在“层级管理器”中右键场景根节点，选择 **创建 → UI 组件 → Canvas**。
5. Cocos Creator 3.8.8 通常会随 Canvas 自动创建 Camera。确认层级中已有 Canvas 及其 Camera；已有时不要再创建第二个相机。
6. 按 `Ctrl+S` 保存。最终应由编辑器产生 `assets/scenes/Main.scene` 和对应 `.meta`。

### D. 预览和回报

1. 关闭右下角“About plug-in migration”通知；项目没有插件目录，不需要复制插件。
2. 点击底部 **Console** 页签，使用清空按钮删除现有记录。现有 `msg not exist!` 已确认来自 Creator 自带 `cocos-service`，并且早于场景创建，不是项目代码错误。
3. 点击编辑器顶部工具栏的三角形“预览”按钮，使用浏览器预览当前场景。
4. 当前场景没有可见内容，因此黑色或空白画面是正常结果；浏览器能打开才是预览成功。
5. 返回编辑器检查 Console：
   - 如果仍为 0 个红色错误，验收通过。
   - 如果出现新红色错误，双击错误并复制完整文本/堆栈，暂时不要修改场景。
6. 回复 Codex：`预览结果：成功/失败；清空后新错误：无/粘贴完整错误文本`。

实际结果（2026-07-14）：

- 预览结果：成功。
- 清空后红色错误计数：0。
- 清空后新错误：无。
- 预览器显示 `640×360` 设计分辨率，截图时运行帧率为 60 FPS。
- 结论：阶段 1 浏览器预览验收通过。

若菜单文字因语言包略有不同，以英文 `Project Settings`、`Project Data`、`Fit Height`、`Fit Width`、`Create → Scene`、`Create → UI Component → Canvas` 为准。

官方依据：

- Cocos 3.8 [项目设置](https://docs.cocos.com/creator/3.8/manual/zh/editor/project/)
- Cocos 3.8 [多分辨率适配方案](https://docs.cocos.com/creator/3.8/manual/zh/ui-system/components/engine/multi-resolution.html)
- Cocos 3.8 [场景资源](https://docs.cocos.com/creator/3.8/manual/zh/asset/scene.html)

### 自动化验证记录（2026-07-14）

- Cocos Creator 3.8.8 已成功打开项目，进程保持响应。
- 编辑器已生成 30 个 `assets` 元数据文件和 6 个 `settings/v2/packages` 配置文件。
- 最新 `asset-db` 日志没有 `error` 或 `warn` 级记录。一条内置 `primitives.fbx` 状态文件缺失信息处于 `debug` 级，后续内置资源导入继续进行；若人工预览出现异常，再按实际错误追查。
- Creator 自带 TypeScript 5.8.2 的项目级 `--noEmit` 检查通过。
- 5 个 JSON 文件解析、交叉引用和地图尺寸基线检查通过。
- `settings/v2/packages/project.json` 已复核为 `640×360`、`Fit Height = true`、`Fit Width = false`。
- `Main.scene` 已复核包含 Canvas、自动生成的 Camera 和正确组件引用。
- 截图中的一条 `msg not exist!` 来自 Creator 自带 `cocos-service`，时间早于场景创建，且没有项目堆栈帧；验收时已清空记录并重新预览，红色错误计数为 0。

## 工具安装验收记录

验收日期：2026-07-14

| 工具 | 实测版本 | 路径 | 验证结果 |
| --- | --- | --- | --- |
| Cocos Dashboard | 2.2.1 | `D:\lzq\cocos\CocosDashboard\CocosDashboard.exe` | 文件存在；Xiamen Yaji Software 签名有效 |
| Cocos Creator | 3.8.8 | `C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe` | 产品/文件版本为 3.8.8；Xiamen Yaji Software 签名有效 |
| 微信开发者工具 | 稳定版 2.01.2510290 | `D:\lzq\微信小程序开发工具\微信web开发者工具\微信开发者工具.exe` | 内部包版本已读取；Tencent Technology 签名有效；`cli.bat` 可执行 |
| Tiled | 1.12.2 | `D:\lzq\Tiled\tiled.exe` | 产品版本为 1.12.2；SignPath Foundation 签名有效 |

- 用户报告：安装和首次启动无错误或警告。
- 微信小游戏 AppID：暂无。
- Git 仓库：已初始化为 `main` 分支，`origin` 已设置；尚未提交或推送。
- 结论：工具前置条件通过；工程初始化只剩本文件顶部列出的编辑器人工验收。

## 已完成的安装步骤

以下版本与入口于 2026-07-13 对照官方页面核验。当前电脑是 64 位 Windows，因此只选择 Windows x64/64-bit 稳定版。不要选择 nightly、RC、开发快照或第三方镜像。

### 1. 安装 Cocos Dashboard 和 Cocos Creator 3.8.8

官方网站：

- 下载页：<https://www.cocos.com/creator-download>
- 官方安装说明：<https://docs.cocos.com/creator/3.8/manual/zh/getting-started/install/index.html>
- Dashboard 使用说明：<https://docs.cocos.com/creator/3.8/manual/zh/getting-started/dashboard/index.html>

安装步骤：

1. 打开 Cocos 下载页，点击“下载 Cocos Dashboard”，选择 Windows 安装器。
2. 运行下载的 Dashboard `.exe`。默认安装目录可用；如果 C 盘空间紧张，建议使用不含中文和特殊字符的目录，例如 `D:\DevTools\CocosDashboard`。
3. 启动 Cocos Dashboard，注册或登录 Cocos 开发者帐号。
4. 如需修改编辑器安装位置，先在 Dashboard 的“设置”中选择一个不含中文和特殊字符的目录，例如 `D:\DevTools\CocosEditors`。
5. 打开“编辑器/安装”页面，点击“安装编辑器”，明确选择 **Cocos Creator 3.8.8**。不要选择 2.x、其他 3.x 主版本或预览版。
6. 等待下载和安装完成，确认 Dashboard 的已安装编辑器列表显示 `3.8.8`。
7. 启动 3.8.8 一次，确认能进入欢迎页；此时不要新建项目、不要导入当前目录，然后关闭编辑器。

官方 Cocos 下载页当前把 3.8.8 列为最新的 3.8 补丁版，并要求从 Dashboard 安装。安装后记录 Dashboard 和 Creator 的实际路径。

### 2. 安装微信开发者工具

官方网站：

- 微信开发者工具下载：<https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html>
- Cocos 微信小游戏发布说明：<https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-wechatgame.html>

安装步骤：

1. 打开微信官方页面，在“稳定版”区域选择 **Windows 64** 下载；不要选择 RC、Nightly 或第三方打包版本。
2. 运行官方安装器，默认安装位置可用。若自定义目录，建议路径简短且不含特殊字符。
3. 安装后启动微信开发者工具。
4. 使用手机微信扫描登录二维码，完成首次登录。安装本身不要求已有小游戏 AppID。
5. 暂时不要创建或导入项目；确认工具可以进入主界面即可。
6. 在工具的“关于/版本信息”中记录完整版本号。如果找不到该入口，记录安装目录并截图主界面，后续通过可执行文件核验。

正式发布前需要小游戏 AppID，但它不阻塞当前的编辑器原型。不要把 AppSecret、登录凭据或其他密钥写入项目文件。

### 3. 安装 Tiled 1.12.2

官方网站：

- Tiled 官方下载页：<https://www.mapeditor.org/download.html>
- 官方作者下载页：<https://thorbjorn.itch.io/tiled>

安装步骤：

1. 从 Tiled 官方下载页进入作者维护的 itch.io 下载页。
2. 点击“Download Now”。付费是自愿支持；如暂不捐助，可选择继续前往下载列表。
3. 选择 **Tiled installer for Windows 10+ (64-bit)**，确认版本为 **1.12.2**。不要选择 32 位版本或开发快照。
4. 运行安装器。默认安装位置即可；可以保留 `.tmx`、`.tsx` 等地图文件关联。
5. 启动 Tiled，在 `Help → About Tiled` 中确认版本为 `1.12.2`。
6. 暂时不要创建地图或图集，地图参数将在后续独立阶段配置。

### 安装安全规则

- 浏览器地址栏域名必须是 `cocos.com`、`docs.cocos.com`、`developers.weixin.qq.com`、`mapeditor.org` 或官方作者的 `thorbjorn.itch.io`。
- 不使用网盘转载、软件管家、破解包、绿色修改版或来源不明的下载站。
- Windows 如果显示签名异常、文件损坏或未知发布者警告，先停止安装并保留截图，不要直接绕过。
- 当前不需要额外安装 TexturePacker、Visual Studio、其他 Node.js 版本或任何素材包。

### 安装完成后回报（已完成）

安装完成后，将以下信息发给 Codex（不要发送密码、AppSecret 或登录二维码）：

```text
Cocos Dashboard 路径：
Cocos Creator 版本和路径：
微信开发者工具版本和路径：
Tiled 版本和路径：
是否已有微信小游戏 AppID：是/否（不要发送 AppSecret）
安装时出现的错误或警告：
```

这些信息已经收到并通过只读命令复核。下一阶段将提供与 Cocos Creator 3.8.8 匹配的新建 2D 工程步骤。

已确认的工程输入：横屏、640×360 逻辑设计分辨率、32×32 像素瓦片。不要在安装阶段提前猜测或创建 Cocos 配置文件。

## 下一阶段将记录的内容

- Cocos Dashboard/编辑器中新建 2D 项目的菜单和模板。
- 项目名称与位置。
- 初始场景名称、Canvas、Camera 和设计分辨率。
- 编辑器生成文件的检查结果。
- 预览与控制台验证方式。
- 微信开发者工具路径、AppID 和构建参数（不把密钥写入仓库）。

## 验证记录模板

```text
日期：
Cocos Creator 版本：
微信开发者工具版本：
Tiled 版本：
执行步骤：
预期结果：
实际结果：
控制台错误/警告：
截图或日志位置：
```
