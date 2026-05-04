# 全页面 1:1 复刻差异审计

- 审计日期：2026-05-04
- 唯一真源：`prototype/index.html`
- App 范围：`apps/mobile/app/**` 与相关 feature 组件
- 截图取证目录：`test-results/prototype-parity-audit/`（本地临时目录，已被 `.gitignore` 忽略）
- 结论：当前 App 不是 1:1 复刻。多个页面把原型的一体化沉浸面板拆成通用卡片、普通表单和组件堆叠；若继续按当前实现迭代，会偏离原型的信息架构、视觉层级和基础交互。

## 2026-05-04 修复落地记录

本轮已按本文档优先关闭用户明确指出和 P0 测试覆盖的结构/交互差异：

- 路径选择页：已从 `OnboardingScreen + PathCard` 改为原型式 `path-choice / path-hero / path-option-list` 单页结构，保留三路径按钮和原型文案层级。
- 快速规划：已改为输入态和 review 态分离；补齐左上返回、右上重新生成当前层级、本周 3 件事、今日清单建议、先看今日清单和进入能量页双路径。
- 五年愿景：已改为输入、愿景认可、年度 OKR 草案、季度 OKR 草案、首月 4 周承诺逐层流转，不再把年/季/四周草案堆在同一屏。
- 深度愿景 AI 草案：年度 OKR、季度 OKR、首月 4 周承诺已恢复原型 `可修改` 编辑语义，不再渲染成只读编号文本；确认年度 OKR 后会把用户编辑后的年度草案传给季度生成，API 确认落库也优先使用 `edits.annualOkr`、`edits.quarterOkr`、`edits.weeks`，避免“界面可改但后续仍用原始 AI 输出”；右上重新生成只重新生成当前层级，不会再次确认或重复落库上一层。
- 手动 OKR：五步页面已统一为原型式顶栏返回、当前层级输入、`AI 辅助` 和 `继续`，每页只处理当前层级。
- 计划页到清单页：周卡片已具备 `select-week` 等价行为，点击 W17 后进入清单页并打开对应周概览。
- 周结算：最终周结果已改为连续 slider 语义，并按点击位置更新分数；确认成功和失败都会立即把第 17 周果实写入本地树反馈。
- 成长树：远端树数据会合并本地新结算果实，避免后端成功返回后短时间内树上看不到新果实。
- 测试：新增 `apps/mobile/tests/prototype-p0-parity.spec.js`，并补齐旧 prototype parity 测试的登录态/API mock，避免认证守卫把 parity 验收到登录页；深度愿景用例已覆盖“年度方向 1 可修改”输入框和用户编辑内容进入下一步生成请求。

本轮仍不把 P1/P2 视觉细节宣称为全部清零；剩余像素级差异继续以本审计文档逐页跟踪。

## 严重级别

- `P0`：流程、页面结构、按钮、跳转、信息层级不一致。
- `P1`：卡片数量、间距、尺寸、圆角、背景、控件形态明显不一致。
- `P2`：字体渲染、阴影、图标、微动效等细节偏差。

## 全局差异

### 页面容器

- 原型应该是什么：所有主体验都渲染在同一个 `393 x 812` phone 内，状态栏、主内容、底部胶囊导航是一个固定舞台。冷启动阶段不显示底部导航，主 App 阶段显示底部导航。
- App 实际是什么：React Native Web 页面按浏览器 viewport 渲染，截图中常出现高度、滚动、内容分段和底栏位置变化；部分页面使用 `ScrollView` 后页面节奏和原型固定舞台不同。
- P0 交互差异：冷启动和主 App 的舞台切换不完全等价，部分页面因为认证守卫先进入登录页，打断原型的首屏体验。
- P0 布局结构差异：原型的一体化 `phone-main` 被 App 的通用 `PrototypeScreen` + 各页面卡片重组，页面间结构不统一。
- P1 排版/样式差异：App 多处使用旧 `Button/Card/Input` 包装或 feature 自定义卡片，和原型 `.glass-card`、`.path-option`、`.goal-input`、`.manual-card` 不等价。
- P2 细节差异：Ionicons 与原型内联 SVG 路径不同；RN Web 的字体渲染、阴影、滤镜和 HTML/CSS 不一致。
- 修复要求：先冻结原型 DOM/视觉结构为页面级规格，再按页面重建 App；不能只复用少量 prototype primitives 后宣称还原。

