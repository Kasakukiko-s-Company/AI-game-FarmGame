# Asset Sources

本文件记录项目运行时素材的来源和生成方式。未列入本文件或没有明确许可证的外部素材不得进入项目。

## 阶段 3：Tiled 导入冒烟测试

### `assets/maps/mvp_farm_ground.png`

- 类型：原创确定性几何占位图块。
- 创建日期：2026-07-14。
- 创建方式：项目内 `tools/generate-stage3-smoke-assets.mts` 使用 Node.js 标准库生成 PNG；未使用第三方图片、商业游戏素材或 AI 图片生成。
- 尺寸：`32×32`，RGBA。
- 色板：基础色 `#5c8b63`、亮色 `#719f70`、暗色 `#457350`。
- SHA-256：`39F99494E8112622DC7F08FF75C2B4BFB5496EB48E7A94FA350EB5F6F56D7D68`。
- 用途：仅用于阶段 3 的 TMX 导入、像素接缝和缩放冒烟测试；不是最终地图美术。

### `assets/maps/mvp_farm.tmx`

- 类型：原创最小测试地图。
- 创建日期：2026-07-14。
- 创建方式：生成器先在被 Git 忽略的 `temp/stage3-tiled` 中创建 Tiled JSON 源文件，再由本机 Tiled 1.12.2 使用 `--export-map tmx` 导出。
- 结构：正交、`30×30`、`32×32` 瓦片、单一 `Ground` 图层、未压缩 CSV、嵌入 tileset。
- 用途：只验证 Cocos Creator 3.8.8 能正确导入并显示 Tiled 基础功能；阻挡、房屋、可耕作区和睡觉点将在导入冒烟测试通过后添加。
