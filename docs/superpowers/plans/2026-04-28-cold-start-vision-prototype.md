# 冷启动愿景规划原型迭代 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `prototype/index.html` 的冷启动从单一路径升级为“深度愿景规划推荐 + 快速规划轻出口”的双路径原型。

**Architecture:** 保持单文件 HTML/CSS/JavaScript 原型，不引入构建工具。扩展现有 `onboardingStep` 状态机和 `renderOnboarding()`，新增深度规划数据、页面、输入同步和确认动作，最终复用现有本周重点/今日清单结果页。同步主产品文档的原型状态，保持设计文档与实际一致。

**Tech Stack:** HTML, CSS, Vanilla JavaScript, Markdown, Node inline checks, npx Playwright

---

### Task 1: 写并运行失败的结构检查

**Files:**
- Verify: `prototype/index.html`

- [x] **Step 1: 运行冷启动结构检查，确认当前原型尚未满足新规格**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const html = fs.readFileSync('prototype/index.html', 'utf8');
const required = [
  '体验深度愿景规划',
  '先快速规划这个季度',
  '五年后，你希望自己成为一个什么样的人？',
  '年度 OKR',
  '4 个季度 OKR',
  '首月 4 周承诺',
  'data-action="choose-deep-planning"',
  'data-action="choose-quick-planning"',
  'data-action="confirm-week-commitments"'
];
const missing = required.filter((token) => !html.includes(token));
if (missing.length) {
  console.error('missing cold-start tokens:', missing.join(', '));
  process.exit(1);
}
console.log('cold-start vision flow tokens ok');
NODE
```

Expected: FAIL，输出缺失的新冷启动关键 token。

### Task 2: 扩展冷启动 UI 与视觉层级

**Files:**
- Modify: `prototype/index.html`

- [x] **Step 1: 新增深度规划需要的 CSS**

Add compact card, path choice, editable OKR, acknowledgement, and commitment styles near the existing onboarding CSS.

- [x] **Step 2: 新增深度规划示例数据到 `state`**

Add these state fields:

```js
vision: "身体强健，有稳定创造力，靠自己的作品获得自由",
annualOkrs: [
  "O1 打造稳定的身体底盘：全年保持早睡早起和规律晨跑",
  "O2 建立复合高认知输入：读完 5 本关键书并形成可复用笔记",
  "O3 用作品换自由：完成 2 个独立 App 并完成一次真实发布"
],
quarterOkrs: [
  { q: "Q1", title: "起势：建立节奏", text: "跑通早睡、晨跑、阅读和独立 App 的最小闭环。" },
  { q: "Q2", title: "生长：完成第一件作品", text: "把第一个 App 做到可试用，同时保持身体和阅读节奏。" },
  { q: "Q3", title: "扩张：做出第二件作品", text: "复用前两个季度的方法，完成第二个 App 的核心版本。" },
  { q: "Q4", title: "沉淀：年度复盘与自由度验证", text: "整理作品、认知资产和身体状态，决定下一年的增长方向。" }
],
weekCommitments: [
  "第 1 周：明确 App 的核心闭环，完成冷启动和今日清单原型",
  "第 2 周：完成能量记录、周结算和成长树反馈的可体验版本",
  "第 3 周：打磨 AI 拆解质量，把任务密度调整到能坚持",
  "第 4 周：完成第一次月度回看，决定后续 4 周的节奏"
]
```

- [x] **Step 3: 改造 `renderOnboarding()` 状态机**

Use this step mapping:

```text
0 intro tree
1 path choice
2 quick quarterly goal
3 generated weekly focus and today list
4 five-year vision input
5 vision acknowledgement
6 annual OKR review
7 quarterly OKR review
8 first-month commitments review
```

### Task 3: 接通冷启动交互与输入同步

**Files:**
- Modify: `prototype/index.html`

- [x] **Step 1: 新增 click action**

Add handlers:

```js
choose-deep-planning -> onboardingStep = 4
choose-quick-planning -> onboardingStep = 2
submit-vision -> onboardingStep = 5
build-annual-okr -> onboardingStep = 6
confirm-annual-okrs -> onboardingStep = 7
confirm-quarter-okrs -> onboardingStep = 8
confirm-week-commitments -> onboardingStep = 3
```

- [x] **Step 2: 新增 input 同步**

Handle these ids:

```text
vision-input
annual-okr-<index>
quarter-okr-<index>
commitment-<index>
```

- [x] **Step 3: 更新 reset 与侧栏文案**

Reset must restore `vision`, `annualOkrs`, `quarterOkrs`, and `weekCommitments`. Side panel must mention the new double-path cold start.

### Task 4: 同步文档状态与运行结构检查

**Files:**
- Modify: `产品需求设计文档.md`
- Modify: `docs/superpowers/specs/2026-04-28-cold-start-vision-planning-design.md`
- Verify: `prototype/index.html`

- [x] **Step 1: 更新文档状态**

Set prototype status from “待同步原型” to “已同步原型” where applicable.

- [x] **Step 2: 运行结构检查**

Run the same Node check from Task 1.

Expected: PASS，输出 `cold-start vision flow tokens ok`。

### Task 5: Playwright 视觉验证

**Files:**
- Verify: `prototype/index.html`

- [x] **Step 1: 启动本地静态服务**

Run:

```bash
python3 -m http.server 4173
```

Expected: server serves the repo at `http://localhost:4173`.

- [x] **Step 2: 用 npx Playwright 验证深度路径首屏与关键步骤**

Run:

```bash
npx playwright screenshot http://localhost:4173/prototype/index.html /tmp/newme-cold-start.png
```

Expected: screenshot succeeds, and the first phone viewport contains the intro tree.

- [x] **Step 3: 用 npx Playwright 执行交互检查**

Run a Playwright script that clicks:

```text
开始规划 -> 体验深度愿景规划 -> 继续 -> 整理今年 OKR -> 确认年度 OKR -> 确认季度 OKR -> 确认 4 周承诺
```

Expected: final screen contains `本周先推进这 3 件事` and no text overlaps obvious bounds in the phone screenshot.
