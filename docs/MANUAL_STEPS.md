# Manual Steps

## 当前阶段

阶段 0 与工具安装验收已经完成。Cocos Creator 3.8.8 工程、代码基线、数据文件和本地 Git 已初始化。

阶段 1 已完成。工程、`640×360` 默认设计分辨率、最小 `Main` 场景和浏览器预览都已通过验收。

阶段 2 已完成。代码、自动化测试、Cocos Creator 3.8.8 脚本导入、组件绑定和浏览器预览均已通过验收。

阶段 3A、阶段 3B、阶段 3C、阶段 4A～4D、阶段 5A～5C、阶段 6A～6C 和阶段 7A～7B 均已完成。当前等待建立阶段 7B Git 基线；阶段 7C 只在收到明确指令后开始。

## 阶段 7B：浇水输入与湿土视觉（已完成）

本切片用 F 键浇灌 Player 正前方的已耕地，并在现有 `TilledSoil` 节点上显示原创冷调深棕湿土。它不推进日期、不让作物成长，也不加入睡觉点、水壶容量、工具栏或存档。

### A. 刷新并确认新脚本

1. 停止浏览器预览，回到 Cocos Creator 3.8.8。
2. 点击资源管理器右上角圆形 **刷新** 按钮，等待脚本编译和资源导入完成。
3. 展开 `assets → scripts → farming`，确认出现 `TiledWateringController` 和 `WateredSoilProjection`。
4. `WateredSoilProjection` 是纯 TypeScript 投影规则，不是组件；不要拖入场景，也不要在“添加组件”中搜索它。
5. 确认两个脚本的 `.meta` 均由 Creator 自动生成；不要手工创建或复制 UUID。
6. 查看底部 Console，确认没有新的红色脚本错误；TMX 1.10 已知提示可保留。

### B. 给 Player 添加浇水组件

1. 在层级管理器展开 `Main → Canvas`，单击 `Player` 节点。
2. 在右侧属性检查器滚动到底部，点击 **添加组件**。
3. 在搜索框输入 `TiledWateringController`。
4. 选择同名脚本组件并添加到 Player。
5. 新组件没有需要拖拽的属性；它会复用 Player 上已有的 `PlayerController` 和 `TiledTillingController`。
6. 找到 Player 上已有的 `TiledTillingController`，确认新出现的 **Starting Day** 为 `1`。不要修改 World、Maps Data、Map Id 或 Blocking Layer Name 的既有绑定。
7. `TiledPlantingController` 不再显示独立的 Current Day 属于正常结果；播种和浇水现在读取同一个权威日期。
8. 不要创建新的湿土节点。已有 `TilledSoil → TilledSoilView` 会自动读取当天湿土投影。
9. 按 `Ctrl+S` 保存 `Main.scene`，等待右下角导入和编译任务结束。

### C. 浏览器预览验收

1. 点击顶部预览按钮，打开浏览器后单击游戏画面取得键盘焦点。
2. 打开浏览器开发者工具 Console；运行时动作日志通常显示在浏览器 Console，而不是 Creator 底部 Console。
3. 面向浅黄绿色药圃格，短按一次空格把它锄成干燥深棕色，然后松开空格。
4. 保持面向该已耕格，短按一次 F。应出现 `[TiledWateringController] watered tile (...)`，土地变成更深、略带冷色和浅色水光的湿土。
5. 松开 F 后在同一格再次短按 F。应记录 `already_watered`，湿土不重复叠加。
6. 面向未耕药圃或外围草地短按 F。应记录 `not_tilled`，地面外观不改变。
7. 按住 F 并移动经过多个格子，只应在首次按下时执行一次；松开后再次按 F 才能执行下一次。
8. 在一个未耕药圃格同时按空格和 F，应只锄地、不立刻变湿；松开后单独按 F 才浇水。
9. 同时按 E 和 F 时应只执行播种，不应同时出现浇水日志；动作优先级为锄地 > 播种 > 浇水。
10. 验证幼苗仍显示在土块上方，Player 和黄色/蓝色调试框层级不被湿土遮挡。
11. 验证 WASD、方向键、石墙碰撞、相机边界、横屏尺寸、空格锄地、E 播种和三粒种子消耗仍正常。
12. 当前日期不会推进，作物不会成长，湿土在本次预览的第 1 天保持可见都属于阶段 7B 正常结果。重新打开预览会重置内存状态。
13. 返回 Creator，确认除 TMX 1.10 已知提示外没有新的项目错误或重复警告。

完成后回复：

```text
TiledWateringController / WateredSoilProjection 导入：成功/失败
两个新 .meta：自动生成/未生成
Player 添加 TiledWateringController：成功/失败
Starting Day：1/其他
首次 F 浇水日志与湿土：正常/异常
同格再次 F：already_watered 且不叠加/异常
未耕地 F：not_tilled 且不变色/异常
按住 F 不重复：正常/异常
空格/E/F 优先级：正常/异常
移动、碰撞、相机、锄地、播种和视觉层级回归：正常/异常
日期与作物成长：未变化（阶段 7B 正常）/异常
除 TMX 1.10 已知提示外的新错误：无/完整内容
```

### D. 验收记录（2026-07-15）

- `TiledWateringController` 与 `WateredSoilProjection` 导入成功，两个 `.meta` 均由 Creator 3.8.8 自动生成并导入。
- Player 已添加 `TiledWateringController`；`TiledTillingController.Starting Day=1`，场景由 Creator 保存。
- 首次 F 返回 `watered` 并显示冷调深棕湿土；同格再次 F 返回 `already_watered` 且不叠加；未耕地返回 `not_tilled` 且不变色。
- 按住 F 不重复，空格/E/F 优先级正常；移动、碰撞、相机、锄地、播种、幼苗和视觉层级回归正常。
- 日期和作物成长保持不变符合阶段 7B 边界。
- 截图中的 QoderWork/Immersive Translate 连接失败来自浏览器扩展，不属于项目；除 TMX 1.10 已知提示外没有项目新错误。

## 阶段 7A：纯浇水与单日结算规则（已完成）

本切片只有纯 TypeScript 规则，不添加浇水按键、湿土画面、睡觉点、日期显示、组件或场景绑定。预览画面保持阶段 6C 状态属于正常结果。

### A. 导入纯规则

1. 停止浏览器预览，回到 Cocos Creator 3.8.8。
2. 点击资源管理器右上角圆形 **刷新** 按钮，等待脚本编译与资源导入完成。
3. 展开 `assets → scripts → farming`，确认出现 `FarmDayCycle`。
4. `FarmDayCycle` 是纯 TypeScript 规则，不是 Creator 组件；不要拖入场景，也不要在“添加组件”中搜索。
5. 确认 `FarmDayCycle.ts.meta` 由 Creator 自动生成；不要自行创建或编辑。
6. 查看底部 Console，确认没有新的红色脚本错误；TMX 1.10 已知提示可保留。

### B. 现有玩法回归

