# Reversible Cold Start Planning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the prototype cold-start planning wizard reversible, with every AI draft layer offering explicit regeneration and no automatic overwrites on back/continue.

**Architecture:** Keep the current single-file static prototype architecture. Add small state helpers for onboarding navigation and deterministic static "regeneration" variants so the prototype can demonstrate behavior without a backend AI call. Tests cover both static affordances and browser-level flow.

**Tech Stack:** Native HTML/CSS/JavaScript in `prototype/index.html`; Node smoke checks in `prototype/prototype-regression.test.cjs`; Playwright browser automation in `prototype/prototype-interaction-smoke.cjs`; product docs in Markdown.

---

## File Structure

- Modify `prototype/index.html`
  - Add onboarding path state, regeneration counters, deterministic generated-content variants, and helpers.
  - Add back buttons and regeneration buttons to quick planning, deep planning, and action suggestion steps.
  - Add click handlers for `onboarding-back` and `regenerate-current-onboarding`.
  - Reset the new state in `resetPrototype()`.
- Modify `prototype/prototype-regression.test.cjs`
  - Assert that onboarding renders back/regenerate affordances.
  - Assert that click handlers exist for back and regenerate.
- Modify `prototype/prototype-interaction-smoke.cjs`
  - Add browser smoke coverage for quick path back/regenerate.
  - Add browser smoke coverage for deep path back/regenerate.
- Modify `docs/superpowers/specs/2026-04-28-cold-start-vision-planning-design.md`
  - Update status from "待原型同步" to "已同步至原型并通过交互检查" after implementation passes.
- Modify `产品需求设计文档.md`
  - Update the static implementation note to mention reversible cold start and per-layer regeneration after implementation passes.

---

### Task 1: Add Static Regression Checks

**Files:**
- Modify: `prototype/prototype-regression.test.cjs`

- [ ] **Step 1: Write failing static assertions for onboarding affordances**

In `prototype/prototype-regression.test.cjs`, after:

```js
const onboarding = sliceBetween("function renderOnboarding()", "function renderEnergyOrb()");
```

add:

```js
const clickHandler = sliceBetween('document.addEventListener("click"', 'document.addEventListener("input"');
```

After the existing onboarding assertion:

```js
assert(onboarding.includes("今日清单建议"), "冷启动 AI 拆解结果应展示今日任务建议。");
```

add:

```js
assert(onboarding.includes('data-action="onboarding-back"'), "冷启动每一步应提供返回上一步入口。");
assert(onboarding.includes('data-action="regenerate-current-onboarding"'), "冷启动 AI 草案层级应提供重新生成入口。");
assert(onboarding.includes("重新生成年度 OKR"), "年度 OKR 层级应能重新生成。");
assert(onboarding.includes("重新生成季度 OKR"), "季度 OKR 层级应能重新生成。");
assert(onboarding.includes("重新生成 4 周承诺"), "首月 4 周承诺层级应能重新生成。");
assert(onboarding.includes("重新生成行动建议"), "本周重点和今日清单建议应能重新生成。");
assert(clickHandler.includes('if (action === "onboarding-back")'), "点击处理器应支持冷启动返回上一步。");
assert(clickHandler.includes('if (action === "regenerate-current-onboarding")'), "点击处理器应支持当前层级重新生成。");
```

- [ ] **Step 2: Run static regression and verify it fails**

Run:

```powershell
node prototype/prototype-regression.test.cjs
```

Expected: FAIL, with at least one message mentioning missing `onboarding-back` or `regenerate-current-onboarding`.

---

### Task 2: Add Browser Smoke Coverage For Reversible Planning

**Files:**
- Modify: `prototype/prototype-interaction-smoke.cjs`

- [ ] **Step 1: Add quick and deep cold-start smoke tests**

In `prototype/prototype-interaction-smoke.cjs`, after:

```js
  page.on("pageerror", (error) => {
    throw error;
  });
```

add:

```js
  await page.goto(prototypeUrl);
  await page.getByRole("button", { name: "开始规划" }).click();
  await page.getByRole("button", { name: "先快速规划这个季度" }).click();
  await expectVisible(page, "这个季度，你最想推进的一件事是什么？");
  await page.getByRole("button", { name: "返回上一步" }).click();
  await expectVisible(page, "先看见五年后的自己");
  await page.getByRole("button", { name: "先快速规划这个季度" }).click();
  await page.locator("#goal-input").fill("做一个能公开演示的个人成长 App");
  await page.getByRole("button", { name: /让 AI 帮我拆成这周行动/ }).click();
  await page.waitForTimeout(1100);
  await expectVisible(page, "今日清单建议");
  const firstSuggestionBefore = await page.locator(".suggestion-item p").first().innerText();
  await page.getByRole("button", { name: "返回上一步" }).click();
  await expectVisible(page, "做一个能公开演示的个人成长 App");
  await page.getByRole("button", { name: /让 AI 帮我拆成这周行动/ }).click();
  await page.waitForTimeout(1100);
  const firstSuggestionAfterReturn = await page.locator(".suggestion-item p").first().innerText();
  assert(firstSuggestionAfterReturn === firstSuggestionBefore, "返回后继续不应自动重新生成行动建议");
  await page.getByRole("button", { name: "重新生成行动建议" }).click();
  const firstSuggestionAfterRegenerate = await page.locator(".suggestion-item p").first().innerText();
  assert(firstSuggestionAfterRegenerate !== firstSuggestionBefore, "点击重新生成后行动建议应更新");

  await page.goto(prototypeUrl);
  await page.getByRole("button", { name: "开始规划" }).click();
  await page.getByRole("button", { name: "体验深度愿景规划" }).click();
  await expectVisible(page, "五年后，你希望自己成为一个什么样的人？");
  await page.getByRole("button", { name: "返回上一步" }).click();
  await expectVisible(page, "先看见五年后的自己");
  await page.getByRole("button", { name: "体验深度愿景规划" }).click();
  await page.locator("#vision-input").fill("身体稳定，持续创作，有自己的作品收入");
  await page.getByRole("button", { name: "继续" }).click();
  await page.getByRole("button", { name: "返回上一步" }).click();
  await expectVisible(page, "身体稳定，持续创作，有自己的作品收入");
  await page.getByRole("button", { name: "继续" }).click();
  await page.getByRole("button", { name: "整理今年 OKR" }).click();
  await expectVisible(page, "年度 OKR");
  const annualBefore = await page.locator("#annual-okr-0").inputValue();
  await page.getByRole("button", { name: "重新生成年度 OKR" }).click();
  const annualAfter = await page.locator("#annual-okr-0").inputValue();
  assert(annualAfter !== annualBefore, "点击重新生成年度 OKR 后，年度草案应更新");
  await page.getByRole("button", { name: "确认年度 OKR" }).click();
  await expectVisible(page, "4 个季度 OKR");
  await page.getByRole("button", { name: "返回上一步" }).click();
  await expectVisible(page, "年度 OKR");
  assert(await page.locator("#annual-okr-0").inputValue() === annualAfter, "返回年度 OKR 后应保留重新生成后的内容");
```

- [ ] **Step 2: Run browser smoke and verify it fails**

Run:

```powershell
node prototype/prototype-interaction-smoke.cjs
```

Expected: FAIL, because the prototype has no `onboarding-back` or regeneration UI yet.

---

### Task 3: Add Onboarding State And Regeneration Helpers

**Files:**
- Modify: `prototype/index.html`

- [ ] **Step 1: Add generated-content variants**

In `prototype/index.html`, after `const DEFAULT_WEEK_COMMITMENTS = [...]`, add:

```js
    const ANNUAL_OKR_VARIANTS = [
      [
        "O1 稳住身体底盘：每周完成 4 次运动，并保持可持续睡眠节奏",
        "O2 建立创作输入系统：读完 5 本关键书，沉淀 20 条可复用笔记",
        "O3 完成作品收入验证：发布 1 个 App，并完成第一次真实用户反馈收集",
      ],
      [
        "O1 让健康成为默认设置：全年保持晨跑、拉伸和早睡的最低行动线",
        "O2 形成稳定创作节奏：每周输出 1 篇产品/技术复盘",
        "O3 把个人作品推向市场：完成 2 个小产品，并至少公开发布 1 个",
      ],
    ];
    const QUARTER_OKR_VARIANTS = [
      [
        { q: "Q1", title: "校准：找到最小节奏", text: "先跑通健康、阅读和 App 原型的最小闭环。" },
        { q: "Q2", title: "交付：推出第一版作品", text: "把第一个 App 做到可以公开演示，并收集真实反馈。" },
        { q: "Q3", title: "复用：扩大作品方法", text: "复用上半年的经验，推进第二个产品或增长实验。" },
        { q: "Q4", title: "沉淀：整理年度资产", text: "复盘身体、认知和作品收入的真实变化，确定下一年方向。" },
      ],
      [
        { q: "Q1", title: "起步：保留最低行动线", text: "用 4 周建立可坚持的晨跑、阅读和产品推进节奏。" },
        { q: "Q2", title: "成形：完成可用版本", text: "完成个人成长 App 的核心体验，并邀请第一批用户试用。" },
        { q: "Q3", title: "增强：优化体验质量", text: "根据反馈打磨 AI 拆解、清单和成长树反馈。" },
        { q: "Q4", title: "验证：确认自由度提升", text: "整理作品、收入、健康和认知资产，判断长期方向是否成立。" },
      ],
    ];
    const WEEK_COMMITMENT_VARIANTS = [
      [
        "第 1 周：确认冷启动路径，完成快速规划和深度规划的可逆流程",
        "第 2 周：完成能量页、今日清单和周概览的核心打磨",
        "第 3 周：优化 AI 拆解后的任务密度，让计划更容易执行",
        "第 4 周：完成月度回看，决定下一个 4 周的节奏",
      ],
      [
        "第 1 周：把 App 的核心闭环压缩到一次可演示体验",
        "第 2 周：补齐清单编辑、能量确认和周结算反馈",
        "第 3 周：邀请 2 位朋友试用，记录卡住的位置",
        "第 4 周：根据试用反馈重排下一月计划",
      ],
    ];
    const ACTION_PLAN_VARIANTS = [
      {
        focusItems: [
          { title: "确认冷启动可逆流程", value: 25, note: "先保证用户能放心返回" },
          { title: "完成行动建议重生成", value: 20, note: "每层草案都可重新来一版" },
          { title: "跑通一次原型检查", value: 10, note: "用 Playwright 看真实页面" },
        ],
        todos: [
          { id: 101, text: "补齐冷启动返回按钮", done: false },
          { id: 102, text: "为 AI 草案层加重新生成入口", done: false },
          { id: 103, text: "用 Playwright 跑快速规划路径", done: false },
          { id: 104, text: "截图检查按钮不遮挡内容", done: false },
        ],
      },
      {
        focusItems: [
          { title: "打磨本周执行闭环", value: 30, note: "先让今天的任务能落地" },
          { title: "保留运动最低线", value: 18, note: "不让计划挤掉身体节奏" },
          { title: "完成一次真实反馈", value: 12, note: "邀请用户看原型" },
        ],
        todos: [
          { id: 201, text: "整理今天最重要的 3 个行动", done: false },
          { id: 202, text: "完成一个可演示的关键交互", done: false },
          { id: 203, text: "晨跑或快走 30 分钟", done: false },
          { id: 204, text: "记录一次原型试用反馈", done: false },
        ],
      },
    ];
```

- [ ] **Step 2: Add clone helpers**

After:

```js
    const cloneWeekCommitments = () => [...DEFAULT_WEEK_COMMITMENTS];
```

add:

```js
    const cloneFocusItems = (items) => items.map((item) => ({ ...item }));
    const cloneActionTodos = (items) => items.map((item) => ({ ...item }));
```

- [ ] **Step 3: Add onboarding path and regeneration counters to state**

In the `state` object, after:

```js
      onboardingLoading: false,
```

add:

```js
      onboardingPath: null,
      regenerationCounts: { annual: 0, quarter: 0, commitments: 0, action: 0 },
```

- [ ] **Step 4: Add navigation and regeneration helper functions**

After `function resetPrototype() { ... }` and before the document click listener, add:

```js
    function onboardingBackStep() {
      const backMap = {
        2: 1,
        3: state.onboardingPath === "deep" ? 8 : 2,
        4: 1,
        5: 4,
        6: 5,
        7: 6,
        8: 7,
      };
      return backMap[state.onboardingStep] ?? 0;
    }

    function goBackOnboarding() {
      state.onboardingLoading = false;
      state.onboardingStep = onboardingBackStep();
    }

    function nextRegenerationIndex(key, length) {
      const nextCount = state.regenerationCounts[key] + 1;
      state.regenerationCounts = { ...state.regenerationCounts, [key]: nextCount };
      return (nextCount - 1) % length;
    }

    function regenerateActionPlan() {
      const variant = ACTION_PLAN_VARIANTS[nextRegenerationIndex("action", ACTION_PLAN_VARIANTS.length)];
      state.focusItems = cloneFocusItems(variant.focusItems);
      state.todos = cloneActionTodos(variant.todos);
      state.weekRecords = syncCurrentWeekTodos(state.weekRecords);
      state.monthWeeks = state.monthWeeks.map((week, index) => index === 1
        ? { ...week, title: "根据当前目标重新生成", items: state.focusItems.map((item) => item.title) }
        : week);
    }

    function regenerateCurrentOnboarding() {
      if (state.onboardingStep === 3) {
        regenerateActionPlan();
        return;
      }
      if (state.onboardingStep === 6) {
        state.annualOkrs = [...ANNUAL_OKR_VARIANTS[nextRegenerationIndex("annual", ANNUAL_OKR_VARIANTS.length)]];
        return;
      }
      if (state.onboardingStep === 7) {
        state.quarterOkrs = QUARTER_OKR_VARIANTS[nextRegenerationIndex("quarter", QUARTER_OKR_VARIANTS.length)].map((item) => ({ ...item }));
        return;
      }
      if (state.onboardingStep === 8) {
        state.weekCommitments = [...WEEK_COMMITMENT_VARIANTS[nextRegenerationIndex("commitments", WEEK_COMMITMENT_VARIANTS.length)]];
      }
    }
```