### 顶部操作

- 原型应该是什么：冷启动输入/草案页统一有左上圆形返回按钮；可重新生成的草案页右上有圆形重新生成按钮，按钮是图标语义，不是页面正文的一部分。
- App 实际是什么：多数 onboarding 页面没有统一顶部操作区；生成、确认、返回、跳转被放到普通按钮区或由路由默认返回替代。
- P0 交互差异：用户无法按原型在每个层级“返回但不清空内容”；重新生成当前层级的入口缺失或语义不一致。
- 修复要求：冷启动 2-8 步必须统一实现原型 `renderOnboardingTopActions()` 的交互，而不是页面各自随意放按钮。

### 现有回归测试

- 原型应该是什么：测试应验证中文文案、布局几何、关键交互和页面状态。
- App 实际是什么：`prototype-parity.spec.js` 和 `prototype-visual-regression.spec.js` 当前多处中文断言呈乱码，且只检查少数锚点、按钮高度和底栏几何。
- P0 交互差异：测试无法覆盖用户指出的基础流程问题，例如五年愿景页结构、返回/重新生成、手动 OKR 层级堆叠。
- 修复要求：后续修复前必须先重写 parity 测试，不允许继续用当前测试作为“已还原”的证据。

## 01 路径选择页

- 原型入口与截图：`prototype/index.html`，点击“开始规划”后进入；截图 `prototype-01-choose.png`。
- App 入口与截图：`/onboarding/choose`；截图 `app-01-choose.png`。
- 原型应该是什么：一块完整的路径选择体验，上方 `path-hero` 包含 `New year map` 胶囊、标题和说明；下方三张 `path-option` 是统一视觉系统，图标、文案、箭头和卡片高亮由 CSS 伪元素控制。
- App 实际是什么：使用 `OnboardingScreen`，先渲染一个通用 `GlassCard` hero，再把三张 `PathCard` 放在另一个 content 区域。
- P0 交互差异：原型从首屏树展示到路径选择是同一个 onboarding 状态机；App 直接访问 `/onboarding/choose`，缺少首屏树展示到路径选择的连续感。
- P0 布局结构差异：原型路径选择是一体化 `path-choice`，App 是“说明卡 + 三张组件卡”的分段页面。
- P1 排版/样式差异：App 的 hero badge、标题字号、卡片高度、图标框和箭头位置与 `.path-ribbon`、`.path-option` 不一致。
- P2 细节差异：原型图标为 `✦/↯/□`，App 图标文案和 icon box 表现不同。
- 修复要求：路径选择页应直接复刻 `path-choice` 结构，不使用现有 `OnboardingScreen + PathCard` 组合。

## 02 快速规划输入页

- 原型入口与截图：路径选择页点击“先快速规划这个季度”；截图 `prototype-03-quick-input.png`。
- App 入口与截图：`/onboarding/quick`；截图 `app-03-quick.png`。
- 原型应该是什么：顶部操作区 + 一张 `glass-card`，卡内只有问题、160px 文本域、hint；底部一个主按钮“让 AI 帮我拆成这周行动”，加载时显示同位置 loading track。
- App 实际是什么：通用 hero 卡先显示 `Quick start`、标题和副标题，再在下方渲染 `ManualInput`，底部用通用 Button。
- P0 交互差异：原型的返回按钮应回到路径选择且保留输入；App 页面没有原型左上返回圆按钮。
- P0 布局结构差异：原型是一张完整输入卡；App 是“上方说明卡 + 下方输入组件 + 下方按钮”的三段式表单。
- P1 排版/样式差异：原型问题文案是卡内主视觉，App 标题在外部 hero；文本域高度、圆角、内边距和提示文案位置不一致。
- P2 细节差异：原型输入框 focus 边框、按钮 margin-top、loading track 宽度和位置未按 CSS 复刻。
- 修复要求：快速规划输入页必须去掉通用 hero 拆分，改为原型 `onboarding-form panel-in has-top-actions`。

