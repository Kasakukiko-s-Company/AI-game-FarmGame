# VISUAL-PILOT-001 生成记录

## 批次状态

- 批次 ID：`VISUAL-PILOT-001`
- 当前阶段：第一轮整体视觉方向探索
- 当前状态：`round_1_generated_awaiting_user_shortlist`
- 生成日期：`2026-07-17`
- 生成工具：Codex 内置图像生成（`image_gen`）
- 模型/功能版本：当前会话未暴露精确后端模型名称或版本号；不得据此推定具体模型
- Seed：内置工具未提供 seed 控制或返回值，记为 `unavailable`
- 参考图：无
- 第三方素材：无
- 输出用途：概念候选与方向评审，不是运行时资源

## 共同构图约束

每张候选都是独立的 16:9 横向完整概念板，不以一张拼贴代替多张候选：

- 左侧约三分之二：略俯视、正交感的 HD 增强像素小场景；
- 右侧约三分之一：男性主角与沈禾的腰部以上 2D 对话立绘示意；
- 底部窄条：复用同一基础资产的轻微异常对照；
- 场景固定包含草地、泥土、小屋、树、雾叶草三个阶段、男性主角和沈禾；
- 白天左上主光，异常态只增加低饱和蓝灰/灰紫色偏、轻雾和有限轮廓错位；
- 不增加完整 UI、矿洞、敌人、战斗、额外 NPC、血腥、亡灵或核心真相符号；
- 不模仿任何具体商业游戏，不使用文字、Logo 或水印。

## 共同角色锚点

### 男性主角（仅为第一轮风格占位，不是已确认造型）

- 年轻成年男性，魔法学院新生背景；
- 黑棕色短层次发，轮廓清楚；
- 靛青/灰蓝短学院外套改为卷袖农务穿法，米白内层，土褐长裤；
- 一枚小型黄铜叶形学院扣作为代表配饰；
- 场景比例约 3.5 头身，农务友好，不画成战斗法师。

### 沈禾 `npc_shen_he`（项目既定识别锚点）

- 23 岁，稳健而轻快，不幼态；
- 深栗色齐肩发、中央短刘海、后方低束；
- 暖琥珀色短围裙/外搭、米白内层、低饱和深青腰带与裤装、深棕短靴；
- 居中种子袋符号；
- 场景比例约 3.5 头身；本轮立绘使用克制的 neutral 表情。

## A：温润块面田居

### 完整提示词

```text
Use case: stylized-concept
Asset type: original game visual-direction concept board for a 640x360 landscape 2D farming-life game
Primary request: create one complete 16:9 visual-direction candidate that proves an HD pixel-enhanced game scene and refined 2D dialogue portraits can share one character design language
Scene/backdrop: a small warm rural fantasy homestead with one patch of grass and dirt, one modest hometown cottage, one tree, and one original crop called Mistleaf shown in three clearly different growth stages
Subjects: two full-body scene characters at approximately 3.5 heads tall. The young adult male protagonist has a clear short layered dark-brown hairstyle, rolled-sleeve indigo academy-work jacket over an ivory shirt, earth-brown trousers, and one small brass leaf-shaped academy clasp. Shen He is a 23-year-old woman with shoulder-length deep chestnut hair, short center bangs and a low back tie, warm amber short apron/outer layer, ivory inner layer, muted deep-teal belt and trousers, dark-brown short boots, and a centered seed-pouch emblem. Keep both characters' hair, age, build, outfit, accessory, and colors identical between scene sprites and portraits.
Style/medium: original 2D HD pixel-enhanced pastoral art with low-to-medium detail density, bold readable pixel clusters, broad controlled color shapes, rounded silhouettes, and refined flat-color dialogue illustration; clearly 2D, no 3D diorama
Composition/framing: one cohesive landscape concept board. The left two-thirds is a large slightly elevated three-quarter orthographic game scene; the right third holds two large waist-up dialogue portrait vignettes of the same male protagonist and Shen He; a narrow strip along the bottom repeats the same scene assets as a mild anomaly comparison. No labels or text.
Lighting/mood: warm quiet daytime, main light from upper left, soft baked shadows, gentle pale mist, suitable for long-term peaceful living
Color palette: celadon grass, warm clay soil, honey wood, cream plaster, restrained indigo and amber accents, dark ink outlines only where needed
Anomaly comparison: change only atmosphere and presentation—low-saturation blue-gray and gray-violet tint, faint inward mist, subtly doubled leaf and roof-edge silhouettes; keep all geometry, characters, assets, and composition unchanged; unsettling but not horror
Production intent: visually imply a 32x32 tile grid and 96x96 scene-character readability without drawing a literal grid; prioritize body silhouette, hair shape, clothing main color, then one accessory at phone size
Constraints: original visual language; no logos, no text, no watermark; no extra characters or buildings; no combat, enemies, blood, ruins, ghosts, occult horror, UI, or spoiler imagery; do not imitate any specific commercial game's characters, maps, architecture, palette, or effects
```

