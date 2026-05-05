# Gold Capsule Energy Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the improvised energy slider with a 1:1 gold capsule energy bar based on the user-provided target image.

**Architecture:** `prototype/index.html` defines the updated source of truth. `EnergySlider.tsx` implements the same composition with React Native views, `expo-linear-gradient`, `PanResponder` drag tracking, and a small Animated highlight. Playwright tests lock the visual structure, default `62%` target state, transparent gradient tail mist, zero-value cleanliness, and finger-follow drag behavior.

**Tech Stack:** Expo React Native, `expo-linear-gradient`, React Native Animated, Playwright, single-file HTML prototype, Markdown docs.

---

### Task 1: Add Failing Regression Coverage

**Files:**
- Modify: `apps/mobile/tests/prototype-parity.spec.js`

- [x] **Step 1: Add target-image structure assertions**

Add Playwright coverage for default `62%`, `energy-bar-card`, four HUD lines, four HUD corners, `energy-bar-fill`, 22 particles, fill-to-track ratio, and absence of `legacy-energy-thumb`.

- [x] **Step 2: Add zero-state cleanliness assertion**

Click the far-left side of the track and assert the value becomes `0%` with fill and tail widths no larger than 4px.

- [x] **Step 3: Add tail fade assertion**

Assert `energy-bar-tail` has no solid background and contains one `energy-bar-tail-fade` gradient child, preventing the visible rectangular glow block.

- [x] **Step 4: Add finger-follow drag assertion**

Hold the pointer down, drag across the track, and assert the percentage updates before pointer release.

- [x] **Step 5: Run focused tests and confirm RED**

Run: `npx playwright test apps/mobile/tests/prototype-parity.spec.js --grep "energy bar" --reporter=line`

Expected: FAIL because the current slider does not expose the gold capsule target structure and still defaults to `82%`.

### Task 2: Implement Mobile Gold Capsule Bar

**Files:**
- Modify: `apps/mobile/src/features/energy/components/EnergySlider.tsx`
- Modify: `apps/mobile/src/features/energy/hooks/useEnergy.ts`

- [x] **Step 1: Set default daily energy to 62**

Change the local demo default from `82` to `62`.

- [x] **Step 2: Rebuild EnergySlider layers**

Render the dark-gold card, header, HUD decorations, dark capsule track, gold gradient fill, internal shine, particles, transparent gradient tail mist, and clean zero state.

- [x] **Step 3: Preserve interaction safety**

Keep finite input parsing and clamp all changes to `0-100`.

### Task 3: Update Prototype Source of Truth

**Files:**
- Modify: `prototype/index.html`

- [x] **Step 1: Set prototype daily value to 62**

Update prototype default state from `82` to `62`.

- [x] **Step 2: Replace old nitro styling**

Update the range card and rail CSS to use the target-image gold capsule composition instead of the old round-thumb nitro rail.

### Task 4: Sync Documentation

**Files:**
- Modify: `产品需求设计文档.md`
- Modify: `docs/prototype-parity/2026-05-04-full-page-diff-audit.md`
- Modify: `docs/superpowers/progress/2026-04-29-parallel-mvp-progress.md`

- [x] **Step 1: Record the new acceptance baseline**

Document that the current target is the user-provided gold capsule energy bar, not the earlier plasma/nozzle exploration.

### Task 5: Verify

**Commands:**
- `pnpm --filter @newme/mobile typecheck`
- `npx playwright test apps/mobile/tests/prototype-parity.spec.js --reporter=line`
- `npx playwright test apps/mobile/tests/prototype-visual-regression.spec.js --reporter=line`
- `pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web`

- [x] **Step 1: Run all commands and record output**

All commands must exit 0 before calling the work complete.