## 03 快速规划 AI 拆解页

- 原型入口与截图：输入季度目标后点击“让 AI 帮我拆成这周行动”；截图 `prototype-04-quick-review.png`。
- App 入口与截图：`/onboarding/quick` 生成 draft 后同页展示。
- 原型应该是什么：顶部返回 + 右上“重新生成行动建议”；内容为“本周先推进这 3 件事”卡片和“今日清单建议”卡片；底部有“先看今日清单”和“进入能量页”两个选择。
- App 实际是什么：生成后仍在通用 quick 页面里插入 `AiDraftView`，只提供“确认并进入能量页”。
- P0 交互差异：缺失“先看今日清单”路径；缺失右上重新生成行动建议；确认行为直接落库并进能量页，不等价于原型的两路径选择。
- P0 布局结构差异：原型 AI 拆解页是独立 review 状态，App 是输入页内追加一块 AI 草案列表。
- P1 排版/样式差异：原型 focus card、suggestion item、badge、双按钮布局均未 1:1 复刻。
- P2 细节差异：原型加载 900ms 后切换到 review；App 真实请求状态与视觉节奏不同。
- 修复要求：快速规划必须拆成输入态、生成中态、review 态三个视觉状态，并补齐双路径按钮。

## 04 五年愿景输入页

- 原型入口与截图：路径选择页点击“体验深度愿景规划”；截图 `prototype-02-vision-input.png`。
- App 入口与截图：`/onboarding/vision`；截图 `app-02-vision.png`。
- 原型应该是什么：一张完整的输入面板。顶部左侧圆形返回；卡内 `five-year vision` eyebrow、问题标题、160px 文本域、hint；卡外底部有主按钮“继续”和副按钮“先快速规划这个季度”。
- App 实际是什么：上方是 `OnboardingScreen` 说明卡，写着 `Deep vision`、标题和副标题；下方是 `ManualInput`；按钮文案是“生成年度 OKR”或后续确认按钮。
- P0 交互差异：原型点击“继续”先进入愿景认可页，不直接生成年度 OKR；App 将继续动作替换成生成年度 OKR。
- P0 交互差异：原型有“先快速规划这个季度”的反悔路径；App 当前视觉中没有按原型位置和样式提供该路径。
- P0 交互差异：原型返回不清空内容；App 没有原型左上圆形返回语义。
- P0 布局结构差异：用户指出的问题成立：原型是一块完整体验，App 拆成“说明卡 + 输入组件”两个卡片/区域，信息层级完全错位。
- P1 排版/样式差异：原型主问题在卡内，App 主标题在外部 hero；eyebrow 文案、大小写、颜色、位置均不同。
- P1 样式差异：原型文本域是 `.goal-input`，高度 160、圆角 24、黑绿色内背景；App 的 `ManualInput` 高度、边框、helper 位置不同。
- P2 细节差异：原型 placeholder 为“可以很具体，也可以很模糊。比如：身体强健，有稳定创造力，靠自己的作品获得自由”；App placeholder 改成“例如：我有稳定的产品节奏...”。
- 修复要求：五年愿景页必须按原型重建，先恢复“返回/继续/先快速规划”交互，再接 AI 生成链路。

## 05 愿景认可页