### 方向差异

低至中等像素密度、圆润块面、四阶左右明暗组和强轮廓，优先验证手机可读性与低成本量产。

## B：织纹木构田园

### 完整提示词

```text
Use case: stylized-concept
Asset type: original game visual-direction concept board for a 640x360 landscape 2D farming-life game
Primary request: create one complete 16:9 visual-direction candidate that proves an HD pixel-enhanced game scene and refined 2D dialogue portraits can share one character design language
Scene/backdrop: the exact same review content: a small rural fantasy homestead with one patch of grass and dirt, one modest hometown cottage, one tree, one original Mistleaf crop in three growth stages, the male protagonist, and Shen He
Subjects: scene characters around 3.5 to 3.75 heads tall. The male protagonist has short layered dark-brown hair, a rolled-sleeve indigo academy-work jacket, ivory inner shirt, earth-brown trousers, and a brass leaf-shaped academy clasp. Shen He is 23 with shoulder-length deep chestnut hair, short center bangs and a low back tie, amber short apron/outer layer, ivory inner layer, muted deep-teal belt and trousers, dark-brown short boots, and a centered seed-pouch emblem. Preserve these identity anchors exactly between sprite and portrait depictions.
Style/medium: original handcrafted HD pixel-enhanced 2D art with medium detail density, crisp woven and carved motifs used only as large readable shapes, slightly angular timber construction, layered textile-inspired plant silhouettes, and refined clean-line dialogue illustration with restrained fabric texture
Composition/framing: match Candidate A's review layout and camera: left two-thirds large slightly elevated three-quarter orthographic game scene, right third two large waist-up portrait vignettes, bottom narrow anomaly comparison strip; no labels or text
Lighting/mood: clear warm daytime from upper left, dry luminous air with a small amount of pale distance haze, calm and inhabited rather than decorative fantasy spectacle
Color palette: warm ochre, pale celadon, smoked teal, walnut brown, linen cream, small copper highlights
Architecture and plants: stronger exposed timber rhythm, practical deep eaves, woven-lattice vent shapes, layered fan-like leaves and crop blades; all forms must remain convertible into modular multi-tile sprites and 32x32 ground tiles
Anomaly comparison: use the identical assets with a cool desaturated veil, compressed distance contrast, faint inward mist ribbons, and a small misalignment in repeated textile-edge shadows only; no new object or creature
Production intent: make the 32x32 module logic, 96x96 character silhouette, and portrait-to-sprite costume mapping legible at phone scale
Constraints: original visual language; no logos, no text, no watermark; no tiny decorative noise; no extra characters or structures; no combat, blood, ghosts, ruins, UI, or truth spoilers; do not imitate any specific commercial game
```

### 方向差异