1. 不需要修改或保存 `Main.scene`；层级仍应包含 `World → TilledSoil → Crops → Player → InteractionDebug`。
2. 点击顶部预览按钮，并点击游戏画面取得键盘焦点。
3. 验证 WASD 和方向键、石墙碰撞、相机跟随与地图边界仍正常。
4. 面向浅黄绿色药圃格短按空格，应正常变成深棕色已耕地；同格再次空格不叠加。
5. 松开空格后短按 E，应正常播种幼苗；重复播种、三粒种子消耗与无种子拒绝仍正常。
6. 黄色朝向框、蓝色点击框、已耕土和幼苗层级仍正常。
7. 本切片尚未接入浇水和跨天，所以没有湿土变化、没有成长、日期不变化均属预期。
8. 返回 Creator，确认没有新的红色错误或重复项目警告。

完成后回复：

```text
FarmDayCycle 导入：成功/失败
FarmDayCycle .meta：自动生成/未生成
Main.scene 新绑定：无/其他
WASD 和方向键：正常/异常
石墙碰撞：正常/异常
相机与地图边界：正常/异常
耕地、播种和幼苗视觉：正常/异常
黄色/蓝色调试框：正常/异常
浇水或跨天视觉：未出现（阶段 7A 正常）/异常内容
除 TMX 1.10 已知提示外的新错误：无/完整内容
```

### C. 验收记录（2026-07-15）

- `FarmDayCycle` 导入成功，Creator 3.8.8 自动生成并导入 `.meta`；UUID 唯一。
- `Main.scene` 没有新绑定或文件改动。
- WASD、方向键、石墙碰撞、相机与地图边界、耕地、播种、幼苗视觉和黄色/蓝色调试框均正常。
- 没有出现浇水或跨天视觉符合阶段 7A 的纯规则边界。
- 除 TMX 1.10 已知提示外没有新的项目错误。

## 阶段 6C：已播种作物视觉（已完成）

本阶段把 `FarmState` 中已播种的格子显示为原创雾叶草幼苗占位。它只读状态，不消耗种子、不推进成长，也不加入浇水、日期或存档。

### A. 刷新并确认新脚本

1. 停止浏览器预览，回到 Cocos Creator 3.8.8。
2. 点击资源管理器右上角圆形 **刷新** 按钮，等待脚本编译和资源导入完成。
3. 展开 `assets → scripts → farming`，确认出现 `CropProjection` 和 `CropView`。
4. `CropProjection` 是纯 TypeScript 规则，不是组件，不要把它拖入场景或在“添加组件”中搜索它。
5. 两个脚本的 `.meta` 必须由 Creator 3.8.8 自动生成；不要自行创建或编辑。
6. 查看底部 Console，确认没有新的红色脚本错误。

### B. 创建独立 Crops 显示节点

1. 在层级管理器展开 `Main → Canvas`。
2. 右键 `Canvas`，选择 **创建空节点 / Create Empty Node**，命名为 `Crops`。
3. 把 `Crops` 拖到 `TilledSoil` 后面、`Player` 前面。最终顺序应为：`Camera → World → TilledSoil → Crops → Player → InteractionDebug`。
4. 选中 `Crops`，确认：
   - Position：`X=0`、`Y=0`、`Z=0`
   - Scale：`X=1`、`Y=1`
   - Layer：`UI_2D`
5. 在属性检查器点击 **添加组件**，搜索并添加 `CropView`。
6. `Graphics` 应随 `requireComponent` 自动添加。如果没有 `cc.Graphics`，再手动添加一次；不要添加重复组件。
7. 在 `CropView` 中完成绑定：
   - `Source`：把层级管理器中的 `Player` 拖入，它会引用 Player 上现有的 `TiledTillingController`。
   - `Tiled Map`：把层级管理器中的 `World` 拖入。
8. 本组件不需要再次绑定 `crops.json`；稳定 `cropId/stageIndex` 已保存在权威 `FarmState`，本阶段只有一种原创通用几何占位表现。
9. 按 `Ctrl+S` 保存 `Main.scene`。

### C. 浏览器视觉验收

1. 点击顶部预览按钮；浏览器打开后点击游戏画面取得键盘焦点。
2. 刚开始预览时不应出现幼苗，因为内存农田状态为空。
3. 面向浅黄绿色药圃格短按空格：该格变成深棕色，但此时仍不应出现幼苗。
4. 松开空格，短按 E：Console 应输出 `planted`，同一深棕土块中央应立即出现一株小型深绿茎、雾绿色双叶幼苗。
5. 不移动再次短按 E：应输出 `occupied`，幼苗不能叠加、变粗或出现第二株。
6. 再耕种两个不同格：三株幼苗应各自居中、大小一致，与 32×32 土格对齐，剩余种子变为 0。
7. 面向第四块已耕空地按 E：应输出 `no_seed`，该格不能出现幼苗。
8. 面向未耕地、石墙、地图外或可耕区外按 E：不能出现幼苗。
9. 角色经过幼苗时仍应显示在幼苗上方；黄色朝向框和蓝色点击框也应位于作物视觉上方。
10. 移动相机并切换另一种横屏预览尺寸，幼苗应保持在原瓦片中心，不随屏幕漂移。
11. 关闭并重新打开预览后，耕地和幼苗一起清空属于当前内存状态预期；持久化留到存档阶段。
12. 当前只能看到第 0 阶幼苗是正常的；阶段 7 实现跨天成长后才会显示更高阶段和芽苞。
13. 浏览器与 Creator 不应出现新的项目红色错误或重复警告；TMX 1.10 已知提示和已识别的浏览器扩展连接提示除外。

完成后回复：

```text
CropProjection / CropView 导入：成功/失败
CropView .meta：自动生成/未生成
Crops 节点和组件：成功/失败
层级顺序：World → TilledSoil → Crops → Player → InteractionDebug/其他
Source：Player/未绑定
Tiled Map：World/未绑定
锄地后、播种前无幼苗：正常/异常
首次 E 后出现一株幼苗：正常/异常
同格再次 E 不叠加：正常/异常
三株幼苗位置与大小：正常/异常
无种子或不可播种位置不出现幼苗：正常/异常
角色和调试框显示在幼苗上方：正常/异常
相机移动和横屏尺寸：正常/异常
移动、碰撞、锄地、播种日志回归：正常/异常
除已知提示外的新错误：无/完整内容
```

### D. 验收记录（2026-07-15）

- `CropProjection` 与 `CropView` 已成功导入；Creator 3.8.8 自动生成 `.meta`，importer=`typescript`、imported=`true`，UUID 分别为 `c0457e9f-49f7-4e85-ade5-eb66b2915e9d` 与 `337ff7a0-81ab-4c41-ad49-4fa26f924a26`，全资源 UUID 无重复。
- `Main.scene` 已保存独立 `Crops` 节点和 `CropView`；顺序为 `World → TilledSoil → Crops → Player → InteractionDebug`，`Source=Player`、`Tiled Map=World`。
- 浏览器实测锄地后播种前无幼苗、首次 E 出现一株、同格再次 E 不叠加、三株幼苗位置与大小正确；无种子或不可播种位置不出现幼苗。
- 角色和黄色/蓝色调试框显示在幼苗上方；相机移动、横屏尺寸、移动、碰撞、锄地和播种日志回归正常。
- 除 TMX 1.10 已知提示外，没有新的项目错误或重复警告。