- 原型入口与截图：五年愿景输入后点击“继续”。
- App 入口与截图：当前无独立对应页面。
- 原型应该是什么：独立 `vision-ack` 状态，顶部返回；中心卡显示 ✓、`vision accepted`、“我记住了。”，说明愿景只是方向；按钮为“整理今年 OKR”。
- App 实际是什么：没有该仪式化认可状态；生成年度 OKR 后直接在同一 `/onboarding/vision` 页面追加草案。
- P0 交互差异：缺失愿景认可这一整步，用户没有原型中的情绪确认和节奏停顿。
- P0 布局结构差异：原型的单卡居中仪式页不存在。
- P1 排版/样式差异：✓ 符号、居中标题、path-copy、按钮位置均缺失。
- 修复要求：深度愿景流程必须恢复认可页，不能把输入和 AI 草案堆在一个路由页面中。

## 06 年度 OKR 草案页

- 原型入口与截图：愿景认可页点击“整理今年 OKR”。
- App 入口与截图：`/onboarding/vision` 生成 annual draft 后同页展示。
- 原型应该是什么：独立 `planning-review`，顶部返回 + 重新生成；卡片标题为年度 OKR 草案，用户确认后进入季度 OKR。
- App 实际是什么：在五年愿景页面下方插入 `AiDraftView`，按钮变成“确认年度 OKR，继续生成季度 OKR”。
- P0 交互差异：右上重新生成当前层级缺失或位置错误。
- P0 布局结构差异：原型年度草案是独立页面状态；App 是同页列表追加。
- P1 排版/样式差异：原型草案卡、条目编号、按钮间距与 App 的 `AiDraftView` 不一致。
- 修复要求：年度 OKR 必须成为单独状态，保留返回和重新生成操作。

## 07 季度 OKR 草案页

- 原型入口与截图：年度 OKR 确认后。
- App 入口与截图：`/onboarding/vision` 生成 quarter draft 后同页展示。
- 原型应该是什么：独立季度 OKR review，只处理季度层级，保留当前层级重新生成。
- App 实际是什么：年度、季度、四周草案都可能堆在同一个 `/onboarding/vision` 页面。
- P0 交互差异：用户指出的“把所有计划层级在一个页面写完”问题成立；这破坏了原型逐层推进的交互逻辑。
- P0 布局结构差异：原型每层一个状态，App 同路由累积多个草案区块。
- P1 排版/样式差异：季度条目、说明、按钮文案和卡片间距不按原型。
- 修复要求：季度 OKR 必须拆成独立视觉状态，确认后才进入四周承诺。

## 08 四周承诺页

- 原型入口与截图：季度 OKR 确认后。
- App 入口与截图：`/onboarding/vision` 生成 week draft 后同页展示。
- 原型应该是什么：独立四周承诺 review，展示 4 周承诺；按钮“确认 4 周承诺，生成天计划”。
- App 实际是什么：`AiDraftView` 展示“首月 4 周承诺”，按钮为“确认四周承诺并进入能量页”。
- P0 交互差异：原型确认后生成天计划再进入闭环，App 直接进能量页，缺少“天计划”连接语义。
- P0 布局结构差异：四周承诺不是独立页面状态。
- P1 排版/样式差异：原型 4 周承诺卡片和按钮区没有被复刻。
- 修复要求：恢复四周承诺页和确认后生成天计划的中间语义。

## 09 手动 OKR 年目标页

- 原型入口与截图：路径选择页点击“手动创建 OKR”。
- App 入口与截图：`/onboarding/manual/annual`；截图 `app-04-manual-annual.png`。
- 原型应该是什么：`manual-flow panel-in has-top-actions`，顶部返回；stepper；一张 `manual-card`，只处理当前层级；有 `AI 辅助` 和 `继续` 两个动作。
- App 实际是什么：使用 `ManualStepScreen`、`ManualInput`、`ManualAiSuggestions` 和通用 Button 组合。
- P0 交互差异：原型每层都可空着继续；App 需要逐页核对是否所有输入、AI 辅助、继续、返回都保留内容。
- P0 布局结构差异：App 不是原型的单张 `manual-card` 结构。
- P1 排版/样式差异：stepper 圆点、卡片顶部大图标、hint-copy、textarea 尺寸和按钮布局不一致。
- 修复要求：手动五步统一复刻 `renderManualOnboarding()`。