中等密度、可读的大型织纹/木刻母题、略角形轮廓与更明确的木构节奏，强调“东方幻想来自工艺语言”而非符号堆砌。

## C：清润绘本像素

### 完整提示词

```text
Use case: stylized-concept
Asset type: original game visual-direction concept board for a 640x360 landscape 2D farming-life game
Primary request: create one complete 16:9 visual-direction candidate showing a cohesive bridge between an HD pixel-enhanced game scene and elegant 2D dialogue portraits
Scene/backdrop: the same small homestead review kit: grass and dirt, one hometown cottage, one tree, Mistleaf in three growth stages, the young male protagonist, and Shen He
Subjects: approximately 3.5-head-tall scene characters with clear silhouettes. Male protagonist: short layered dark-brown hair, indigo-gray rolled-sleeve academy-work jacket, ivory shirt, earth-brown trousers, brass leaf-shaped academy clasp. Shen He: age 23, deep chestnut shoulder-length hair with short center bangs and low back tie, amber short apron, ivory inner layer, muted deep-teal belt and trousers, dark-brown boots, centered seed-pouch emblem. Their portrait versions must be unmistakably the same people.
Style/medium: original lyrical HD pixel-enhanced 2D environment with medium-high but controlled detail, painterly pixel clusters, smooth large-value grouping, soft gouache-like dialogue portraits with precise clean facial features, no photorealism and no 3D
Composition/framing: same fixed review composition: large slightly elevated three-quarter orthographic scene on the left two-thirds, two large waist-up portrait vignettes stacked on the right third, and a bottom narrow strip showing the same assets under a mild anomaly; no labels or text
Lighting/mood: moist spring daylight from upper left, luminous quiet air, soft leaf-shadow rhythm and shallow atmospheric depth, warm enough for everyday life
Color palette: mist sage, blue-green shadow, warm apricot clay, honey amber, muted indigo, creamy paper highlights
Architecture and plants: gently curved roofline, plaster and timber balanced with simple stone footing, cloud-like tree mass broken into a few readable tiers, elegant Mistleaf silhouettes with a clear mature glow shape but no special effect dependency
Anomaly comparison: preserve all assets and geometry; cool the palette toward blue-gray and gray-violet, thin the warm highlights, flatten distant values, add faint low mist and restrained double contours at only two edges
Production intent: show rich atmosphere without hiding the implied 32x32 tile structure or the 96x96 character readability; no high-frequency noise
Constraints: entirely original; no logos, text, watermark, extra people, extra buildings, combat, horror creatures, blood, ruins, UI, or core-story symbols; do not imitate a specific commercial game
```

### 方向差异

中高密度但大块明度受控，用清润空气感和绘本式立绘建立精致度；风险集中在后续像素化与雾效降级。

## D：山雾木刻图形

### 完整提示词