- [ ] **Step 5: Reset the new state**

In `resetPrototype()`, after:

```js
      state.onboardingLoading = false;
```

add:

```js
      state.onboardingPath = null;
      state.regenerationCounts = { annual: 0, quarter: 0, commitments: 0, action: 0 };
```

---

### Task 4: Add Reversible Onboarding UI And Handlers

**Files:**
- Modify: `prototype/index.html`

- [ ] **Step 1: Add compact action-row styling**

In the `<style>` block near `.onboarding-actions`, add:

```css
    .onboarding-secondary-actions {
      display: grid;
      gap: 10px;
      margin-top: 12px;
    }
    .onboarding-secondary-actions.two {
      grid-template-columns: 1fr 1fr;
    }
    .onboarding-secondary-actions .secondary-button {
      min-width: 0;
      padding: 13px 12px;
      font-size: 13px;
    }
```

- [ ] **Step 2: Add back and regeneration buttons to quick path and action suggestion step**

In `renderOnboarding()`, in step `state.onboardingStep === 2`, after the primary `start-ai` button and loading track, add:

```html
            <button class="secondary-button" style="margin-top:10px" data-action="onboarding-back">返回上一步</button>
```

In step `state.onboardingStep === 3`, replace:

```html
          <div class="onboarding-actions">
            <button class="primary-button" data-action="finish-onboarding-list">先看今日清单</button>
            <button class="ghost-button" data-action="finish-onboarding">进入能量页</button>
          </div>
```

with:

```html
          <div class="onboarding-secondary-actions two">
            <button class="secondary-button" data-action="onboarding-back">返回上一步</button>
            <button class="secondary-button" data-action="regenerate-current-onboarding">重新生成行动建议</button>
          </div>
          <div class="onboarding-actions">
            <button class="primary-button" data-action="finish-onboarding-list">先看今日清单</button>
            <button class="ghost-button" data-action="finish-onboarding">进入能量页</button>
          </div>
```

- [ ] **Step 3: Add back and regeneration buttons to deep path steps**

In step `state.onboardingStep === 4`, before the existing quick-planning secondary button, add:

```html
            <button class="secondary-button" style="margin-top:10px" data-action="onboarding-back">返回上一步</button>
```

In step `state.onboardingStep === 5`, before the `build-annual-okr` button, add:

```html
              <button class="secondary-button" style="margin-bottom:10px" data-action="onboarding-back">返回上一步</button>
```

In step `state.onboardingStep === 6`, replace the single confirm button:

```html
            <button class="primary-button" style="margin-top:14px" data-action="confirm-annual-okrs">确认年度 OKR</button>
```

with:

```html
            <div class="onboarding-secondary-actions two">
              <button class="secondary-button" data-action="onboarding-back">返回上一步</button>
              <button class="secondary-button" data-action="regenerate-current-onboarding">重新生成年度 OKR</button>
            </div>
            <button class="primary-button" style="margin-top:14px" data-action="confirm-annual-okrs">确认年度 OKR</button>
```

In step `state.onboardingStep === 7`, replace the single confirm button:

```html
            <button class="primary-button" style="margin-top:14px" data-action="confirm-quarter-okrs">确认季度 OKR</button>
```

with:

```html
            <div class="onboarding-secondary-actions two">
              <button class="secondary-button" data-action="onboarding-back">返回上一步</button>
              <button class="secondary-button" data-action="regenerate-current-onboarding">重新生成季度 OKR</button>
            </div>
            <button class="primary-button" style="margin-top:14px" data-action="confirm-quarter-okrs">确认季度 OKR</button>
```

In the final `return` for step 8, before the confirm button, add:

```html
          <div class="onboarding-secondary-actions two">
            <button class="secondary-button" data-action="onboarding-back">返回上一步</button>
            <button class="secondary-button" data-action="regenerate-current-onboarding">重新生成 4 周承诺</button>
          </div>
```

- [ ] **Step 4: Track selected path in existing actions**

In the click handler, update `choose-deep-planning` from:

```js
      if (action === "choose-deep-planning") {
        state.onboardingStep = 4;
      }
```

to:

```js
      if (action === "choose-deep-planning") {
        state.onboardingPath = "deep";
        state.onboardingStep = 4;
      }
```

Update `choose-quick-planning` from:

```js
      if (action === "choose-quick-planning") {
        state.onboardingStep = 2;
      }
```

to:

```js
      if (action === "choose-quick-planning") {
        state.onboardingPath = "quick";
        state.onboardingStep = 2;
      }
```

- [ ] **Step 5: Add click handlers for back and regenerate**

In the click handler, after the `choose-quick-planning` block, add:

```js
      if (action === "onboarding-back") {
        goBackOnboarding();
      }
      if (action === "regenerate-current-onboarding") {
        regenerateCurrentOnboarding();
      }
```

The existing `renderApp();` at the end of the click handler will redraw the screen.

---

### Task 5: Run Tests And Update Docs After Prototype Sync

**Files:**
- Modify: `docs/superpowers/specs/2026-04-28-cold-start-vision-planning-design.md`
- Modify: `产品需求设计文档.md`

- [ ] **Step 1: Run static regression**

Run:

```powershell
node prototype/prototype-regression.test.cjs
```

Expected:

```text
prototype regression checks passed
```

- [ ] **Step 2: Run Playwright interaction smoke**

Run:

```powershell
node prototype/prototype-interaction-smoke.cjs
```

Expected:

```text
prototype interaction smoke passed
```

- [ ] **Step 3: Capture a visual verification screenshot with npx playwright**

Run:

```powershell
npx playwright screenshot --viewport-size=390,844 "file:///c:/WORK-SPACE/newMe/prototype/index.html" prototype/reversible-cold-start.png
```

Expected: `prototype/reversible-cold-start.png` is created and the opening cold-start screen is visible. Do not commit the screenshot unless the repository already tracks prototype screenshots.

- [ ] **Step 4: Update spec status after verification**

In `docs/superpowers/specs/2026-04-28-cold-start-vision-planning-design.md`, change:

```markdown
- 状态：补充可返回与重新生成规则，待原型同步
```

to:

```markdown
- 状态：已同步至原型并通过交互检查
```

- [ ] **Step 5: Update main PRD implementation note**

In `产品需求设计文档.md`, replace the static implementation note:

```markdown
`prototype/index.html` 已从 `终稿原型.jsx` 迁移为原生 HTML/CSS/JavaScript 单文件版本。静态版保留 React 终稿的主要状态和交互：冷启动、Tab 切换、能量确认提醒、清单新增/勾选/编辑/左滑删除、本周 7 天概览、计划页月/年切换、带反馈输入的 AI 重规划、成长树详情、果实时间胶囊、可微调的周结算和重置原型。
```

with:

```markdown
`prototype/index.html` 已从 `终稿原型.jsx` 迁移为原生 HTML/CSS/JavaScript 单文件版本。静态版保留 React 终稿的主要状态和交互：冷启动双路径、冷启动逐级返回、AI 草案层级重新生成、Tab 切换、能量确认提醒、清单新增/勾选/编辑/左滑删除、本周 7 天概览、计划页月/年切换、带反馈输入的 AI 重规划、成长树详情、果实时间胶囊、可微调的周结算和重置原型。
```

- [ ] **Step 6: Commit implementation**

Run:

```powershell
git status --short
git add prototype/index.html prototype/prototype-regression.test.cjs prototype/prototype-interaction-smoke.cjs docs/superpowers/specs/2026-04-28-cold-start-vision-planning-design.md 产品需求设计文档.md
git commit -m "feat: make cold start planning reversible"
```

Expected: Commit succeeds. If `prototype/reversible-cold-start.png` is untracked, leave it uncommitted or delete it after visual verification.

---

## Self-Review

- Spec coverage: The plan covers reversible navigation, state retention, explicit regeneration at annual/quarter/week/action layers, no automatic regeneration on back/continue, docs synchronization, and Playwright verification.
- Placeholder scan: No TBD/TODO/fill-in placeholders remain.
- Type consistency: The plan consistently uses `onboardingPath`, `regenerationCounts`, `onboarding-back`, and `regenerate-current-onboarding` across tests, implementation, and handlers.