## 阶段 6B：播种输入与真实 JSON/地图适配（已完成）

本阶段让 E 键在角色正前方一格播种。它复用现有 Player、World、已耕土地和唯一 `FarmState`，不会出现幼苗画面；作物视觉属于阶段 6C。

### A. 刷新并确认新脚本

1. 停止正在运行的浏览器预览，回到 Cocos Creator 3.8.8。
2. 在左下角资源管理器点击圆形 **刷新** 按钮，等待资源导入和脚本编译结束。
3. 展开 `assets → scripts → data`，确认出现 `CropDataDecoder`。
4. 展开 `assets → scripts → farming`，确认出现 `TiledPlantingController`。
5. 两个脚本的 `.meta` 必须由 Creator 3.8.8 自动生成；不要自行创建或编辑。
6. 查看底部 Console，确认没有新的红色编译错误。TMX 1.10 已知兼容提示可保留。

### B. 把播种组件添加到现有 Player

1. 在左上角层级管理器展开 `Main → Canvas`，单击现有 `Player` 节点。
2. 在右侧属性检查器滚动到最下方，点击 **添加组件**。
3. 搜索 `TiledPlantingController` 并添加。不要新建第二个 Player、World、TilledSoil 或作物节点。
4. 添加后确认出现以下属性：`Crops Data`、`Seed Item Id`、`Starting Seed Quantity`、`Current Day`。
5. 在资源管理器展开 `assets → data`，把 `crops`（源文件是 `crops.json`）拖到 `Crops Data`。
6. 保持以下值：
   - `Seed Item Id`：`mistleaf_seed`
   - `Starting Seed Quantity`：`3`
   - `Current Day`：`1`
7. 不需要再绑定 `World` 或 `Tiled Map`；组件通过同节点现有 `TiledTillingController` 使用已绑定地图和权威农田状态。
8. 按 `Ctrl+S` 保存 `Main.scene`。

### C. 浏览器预览播种验收

1. 点击顶部预览按钮，打开浏览器后点击游戏画面取得键盘焦点。
2. 按 WASD 或方向键移动，使黄色框落到尚未耕作的浅黄绿色药圃格；短按一次 E。
3. 打开浏览器开发者工具 Console，应看到类似：`[TiledPlantingController] not_tilled tile (x, y); seeds=3.`。运行时日志以浏览器 Console 为准，不要求出现在 Creator 底部 Console。
4. 面向该格短按一次空格，把它耕成深棕色；松开空格后短按 E。日志应变为 `planted`，`seeds=2`。
5. 画面暂时不会出现幼苗，这是阶段 6B 的预期；深棕土地仍应存在。
6. 不移动，再短按 E。日志应为 `occupied`，种子仍是 `2`。
7. 再耕两个不同的可耕格，并分别短按 E：两次应为 `planted`，剩余种子依次为 `1`、`0`。
8. 面向第四块已耕空地短按 E，应为 `no_seed`，种子保持 `0`。
9. 按住 E 不放：同一次按住期间只能出现一条播种日志；松开后再次按下才可触发下一次。
10. 如要验证 `invalid_seed`，只在测试结束后临时把 Inspector 的 `Seed Item Id` 改为不存在的 ID并重新预览；应输出 `invalid_seed` 且不消耗种子。验证后恢复为 `mistleaf_seed` 并保存。此项可选。
11. 同时按住空格和 E 时，本阶段规定锄地优先；不应在同一帧自动把刚耕的格子立即播种。

### D. 现有玩法回归

1. 确认 WASD、方向键、斜向移动和停止朝向正常。
2. 确认石墙碰撞、斜向滑墙、相机跟随与地图四边限制正常。
3. 确认空格锄地、浅黄绿/深棕土地、黄色朝向框和蓝色点击框正常。
4. 切换另一种横屏预览尺寸，重复一次移动、锄地和 E 播种；坐标不能漂移。
5. 浏览器与 Creator 不应出现新的红色错误或重复警告；TMX 1.10 已知提示除外。

完成后回复：

```text
CropDataDecoder / TiledPlantingController 导入：成功/失败
TiledPlantingController .meta：自动生成/未生成
Player 组件添加：成功/失败
Crops Data：crops/未绑定
Seed Item Id / Starting Seed Quantity / Current Day：mistleaf_seed / 3 / 1（或实际值）
未耕地按 E：not_tilled/其他完整日志
已耕空地首次 E：planted，seeds=2/其他完整日志
同格再次 E：occupied，种子不变/其他完整日志
三粒种子耗尽后：no_seed，seeds=0/其他完整日志
按住 E 不重复：正常/异常
空格与 E 同时按：锄地优先/异常
作物视觉：未出现（阶段 6B 正常）/出现（说明内容）
移动、碰撞、相机、锄地和调试框回归：正常/异常
除 TMX 1.10 已知提示外的新错误：无/完整内容
```

### E. 验收记录

- 验收日期：2026-07-15。
- `CropDataDecoder` 与 `TiledPlantingController` 导入成功；Creator 3.8.8 自动生成 `.meta`，importer=`typescript`、imported=`true`，UUID 分别为 `4d0dbc99-f970-4aa4-9234-ab6e00857e9c` 与 `f61f18f9-0bb0-492a-9810-fda55f54f1b7`，全资源 UUID 无重复。
- `Main.scene` 已在现有 Player 上添加 `TiledPlantingController`，`Crops Data=crops`、`Seed Item Id=mistleaf_seed`、`Starting Seed Quantity=3`、`Current Day=1`。
- 浏览器 Console 已验证未耕地 `not_tilled`、首次播种 `planted`、同格再次操作 `occupied`，三粒种子依次消耗到 0，之后返回 `no_seed`。
- 按住 E 不重复；空格与 E 同时按下时锄地优先；阶段 6B 没有作物视觉符合预期。
- 移动、碰撞、相机、锄地和黄色/蓝色调试框回归正常；除 TMX 1.10 已知提示外没有项目新错误。
- 截图中 `QoderWork`、`Immersive Translate` 和 `content_scripts` 的连接提示来自浏览器扩展内容脚本，不是 FarmGame 或 Cocos 运行时错误。

## 阶段 6A：纯播种规则与成长阶段计算（已完成）

本节只让 Creator 导入纯规则并回归现有玩法。它不会新增播种按键、作物画面、节点、组件或场景绑定；按键接入和视觉分别属于阶段 6B、6C。

### A. 导入纯规则

1. 使用 Cocos Creator 3.8.8 打开本项目；若已经打开，先停止浏览器预览并返回编辑器。
2. 等待资源数据库自动刷新；若没有刷新，点击资源管理器右上角圆形 **刷新** 按钮。
3. 展开 `assets → scripts → farming`，确认出现 `CropPlanting`。
4. `CropPlanting` 是纯 TypeScript 规则，不是 Creator 组件；不要把它拖进层级管理器，也不要在“添加组件”中搜索或添加它。
5. `.meta` 必须由 Creator 3.8.8 自动生成；不要自行创建或编辑。
6. `Main.scene` 不需要新增节点、组件、属性绑定或保存改动。
7. 查看底部 Console，确认没有新的红色编译错误。