## 10 手动 OKR 季度/月/周/今日页

- 原型入口与截图：手动路径逐层继续；手动周空态截图 `prototype-07-manual-week-empty.png`。
- App 入口与截图：`/onboarding/manual/quarter`、`/month`、`/week`、`/today`；截图 `app-05-manual-week.png` 覆盖周页。
- 原型应该是什么：每个页面只处理一个层级；到本周及今日时才显示上层 context 摘要；局部 AI 只影响当前层级及下游，不补上游。
- App 实际是什么：手动页面和计划页复用了不同组件，计划页又展示多个 manualLevels。
- P0 交互差异：手动 OKR 的“逐层引导”没有严格贯彻到所有相关页面；在计划页出现多层级聚合，用户感知为把年/季/月/周/日堆在一个页面。
- P0 布局结构差异：原型当前层级是单卡主体验；App 页面与计划页的层级卡片网格破坏了“只处理当前层级”的沉浸感。
- P1 排版/样式差异：manual context row、manual AI panel、按钮区域和 stepper 与原型不一致。
- 修复要求：冷启动手动页和主 App 计划页要分开；冷启动只逐层推进，计划页只在原型允许的位置展示补全入口。

## 11 能量页

- 原型入口与截图：进入主 App 后 `energy` tab；截图 `prototype-05-energy.png`、App `app-06-energy.png`。
- App 入口与截图：`/` 或 `/(tabs)/energy`。
- 原型应该是什么：一屏四元素：能量球、本周进度概览、今日能量条、确认按钮；能量球有 242px 主视觉、气泡、液态/充能层次。
- App 实际是什么：使用 `EnergyOrb`、`WeeklyFocusPanel`、`EnergySlider`、`ConfirmButton`，整体接近但组件实现和原型 DOM/CSS 不同。
- P0 交互差异：打分前提醒依赖本地 viewedList，需确认“先看清单 -> 返回能量 -> 不再提醒”的流程和原型完全一致。
- P0 布局结构差异：页面是否一屏完整呈现受 ScrollView、API loading/error 文案影响；原型无额外“能量加载失败”等错误文本。
- P1 排版/样式差异：能量球大小、气泡数量、文字位置、进度卡高度、滑条轨道和 confirm 按钮形态需逐项修。
- P2 细节差异：原型滑条是原生 range + nitro sparks，App 用 Pressable 轨道模拟，拖动手感和 thumb 视觉不同。
- 修复要求：能量页应以原型 CSS 尺寸为准重建，而不是继续调当前组件近似值。

## 12 能量提醒弹窗和 toast

- 原型入口与截图：能量页未看清单直接确认；App 截图 `app-11-energy-reminder.png`。
- App 入口与截图：`/` 点击“确认今日能量”。
- 原型应该是什么：居中 `modal-layer` + `modal-card`，标题“要不要先看看今天的清单？”，按钮“先看清单 / 继续注入”；继续后 toast 出现在底部导航上方。
- App 实际是什么：使用 `PrototypeModalLayer` 和 `PrototypeToast`，但页面和导航位置受 RN 布局影响。
- P0 交互差异：必须核对点击空白关闭、先看清单跳转、继续注入、再次返回不提醒四个动作。
- P1 排版/样式差异：modal 宽度、padding、按钮左右权重、toast y 坐标与原型测试目前只粗略断言。
- P2 细节差异：背景遮罩透明度、阴影和玻璃滤镜不同。
- 修复要求：弹层交互写入专门 parity 测试，禁止只检查文案可见。

## 13 清单页