```text
Use case: stylized-concept
Asset type: original game visual-direction concept board for a 640x360 landscape 2D farming-life game
Primary request: create one complete 16:9 visual-direction candidate that uses a graphic carved-shape language across a 2D HD pixel-enhanced scene and refined dialogue portraits
Scene/backdrop: identical review kit and camera content: a small patch of grass and dirt, one modest hometown cottage, one tree, three Mistleaf growth stages, male protagonist, and Shen He
Subjects: slightly taller 3.75-to-4-head scene proportions with decisive silhouettes. Male protagonist keeps short layered dark-brown hair, an indigo academy-work jacket with rolled sleeves, ivory inner shirt, brown trousers, and a brass leaf-shaped clasp. Shen He remains 23 with deep chestnut shoulder-length hair, short center bangs and low back tie, amber short apron, ivory inner layer, muted deep-teal belt and trousers, dark-brown boots, and a centered seed-pouch emblem. Portraits use the identical design anchors.
Style/medium: original graphic HD pixel-enhanced 2D art with medium detail density, crisp stepped edges, carved-print-inspired negative space, angular leaf clusters, strong shape rhythm, restrained outline weight, and refined ink-and-flat-color dialogue portraits; not monochrome and not retro 8-bit
Composition/framing: same fixed concept-board layout and slightly elevated three-quarter orthographic camera as the other candidates: left two-thirds large game scene, right third two large waist-up portraits, bottom narrow anomaly strip; no labels or text
Lighting/mood: crisp upper-left daylight, clear cast-shape logic, calm mountain air, homely rather than epic
Color palette: mineral green, rust clay, charred teal, parchment cream, dark plum-brown, sparse warm amber highlights
Architecture and plants: compact steep eaves with bold bracket-like wood shapes, squared stone base, tree canopy cut into interlocking angular masses, Mistleaf stages separated by clear silhouette rather than sparkle
Anomaly comparison: keep the scene identical; reverse only a few edge accents, cool the light, compress the background, introduce faint inward gray-violet mist and one restrained offset shadow contour; no distortion covering the screen
Production intent: maximize shape readability under nearest-neighbor scaling and low effects while keeping enough refinement for portraits; imply modular tiles without drawing a grid
Constraints: original visual language; no logos, text, watermark, tiny patterns, extra subjects, combat, blood, ghosts, ruins, UI, or narrative spoilers; no imitation of commercial game art
```

### 方向差异

中等密度、硬朗负形、木刻式阶梯边与较高局部对比，强调关闭粒子/Shader 后依然成立的图形可读性。

## E：学院几何乡野

### 完整提示词

```text
Use case: stylized-concept
Asset type: original game visual-direction concept board for a 640x360 landscape 2D farming-life game
Primary request: create one complete 16:9 visual-direction candidate where restrained academy geometry and practical rural forms share one original HD pixel-enhanced language
Scene/backdrop: same review content and scale: small grass and dirt patch, one hometown cottage, one tree, original Mistleaf crop in three stages, male protagonist, and Shen He
Subjects: scene characters approximately 3.75 heads tall with clean geometric silhouettes. Male protagonist has short layered dark-brown hair, a slate-indigo cropped academy-work jacket with rolled sleeves over ivory, brown work trousers, and one clear brass leaf-shaped academy clasp. Shen He is 23 with deep chestnut shoulder-length hair, short center bangs, low back tie, amber short apron/outer layer, ivory inner layer, muted deep-teal belt and trousers, dark-brown boots, and centered seed-pouch emblem. Keep exact identity and outfit mapping in the portraits.
Style/medium: original clean HD pixel-enhanced 2D art with medium detail, modular geometric accents, disciplined diagonal and curve vocabulary, compact pixel clusters, and polished cel-painted dialogue portraits with the same shape language; magical but practical, never sci-fi
Composition/framing: fixed comparison layout: left two-thirds large slightly elevated three-quarter orthographic game scene, right third two large waist-up portrait vignettes, bottom narrow same-asset anomaly strip; no labels or text
Lighting/mood: bright upper-left morning light with crisp soft-edged baked shadows and very light air haze, hopeful and settled
Color palette: slate indigo, cream, copper amber, muted jade, clay brown, a very small blue-violet magic accent
Architecture and plants: practical cottage geometry with one restrained academy-like arch and repeating leaf-diamond construction rhythm, tree branches and Mistleaf designed from compatible arc-and-diamond masses; no glowing rune clutter
Anomaly comparison: preserve assets and geometry; cool and desaturate the whole strip, mute copper warmth, allow only a faint violet edge echo and low inward haze; the same shared assets must still read
Production intent: strong modular conversion to 32x32 tiles and 96x96 sprites, clear costume color blocking and one accessory at phone scale, minimal reliance on particles
Constraints: original design only; no logos, text, watermark, extra people or objects, no combat, enemies, blood, ghosts, ruins, UI, or spoilers; do not imitate any commercial game
```

### 方向差异