### B. 现有玩法回归

1. 清空 Creator Console，打开 `Main.scene` 并点击顶部三角形预览按钮。
2. 点击游戏画面取得键盘焦点，确认 WASD 和方向键移动正常。
3. 确认石墙碰撞、斜向滑墙、相机跟随和地图四边限制正常。
4. 确认浅黄绿色未耕药圃、深棕色已耕土块、黄色朝向框和蓝色点击框正常。
5. 面向未耕药圃短按空格，仍应耕出深棕色土块；同格再次空格不叠加。
6. 本切片尚未接入播种输入，所以按其他键不会出现幼苗是正常结果。
7. 返回 Creator，确认没有新的红色错误或重复警告。当前已知的 TMX 1.10 兼容提示不计为阶段 6A 新错误。

完成后回复：

```text
CropPlanting 导入：成功/失败
CropPlanting .meta：自动生成/未生成
Main.scene 新绑定：无/有（说明内容）
WASD 和方向键：正常/异常
石墙碰撞：正常/异常
相机与地图边界：正常/异常
耕地视觉和空格锄地：正常/异常
黄色/蓝色调试框：正常/异常
除 TMX 1.10 已知提示外的新错误：无/完整内容
```

### C. 验收记录

- 验收日期：2026-07-15。
- 截图确认资源管理器中已出现并可打开 `CropPlanting`，因此脚本导入成功。
- Creator 3.8.8 自动生成 `CropPlanting.ts.meta`；importer=`typescript`、imported=`true`、UUID=`71191c8b-af0b-4527-8788-8b9e3cd4fc5c`，资源 UUID 无重复。
- `Main.scene` 没有新增绑定或文件改动，符合纯规则切片范围。
- WASD、方向键、石墙碰撞、相机与地图边界、耕地视觉、空格锄地和黄色/蓝色调试框回归均正常。
- 除 TMX 1.10 已知兼容提示外没有新错误。

## 阶段 5C：已耕土地视觉（已完成）

本阶段把 `maps.json` 的可耕范围显示为浅黄绿色未耕药圃，并把阶段 5B 的内存耕地状态显示为原创深棕色占位土块。它不加入播种、浇水、存档或正式美术，也不修改 TMX。

### A. 刷新并确认脚本导入

1. 回到已打开的 Cocos Creator 3.8.8。
2. 在左下角资源管理器点击刷新按钮，等待编译完成。
3. 展开 `assets → scripts → farming`。
4. 确认出现 `TilledSoilProjection` 和 `TilledSoilView`。
5. 查看底部 Console，确认没有新的红色编译错误；不要自行创建或编辑 `.meta`。

### B. 创建显示节点

1. 在层级管理器展开 `Main → Canvas`。
2. 右键 `Canvas`，选择 **创建空节点 / Create Empty Node**，命名为 `TilledSoil`。
3. 把 `TilledSoil` 拖动到层级顺序中，使它紧跟在 `World` 后面、位于 `Player` 前面。最终顺序应为：`Camera → World → TilledSoil → Player → InteractionDebug`。
4. 选中 `TilledSoil`，确认：
   - Position：`X=0`、`Y=0`、`Z=0`
   - Scale：`X=1`、`Y=1`
   - Layer：`UI_2D`
5. 在属性检查器点击 **添加组件**，搜索并添加 `TilledSoilView`。
6. `Graphics` 应随 `requireComponent` 自动添加；如果属性检查器中没有 `cc.Graphics`，再手动添加一次，但不要添加重复组件。
7. 在 `TilledSoilView` 中完成绑定：
   - `Source`：从层级管理器拖入 `Player` 节点，它会引用该节点上的 `TiledTillingController`。
   - `Tiled Map`：拖入 `World` 节点。
8. 按 `Ctrl+S` 保存 `Main.scene`。

不要把 `TilledSoilView` 添加到 Player、World 或 InteractionDebug；独立节点用于固定渲染顺序并避免视图跟随角色移动。

### C. 浏览器预览验收

1. 点击顶部预览按钮，打开浏览器后先点击游戏画面获取键盘焦点。
2. 预览刚开始时，应能一眼看到 10×10 浅黄绿色网格药圃；外围普通地面仍为绿色。浅黄绿色表示“允许耕作但尚未耕作”，不是已耕地。
3. 移动到浅黄绿色药圃，使黄色框落在其中一格，短按一次空格。
4. 黄色框所在格应立即由浅黄绿色变成深棕色土块，内部有三条横向耕沟；浏览器 Console 同时输出 `tilled`。
5. 不移动并再次短按空格：日志应为 `already_tilled`，画面不能叠出第二块或变深。
6. 连续耕作两到三个相邻格：每个成功坐标应各出现一个对齐 32×32 网格的土块，角色仍显示在土块上方。
7. 面向外围绿色草地、石墙或地图外按空格：日志应为 `not_farmable`，不能出现新土块。
8. 移动相机并切换另一种横屏预览尺寸，药圃和土块应保持在原地图格，不跟随屏幕漂移。
9. 回归 WASD、方向键、石墙碰撞、相机边界、黄色朝向框和蓝色点击框。
10. 关闭并重新打开预览后深棕色土块清空、浅黄绿色药圃仍存在是当前预期；持久化属于后续存档阶段。
11. 浏览器 Console 和 Creator 中不应出现新的红色错误或重复警告。

已知兼容提示：当前 TMX 头部由 Tiled 1.12.2 写为 `version="1.10"`，Creator 可能显示 `[Scene] cocos2d: TMXFormat: Unsupported TMX version: 1.10`。只要地图、碰撞和视觉均正常，它不是阶段 5C 新错误；保留完整文本，后续单独处理，不要在本阶段手改 TMX 版本。

验收记录：

```text
TilledSoilProjection / TilledSoilView 导入：成功
TilledSoil 节点和组件：成功
Source：Player
Tiled Map：World
首次空格出现土块：正常
未耕药圃与外围草地可区分：正常
同格再次空格不叠加：正常
相邻土块对齐：正常
不可耕位置不出现土块：正常
角色显示在土块上方：正常
相机移动和横屏尺寸：正常
现有移动、碰撞和调试框回归：正常
浏览器或 Creator 新错误：除 TMX 1.10 已知兼容警告外无
```

## 阶段 5B：锄头输入与真实地图适配（已完成）

本阶段按空格键对 Player 黄色朝向框所在瓦片执行锄地。它只更新内存状态并输出 Console 日志，不改变草地图块外观；土地视觉属于阶段 5C。

Creator 3.8.8 已自动生成 `TiledTillingController.ts.meta`，importer 为 `typescript`、imported 为 `true`，UUID 为 `73dbea20-def2-4f48-ba96-cb23e0278a47`。不要手工创建或编辑 `.meta`。

### A. 确认脚本导入

