# Plasma Energy Slider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the plain daily energy slider with a plasma nitro rail and make the prototype plus mobile client share the upgraded visual language.

**Architecture:** `prototype/index.html` defines the updated visual source of truth. `EnergySlider.tsx` implements the mobile version with React Native layout primitives and lightweight `Animated` loops. Playwright tests lock the visible structure and the `NaN%` regression.

**Tech Stack:** Expo React Native, React Native Web, Playwright, single-file HTML prototype, Markdown docs.

---

### Task 1: Add Failing Regression Coverage

**Files:**
- Modify: `apps/mobile/tests/prototype-parity.spec.js`
- Modify: `apps/mobile/tests/prototype-visual-regression.spec.js`

- [x] **Step 1: Add structure and NaN assertions**

Add a Playwright test that opens the energy page, clicks the energy control, verifies the value label is not `NaN%`, and checks for plasma rail test ids.

- [x] **Step 2: Run the focused test and confirm RED**

Run: `npx playwright test apps/mobile/tests/prototype-parity.spec.js --grep "plasma energy rail" --reporter=line`

Expected: FAIL because the current slider does not expose the plasma rail structure.

### Task 2: Upgrade Prototype Source of Truth

**Files:**
- Modify: `prototype/index.html`

- [x] **Step 1: Replace the old nitro rail CSS**

Update `.nitro-range-wrap`, `.nitro-tail`, `.nitro-head`, and `.nitro-spark` styling so the rail uses an angled nozzle, layered plasma tails, and stronger particle sparks.

- [x] **Step 2: Keep the existing range input invisible but interactive**

Do not change the `input#energy-range` data flow. Only change visual layers and class semantics.

### Task 3: Upgrade Mobile EnergySlider

**Files:**
- Modify: `apps/mobile/src/features/energy/components/EnergySlider.tsx`

- [x] **Step 1: Clamp value rendering**

Render `safeValue = clampFinite(value)` and call `onChange` only with finite numbers.

- [x] **Step 2: Replace thumb UI with plasma layers**

Render test-id-backed layers for rail, core fill, plasma tail, nozzle, and sparks. The nozzle must be angled, not a circle.

- [x] **Step 3: Add lightweight animation**

Use `Animated.loop` for pulsing opacity/scale on the plasma tail and particles. Keep the control usable on web and mobile.

### Task 4: Sync Documentation

**Files:**
- Modify: `产品需求设计文档.md`
- Modify: `docs/prototype-parity/2026-05-04-full-page-diff-audit.md`
- Modify: `docs/superpowers/progress/2026-04-29-parallel-mvp-progress.md`

- [x] **Step 1: Record the new source-of-truth decision**

Document that the energy slider was intentionally upgraded beyond the old prototype and the new prototype rail is the acceptance baseline.

### Task 5: Verify

**Commands:**
- `pnpm --filter @newme/mobile typecheck`
- `npx playwright test apps/mobile/tests/prototype-parity.spec.js --reporter=line`
- `npx playwright test apps/mobile/tests/prototype-visual-regression.spec.js --reporter=line`
- `pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web`

- [x] **Step 1: Run all commands and record output**

All commands must exit 0 before calling the work complete.
