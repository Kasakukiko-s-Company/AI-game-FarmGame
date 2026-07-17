# 《雾乡如昨》对话与立绘规格

## 文档地位

本文件定义 Demo 对话数据与人物立绘表现的正式契约。当前阶段只确认接口、资源语义和验收规则；尚未实现对话运行时、对白编辑器、NPC 关系系统或正式立绘。

## 体验目标

- 场景人物使用 HD 像素 Sprite，对话时使用精美 2D 人物立绘。
- 同一段对话可以逐句切换表情、姿势、服装、效果与朝向。
- 关系状态、剧情状态和玩家选择可以决定对白分支；选中的对白行必须显式写明立绘状态。
- 当前说话者保持正常亮度，其他显示中的人物降低亮度或透明度。
- 切换使用轻量淡入淡出，不依赖 Live2D、复杂骨骼、口型识别或高成本后处理。

## 明确非目标

- 不通过关键词、情感模型或生成式模型分析对白文字并猜测表情。
- 不要求每句对白制作一张新的完整插画。
- 不在对白 JSON 中保存 Cocos UUID、文件系统路径、平台路径或引擎对象。
- 不把 NPC 好感、剧情分支和存档状态塞进立绘渲染器；这些系统只负责选择对白内容。
- 第一版不实现多人同屏群像编排、实时换装合成、Live2D 或逐字口型同步。

## 模块边界

对话表现应形成一个深模块，外部只提交已经选中的对白行和参与者状态，模块内部负责：

1. 解码与校验对白数据；
2. 将缺省字段补成确定的 `PortraitState`；
3. 从角色立绘目录解析稳定资源 ID；
4. 按固定顺序处理缺失资源；
5. 计算当前/非当前说话者焦点；
6. 更新左右/中央立绘槽和对白框；
7. 执行低成本淡入淡出；
8. 在不破坏对白流程的前提下报告一次性诊断。

该模块的外部接口不暴露 Sprite 节点、资源路径或回退步骤。未来测试应从“输入对白行，得到可观察的规范化状态、资源选择与焦点结果”验证，而不是断言内部节点结构。

## 数据结构

建议 TypeScript 领域接口：

```ts
export type PortraitDirection = 'left' | 'right';

export interface PortraitState {
  readonly characterId: string;
  readonly expression: string;
  readonly pose?: string;
  readonly costume?: string;
  readonly effect?: string;
  readonly direction?: PortraitDirection;
  readonly dimmed?: boolean;
}

export interface DialogueLine {
  readonly id: string;
  readonly speakerId: string | null;
  readonly textKey: string;
  readonly portrait?: PortraitState;
}
```

字段规则：

- `characterId`：稳定角色 ID。通常必须与 `speakerId` 一致。
- `expression`：必填表情 ID；若整段 `portrait` 省略，则使用角色默认状态。
- `pose`：可选姿势/手部动作/视线姿态 ID，省略时使用角色默认姿势。
- `costume`：可选服装或剧情状态 ID，省略时使用角色默认服装。
- `effect`：可选有限情绪效果 ID；省略表示无效果。
- `direction`：立绘在画面内面对的方向，省略时使用角色目录默认方向。
- `dimmed`：表现覆盖值，不属于图片身份。一般不在每句对白中填写，由当前说话者焦点自动计算；只有经过设计确认的特殊情境才显式覆盖。
- `speakerId: null`：旁白或系统文本；默认不激活人物立绘。
- `textKey`：本地化键。正式数据不直接保存某一种语言的完整对白正文。

状态 ID 使用英文 `snake_case`。第一版保留的基础表情 ID 为：

```text
neutral
smile
happy
shy
angry
sad
surprised
thinking
```

建议基础姿势 ID：`default`、`arms_crossed`、`hands_together`、`look_down`。建议有限效果 ID：`blush`、`tear`、`anger_mark`、`shadow_face`。新增 ID 必须先进入角色立绘目录与资源清单，不能由对白作者临时拼写。

## JSON 示例

对白数据保存本地化键和显式立绘状态：

```json
{
  "id": "shen_he_farm_reacquaintance_01",
  "speakerId": "npc_shen_he",
  "textKey": "dialogue.shen_he.farm_reacquaintance_01",
  "portrait": {
    "characterId": "npc_shen_he",
    "expression": "shy",
    "pose": "hands_together",
    "effect": "blush",
    "direction": "left"
  }
}
```

生气：

```json
{
  "id": "shen_he_tool_warning_02",
  "speakerId": "npc_shen_he",
  "textKey": "dialogue.shen_he.tool_warning_02",
  "portrait": {
    "characterId": "npc_shen_he",
    "expression": "angry",
    "pose": "arms_crossed",
    "effect": "anger_mark",
    "direction": "left"
  }
}
```

悲伤：

