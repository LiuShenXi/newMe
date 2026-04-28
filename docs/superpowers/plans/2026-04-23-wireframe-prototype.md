# 个人成长 App 线稿原型 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新建一版独立的低保真可点击线稿原型，覆盖冷启动、4 个 Tab、今日清单、本周视图、周结算和成长树回顾，同时同步更新规格文档与用户故事。

**Architecture:** 保留现有 `prototype/index.html` 作为彩色演示稿，新增 `prototype/wireframe.html` 作为黑白灰单文件原型。原型通过原生 HTML、CSS、JavaScript 管理页面状态、弹层和列表操作，不引入构建工具。文档侧同步更新产品规格与用户故事，统一为“本周重点 + 今日清单”的信息结构。

**Tech Stack:** HTML, CSS, Vanilla JavaScript, Markdown

---

### Task 1: 同步产品文档

**Files:**
- Modify: `docs/superpowers/specs/2026-04-19-personal-growth-app-design.md`
- Modify: `docs/superpowers/specs/2026-04-21-user-stories.md`

- [ ] **Step 1: 更新规格文档中的信息结构**

```md
2. `清单`
   - 默认展示今天的普通 todolist
   - 右上角提供 `本周` 入口查看一周 7 天的 TDL 明细，不能只显示完成率
   - 支持用户手动 CRUD
```

- [ ] **Step 2: 更新用户故事中的核心用语**

```md
### US-007：本周重点推进概览

- Then 我在能量球下方看到"本周重点推进概览"
- And 每条重点显示当前完成进度
```

- [ ] **Step 3: 运行一致性检查**

Run: `rg -n "承诺作为容器|按承诺分组|本周承诺完成概览" docs/superpowers/specs/2026-04-19-personal-growth-app-design.md docs/superpowers/specs/2026-04-21-user-stories.md`
Expected: 不再出现旧的清单容器表述

### Task 2: 搭建线稿原型骨架

**Files:**
- Create: `prototype/wireframe.html`

- [ ] **Step 1: 创建单文件页面骨架**

```html
<body>
  <div id="onboarding" class="screen active"></div>
  <div id="energy" class="screen"></div>
  <div id="checklist" class="screen"></div>
  <div id="plan" class="screen"></div>
  <div id="tree" class="screen"></div>
  <div id="weekViewModal" class="modal"></div>
  <div id="settlementModal" class="modal"></div>
  <div class="tab-bar"></div>
</body>
```

- [ ] **Step 2: 定义低保真样式系统**

```css
:root {
  --bg: #f5f5f3;
  --panel: #ffffff;
  --line: #1f1f1f;
  --muted: #8a8a8a;
  --soft: #d7d7d2;
}
```

- [ ] **Step 3: 先写静态占位内容**

```html
<section class="panel">
  <div class="section-title">本周重点</div>
  <div class="tag-row">
    <span class="tag">上线原型线框</span>
    <span class="tag">理清日清单结构</span>
    <span class="tag">准备周结算</span>
  </div>
</section>
```

### Task 3: 接通关键交互

**Files:**
- Modify: `prototype/wireframe.html`

- [ ] **Step 1: 实现冷启动与 Tab 切换**

```js
function finishOnboarding() {
  setActiveScreen('energy');
  document.getElementById('tabBar').classList.remove('hidden');
}

function switchTab(tab) {
  setActiveScreen(tab);
}
```

- [ ] **Step 2: 实现今日清单 CRUD 与本周视图**

```js
function addTodo() {
  const value = input.value.trim();
  if (!value) return;
  state.todos[state.selectedDay].push({ text: value, done: false });
  renderChecklist();
}

function openWeekView() {
  document.getElementById('weekViewModal').classList.add('show');
}
```

- [ ] **Step 3: 实现能量提醒、周结算和果实卡片**

```js
function maybePromptChecklist() {
  if (!state.viewedTodayChecklist) {
    document.getElementById('checklistReminder').classList.add('show');
    return;
  }
  confirmEnergy();
}
```

### Task 4: 验证原型结构

**Files:**
- Verify: `prototype/wireframe.html`

- [ ] **Step 1: 检查关键节点存在**

Run: `node - <<'NODE'\nconst fs = require('fs');\nconst html = fs.readFileSync('prototype/wireframe.html', 'utf8');\nconst required = ['id=\"onboarding\"', 'id=\"energy\"', 'id=\"checklist\"', 'id=\"plan\"', 'id=\"tree\"', 'id=\"weekViewModal\"', 'id=\"settlementModal\"'];\nconst missing = required.filter((token) => !html.includes(token));\nif (missing.length) {\n  console.error('missing', missing.join(', '));\n  process.exit(1);\n}\nconsole.log('wireframe structure ok');\nNODE`
Expected: 输出 `wireframe structure ok`

- [ ] **Step 2: 检查关键交互函数存在**

Run: `node - <<'NODE'\nconst fs = require('fs');\nconst html = fs.readFileSync('prototype/wireframe.html', 'utf8');\nconst required = ['finishOnboarding', 'switchTab', 'addTodo', 'openWeekView', 'maybePromptChecklist', 'nextSettle'];\nconst missing = required.filter((token) => !html.includes(token));\nif (missing.length) {\n  console.error('missing functions', missing.join(', '));\n  process.exit(1);\n}\nconsole.log('wireframe interactions ok');\nNODE`
Expected: 输出 `wireframe interactions ok`

- [ ] **Step 3: 复查文档与原型产物路径**

Run: `ls prototype && ls docs/superpowers/specs && ls docs/superpowers/plans`
Expected: 能看到 `wireframe.html`、更新后的规格文档和本计划文件