- 原型入口与截图：`list` tab；截图 `prototype-09-list.png`、App `app-07-list.png`。
- App 入口与截图：`/todo`。
- 原型应该是什么：顶部 focus chips；一张 list-card，头部日期和“本周”小胶囊；todo 行支持左滑露出垃圾桶、勾选、编辑；底部新增输入保持原型位置。
- App 实际是什么：整体功能接入，但使用 `TodoList`、`TodoItem`、`AddTodoInput` 组件实现。
- P0 交互差异：左滑删除、编辑 sheet、新增任务、从计划周节点跳到本周概览都需要逐项确认；当前文档和测试不足。
- P0 布局结构差异：若 API loading/error 出现，会在原型无对应位置插入文案。
- P1 排版/样式差异：todo 行高度、delete reveal 宽度、编辑按钮位置、todo mark 大小与原型可能不同。
- P2 细节差异：滑动阈值、动画缓动、勾选符号和图标路径不同。
- 修复要求：清单页需按 `.todo-item`、`.todo-surface`、`.todo-delete-reveal` 逐像素复刻。

## 14 本周 7 天概览弹窗

- 原型入口与截图：清单页点击“本周”；原型 `renderWeekModal()`，App 截图 `app-12-week-modal.png`。
- App 入口与截图：`/todo` 点击本周。
- 原型应该是什么：居中大 modal，顶部 `week overview`、关闭 pill、7 天列表，每天有状态、清单摘要和任务条。
- App 实际是什么：使用 `PrototypeModalCard` 包裹 ScrollView。
- P0 交互差异：从计划页点击周节点应打开同一弹窗并标记来源周；App 计划页当前 `MonthView` 只是卡片，不等价于原型 `select-week` -> list modal。
- P1 排版/样式差异：modal 高度、max-height、day row 间距、today/past 背景不完全一致。
- P2 细节差异：滚动条、阴影、关闭按钮图标/文字不同。
- 修复要求：计划页与清单页共用同一周概览状态机。

## 15 清单编辑 sheet

- 原型入口与截图：清单行点击编辑。
- App 入口与截图：`/todo` 点击编辑按钮。
- 原型应该是什么：底部 sheet，含 handle、标题“调整这件小事”、说明、textarea、保存/取消双按钮。
- App 实际是什么：使用 `PrototypeEditSheet`，结构接近，但内容和高度依赖 RN。
- P0 交互差异：sheet 背景点击关闭、保存后仅改今日任务、不影响本周重点需验证。
- P1 排版/样式差异：sheet y 坐标、高度、圆角、textarea 高度和按钮高度需对齐。
- P2 细节差异：弹出动画缺失或不同。
- 修复要求：以原型 `.edit-sheet` 几何和行为为准写回归。

## 16 计划页 月/周视图

- 原型入口与截图：`plan` tab 月视图；截图 `prototype-10-plan.png`、App `app-08-plan.png`。
- App 入口与截图：`/plan`。
- 原型应该是什么：顶部 segmented；AI 来源时不显示手动来源卡；月视图包含 `plan-intro`、AI 重规划按钮、可展开反馈面板、4 周按钮列表。
- App 实际是什么：使用 `usePlan`、`MonthView`、`manualCard`、`EmptyLevel`。当来源为 manual/mixed 时会在计划页聚合展示多个层级。
- P0 交互差异：用户指出的“所有计划层级在一个页面写完”在此处最明显；原型只在手动来源下展示补全入口，不应把冷启动填写体验搬进计划页。
- P0 交互差异：点击周节点应跳清单页并打开对应周概览；App 当前 `MonthView` 周卡缺少原型 `select-week` 到清单弹窗的等价行为。
- P0 布局结构差异：原型 `plan-intro-grid` 和 `week-button` 是一套结构；App 使用普通卡片列表，层级和视觉重量不同。
- P1 排版/样式差异：segmented 高度、active 状态、replan pill、week card 内部 row 和任务 index 不一致。
- P2 细节差异：loading track、生成轮次文案、按钮 pressed 效果不同。
- 修复要求：计划页应分 AI 默认态、manual 空层级态、mixed 局部 AI 态三套原型状态，不用现有通用层级网格兜底。