```json
{
  "id": "shen_he_old_farm_03",
  "speakerId": "npc_shen_he",
  "textKey": "dialogue.shen_he.old_farm_03",
  "portrait": {
    "characterId": "npc_shen_he",
    "expression": "sad",
    "pose": "look_down",
    "effect": "tear",
    "direction": "left"
  }
}
```

对应中文正文只存在本地化数据中，例如：

```json
{
  "dialogue.shen_he.farm_reacquaintance_01": "你还记得这排种子该怎么分吗？",
  "dialogue.shen_he.tool_warning_02": "那把剪子还没磨好，先别拿它试手。",
  "dialogue.shen_he.old_farm_03": "你走以后，我换过一次种子的排法。"
}
```

## 关系与剧情状态

“根据关系和剧情动态调整”通过显式分支完成：

1. 对话选择器读取关系等级、剧情标记、时间或地点；
2. 选择满足条件的对白节点；
3. 每个被选中的 `DialogueLine` 自己声明 `portrait`；
4. 立绘表现模块只呈现声明结果，不重新解释正文或关系含义。

例如，同一句问候在普通关系和亲密关系下应是两个稳定对白行，各自拥有自己的 `textKey` 与 `portrait`。这使编剧、美术和测试可以直接审查最终意图，也避免“看到谢谢就自动开心”之类的错误。

### 既有关系记忆与新生关系

第一章 NPC 对主角并非陌生人。对白选择器可以读取角色目录中的 `priorBondId`，用熟悉称呼、旧习惯或共同经历完成“主角重逢、玩家初识”；不得让人物向主角解释双方理应都知道的基础身份。

`priorBondId` 只选择对白语境，不写入当前存档好感，也不自动解锁恋爱。玩家在第一章后的选择、事件与关系变化属于新生关系，必须由独立关系状态和事件标记保存。重构村民不能因为继承旧日关系记忆就被写成必须重复原型感情。

### 亲近表现、告白、恋爱与配偶分支

- 15 名 NPC 都有独立好感状态；对白选择器可以读取好感等级和事件标记，但内容层级不能让某个角色失去好感能力。
- 允许恋爱的当前无配偶 NPC 可以拥有与年龄相符的亲近表现。主角男性/女性形态与 NPC 性别均不限制资格；成年人的对白可有双向轻微暧昧，未成年人只允许单方面稚嫩好感、崇拜或误解，主角回应必须保持明确边界且不得含性暗示。
- 罗岑山、陈蕴等“仅非恋爱关系”的老年长辈只能使用友情、信任、关怀、敬重或冲突语境；不得出现暧昧、告白接受、约会、恋爱、求婚或婚姻分支。
- 亲近表现不是恋爱状态。只有告白事件返回 `accepted` 后才能成为 `dating`；未满 18 岁必须明确拒绝，成年人再按当前好感门槛决定接受或拒绝。
- 恋爱对象满好感后才开放求婚事件；满好感不自动求婚或结婚。
- 同一存档可以有多个 `dating` 角色；对白分支必须按人物自身状态读取，不能使用一个全局“正在恋爱”布尔值覆盖所有人。
- 配偶通过唯一 `spouseCharacterId` 读取。婚后其他恋爱对象的反应由编写好的对白与事件处理，底层对话系统不自行结束或隐藏关系。
- 宁昭的 Demo 内容是友谊/信任，不得因为旧日亲近自动写成暧昧，但这不关闭其完整产品恋爱资格；沈禾的 Demo 内容可以表达恋爱可能性，但不在 Demo 中告白或确立关系。
- 乔苓与阿桃成年前可以表达单方面稚嫩好感，但告白行必须明确拒绝。满 18 岁后必须切换到明确标记为成年阶段的新对白；儿童时期内容不得被重释或自动转成恋爱分支。
- 当前不为未婚 NPC 之间编写恋爱状态或告白分支；NPC 对 NPC 只使用友情、信任、竞争、厌恶等非恋爱语境。
- 对白数据需要性别相关称谓或语境时，必须显式读取主角形态条件并选择已配置的稳定对白行；不得从主角形态推断 NPC 是否可恋爱，也不得默认主角永远为男性。
- 关系分支仍只负责选择稳定对白行；立绘表现继续读取行内显式 `PortraitState`，不得从好感或恋爱状态自动猜表情。

## 第一处异常对白约束

阶段 10D 的“界碑回折”使用旁白/主角内心与晏巡短对白，稳定键和语义稿见 `docs/FIRST_BARRIER_ANOMALY.md`。实现时还必须满足：