1. 回到已经打开的 Cocos Creator 3.8.8；等待资源刷新完成。
2. 在左下角资源管理器依次展开 `assets → scripts → farming`。
3. 确认其中出现 `FarmState` 和新脚本 `TiledTillingController`。
4. 查看底部 Console，确认没有新的红色编译错误。

### B. 把组件添加到 Player

1. 在左上角层级管理器展开 `Main → Canvas`，单击 `Player` 节点。
2. 在右侧属性检查器滚动到最下方，点击 **添加组件**。
3. 在搜索框输入 `TiledTillingController`，单击搜索结果添加组件。
4. 添加后应看到四个属性：`Tiled Map`、`Maps Data`、`Map Id`、`Blocking Layer Name`。
5. 从层级管理器把 `Canvas → World` 节点拖到 `Tiled Map` 属性框。
6. 在资源管理器展开 `assets → data`，把 `maps`（源文件为 `maps.json`）拖到 `Maps Data` 属性框。
7. 确认 `Map Id` 保持 `mvp_farm`。
8. 确认 `Blocking Layer Name` 保持 `Blocking`，大小写必须一致。
9. 按 `Ctrl+S` 保存 `Main.scene`。

不要把组件添加到 World、Camera 或 InteractionDebug；它必须与 `PlayerController`、`KeyboardInputBridge` 位于同一个 Player 节点。

### C. 浏览器预览验收

1. 清空 Creator Console，点击顶部三角形预览按钮。
2. 使用 WASD 或方向键移动。空格键现在是“使用默认锄头”。
3. 移动到地图中央偏左下的可耕作区域，使黄色框位于允许耕作的瓦片，然后短按一次空格。
4. 打开浏览器开发者工具的 Console，应出现类似：`[TiledTillingController] tilled tile (14, 14).`，实际坐标可以不同。外部浏览器预览的运行时日志不保证转发到 Creator 底部 Console。
5. 松开空格，不移动黄色框，再按一次空格；应出现相同坐标的 `already_tilled`。
6. 按住空格并改变移动方向，松开前不应连续产生新的耕地日志；松开后再次短按才执行下一次动作。
7. 面向石墙、地图外方向或可耕作矩形之外的草地按空格，应出现 `not_farmable`，且不能产生 `tilled`。
8. 草地画面不变是本阶段预期结果；不要因此添加 Sprite、图块层或手写场景数据。
9. 回归 WASD、方向键、石墙碰撞、相机边界、黄色朝向框和蓝色点击框。
10. 返回 Creator，确认没有新的红色错误、重复警告或“缺少 World/maps.json/Blocking”警告。若“打开日志文件”提示 `temp/logs/project.log` 不存在，使用浏览器 Console 验收运行时日志，不要手工创建该文件。

验收结果：Player 组件及 `World`、`maps.json`、`mvp_farm`、`Blocking` 绑定已保存；首次空格、重复空格和区域外操作分别得到 `tilled`、`already_tilled`、`not_farmable`。清理临时文件后曾出现的 `project.log` EPERM 在完整重启 Creator 后消失。

完成后回复：

```text
TiledTillingController 导入：成功/失败
Player 组件添加：成功/失败
Tiled Map：World/未绑定
Maps Data：maps/未绑定
首次空格：tilled/其他完整日志
同格再次空格：already_tilled/其他完整日志
按住空格不重复：正常/异常
石墙或区域外：not_farmable/其他完整日志
WASD 和方向键：正常/异常
石墙碰撞：正常/异常
相机与地图边界：正常/异常
黄色/蓝色调试框：正常/异常
Console 新错误或重复警告：无/完整内容
```

## 阶段 5A：纯耕地状态规则（已完成）

本节只让 Creator 导入纯规则并回归现有玩法。它不会在画面中产生耕地，也不需要创建节点、添加组件或修改 `Main.scene`。

2026-07-15 已重新启动 Creator 3.8.8，编辑器自动生成 `FarmState.ts.meta`；importer 为 `typescript`、imported 为 `true`，UUID 为 `6d087727-4df3-438e-9096-c5041018e4c9`。资源 UUID 检查无重复，场景没有产生新改动。

### A. 导入纯规则

1. 使用 Cocos Creator 3.8.8 打开本项目；若编辑器已经打开，回到编辑器即可。
2. 等待资源数据库刷新完成；如未自动刷新，点击资源管理器右上角圆形 **刷新** 按钮。
3. 展开 `assets/scripts/farming`，确认出现 `FarmState`。
4. `FarmState` 是纯 TypeScript 领域规则，不是 Creator 组件；不要把它拖入 Hierarchy，也不要使用“添加组件”搜索它。
5. 不要自行创建或编辑 `.meta`；由 Creator 3.8.8 自动生成。
6. 确认 `Main.scene` 不需要新增节点、组件或属性绑定。
7. 确认底部 Console 没有新的红色编译错误。

### B. 浏览器预览回归

1. 清空 Console，打开 `Main.scene`，点击顶部三角形预览按钮。
2. 确认 WASD 与方向键移动正常，石墙仍不能穿过且斜向仍可滑墙。
3. 确认相机跟随和地图边界正常。
4. 确认黄色朝向框正常；点击地图后蓝色指针框仍落在所点瓦片。
5. 本阶段没有把 `tillTile` 接入输入和画面，因此点击或按键后草地不改变颜色是正常结果。
6. 返回 Creator，确认 Console 无新错误或重复警告。
7. 回复 Codex：

```text
FarmState 导入：成功/失败
FarmState .meta：自动生成/未生成
Main.scene 新绑定：无/有（说明内容）
WASD 和方向键：正常/异常
石墙碰撞：正常/异常
相机与地图边界：正常/异常
黄色/蓝色调试框：正常/异常
Console 新错误或重复警告：无/完整内容
```

### C. 验收记录

- 验收日期：2026-07-15。
- Creator 3.8.8 已成功导入 `FarmState.ts` 并自动生成 `.meta`；该规则没有添加到节点或组件，`Main.scene` 无新绑定。
- 清理临时文件后的首次浏览器预览曾显示 Cocos 内置 `@cocos/box2d` 模块加载失败；本地预览服务器随后已对相同资源返回 HTTP 200，执行 `Ctrl+F5` 和重新打开预览后均恢复正常。
- 清空 Creator Console 后旧的 `msg not exist!` 未再次出现；没有其他新错误或重复警告。本次瞬时错误没有通过修改项目代码处理。
- WASD、方向键、石墙碰撞、相机与地图边界、黄色/蓝色调试框回归均正常。
- 本阶段没有可见耕地变化，符合 5A 只建立纯状态规则的范围。

## 阶段 4D：屏幕/触控坐标适配（已完成）

本节只验证屏幕指针能正确映射到有限地图瓦片。蓝色框表示鼠标/触控所点瓦片，黄色框仍表示 Player 朝向目标；本节不执行锄地或修改农田状态。

### A. 导入新组件

