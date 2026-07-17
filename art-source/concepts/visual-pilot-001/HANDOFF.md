# VISUAL-PILOT-001 第一轮交接

## 批次与状态

- 批次：`VISUAL-PILOT-001`
- 阶段：第一轮整体视觉方向探索
- 状态：`awaiting_user_shortlist`
- 已完成：A～F 六张独立候选、总览、手机缩略、综合色板、逐张技术评审、提示词/来源/条款记录
- 未完成：第二轮优化、角色造型候选、角色设定页、沈禾表情候选、严格像素资源、运行时导入

## 文件清单

### AI 原始候选

- `art-source/ai-generated/visual-pilot-001/visual-pilot-001-r1-A.png`
- `art-source/ai-generated/visual-pilot-001/visual-pilot-001-r1-B.png`
- `art-source/ai-generated/visual-pilot-001/visual-pilot-001-r1-C.png`
- `art-source/ai-generated/visual-pilot-001/visual-pilot-001-r1-D.png`
- `art-source/ai-generated/visual-pilot-001/visual-pilot-001-r1-E.png`
- `art-source/ai-generated/visual-pilot-001/visual-pilot-001-r1-F.png`
- `art-source/ai-generated/visual-pilot-001/GENERATION_LOG.md`

### 概念审核与记录

- `art-source/concepts/visual-pilot-001/visual-pilot-001-r1-overview.png`
- `art-source/concepts/visual-pilot-001/visual-pilot-001-r1-mobile-320x180-overview.png`
- `art-source/concepts/visual-pilot-001/visual-pilot-001-r1-palette-overview.png`
- `art-source/concepts/visual-pilot-001/ROUND_01_REVIEW.md`
- `art-source/concepts/visual-pilot-001/SOURCE_AND_LICENSE.md`
- `art-source/concepts/visual-pilot-001/CONFIRMATION_LOG.md`
- `art-source/concepts/visual-pilot-001/HANDOFF.md`

### 像素源文件区

- `art-source/aseprite/visual-pilot-001/README.md`：明确第一轮尚无伪造的 Aseprite/分层成品。

## 尚需人工像素整理

方向确认后必须人工完成，而不能把概念图直接缩小：

1. 32×32 草地、普通泥土、耕地、湿土及边缘/转角/少量变体的无缝重绘；
2. 96×96 男性主角与沈禾的正、背、侧比例稿，统一底部中心脚点和透明留白；
3. 小屋拆分 `Objects_Back`/`Objects_Front`，固定占地、遮挡和碰撞参考；
4. 树干/根部与树冠前景拆分，关闭动态后仍可读；
5. 雾叶草 `stage_00`、`stage_01`、`stage_02` 的 32×32/必要时 64×64 重绘，根部固定；
6. 将雾、色偏、局部轮廓错位拆成可关闭的共享覆盖，不烘焙成玩法状态真相；
7. 沈禾未来 1024×1536 分层立绘与 512×768 透明审核导出，移除背景和随机装饰；
8. Point/Nearest、alpha 边缘、像素对齐、图集 padding/extrude、微信真机和 Windows 构建检查。

## 主线安全导入清单

### 可安全读取/评审

本交接列出的 A～F、总览和 Markdown 记录可以由主线只读评审，继续保留在 `art-source/`。

### 可复制到 `assets/art/`

**当前为空。** 第一轮没有任何运行时安全导入文件。用户选择两个入围方向并完成第二轮确认后，仍需人工整理和主线 G2/G3 验收，才会另行给出运行时导出清单。

## 下一步输入

用户需明确回复两个入围编号，例如“B、D 入围”，并可附各自第二轮要解决的问题。收到明确选择前，不进入第二轮。