中等密度、模块化几何母题、较修长轮廓与克制魔法强调；把学院背景融入构造线和配饰，而不是大面积发光符文。

## F：柔雾生长诗性

### 完整提示词

```text
Use case: stylized-concept
Asset type: original game visual-direction concept board for a 640x360 landscape 2D farming-life game
Primary request: create one complete 16:9 visual-direction candidate built around organic growth silhouettes, soft mist atmosphere, and consistent character identity across HD pixel-enhanced scene art and refined dialogue portraits
Scene/backdrop: identical small homestead kit: grass and dirt, one hometown cottage, one tree, Mistleaf in three growth stages, the young male protagonist, and Shen He
Subjects: compact 3.25-to-3.5-head scene characters with rounded but adult silhouettes. Male protagonist keeps short layered dark-brown hair, indigo academy-work outer layer with rolled sleeves, ivory shirt, brown trousers, and brass leaf-shaped academy clasp. Shen He remains 23 with deep chestnut shoulder-length hair, short center bangs and low back tie, amber short apron, ivory inner layer, muted deep-teal belt and trousers, dark-brown boots, and centered seed-pouch emblem. Portraits must preserve all design anchors exactly.
Style/medium: original high-detail HD pixel-enhanced 2D art with controlled organic clusters, embroidered-edge inspiration expressed through large shapes, layered foliage, soft painted dialogue portraits, delicate but readable material transitions; not blurry, not photorealistic, not 3D
Composition/framing: same fixed 16:9 concept-board composition: large slightly elevated three-quarter orthographic scene in left two-thirds, two large waist-up portrait vignettes in right third, narrow bottom strip repeating the same assets under mild anomaly treatment; no labels or text
Lighting/mood: warm upper-left dappled daylight, pale luminous fog behind forms rather than over them, intimate and quietly magical
Color palette: mist green, moss teal, muted plum, warm amber, faded coral clay, parchment cream
Architecture and plants: softly asymmetric cottage eaves, rounded plaster corners, layered tree canopy with a few drooping ribbon-like branch masses, Mistleaf develops from a two-leaf sprout into a broad three-lobed mature silhouette
Anomaly comparison: reuse everything; lower saturation and warmth, let the fog subtly move inward, offset only selected foliage and eave contours by a few pixels, keep characters and gameplay silhouettes untouched; melancholy unease, never overt terror
Production intent: test the upper useful density limit while retaining strong silhouettes and a feasible 32x32/96x96 simplification path; avoid single-pixel visual noise
Constraints: wholly original; no logos, text, watermark, extra people, extra structures, UI, combat, blood, ghosts, ruins, occult symbols, or truth spoilers; no imitation of any commercial game
```

### 方向差异

本轮最高细节密度、圆润有机生长语言、刺绣感大形与更强空气层次，用来测试精致度上限和手机缩小时的损失。

## 生成后记录字段

每张生成后补充：

- 实际文件路径；
- 原始像素尺寸；
- 工具返回的版本/seed（如有）；
- 是否重试及原因；
- 纯机械后处理（缩放、留白、总览拼接）；
- 评审结论和淘汰/入围/确认状态。

## 实际输出

六张原图均由内置工具各自独立生成一次，没有以单次多图或一张缩略图拼贴代替。工具未返回 seed，也未暴露精确模型版本。