1. 停止浏览器预览，回到 Cocos Creator 3.8.8。
2. 在左下角资源管理器点击右上角圆形 **刷新** 按钮，等待脚本编译完成。
3. 展开 `assets/scripts/world`，确认出现 `ScreenTileMapper`。
4. 不要自行创建或编辑 `.meta`；由 Creator 3.8.8 自动生成。
5. 选中 `assets/scripts/world/TileInteractionDebugView` 不需要做任何资源设置；刷新后它会多出一个可绑定属性。
6. 确认底部 Console 没有新的红色编译错误。

### B. 绑定现有 Camera 和调试视图

1. 在 Hierarchy 中展开 `Canvas`，选中现有的 `Camera`；不要创建第二个 Camera 节点或第二个 `cc.Camera`。
2. 滚动到 Inspector 底部，点击 **添加组件 / Add Component**，搜索并添加 `ScreenTileMapper`。
3. 该节点原有 `cc.Camera` 和 `BoundedCameraFollow` 都应保留且继续启用。
4. 在新组件的 **Tiled Map** 属性中，把 Hierarchy 的 `World` 节点拖入槽位；槽内应显示 World 上的 `TiledMap`。
5. 在 Hierarchy 选中现有 `InteractionDebug` 节点。
6. 找到原有 `TileInteractionDebugView`，确认 Target 仍为 `Player`、Tiled Map 仍为 `World`。
7. 找到新增的 **Screen Tile Mapper** 槽位，把 Hierarchy 的 `Camera` 节点拖入；槽内应显示 Camera 上的 `ScreenTileMapper`。
8. 保持 `InteractionDebug` 只有一个 `Graphics`；不要添加第二个 Graphics。
9. 按 `Ctrl+S` 保存场景。

### C. 浏览器预览验收

1. 清空 Console，点击顶部三角形预览按钮。
2. 黄色框应继续位于 Player 最后朝向的相邻一格；点击地图内任意草地，所点瓦片应出现一个蓝色半透明方框。
3. 在同一瓦片的不同位置点击，蓝框应保持在同一格；跨过瓦片边界点击，蓝框应按整数瓦片跳到相邻格。
4. 点击可见石墙格时蓝框允许覆盖石墙，因为阶段 4D 只定位屏幕瓦片，不判断可耕作性；Player 仍不能穿墙。
5. 移动 Player 让相机明显跟随，再点击当前屏幕中的草地，蓝框必须出现在新相机位置下实际所点的瓦片，不能停留在旧屏幕映射。
6. 在预览器切换到另一种横屏尺寸；如果使用 `OPPO Reno2 (360×800)`，先点击 **Rotate** 使实际视口成为 `800×360`。再次点击不同瓦片，蓝框仍应准确吸附。
7. 如需验证真实触控事件，可打开浏览器开发者工具的设备模拟模式后轻触游戏画面；触控结束应与鼠标松开产生相同蓝框。若本轮不使用设备模拟，请在回报中写“触控模拟未验证”，不要写成功。
8. 再回归 WASD、方向键、石墙碰撞、相机边界和黄色目标框。
9. 返回 Creator，确认红色错误计数为 0，也没有重复出现 `[ScreenTileMapper] Add this component to Camera and assign Tiled Map.` 警告。
10. 回复 Codex：

```text
ScreenTileMapper 导入：成功/失败
Camera 上添加组件：成功/失败
Tiled Map：World/未绑定
InteractionDebug Mapper：Camera/未绑定
鼠标点击蓝框：正常/异常
移动相机后点击：正常/异常
另一横屏尺寸点击：正常/异常
触控模拟：正常/异常/未验证
黄色目标框与现有回归：正常/异常
Console 新错误或重复警告：无/完整内容
```

### D. 验收记录

- 验收日期：2026-07-15。
- Creator 3.8.8 已显示 `assets/scripts/world/ScreenTileMapper`；对应 `.meta` 由编辑器生成，importer 为 `typescript`、imported 为 `true`，UUID 为 `7063dbff-89be-48aa-9013-e148348327e0`。
- 现有 Camera 已添加 `ScreenTileMapper`，Tiled Map=`World`；`InteractionDebug/TileInteractionDebugView` 的 Screen Tile Mapper=`Camera`，场景序列化引用检查通过。
- 浏览器鼠标点击蓝框、移动相机后点击和另一横屏尺寸点击均正常；截图确认黄色朝向框正常，蓝框与黄色框重叠时覆盖黄色框属于绘制顺序的预期结果。
- Creator Console 无新错误或重复警告；截图显示预览保持 60 FPS。
- 浏览器设备触控模拟本轮未验证，因此不记录为通过；真实微信设备触控须在后续微信构建阶段回归。

## 阶段 4C：纯可耕作瓦片查询（已完成）

本节只让 Creator 导入纯规则并回归现有玩法，不创建节点、不添加组件，也不实现锄地、农田状态或屏幕点击。

### A. 导入纯规则

1. 停止浏览器预览，回到 Cocos Creator 3.8.8。
2. 在左下角资源管理器点击右上角圆形 **刷新** 按钮，等待脚本编译完成。
3. 展开 `assets/scripts/world`，确认出现 `TileFarmability`。
4. `TileFarmability` 是纯 TypeScript 规则，不是 Creator 组件；不要把它拖入 Hierarchy，也不要点击“添加组件”搜索它。
5. 不要自行创建或编辑 `.meta`；由 Creator 3.8.8 自动生成。
6. 确认底部 Console 没有新的红色编译错误。

### B. 浏览器预览回归

1. 清空 Console，点击顶部三角形预览按钮，再点击游戏画面取得键盘焦点。
2. 确认 WASD 和方向键移动正常，石墙仍不能穿过且斜向仍可滑墙。
3. 确认相机跟随与地图边界正常。
4. 确认阶段 4B 黄色目标框仍按四方向和跨瓦片更新，面向地图外时消失。
5. 本阶段没有接入可见表现，因此黄色框不会改变颜色；画面与阶段 4B 相同属于正常结果。
6. 返回 Creator，确认红色错误计数为 0，也没有新的重复警告。
7. 回复 Codex：

```text
TileFarmability 导入：成功/失败
WASD 和方向键：正常/异常
石墙碰撞：正常/异常
相机与地图边界：正常/异常
黄色目标框：正常/异常
Console 新错误或重复警告：无/完整内容
```

### C. 验收记录

- 验收日期：2026-07-14。
- Creator 3.8.8 已显示 `assets/scripts/world/TileFarmability`；对应 `.meta` 由编辑器生成，importer 为 `typescript`、imported 为 `true`，UUID 为 `4b392adb-0483-44b7-8048-ec7d16b1d5f1`。
- `TileFarmability` 没有绑定到场景节点或组件，`Main.scene` 未产生阶段 4C 改动。
- WASD、方向键、石墙碰撞、相机与地图边界、黄色目标框回归均正常。
- Creator Console 无新错误或重复警告；阶段 4C 人工验收完成。

## 阶段 4B：场景交互目标调试框（已完成）

本节只显示 Player 当前朝向的相邻瓦片，不加入可耕作性、锄地、屏幕点击或农田状态。

### A. 导入新组件