## 17 AI 重规划面板

- 原型入口与截图：计划页点击“AI 重规划”；App 截图 `app-13-replan-panel.png`。
- App 入口与截图：`/plan` 点击按钮。
- 原型应该是什么：轻量 coach panel，显示“告诉 AI 这周哪里变了...第 n/3 轮”，textarea，生成新版本/取消，生成中 loading track。
- App 实际是什么：MonthView 内嵌 coachPanel，功能接近。
- P0 交互差异：最多 3 轮、只改后续计划、生成中状态、取消后不覆盖内容均需验证；当前测试只点一次。
- P1 排版/样式差异：coach panel 背景、textarea 高度、按钮样式和间距不同。
- P2 细节差异：loading track 动画与原型不一致。
- 修复要求：把 coachPanel 当原型状态做几何和流程测试。

## 18 计划页 年/季度视图

- 原型入口与截图：计划页点击“年/季度”。
- App 入口与截图：`/plan` 切换 year。
- 原型应该是什么：年度只看四个季度阶段变化；Q1-Q4 卡片包含状态、目标和 track，避免变成复杂 dashboard。
- App 实际是什么：`YearView` 渲染季度卡，数据来自 API fallback。
- P0 交互差异：上层目标空态和补填入口必须与手动来源规则一致；当前没有完整审计测试。
- P1 排版/样式差异：quarter card、badge、score、track 与原型 CSS 不一致。
- P2 细节差异：进度条透明度和圆角不同。
- 修复要求：补 year view 的截图和 DOM 几何对照。

## 19 成长树主画面

- 原型入口与截图：`tree` tab；截图 `prototype-11-tree.png`、App `app-09-tree.png`。
- App 入口与截图：`/tree`。
- 原型应该是什么：整屏沉浸式树画布，树干、树冠、果实、树侧工具和底部 tip 不应变成普通信息面板。
- App 实际是什么：使用 `GrowthTree` 绘制近似树，但外层和布局与原型仍不同。
- P0 交互差异：果实点击应打开时间胶囊；树侧工具应进入对应详情页；从周结算生成果实后应跳树并展示第 17 周果实。
- P0 布局结构差异：App 的树画布、背景层、工具按钮和 tip 位置需逐项比对；不能只验证“不是占位”。
- P1 排版/样式差异：树冠位置、果实坐标、树侧工具宽高和颜色不一致。
- P2 细节差异：treeAura 动画、果实呼吸动效、滤镜不一致。
- 修复要求：以原型 `.tree-canvas` 坐标系统重建，不靠 RN flex 自适应猜位置。

## 20 成长树详情

- 原型入口与截图：树侧工具点击果实/阶段/荣誉；截图 `prototype-12-tree-detail.png`。
- App 入口与截图：`/tree` 点击工具。
- 原型应该是什么：树详情是同一 phone 内替换内容，左上“← 返回成长树”，详情卡 + stats，说明数据不压主画面。
- App 实际是什么：`tree.tsx` 内部 `detailType` 切换 detail 页面。
- P0 交互差异：返回成长树应不改变底部 tab；三个工具的数据和文案需与原型一致。
- P1 排版/样式差异：back button、detail card、stat grid 和说明文案不一致。
- P2 细节差异：卡片边框、背景和阴影不同。
- 修复要求：详情页按 `renderTreeDetail()` 直接复刻。

## 21 果实时间胶囊

- 原型入口与截图：点击果实；原型 `renderFruitModal()`。
- App 入口与截图：`/tree` 点击果实。
- 原型应该是什么：居中 modal，显示 `time capsule`、周标题、日期、分数、重点、感悟，按钮“收起”。
- App 实际是什么：`FruitCapsule` 使用 RN Modal 和自定义布局。
- P0 交互差异：点击遮罩关闭、收起按钮、打开指定周果实的 accessible label 需核对。
- P1 排版/样式差异：modal card 宽度、score dot、focus item、reflection spacing 不一致。
- P2 细节差异：RN Modal 与原型 modal-layer 阴影/遮罩不同。
- 修复要求：果实胶囊复用统一 prototype modal，不使用独立风格。