| 编号 | 项目内原图 | Codex 默认保存原图 | 尺寸/模式 | SHA-256 | 状态 |
| --- | --- | --- | --- | --- | --- |
| A | `art-source/ai-generated/visual-pilot-001/visual-pilot-001-r1-A.png` | `C:/Users/26478/.codex/generated_images/019f6fe8-ea87-7f10-8846-6900105e4aaf/exec-36155830-4417-4e2e-ac29-adb5feba1f90.png` | 1672×941 RGB | `724286B38AB314B38AF1F732ECB4EE1541F35F74FCC37969056C55F9BF6006A4` | 待用户评审 |
| B | `art-source/ai-generated/visual-pilot-001/visual-pilot-001-r1-B.png` | `C:/Users/26478/.codex/generated_images/019f6fe8-ea87-7f10-8846-6900105e4aaf/exec-00ae32d1-1534-4576-a7c6-922a37e7ad1c.png` | 1672×941 RGB | `C8FA4DA848F1245F2E3ED618D77FEC4092D1AEC9E92F05FCBC3A712EEBBF8156` | 待用户评审 |
| C | `art-source/ai-generated/visual-pilot-001/visual-pilot-001-r1-C.png` | `C:/Users/26478/.codex/generated_images/019f6fe8-ea87-7f10-8846-6900105e4aaf/exec-38945ac4-a729-4dc9-9aa5-e7e5f8975d85.png` | 1672×941 RGB | `2950844CE6335ED5367B0FBEAF4A27039FC236A20FA24DD7B0357B4E4BC17252` | 待用户评审 |
| D | `art-source/ai-generated/visual-pilot-001/visual-pilot-001-r1-D.png` | `C:/Users/26478/.codex/generated_images/019f6fe8-ea87-7f10-8846-6900105e4aaf/exec-2482974f-87c0-4fc2-914e-877c18fc77ad.png` | 1672×941 RGB | `D4AB0E5CC9D4A82B4BF59EC0E1D75DA6A84FB80138F16AD8A296D8DA51247174` | 待用户评审 |
| E | `art-source/ai-generated/visual-pilot-001/visual-pilot-001-r1-E.png` | `C:/Users/26478/.codex/generated_images/019f6fe8-ea87-7f10-8846-6900105e4aaf/exec-7244abc1-f71c-4d62-8b36-d04b4491e8b6.png` | 1672×941 RGB | `DD1F11A04E8406ADB155BC169A2DBD625776FE11A12D1A61CDFC239376219CD4` | 待用户评审 |
| F | `art-source/ai-generated/visual-pilot-001/visual-pilot-001-r1-F.png` | `C:/Users/26478/.codex/generated_images/019f6fe8-ea87-7f10-8846-6900105e4aaf/exec-df959e3e-85ed-4a64-9fb4-4dcbf9bedbc3.png` | 1672×941 RGB | `84104D404C58FAA2B4CEF2305FE89DE0F8F0E8416309435113896A94818704D9` | 待用户评审 |

## 生成偏差与重试

- A～F 都没有进行生成重试或局部重绘，保留首次输出的随机性和瑕疵，避免在用户确认前暗中融合候选。
- 六张都满足独立完整图片、两名角色、小屋、树、草地/泥土、三阶段作物、白天与轻微异常对照的核心要求。
- 布局执行存在合理随机偏差：A、B、F 把异常态做成资产带，C、D、E 使用较大的同场景对照；不影响第一轮风格比较，但第二轮应锁定完全一致的对照比例。
- F 的沈禾袖口出现少量偏红绘制痕迹；该痕迹不是设定，不能带入后续角色设计。

## 机械后处理

原图 A～F 未做任何像素、色彩、五官、服装或构图修改。仅创建以下评审衍生图：

- `art-source/concepts/visual-pilot-001/visual-pilot-001-r1-overview.png`：每张以 Lanczos 适配到 640×360，按 A～F 排成 3×2 总览，添加编号标签；
- `art-source/concepts/visual-pilot-001/visual-pilot-001-r1-mobile-320x180-overview.png`：每张适配到 320×180，用于缩小可读性预检；
- `art-source/concepts/visual-pilot-001/visual-pilot-001-r1-palette-overview.png`：对每张完整概念板做 8 色 Median Cut 自动提取，仅作为综合色倾向参考；
- 评审衍生图编号使用本机 Windows Arial Bold；该字体只出现在审核图标签，不是游戏运行时字体或美术资产。