1. 停止浏览器预览，回到 Cocos Creator 3.8.8。
2. 在左下角资源管理器点击右上角圆形 **刷新** 按钮，等待脚本编译完成。
3. 展开 `assets/scripts/world`，确认能看到 `TileInteractionDebugView`。
4. 不要自行创建或编辑 `.meta`；由 Creator 3.8.8 自动生成。
5. 确认底部 Console 没有新红色编译错误。

### B. 创建独立调试节点

1. 在左上角 Hierarchy 展开 `Canvas`。
2. 右键 `Canvas`，选择 **创建空节点 / Create Empty Node**，命名为 `InteractionDebug`。
3. 如果新节点不在最下方，把它拖到 `Canvas` 内并放在 `Player` 下方，使层级顺序成为 `Camera`、`World`、`Player`、`InteractionDebug`。
4. 选中 `InteractionDebug`，在 Inspector 设置：
   - Position：`X = 0`、`Y = 0`、`Z = 0`
   - Layer：`UI_2D`
5. 点击 Inspector 底部 **添加组件 / Add Component**，搜索并添加 `TileInteractionDebugView`。
6. 添加后应自动出现 `Graphics`，节点也应有 `UITransform`；不要再手动添加第二份 `Graphics`。
7. 在 `TileInteractionDebugView` 中，把 Hierarchy 的 `Player` 拖入 **Target**。
8. 把 Hierarchy 的 `World` 拖入 **Tiled Map**；槽内应显示 World 上的 `TiledMap` 组件。
9. 不要给该节点添加 `PlayerController`、`KeyboardInputBridge` 或 `TiledCollisionBridge`。
10. 按 `Ctrl+S`，让 Creator 保存场景绑定。

### C. 浏览器预览验收

1. 清空 Console，点击顶部三角形预览按钮，再点击游戏画面取得键盘焦点。
2. Player 附近应出现一个 `32×32` 的黄色半透明方框；它应位于黄色朝向圆点所指方向的相邻一格，而不是覆盖 Player 自己。
3. 分别短按 `W`、`S`、`A`、`D` 并松开：方框应切换到上、下、左、右相邻瓦片，停止后保持最后朝向。
4. 在同一瓦片内部小幅移动时，方框保持在同一格；Player 跨入下一瓦片时，方框按完整瓦片跳到新目标。
5. 靠近石墙时方框允许覆盖石墙瓦片；本阶段还没有可耕作性过滤，这是正常结果，Player 本身仍不能穿墙。
6. 走到地图边缘并面向地图外：方框应消失；转回地图内后应重新出现。
7. 确认相机跟随和地图边界仍正常。
8. 返回 Creator，确认红色错误计数为 0，也没有反复出现 `[TileInteractionDebugView] Assign Target and Tiled Map...` 警告。
9. 回复 Codex：

```text
新组件导入：成功/失败
InteractionDebug 节点和组件：成功/失败
Target：Player
Tiled Map：World
四方向目标格：正常/异常
跨瓦片更新：正常/异常
石墙碰撞回归：正常/异常
地图边缘向外时消失：正常/异常
相机与地图边界：正常/异常
Console 新错误或重复警告：无/完整内容
```

### D. 验收记录

- 验收日期：2026-07-14。
- Creator 3.8.8 已导入 `TileInteractionDebugView`，对应 `.meta` 由编辑器生成，importer 为 `typescript` 且 imported 为 `true`。
- `Canvas/InteractionDebug` 已由编辑器创建并保存，节点包含独立 `Graphics` 和 `TileInteractionDebugView`；Target=`Player`、Tiled Map=`World`。
- 四方向目标格、跨瓦片更新和地图边缘向外时隐藏均正常。
- 石墙碰撞、相机跟随和地图边界回归正常；浏览器预览保持 60 FPS。
- Creator Console 无新错误或重复警告；阶段 4B 人工验收完成。

## 阶段 4A：纯坐标与面向瓦片规则（已完成）

本节只让 Creator 导入纯规则并回归现有玩法，不创建节点、不添加组件，也不实现锄地或可耕作区。

### A. 导入纯规则

1. 停止浏览器预览，回到 Cocos Creator 3.8.8。
2. 在左下角资源管理器点击右上角圆形 **刷新** 按钮，等待脚本编译完成。
3. 展开 `assets/scripts/world`，确认能看到 `TileInteraction`。
4. `TileInteraction` 是纯 TypeScript 规则，不是 Creator 组件；不要把它拖入 Hierarchy，也不要点击“添加组件”搜索它。
5. 不要自行创建或编辑 `.meta`，由 Creator 3.8.8 自动生成。

### B. 基础预览回归

1. 清空 Console，点击顶部三角形预览按钮。
2. 点击游戏画面取得键盘焦点，确认 WASD 和方向键移动正常。
3. 再确认石墙仍不能穿过、斜向仍可滑墙、相机仍跟随且地图边缘不露出地图外区域。
4. 本阶段没有新增可见画面，预览外观与阶段 3C 相同属于正常结果。
5. 返回 Creator，确认红色错误计数为 0，也没有新的重复警告。
6. 回复 Codex：

```text
TileInteraction 导入：成功/失败
WASD 和方向键：正常/异常
石墙碰撞：正常/异常
相机与地图边界：正常/异常
Console 新错误或重复警告：无/完整内容
```

### C. 验收记录

- 验收日期：2026-07-14。
- Creator 3.8.8 已显示 `assets/scripts/world/TileInteraction`；对应 `.meta` 由编辑器生成，importer 为 `typescript` 且 imported 为 `true`。
- WASD、方向键、石墙碰撞、相机跟随和地图边界回归均正常。
- Console 无新错误或重复警告；本阶段没有新增可见画面，阶段 4A 验收完成。

## 阶段 3C：摄像机跟随与地图边界（已完成）

本节只验证相机跟随和有限地图夹取，不添加房屋、可耕作区、睡觉点或其他玩法。

### A. 刷新并确认脚本导入

1. 停止浏览器预览，回到 Cocos Creator 3.8.8。
2. 在左下角资源管理器点击右上角圆形 **刷新** 按钮，等待脚本编译完成。
3. 展开 `assets/scripts/world`，确认出现 `CameraBounds` 和 `BoundedCameraFollow`；不要手动创建或编辑 `.meta`。
4. 确认 Console 没有新红色错误。

### B. 给现有 Camera 绑定跟随组件

1. 在 Hierarchy 中展开 `Canvas`，选中现有的 `Camera`；不要创建第二个 Camera 节点或第二个 `cc.Camera` 组件。
2. 滚动到右侧 Inspector 底部，点击 **添加组件**，搜索并添加 `BoundedCameraFollow`。
3. 在新组件中找到 **Target** 空槽，从 Hierarchy 把 `Player` 节点拖入该槽。
4. 把 `World` 节点拖入 **Tiled Map** 空槽；槽内应显示 `World` 上的 `TiledMap` 组件，而不是 `None`。
5. 确认同节点原有 `cc.Camera` 仍启用；不要手动修改 Orthographic Height，Canvas 会根据实际窗口自动维护它。
6. 同一个 Camera 只保留一个 `BoundedCameraFollow`，按 `Ctrl+S` 保存场景。

### C. 浏览器预览验收