- 事件触发与对白选择不读取晏巡好感、恋爱状态、主角性别形态或是否完成事前谈话；
- 主角内心行可以使用 `speakerId: null` 和独立 `textKey`，避免第二套主角立绘未完成时阻塞异常；
- 晏巡候选专属表情 `serious` 不自动扩展成所有 NPC 的通用表情；资源未确认时，数据显式改用或回退到 `neutral`；
- 路标布检查文本是可选检查结果，不得被误写成强制任务对白；
- 晏巡只能暗示对山雾/迷路有经验，不得说出“愿境”“愿望”“屠村”“重构”或幸存者共同隐瞒；
- 关闭立绘、淡入淡出或异常视觉效果时，所有旁白、对白和最终状态仍按相同顺序执行。

## 角色立绘目录

每名有立绘的角色需要一份数据目录，至少包含：

```ts
export interface PortraitVariantDefinition {
  readonly expression: string;
  readonly pose?: string;
  readonly costume?: string;
  readonly effect?: string;
  readonly direction?: PortraitDirection;
  readonly assetId: string;
  readonly mirrorSafe: boolean;
}

export interface CharacterPortraitDefinition {
  readonly characterId: string;
  readonly defaultState: PortraitState;
  readonly variants: ReadonlyArray<PortraitVariantDefinition>;
}
```

- `assetId` 是稳定的逻辑资源 ID，不是磁盘路径。
- `mirrorSafe` 明确该导出图是否允许通过水平翻转满足另一方向。
- 目录必须包含一个实际存在的默认状态，通常为 `default/default/neutral/no_effect`。
- 内容构建时验证对白引用的角色和状态；运行时仍保留安全回退。

第一版运行时优先使用一状态一张合成 PNG。源文件可以按身体、姿势、表情和效果分层，但不要求运行时实时组合所有层。

## 确定性回退策略

当对白没有 `portrait` 时，直接使用角色目录的 `defaultState`。当对白指定的精确组合没有导出资源时，按以下顺序尝试，并保留能保留的情绪意图：

1. 精确匹配 `costume + pose + expression + effect`；
2. 去掉 `effect`，保留服装、姿势和表情；
3. 使用默认姿势，保留服装和表情；
4. 使用默认服装与默认姿势，保留表情；
5. 使用该角色完整 `defaultState`；
6. 若角色默认资源也缺失：开发构建显示明显的缺失立绘占位并记录一次警告；发布构建隐藏该人物立绘，但继续显示姓名与对白。

方向处理发生在资源匹配之后：允许镜像时复用同一资源；不允许镜像时必须找到对应方向变体，否则回退到角色默认方向。`dimmed` 只影响 UI 色调/透明度，不参与上述资源查找。

禁止以下回退：

- 根据正文关键词猜一个“相似”表情；
- 回退到其他角色的立绘；
- 静默保留上一句错误人物或错误服装；
- 因单张立绘缺失中断整段对白或破坏存档。

## 焦点与切换

- 当前 `speakerId` 对应的已显示立绘默认 `dimmed=false`。
- 其他已显示人物默认 `dimmed=true`；第一版建议保留约 85% 不透明度，并使用约 65%～75% 亮度的统一色调，最终值以真机可读性测试锁定。
- `dimmed` 显式覆盖只用于刻意的沉默、意识模糊、剪影或异常情境，不能成为每句必填字段。
- 同一人物连续说话但只更换表情时，保留槽位并交叉淡化，避免整张立绘退出再进入。
- 默认淡入淡出为约 `140ms`；`reduceMotion` 或性能降级可以缩短或关闭，但不能改变最终状态。
- 第一版普通对话最多同时显示左右两个角色；单人重点画面可以使用中央槽。三人以上通过换槽或分镜表达，不在首版做群像布局系统。

## 校验规则

构建或数据加载阶段至少校验：

- `DialogueLine.id`、`speakerId`、`characterId` 和所有状态 ID 格式合法；
- `textKey` 在默认语言中存在；
- 非旁白对白拥有有效 `speakerId`；
- `portrait.characterId` 通常与 `speakerId` 一致；特殊反应镜头必须使用未来明确的舞台指令，不能偷偷借此字段替换说话者；
- 角色目录存在且默认资源可解析；
- 精确状态不存在时给出可定位到对白行 ID 的诊断；
- `direction` 只有 `left`/`right`；
- 一段对白可以在连续行中多次切换状态，并保持确定结果。

## 验收场景

首个对话立绘试制包至少验证：

1. 单角色从 `neutral` 连续切换到 `happy`、`surprised`、`sad`；
2. 双角色轮流说话时焦点明暗正确；
3. 关系分支选择不同对白行后出现不同显式表情；
4. 未写 `portrait` 时使用角色默认状态；
5. 缺少效果、姿势和精确组合时按固定顺序回退；
6. 未知角色或默认资源缺失时对白仍可继续；
7. 640×360、另一横屏比例、微信低档与 Windows 预览均可读；
8. 关闭淡入淡出后状态仍正确；
9. 不出现文本情绪推断、Live2D 或高成本表现依赖。