## 22 周结算页

- 原型入口与截图：侧面板/路由进入 `settlement`；截图 `app-10-settlement.png`，原型 `renderSettlementScreen()`。
- App 入口与截图：`/settlement`。
- 原型应该是什么：一列 `screen-stack`，包含结算卡、能量柱状图、本周重点回顾、最终周结果 slider、周感悟 textarea、确认生成果实按钮；属于成长树 tab 语义。
- App 实际是什么：使用多个 `GlassCard`，hero、bars、result、score 分块。
- P0 交互差异：原型 slider 是 range，可连续调整；App 当前 `Pressable` 每点 +5，基础交互逻辑不一致。
- P0 交互差异：确认后原型先显示果实 born，再跳树；App 900ms 后跳转，但视觉 born 状态和果实写入 fallback 需核对。
- P0 布局结构差异：原型卡片和控件顺序相似，但 App 卡片分割和高度节奏不同。
- P1 排版/样式差异：果实大小、柱状图高度、textarea 高度、按钮颜色和边距不一致。
- P2 细节差异：果实生成动画、slider thumb、柱状图 fill 过渡不同。
- 修复要求：周结算 slider 必须改回原型 range 语义，页面几何按原型重建。

## 23 登录页、认证守卫、加载态、错误态

- 原型入口与截图：无。
- App 入口与截图：`/auth/login`；截图 `app-00-login.png`。
- 原型应该是什么：原型没有登录页，也没有认证守卫。
- App 实际是什么：未登录访问任意 App 页面会跳 `/auth/login`；登录页使用 NewMe Account 卡片、验证码输入和开发验证码提示。
- P0 交互差异：这是生产必要新增页，但会阻断原型冷启动首屏；不能拿它作为原型复刻范围内的页面。
- P0 布局结构差异：登录页无原型对应，必须在产品文档里明确“不参与 prototype 1:1 验收”或新增登录原型。
- P1 排版/样式差异：若要保留登录页，也应按同一 phone 视觉系统补原型。
- 修复要求：登录页单独补原型或在验收中隔离；认证守卫不能影响原型页面截图和 parity 测试。

## 24 App 错误/加载文案

- 原型入口与截图：无。
- App 入口与截图：能量、清单、计划、周结算等页面的 API loading/error 状态。
- 原型应该是什么：终稿原型没有在主体验中显示“同步中”“加载失败，已显示本地示例”等工程态文案。
- App 实际是什么：部分页面会插入 loading/error 文本。
- P0 交互差异：工程态直接改变首屏结构和高度，破坏 1:1 复刻。
- P1 排版/样式差异：错误文案没有原型样式。
- 修复要求：加载/错误态要么补原型，要么用不改变主结构的隐式反馈，不允许随意插入页面正文。

## 优先修复顺序

1. `P0` 冷启动状态机：路径选择、快速规划、五年愿景、愿景认可、年度/季度/四周 review、手动五步。
2. `P0` 计划页信息架构：禁止把冷启动层级全部堆到计划页；恢复原型的 AI/manual/mixed 三类状态。
3. `P0` 周结算 slider 与确认生成果实交互。
4. `P0` 清单/计划/成长树之间的跳转与弹层状态。
5. `P1` 全局几何：phone 尺寸、卡片数量、按钮尺寸、间距、圆角、底部导航。
6. `P2` 视觉细节：字体、图标、阴影、滤镜、动画。

## 后续验收要求

- 重写 `prototype-parity.spec.js`，先修复中文编码，再逐页面断言关键文案、按钮、路由和弹层状态。
- 新增截图对照基线，至少覆盖本文档所有页面/状态。
- 不再使用“接近”“风格一致”“原语级还原”作为验收词；只接受逐页差异清零或在产品文档中记录明确变更。