1. 清空 Console，点击顶部三角形预览按钮，再点击游戏画面让键盘获得焦点。
2. 向左、右、上、下移动：Player 在地图内部移动时，相机应随 Player 移动，地图和石墙相对屏幕向反方向移动。
3. 靠近石墙时再次确认正面不能穿墙、斜向仍可滑墙。
4. 持续走到地图最右侧：Player 最终由地图边界阻挡，相机停止继续右移；640×360 游戏矩形右侧不应出现地图外黑带或空白。
5. 用同样方法至少检查地图左侧和上侧；相机都应在边缘停止且不显示地图外区域。
6. 回到地图内部、远离四边，再在预览器左上角分辨率下拉框中选择另一种横屏尺寸。切换后 Player 应重新位于屏幕中心附近；如果 Player 已靠近地图边缘，为避免露出地图外区域而偏离中心属于正常行为。
7. 专门回归尺寸切换输入：在旧尺寸中按住 `W` 移动，用鼠标切换预览尺寸，切换完成后松开 `W`。Player 必须停止，不得继续自动向上；随后左右移动仍应正常。
8. `OPPO Reno2 (360×800)` 的名称记录的是竖屏宽高。单独打开可用于诊断，但本项目横屏验收时应点击预览器的 **Rotate**，确认实际视口为 `800×360` 后再检查边界。
9. 再切回原横屏尺寸，重复一次地图内部居中和松键停止检查。
10. 返回 Creator，确认红色错误计数为 0，也没有反复出现 `[BoundedCameraFollow] Assign Target and Tiled Map...` 警告。
11. 回复 Codex：

```text
新脚本导入：成功/失败
Target 绑定 Player：成功/失败
Tiled Map 绑定 World：成功/失败
地图内部相机跟随：正常/异常
石墙碰撞回归：正常/异常
右侧边界无地图外区域：是/否
左侧和上侧边界无地图外区域：是/否
另一横屏尺寸边界：正常/异常
切换尺寸后松键停止：正常/仍持续移动
切换后地图内部居中：正常/异常
Console 新错误或重复警告：无/完整内容
```

### D. 验收与缺陷修复记录

- 验收日期：2026-07-14。
- 地图内部相机跟随、石墙碰撞、地图左/右/上边界和另一横屏尺寸边界均通过；Console 无新错误或重复警告。
- 单独以 `OPPO Reno2 (360×800)` 打开时一切正常。只有在预览运行中切换尺寸后，曾出现持续向上移动或画面观察对象不在中心。
- 已定位持续移动原因为尺寸切换过程中可能丢失 `KEY_UP`，而 `KeyboardInputBridge` 保留了旧按键状态；现已在 Creator 3.8.8 的 `canvas-resize` 事件中清空旧状态。
- “不在中心”必须在地图内部判断。Player 靠近地图边界时，相机为保证不显示地图外区域而停止跟随，Player 偏离屏幕中心是预期行为。
- 修复后回归结果：切换尺寸后松开 `W` 会正常停止，其他方向正常，地图内部重新居中正常。
- 地图边缘实测 Player 会偏离屏幕中心，同时地图外区域没有进入视口；该结果符合有界相机设计。
- Creator Console 无新错误或重复警告，截图中浏览器预览保持 60 FPS；阶段 3C 人工验收完成。

## 阶段 3B：最小阻挡层与角色碰撞（已完成）

本节只验证一列石墙的阻挡和滑墙，不添加摄像机跟随、房屋、农田或其他地图装饰。

### A. 刷新并确认资源导入

1. 停止浏览器预览，回到 Cocos Creator 3.8.8。
2. 在左下角资源管理器点击右上角圆形 **刷新** 按钮，等待脚本编译和 TMX 重导入完成。
3. 展开 `assets/maps`，确认出现 `mvp_farm_stone`；展开 `assets/scripts/world`，确认出现 `GridCollision` 和 `TiledCollisionBridge`。
4. 不要手动创建或编辑这些资源的 `.meta`；它们必须由 Creator 3.8.8 生成。
5. 展开 Hierarchy 中的 `World`，预期看到 `Ground`、`Obstacles` 和灰色/未激活的 `Blocking`。场景中应在 Player 右侧看到一列 4 格石墙。
6. 如果 `World` 仍只有旧的 `Ground`，先选中 `World`，把资源管理器中的 `mvp_farm` 再拖到 `cc.TiledMap → Tmx Asset` 原槽位，等待图层重建。
7. 确认 Console 没有新红色错误。

### B. 给 Player 绑定碰撞桥

1. 在 Hierarchy 中选中 `Player`。
2. 滚动到右侧 Inspector 底部，点击 **添加组件**，搜索并添加 `TiledCollisionBridge`。
3. 在新组件中找到空的 **Tiled Map** 属性槽，从 Hierarchy 把 `World` 节点拖入该槽；槽内应显示 `World` 上的 `TiledMap` 组件，而不是 `None`。
4. 保持 **Blocking Layer Name** 为 `Blocking`，大小写必须完全一致。
5. 检查同节点的 `PlayerController`：`Collision Half Width = 8`、`Collision Half Height = 11`，`Move Speed = 96`。
6. 同一个 Player 只保留一个 `TiledCollisionBridge`；按 `Ctrl+S` 保存场景。

### C. 浏览器预览验收

1. 清空 Console，点击顶部三角形预览按钮，再点击一次游戏画面让键盘获得焦点。
2. 出生点右侧约 3 格处应显示一列竖直石墙。
3. 持续按 `D` 向右移动：Player 应停在石墙左边，不能进入或穿过石墙。
4. 在贴住石墙时同时按 `D+W` 或 `D+S`：横向应继续受阻，Player 应能沿石墙向上或向下滑动。
5. 按 `A` 离开石墙后，再测试 WASD 和方向键，确认普通移动恢复正常。
6. 返回 Creator，确认红色错误计数为 0，也没有反复出现 `[TiledCollisionBridge] Assign a TiledMap...` 警告。
7. 回复 Codex：

```text
新资源和脚本导入：成功/失败
World 图层：Ground、Obstacles、Blocking 均存在/缺少内容
Tiled Map 属性绑定：成功/失败
正面撞墙：无法穿过/仍能穿过
斜向贴墙：可以滑动/无法滑动/仍会穿过
离墙后普通移动：正常/异常
Console 新错误或重复警告：无/完整内容
```

### D. 验收记录

- 验收日期：2026-07-14。
- 新石墙资源、`GridCollision`、`TiledCollisionBridge` 和三层 TMX 均由 Creator 3.8.8 成功导入。
- `Main.scene/Canvas/Player` 已保存 `TiledCollisionBridge`；`Tiled Map` 指向 `World` 的 `cc.TiledMap`，图层名为 `Blocking`。
- 浏览器预览中正面撞墙无法穿过，斜向贴墙可以沿墙滑动，离开石墙后 WASD/方向键移动正常。
- Console 没有新红色错误或重复缺失绑定警告。
- 本阶段仍未实现摄像机跟随；地图外边界由自动化测试覆盖，但因当前相机固定未列入本次人工观察项。

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
