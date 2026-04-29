# MVP 并行开发实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零搭建个人成长管理 App 的 MVP，跑通从冷启动规划到周结算的完整闭环，最大化并行开发效率。

**Architecture:** Monorepo（pnpm workspace）包含三个包：`packages/shared`（共享类型/枚举/常量）、`apps/api`（NestJS 后端）、`apps/mobile`（React Native + Expo 前端）。后端模块化单体，前端 feature-first 目录结构。AI 编排层模型无关，端侧 expo-sqlite 支持离线。

**Tech Stack:** React Native (Expo) · TypeScript · NestJS · PostgreSQL · Prisma · Zustand · React Query · expo-sqlite · expo-router · react-native-reanimated · @shopify/react-native-skia · Zod

**Frontend UI Source of Truth:** 移动客户端 UI 必须以 `prototype/index.html` 终稿静态交互原型为视觉与交互基准做 1:1 还原。除非产品需求设计文档明确变更，worker 不得把原型仅作为风格参考，也不得自行改动信息架构、视觉层级、关键交互或文案表达。移动端实现完成后，主控必须用 `npx playwright` 对原型关键状态截图，并与 Expo 客户端关键页面做视觉/交互对照验收。

---

## AI worker 必读与启动规则

下次启动多个 Codex/AI 对话并行开发时，**每个 worker 在写代码前必须先阅读本文件和下列架构文档**：

1. `docs/superpowers/plans/2026-04-29-parallel-mvp-implementation.md`
2. `docs/architecture/00-技术架构总览.md`
3. `docs/architecture/04-数据与AI架构.md`
4. `docs/architecture/05-部署与运维方案.md`
5. `docs/architecture/06-技术风险与演进路线.md`
6. `产品需求设计文档.md`

推荐采用 **一个主控对话 + 多个 worker 对话 + 每个 worker 一个 git worktree/branch** 的方式。不要让多个 Codex 对话同时在 `c:\WORK-SPACE\newMe` 主目录里写代码。

### 手动多开 Codex 的 worktree 建议

```powershell
git worktree add .worktrees/track-a-contract -b feat/track-a-contract
git worktree add .worktrees/track-b-api -b feat/track-b-api
git worktree add .worktrees/track-c-mobile-shell -b feat/track-c-mobile-shell
git worktree add .worktrees/track-d-local-db -b feat/track-d-local-db
git worktree add .worktrees/track-e-ai -b feat/track-e-ai
```

每个 worker 对话只打开自己的 worktree，并严格遵守本计划里的 **Owned paths**。完成后提交 commit，由主控对话负责合并、冲突处理、端到端验证和文档收口。

### Worker 通用执行协议

- 启动后先确认自己的任务、依赖、Owned paths 和禁止修改范围。
- 不要回滚或重写其他 worker 的代码。
- 不要跨轨道抢核心契约；共享类型、AI schema、同步 payload 只能由 Track A 契约任务先定义，其他轨道引用。
- 每个任务先写测试或最小验证，再实现，再运行本任务验证命令。
- 每次完成一个 task 都要提交 commit，并在最终回复里列出修改文件、验证命令和残余风险。
- 如果发现计划和架构文档不一致，暂停当前任务并回报主控对话，不要自行发散。

### Worker 分发模板

复制下面模板给每个手动开启的 Codex 对话：

```text
你是本仓库并行开发 worker。请先阅读：
1. docs/superpowers/plans/2026-04-29-parallel-mvp-implementation.md
2. docs/architecture/00-技术架构总览.md
3. docs/architecture/04-数据与AI架构.md
4. docs/architecture/05-部署与运维方案.md
5. docs/architecture/06-技术风险与演进路线.md
6. 产品需求设计文档.md

你的任务：[填写 Track/Task 编号和标题]
你的 Owned paths：[填写允许修改的路径]
禁止修改：[填写其他 worker 的路径]
依赖条件：[填写必须先完成的任务或 commit]

按计划执行。完成后提交 commit，回复：
- 完成内容
- 修改文件
- 运行过的验证命令和结果
- 未解决风险或需要主控集成的事项
```

### 并行启动批次

**Batch 0：契约冻结（必须最先完成）**

- Track A1-A3：Monorepo + shared 基础。
- Track A4：冻结数据/AI/同步契约。

**Batch 1：基础并行（A4 完成后启动）**

| Worker | 任务范围 | Owned paths | 依赖 |
| --- | --- | --- | --- |
| A | 共享契约维护、计划文档收口 | `packages/shared/**`, `docs/superpowers/plans/**` | 无 |
| B | API 基础、Prisma、Auth、Health | `apps/api/**` | A4 |
| C | Expo App、导航、主题、基础状态 | `apps/mobile/app/**`, `apps/mobile/src/shared/**`, `apps/mobile/src/stores/**` | A4 |
| D | SQLite、本地 repository、sync queue | `apps/mobile/src/db/**` | A4 |
| E | AI 编排、mock provider、prompt/schema 测试 | `apps/api/src/modules/ai/**` | A4 |

Track C 前端 worker 的 UI 验收基准是 `prototype/index.html`，要求按终稿原型做 1:1 还原；若移动端技术限制导致无法完全一致，必须记录差异、原因和替代实现，并同步更新 `产品需求设计文档.md` 与本计划。

**Batch 2：业务闭环并行（集成点 1 通过后启动）**

- B：Goals / Plans / Todos / Energy / Settlement / Tree / Sync API。
- C：冷启动三路径、能量页、清单页、计划页、成长树、周结算 UI。
- D：同步引擎、冲突处理、离线验证。
- E：7 个 AI 场景 prompt、confirm 写入对接。
- 主控：端到端联调、Playwright 原型对照、文档一致性收口。

## 技术总监续跑协议

当用户输入类似下面的口令时：

```text
技术总监，请按照当前进度和计划文档继续开发
```

AI 必须自动进入 **Director 续跑模式**，先检查当前真实进度，再决定下一步任务。不要直接从计划开头重做，也不要凭聊天记忆判断进度。

### Director 续跑模式步骤

1. 阅读本计划、架构文档、产品需求文档和进度交接日志：`docs/superpowers/progress/2026-04-29-parallel-mvp-progress.md`。
2. 检查 git 状态：`git status --short`、`git branch --show-current`、`git log --oneline -5`。
3. 检查 worktree 状态：`git worktree list`。
4. 检查计划 checkbox、最近 commit、未提交文件和进度日志，判断每个 task 是 `未开始 / 进行中 / 已完成 / 阻塞 / 待 review`。
5. 如果工作区有未提交改动，先识别改动归属，不覆盖、不回滚，必要时先做交接记录。
6. 选择依赖已满足、Owned paths 不冲突、能在当前额度内完成并验证的最小下一任务。
7. 派发 worker 子 agent 或自己执行任务；完成后必须更新进度日志。
8. 若额度或上下文可能不足，优先执行“额度保护收尾协议”，不要继续开新任务。

### 额度保护收尾协议

为了防止开发到一半额度耗尽导致停摆，任何 Director/Worker 都必须遵守：

- 每完成一个小任务就提交 commit；不要把多个大功能堆在一个未提交工作区。
- 每次准备进入较大改动前，先更新进度日志的“当前状态”和“下一步建议”。
- 每 30 分钟、每个 task 完成后、每次遇到阻塞时，都更新一次进度日志。
- 如果不能完成当前任务，必须至少留下：
  - 已改文件列表
  - 当前做到哪一步
  - 已运行验证命令及结果
  - 未完成事项
  - 下次建议从哪里继续
- 不确定是否有足够额度时，优先做文档交接和小型验证，不启动新模块。

### 进度状态枚举

任务状态统一使用：

| 状态 | 含义 |
| --- | --- |
| `TODO` | 未开始 |
| `IN_PROGRESS` | 正在实现，有未合并或未验证改动 |
| `DONE` | 已实现、已验证、已提交 |
| `REVIEW_PENDING` | 实现完成，等待 spec/code review |
| `CHANGES_REQUESTED` | review 未通过，需要返工 |
| `BLOCKED` | 阻塞，需要用户或主控决策 |

### Director 下次续跑最小汇报格式

Director 完成自动检查后，先用下面格式汇报，再继续开发：

```text
当前进度：
- 已完成：
- 进行中：
- 阻塞：
- 未提交改动：

我将继续：
- 下一任务：
- 选择原因：
- 验证方式：
- 收尾点：
```

## 并行轨道总览

本计划拆分为 **5 条主要并行轨道 + 1 条集成轨道**。轨道之间通过 `packages/shared` 的类型契约解耦，在关键节点汇合集成。真正并行前必须先完成 Track A 的契约冻结任务。

```text
时间线（大致）：

Week 1:
  Track A: Monorepo + Shared + 契约冻结 ───────────────┐
  Track B: 后端基础 + Prisma + Health + Auth ─────────┤
  Track C: 前端基础 + 导航 + 静态页面骨架 ─────────────┤
  Track D: 本地 SQLite + sync queue ──────────────────┤
  Track E: AI 编排层 + mock provider ─────────────────┘
                                                       │
Week 2:                                          集成点 1
  Track B: 结算 + 成长树 + 同步 ───────────────────────┤
  Track C: 冷启动三路径 + 能量页 + 清单页 ─────────────┤
  Track E: AI 场景 prompt + 前端对接 ──────────────────┘
                                                       │
                                                 集成点 2
                                                       │
  全轨道: 端到端集成测试 + Bug 修复 + 发布准备
```

### 轨道依赖关系

| 轨道 | 依赖 | 产出 |
| --- | --- | --- |
| A: Monorepo + Shared | 无 | 项目骨架、共享类型、构建配置 |
| B: 后端 | A 的共享类型和契约 | Prisma schema、REST API、业务逻辑、数据持久化 |
| C: 前端 | A 的共享类型 | App UI、导航、交互 |
| D: 本地数据层 | A 的共享类型和同步契约 | SQLite 本地层、sync_queue、端侧同步引擎 |
| E: AI 编排 | A 的 AI schema、B 的 ai_generations 表 | AI 调用、prompt、结构化输出 |
| F: 集成验证 | B/C/D/E 阶段产物 | 端到端联调、部署验证、文档收口 |

**关键原则：Track A 必须最先完成 A1-A4，之后 B/C/D/E 才能并行。Track B 拥有 Prisma schema；Track D 只拥有端侧 SQLite，不改服务端 schema。**

---

## Track A: Monorepo 基础设施 + Shared 包

### Task A1: 初始化 Monorepo

**Files:**
- Create: `package.json` (root)
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `.nvmrc`
- Create: `tsconfig.base.json`

- [ ] **Step 1: 初始化 root package.json**

```json
{
  "name": "newme",
  "private": true,
  "scripts": {
    "api": "pnpm --filter @newme/api",
    "mobile": "pnpm --filter @newme/mobile",
    "shared": "pnpm --filter @newme/shared"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 2: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

- [ ] **Step 3: 创建 tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 4: 创建 .nvmrc**

```text
20
```

- [ ] **Step 5: 创建 .gitignore**

```text
node_modules/
dist/
.env
.env.*
!.env.example
*.tsbuildinfo
.expo/
android/
ios/
```

- [ ] **Step 6: 运行 pnpm install 验证 workspace**

Run: `pnpm install`
Expected: 成功，无错误

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json .nvmrc .gitignore
git commit -m "chore: init monorepo with pnpm workspace"
```

### Task A2: 创建 Shared 包 — 枚举和常量

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/enums/goal.ts`
- Create: `packages/shared/src/enums/source.ts`
- Create: `packages/shared/src/enums/sync.ts`
- Create: `packages/shared/src/enums/ai-scenario.ts`
- Create: `packages/shared/src/enums/index.ts`
- Create: `packages/shared/src/constants/index.ts`

- [ ] **Step 1: 创建 shared package.json**

```json
{
  "name": "@newme/shared",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: 创建枚举文件 — goal.ts**

```typescript
export enum GoalType {
  RESULT = 'result',
  PROJECT = 'project',
  HABIT = 'habit',
}

export enum GoalLevel {
  VISION = 'vision',
  ANNUAL = 'annual',
  QUARTER = 'quarter',
  MONTH = 'month',
  WEEK = 'week',
  DAY = 'day',
}
```

- [ ] **Step 4: 创建枚举文件 — source.ts**

```typescript
export enum Source {
  MANUAL = 'manual',
  AI = 'ai',
  MIXED = 'mixed',
  SYSTEM = 'system',
}
```

- [ ] **Step 5: 创建枚举文件 — sync.ts**

```typescript
export enum SyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  FAILED = 'failed',
}
```

- [ ] **Step 6: 创建枚举文件 — ai-scenario.ts**

```typescript
export enum AiScenario {
  QUICK_QUARTER_PLAN = 'quick_quarter_plan',
  VISION_TO_ANNUAL_OKR = 'vision_to_annual_okr',
  ANNUAL_TO_QUARTER_OKR = 'annual_to_quarter_okr',
  QUARTER_TO_FOUR_WEEK_COMMITMENTS = 'quarter_to_four_week_commitments',
  WEEKLY_FOCUS_TO_TODOS = 'weekly_focus_to_todos',
  REPLAN_FUTURE_WEEKS = 'replan_future_weeks',
  MANUAL_LOCAL_ASSIST = 'manual_local_assist',
}
```

- [ ] **Step 7: 创建 enums/index.ts 和常量**

```typescript
// enums/index.ts
export * from './goal';
export * from './source';
export * from './sync';
export * from './ai-scenario';
```

```typescript
// constants/index.ts
export const QUARTER_HONOR_THRESHOLD = 0.8;
export const MAX_WEEKLY_FOCUSES = 5;
export const MIN_WEEKLY_FOCUSES = 3;
export const MAX_DAILY_TODOS = 10;
export const ENERGY_MIN = 0;
export const ENERGY_MAX = 100;
export const AI_REQUEST_TIMEOUT_MS = 30_000;
export const AI_PROVIDER_TIMEOUT_MS = 25_000;
export const AI_RATE_LIMIT_PER_SCENARIO_PER_MIN = 3;
export const AI_RATE_LIMIT_GLOBAL_PER_HOUR = 30;
export const SETTLEMENT_BACKFILL_WEEKS = 1;
```

- [ ] **Step 8: 创建 src/index.ts**

```typescript
export * from './enums';
export * from './constants';
```

- [ ] **Step 9: 运行 typecheck**

Run: `cd packages/shared && pnpm typecheck`
Expected: 无错误

- [ ] **Step 10: Commit**

```bash
git add packages/shared/
git commit -m "feat: add shared package with enums and constants"
```

### Task A3: Shared 包 — DTO 类型和 Zod Schema

**Files:**
- Create: `packages/shared/src/dto/auth.ts`
- Create: `packages/shared/src/dto/goal.ts`
- Create: `packages/shared/src/dto/plan.ts`
- Create: `packages/shared/src/dto/todo.ts`
- Create: `packages/shared/src/dto/energy.ts`
- Create: `packages/shared/src/dto/settlement.ts`
- Create: `packages/shared/src/dto/tree.ts`
- Create: `packages/shared/src/dto/ai.ts`
- Create: `packages/shared/src/dto/sync.ts`
- Create: `packages/shared/src/dto/index.ts`
- Create: `packages/shared/src/validators/ai-output.ts`
- Create: `packages/shared/src/validators/index.ts`
- Modify: `packages/shared/src/index.ts`
- Modify: `packages/shared/package.json` (add zod dependency)

- [ ] **Step 1: 安装 zod**

Run: `cd packages/shared && pnpm add zod`

- [ ] **Step 2: 创建 dto/auth.ts**

```typescript
export interface LoginRequest {
  phone: string;
  code: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface UserContext {
  id: string;
  phone: string;
  timezone: string;
  currentWeekId: string;
  currentQuarterId: string;
  hasCompletedOnboarding: boolean;
}
```

- [ ] **Step 3: 创建 dto/goal.ts**

```typescript
import { GoalType, Source } from '../enums';

export interface VisionDto {
  id: string;
  content: string;
  source: Source;
  createdAt: string;
}

export interface AnnualObjectiveDto {
  id: string;
  year: number;
  objectives: { title: string; keyResults: string[] }[];
  source: Source;
}

export interface QuarterGoalDto {
  id: string;
  quarterId: string;
  title: string;
  goalType: GoalType | null;
  source: Source;
}

export interface MonthGoalDto {
  id: string;
  monthId: string;
  title: string;
  source: Source;
}

export interface CreateVisionRequest {
  content: string;
}

export interface CreateQuarterGoalRequest {
  title: string;
}

export interface CreateMonthGoalRequest {
  title: string;
}
```

- [ ] **Step 4: 创建 dto/plan.ts**

```typescript
import { Source } from '../enums';

export interface WeeklyFocusDto {
  id: string;
  weekId: string;
  title: string;
  reason: string | null;
  source: Source;
  invalidatedAt: string | null;
}

export interface WeekPlanDto {
  id: string;
  weekId: string;
  focuses: WeeklyFocusDto[];
}

export interface UpdateWeeklyFocusesRequest {
  focuses: { title: string; reason?: string }[];
}
```

- [ ] **Step 5: 创建 dto/todo.ts**

```typescript
import { Source } from '../enums';

export interface TodoDto {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  estimatedMinutes: number | null;
  sourceFocusId: string | null;
  source: Source;
  userEdited: boolean;
}

export interface CreateTodoRequest {
  title: string;
  date: string;
  estimatedMinutes?: number;
  sourceFocusId?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  completed?: boolean;
  estimatedMinutes?: number;
}
```

- [ ] **Step 6: 创建 dto/energy.ts**

```typescript
export interface EnergyEntryDto {
  id: string;
  date: string;
  score: number;
  weekId: string;
  hasViewedTodos: boolean;
}

export interface WeeklyEnergyDto {
  weekId: string;
  entries: EnergyEntryDto[];
  average: number | null;
  recordedDays: number;
}

export interface RecordEnergyRequest {
  score: number;
  hasViewedTodos: boolean;
}
```

- [ ] **Step 7: 创建 dto/settlement.ts**

```typescript
export interface WeeklySettlementDto {
  id: string;
  weekId: string;
  suggestedScore: number;
  finalScore: number;
  reflection: string | null;
  snapshotJson: Record<string, unknown>;
  confirmedAt: string;
}

export interface CreateSettlementRequest {
  finalScore: number;
  reflection?: string;
}
```

- [ ] **Step 8: 创建 dto/tree.ts**

```typescript
export interface TreeFruitDto {
  id: string;
  weekId: string;
  score: number;
  label: string;
  capsuleSummary: string;
  createdAt: string;
}

export interface QuarterHonorDto {
  id: string;
  quarterId: string;
  averageScore: number;
  earnedAt: string;
}

export interface GrowthTreeDto {
  year: number;
  stage: 'q1_start' | 'q2_growth' | 'q3_flourish' | 'q4_complete';
  fruits: TreeFruitDto[];
  honors: QuarterHonorDto[];
}
```

- [ ] **Step 9: 创建 dto/ai.ts**

```typescript
import { AiScenario } from '../enums';

export interface GenerateRequest {
  scenario: AiScenario;
  input: Record<string, unknown>;
  contextVersion?: string;
  regenerateFromId?: string;
}

export interface GenerationDto {
  id: string;
  scenario: AiScenario;
  status: 'pending' | 'completed' | 'failed' | 'confirmed';
  outputJson: Record<string, unknown> | null;
  createdAt: string;
}

export interface ConfirmGenerationRequest {
  edits?: Record<string, unknown>;
}

export interface AssistRequest {
  level: 'annual' | 'quarter' | 'month' | 'week' | 'day';
  context: string;
  existingData?: Record<string, unknown>;
  options?: { availableDays?: number };
}
```

- [ ] **Step 10: 创建 dto/sync.ts**

```typescript
export interface SyncPushItem {
  tableName: string;
  localId: string;
  remoteId: string | null;
  operation: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  version: number;
}

export interface SyncPushRequest {
  items: SyncPushItem[];
  deviceId: string;
}

export interface SyncPushResultItem {
  localId: string;
  remoteId: string;
  status: 'success' | 'conflict' | 'error';
  newVersion: number;
  error?: string;
}

export interface SyncPullRequest {
  deviceId: string;
  lastPulledAt: string;
}

export interface SyncPullResponse {
  changes: {
    tableName: string;
    remoteId: string;
    operation: 'create' | 'update' | 'delete';
    data: Record<string, unknown>;
    version: number;
    updatedAt: string;
  }[];
  pulledAt: string;
}
```

- [ ] **Step 11: 创建 dto/index.ts 和 validators**

```typescript
// dto/index.ts
export * from './auth';
export * from './goal';
export * from './plan';
export * from './todo';
export * from './energy';
export * from './settlement';
export * from './tree';
export * from './ai';
export * from './sync';
```

```typescript
// validators/ai-output.ts
import { z } from 'zod';

export const weeklyFocusOutputSchema = z.object({
  title: z.string().min(1).max(100),
  reason: z.string().max(200),
});

export const todoOutputSchema = z.object({
  title: z.string().min(1).max(100),
  estimatedMinutes: z.number().int().min(5).max(480),
  sourceFocusTitle: z.string().optional(),
});

export const quickPlanOutputSchema = z.object({
  goalType: z.enum(['result', 'project', 'habit']),
  weeklyFocuses: z.array(weeklyFocusOutputSchema).min(3).max(5),
  todayTodos: z.array(todoOutputSchema).min(1).max(10),
});

export const annualOkrOutputSchema = z.object({
  objectives: z.array(z.object({
    title: z.string().min(1).max(100),
    keyResults: z.array(z.string().min(1).max(200)).min(1).max(5),
  })).min(1).max(5),
});

export const quarterOkrOutputSchema = z.object({
  quarters: z.array(z.object({
    quarter: z.number().int().min(1).max(4),
    goals: z.array(z.object({
      title: z.string().min(1).max(100),
      goalType: z.enum(['result', 'project', 'habit']),
    })).min(1).max(5),
  })).length(4),
});

export const fourWeekCommitmentsOutputSchema = z.object({
  weeks: z.array(z.object({
    weekNumber: z.number().int().min(1).max(4),
    focuses: z.array(weeklyFocusOutputSchema).min(3).max(5),
  })).min(1).max(4),
});

export const weeklyFocusToTodosOutputSchema = z.object({
  days: z.array(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    todos: z.array(todoOutputSchema).min(0).max(10),
  })).min(1).max(7),
});

export const replanFutureWeeksOutputSchema = z.object({
  reason: z.string().min(1).max(300),
  weeks: z.array(z.object({
    weekNumber: z.number().int().min(1).max(4),
    focuses: z.array(weeklyFocusOutputSchema).min(3).max(5),
  })).min(1).max(4),
});

export const localAssistOutputSchema = z.object({
  suggestions: z.array(z.object({
    title: z.string().min(1).max(100),
    reason: z.string().max(200).optional(),
  })).min(1).max(10),
});
```

```typescript
// validators/index.ts
export * from './ai-output';
```

- [ ] **Step 12: 更新 src/index.ts**

```typescript
export * from './enums';
export * from './constants';
export * from './dto';
export * from './validators';
```

- [ ] **Step 13: 运行 typecheck**

Run: `cd packages/shared && pnpm typecheck`
Expected: 无错误

- [ ] **Step 14: Commit**

```bash
git add packages/shared/
git commit -m "feat: add shared DTOs, Zod validators for AI output"
```

### Task A4: 契约冻结 — 数据 / AI / 同步 / Worker 边界

**Purpose:** 这是并行开发的闸门任务。A4 完成前，B/C/D/E 只能做环境初始化，不能实现依赖共享 DTO、AI 输出或同步协议的业务逻辑。

**Files:**
- Modify: `packages/shared/src/dto/ai.ts`
- Modify: `packages/shared/src/dto/sync.ts`
- Modify: `packages/shared/src/validators/ai-output.ts`
- Create: `packages/shared/src/contracts/tables.ts`
- Create: `packages/shared/src/contracts/ai-confirmation.ts`
- Create: `packages/shared/src/contracts/index.ts`
- Modify: `packages/shared/src/index.ts`
- Modify: `docs/superpowers/plans/2026-04-29-parallel-mvp-implementation.md`

- [ ] **Step 1: 创建业务表名契约**

```typescript
// packages/shared/src/contracts/tables.ts
export const SYNC_TABLES = [
  'visions',
  'annual_objectives',
  'quarter_goals',
  'month_goals',
  'month_plans',
  'week_plans',
  'weekly_focuses',
  'todos',
  'energy_entries',
  'weekly_settlements',
  'tree_fruits',
  'quarter_honors',
  'ai_generations',
] as const;

export type SyncTableName = (typeof SYNC_TABLES)[number];
```

- [ ] **Step 2: 创建 AI 确认落库契约**

AI confirm 不允许 AiModule 直接写正式业务表。Confirm 请求必须携带 `target`，由对应业务模块事务落库。

```typescript
// packages/shared/src/contracts/ai-confirmation.ts
import { AiScenario } from '../enums';

export type AiConfirmationTarget =
  | 'vision'
  | 'annual_objective'
  | 'quarter_goals'
  | 'month_goals'
  | 'month_plan'
  | 'week_plan'
  | 'todos';

export interface AiConfirmationContract {
  generationId: string;
  scenario: AiScenario;
  target: AiConfirmationTarget;
  contextVersion: string;
  edits?: Record<string, unknown>;
}
```

- [ ] **Step 3: 收紧 sync DTO**

`tableName` 使用 `SyncTableName`，`/sync/pull` 使用 POST body，不用 GET query 承载水位。

```typescript
// packages/shared/src/dto/sync.ts
import { SyncTableName } from '../contracts';

export interface SyncPushItem {
  tableName: SyncTableName;
  localId: string;
  remoteId: string | null;
  operation: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  version: number;
}
```

- [ ] **Step 4: 确认 7 个 AI 场景都有 Zod schema**

必须包含：
- `quickPlanOutputSchema`
- `annualOkrOutputSchema`
- `quarterOkrOutputSchema`
- `fourWeekCommitmentsOutputSchema`
- `weeklyFocusToTodosOutputSchema`
- `replanFutureWeeksOutputSchema`
- `localAssistOutputSchema`

- [ ] **Step 5: 导出 contracts**

```typescript
// packages/shared/src/contracts/index.ts
export * from './tables';
export * from './ai-confirmation';
```

```typescript
// packages/shared/src/index.ts
export * from './enums';
export * from './constants';
export * from './dto';
export * from './validators';
export * from './contracts';
```

- [ ] **Step 6: 运行验证**

Run: `pnpm --filter @newme/shared typecheck`

Expected: 无错误

- [ ] **Step 7: Commit**

```bash
git add packages/shared/ docs/superpowers/plans/2026-04-29-parallel-mvp-implementation.md
git commit -m "chore: freeze shared contracts for parallel workers"
```

---

## Track B: 后端 — NestJS API

**Worker owned paths:** `apps/api/**`

**执行顺序约束：**
- B1 → B2 → B12 必须在 Week 1 集成点前完成，确保 API 能启动且 `/health` 可检查。
- B3-B11 可以在 B12 后继续推进。
- Track B 拥有 `apps/api/prisma/schema.prisma`。Track D 不修改 Prisma schema。

### Task B1: 初始化 NestJS 项目

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/tsconfig.build.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/app.module.spec.ts`
- Create: `apps/api/.env.example`

**实际执行补充：** B1 增加 `AppModule` smoke test，用于满足测试先行；先确认测试因 `./app.module` 缺失失败，再实现 `AppModule` 与启动入口。

- [x] **Step 1: 创建 apps/api 目录并初始化**

Run: `mkdir -p apps/api/src`

- [x] **Step 2: 创建 package.json**

```json
{
  "name": "@newme/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "lint": "eslint src/ --ext .ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@nestjs/common": "^10.4.0",
    "@nestjs/core": "^10.4.0",
    "@nestjs/platform-express": "^10.4.0",
    "@nestjs/config": "^3.3.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@prisma/client": "^6.5.0",
    "@newme/shared": "workspace:*",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "zod": "^3.24.0",
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.0",
    "@nestjs/testing": "^10.4.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@types/passport-jwt": "^4.0.1",
    "@types/bcrypt": "^5.0.2",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.0",
    "typescript": "^5.7.0",
    "prisma": "^6.5.0"
  }
}
```

- [x] **Step 3: 创建 tsconfig.json 和 tsconfig.build.json**

```json
// tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "CommonJS",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src"]
}
```

```json
// tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "test", "**/*.spec.ts"]
}
```

- [x] **Step 4: 创建 nest-cli.json**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "tsConfigPath": "tsconfig.build.json"
  }
}
```

- [x] **Step 5: 创建 .env.example**

```text
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://newme:newme@localhost:5432/newme_dev
JWT_SECRET=dev-secret-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
AI_PROVIDER=openai
AI_API_KEY=sk-xxx
AI_MODEL=gpt-4o
```

- [x] **Step 6: 创建 src/main.ts**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
```

- [x] **Step 7: 创建 src/app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
```

- [x] **Step 8: 安装依赖并验证构建**

Run: `cd apps/api && pnpm install && pnpm build`
Expected: 构建成功

- [x] **Step 9: Commit**

```bash
git add apps/api/
git commit -m "feat: init NestJS API project"
```

### Task B2: Prisma Schema + 数据库基础

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/src/prisma/prisma.module.ts`
- Create: `apps/api/src/prisma/prisma.service.ts`
- Modify: `apps/api/src/app.module.ts`

- [x] **Step 1: 创建 prisma/schema.prisma**

完整 schema 包含所有核心实体：users, visions, annual_objectives, quarters, quarter_goals, month_goals, goal_classifications, month_plans, week_plans, weekly_focuses, todos, energy_entries, weekly_settlements, tree_fruits, quarter_honors, ai_generations, sync_devices, refresh_tokens, push_tokens。

每个 model 包含 id (uuid), userId, createdAt, updatedAt, deletedAt, source, version 等基础字段。具体字段参照 `04-数据与AI架构.md` 的实体定义。

- [x] **Step 2: 创建 PrismaService**

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

- [x] **Step 3: 创建 PrismaModule**

```typescript
// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [x] **Step 4: 注册 PrismaModule 到 AppModule**

- [x] **Step 5: 运行 prisma migrate dev 创建初始迁移**

Run: `cd apps/api && npx prisma migrate dev --name init`
Expected: 迁移成功，数据库表创建

- [x] **Step 6: Commit**

```bash
git add apps/api/prisma/ apps/api/src/prisma/
git commit -m "feat: add Prisma schema with all core entities"
```

### Task B3: Auth 模块 — 登录 + JWT

**Files:**
- Create: `apps/api/src/modules/auth/auth.module.ts`
- Create: `apps/api/src/modules/auth/auth.controller.ts`
- Create: `apps/api/src/modules/auth/auth.service.ts`
- Create: `apps/api/src/modules/auth/jwt.strategy.ts`
- Create: `apps/api/src/modules/auth/jwt-auth.guard.ts`
- Create: `apps/api/src/modules/auth/dto/login.dto.ts`
- Create: `apps/api/src/modules/auth/tests/auth.service.spec.ts`
- Modify: `apps/api/src/app.module.ts`

- [x] **Step 1: 写 AuthService 的测试**

测试登录流程：验证码校验、JWT 签发、Refresh Token 生成和轮换。

- [x] **Step 2: 运行测试确认失败**

Run: `cd apps/api && pnpm test -- auth.service.spec`
Expected: FAIL

- [x] **Step 3: 实现 AuthService**

包含：sendVerificationCode, verifyCode, login, refreshTokens, revokeAllTokens。
Access Token: JWT 15 分钟。Refresh Token: 随机字符串 30 天，存 refresh_tokens 表。

- [x] **Step 4: 实现 JwtStrategy 和 JwtAuthGuard**

- [x] **Step 5: 实现 AuthController**

路由：POST /auth/login, POST /auth/refresh, POST /auth/logout

- [x] **Step 6: 运行测试确认通过**

Run: `cd apps/api && pnpm test -- auth.service.spec`
Expected: PASS

- [x] **Step 7: Commit**

```bash
git add apps/api/src/modules/auth/
git commit -m "feat: add auth module with JWT + refresh token rotation"
```

### Task B4: Users 模块

**Files:**
- Create: `apps/api/src/modules/users/users.module.ts`
- Create: `apps/api/src/modules/users/users.controller.ts`
- Create: `apps/api/src/modules/users/users.service.ts`
- Create: `apps/api/src/modules/users/tests/users.service.spec.ts`

- [x] **Step 1: 写测试 → 实现 → 验证**

GET /me 返回 UserContext（userId, phone, timezone, currentWeekId, currentQuarterId, hasCompletedOnboarding）。

- [x] **Step 2: Commit**

```bash
git commit -m "feat: add users module with /me endpoint"
```

### Task B5: Goals 模块 — 愿景 + 年/季/月目标

**Files:**
- Create: `apps/api/src/modules/goals/goals.module.ts`
- Create: `apps/api/src/modules/goals/goals.controller.ts`
- Create: `apps/api/src/modules/goals/goals.service.ts`
- Create: `apps/api/src/modules/goals/tests/goals.service.spec.ts`

- [x] **Step 1: 写测试 → 实现 → 验证**

路由：
- PUT /goals/vision — 创建/更新愿景
- POST /goals/quarters/:quarterId/goals — 设置季度目标
- POST /goals/months/:monthId/goals — 设置月目标
- GET /goals/current — 获取当前规划概览

支持手动路径：各层级可独立存在，外键允许 null。

- [x] **Step 2: Commit**

```bash
git commit -m "feat: add goals module with vision, quarter, month goals"
```

### Task B6: Plans 模块 — 月计划 + 本周重点

**Files:**
- Create: `apps/api/src/modules/plans/plans.module.ts`
- Create: `apps/api/src/modules/plans/plans.controller.ts`
- Create: `apps/api/src/modules/plans/plans.service.ts`
- Create: `apps/api/src/modules/plans/tests/plans.service.spec.ts`

- [x] **Step 1: 写测试 → 实现 → 验证**

路由：
- GET /plans/weeks/:weekId/focuses — 获取本周重点
- PUT /plans/weeks/:weekId/focuses — 更新本周重点（标记旧 AI 建议失效）

- [x] **Step 2: Commit**

```bash
git commit -m "feat: add plans module with weekly focuses"
```

### Task B7: Todos 模块

**Files:**
- Create: `apps/api/src/modules/todos/todos.module.ts`
- Create: `apps/api/src/modules/todos/todos.controller.ts`
- Create: `apps/api/src/modules/todos/todos.service.ts`
- Create: `apps/api/src/modules/todos/tests/todos.service.spec.ts`

- [x] **Step 1: 写测试 → 实现 → 验证**

路由：
- GET /todos/today — 获取今日任务
- POST /todos — 创建任务
- PATCH /todos/:id — 更新任务
- DELETE /todos/:id — 软删除任务

- [x] **Step 2: Commit**

```bash
git commit -m "feat: add todos module with CRUD"
```

### Task B8: Energy 模块

**Files:**
- Create: `apps/api/src/modules/energy/energy.module.ts`
- Create: `apps/api/src/modules/energy/energy.controller.ts`
- Create: `apps/api/src/modules/energy/energy.service.ts`
- Create: `apps/api/src/modules/energy/tests/energy.service.spec.ts`

- [x] **Step 1: 写测试 → 实现 → 验证**

路由：
- PUT /energy/days/:date — 记录今日能量（当天可多次修改）
- GET /energy/weeks/:weekId — 获取本周能量（含每日记录和均值）

计算规则：本周累计 = 已记录每日能量之和 / 已记录天数

- [x] **Step 2: Commit**

```bash
git commit -m "feat: add energy module with daily recording and weekly summary"
```

### Task B9: Settlement 模块 — 周结算 + 果实

**Files:**
- Create: `apps/api/src/modules/settlements/settlements.module.ts`
- Create: `apps/api/src/modules/settlements/settlements.controller.ts`
- Create: `apps/api/src/modules/settlements/settlements.service.ts`
- Create: `apps/api/src/modules/settlements/tests/settlements.service.spec.ts`

- [x] **Step 1: 写测试 → 实现 → 验证**

路由：
- POST /settlements/weeks/:weekId — 创建周结算

事务逻辑：
1. 读取本周每日能量和任务完成情况
2. 计算建议周结果（本周能量均值）
3. 用户确认最终分数和感悟
4. 生成结算快照（snapshotJson）
5. 创建 TreeFruit
6. 检查季度是否完成，若完成则计算季度均值和荣誉

实现说明：当前 B9 已完成周结算事务、结算快照和 TreeFruit 生成；季度完成检测与荣誉生成不在本次 B9 提交中硬猜 `weekId`，后续由 B10 Tree/季度结算能力基于更明确的季度边界补齐。

- [x] **Step 2: Commit**

```bash
git commit -m "feat: add settlement module with weekly settlement and fruit generation"
```

### Task B10: Tree 模块

**Files:**
- Create: `apps/api/src/modules/tree/tree.module.ts`
- Create: `apps/api/src/modules/tree/tree.controller.ts`
- Create: `apps/api/src/modules/tree/tree.service.ts`
- Create: `apps/api/src/modules/tree/tests/tree.service.spec.ts`

- [x] **Step 1: 写测试 → 实现 → 验证**

路由：
- GET /tree/years/:year — 获取成长树（树阶段、果实、荣誉）

树阶段由当前季度决定（Q1-Q4）。荣誉层只增不减。

- [x] **Step 2: Commit**

```bash
git commit -m "feat: add tree module with growth tree and honors"
```

### Task B11: Sync 模块

**Files:**
- Create: `apps/api/src/modules/sync/sync.module.ts`
- Create: `apps/api/src/modules/sync/sync.controller.ts`
- Create: `apps/api/src/modules/sync/sync.service.ts`
- Create: `apps/api/src/modules/sync/tests/sync.service.spec.ts`

- [ ] **Step 1: 写测试 → 实现 → 验证**

路由：
- POST /sync/push — 端侧脏数据推送（批量，逐条返回结果）
- POST /sync/pull — 按水位拉取远端变更

冲突解决：版本号比较，服务端版本大的赢。批量推送部分失败返回逐条结果。

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add sync module with push/pull and conflict resolution"
```

### Task B12: 全局错误处理 + 健康检查（Week 1 必做闸门）

**执行提示：** 虽然编号在 B11 之后，但后端 worker 必须在完成 B2 后立即执行 B12，再继续 B3-B11。集成点 1 依赖 `/health`。

**Files:**
- Create: `apps/api/src/common/filters/http-exception.filter.ts`
- Create: `apps/api/src/common/interceptors/request-id.interceptor.ts`
- Create: `apps/api/src/health/health.controller.ts`

- [x] **Step 1: 实现统一错误响应格式**

```json
{ "code": "ERROR_CODE", "message": "用户友好文案", "requestId": "req_xxx" }
```

- [x] **Step 2: 实现健康检查 GET /health**

返回 API 状态、数据库连接、版本号。

- [x] **Step 3: Commit**

```bash
git commit -m "feat: add global error handling and health check"
```

---

## Track C: 前端 — React Native + Expo

**Worker owned paths:** `apps/mobile/app/**`, `apps/mobile/src/shared/**`, `apps/mobile/src/stores/**`, `apps/mobile/src/features/**`

**禁止修改:** `apps/mobile/src/db/**` 由 Track D 负责；`packages/shared/**` 由 Track A 负责。

### Task C1: 初始化 Expo 项目

**Files:**
- Create: `apps/mobile/` (Expo 项目)
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/tsconfig.json`

- [ ] **Step 1: 使用 create-expo-app 初始化**

Run: `cd apps && npx create-expo-app@latest mobile --template blank-typescript`

- [ ] **Step 2: 安装核心依赖**

Run:
```bash
cd apps/mobile
npx expo install expo-router expo-sqlite expo-secure-store expo-notifications
pnpm add zustand @tanstack/react-query react-native-reanimated react-native-gesture-handler react-native-safe-area-context
pnpm add @newme/shared@workspace:*
```

- [ ] **Step 3: 配置 expo-router 文件系统路由**

修改 app.json 添加 `"scheme": "newme"` 和 router 插件配置。

- [ ] **Step 4: 验证 App 启动**

Run: `cd apps/mobile && npx expo start`
Expected: Metro bundler 启动，App 可在模拟器中打开

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/
git commit -m "feat: init Expo project with core dependencies"
```

### Task C2: 导航结构 + 4 Tab 布局

**Files:**
- Create: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/energy.tsx`
- Create: `apps/mobile/app/(tabs)/todo.tsx`
- Create: `apps/mobile/app/(tabs)/plan.tsx`
- Create: `apps/mobile/app/(tabs)/tree.tsx`
- Create: `apps/mobile/app/onboarding/_layout.tsx`
- Create: `apps/mobile/app/onboarding/choose.tsx`
- Create: `apps/mobile/app/settlement/_layout.tsx`

- [ ] **Step 1: 创建根 _layout.tsx**

包含 QueryClientProvider、全局 SafeAreaProvider、导航容器。

- [ ] **Step 2: 创建 (tabs)/_layout.tsx**

4 个 tab：能量（首页）、清单、计划、成长树。使用深色主题配色。

- [ ] **Step 3: 创建各 tab 页面占位**

每个 tab 页面先放一个标题文本占位，后续任务填充真实内容。

- [ ] **Step 4: 创建 onboarding 和 settlement 路由组**

- [ ] **Step 5: 验证导航可切换**

在模拟器中验证 4 个 tab 可切换，onboarding 路由可访问。

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add 4-tab navigation and route structure"
```

### Task C3: 设计系统 — 主题 + 通用组件

**Files:**
- Create: `apps/mobile/src/shared/theme/colors.ts`
- Create: `apps/mobile/src/shared/theme/typography.ts`
- Create: `apps/mobile/src/shared/theme/spacing.ts`
- Create: `apps/mobile/src/shared/theme/index.ts`
- Create: `apps/mobile/src/shared/components/Button.tsx`
- Create: `apps/mobile/src/shared/components/Card.tsx`
- Create: `apps/mobile/src/shared/components/Input.tsx`
- Create: `apps/mobile/src/shared/components/LoadingOverlay.tsx`

- [ ] **Step 1: 创建颜色 token**

参照原型的深色玻璃质感：背景深色、青绿色能量反馈、琥珀色果实反馈。

```typescript
// colors.ts
export const colors = {
  background: '#0A0E1A',
  surface: 'rgba(255, 255, 255, 0.06)',
  surfaceHover: 'rgba(255, 255, 255, 0.10)',
  primary: '#00E5A0',
  primaryDim: 'rgba(0, 229, 160, 0.2)',
  accent: '#F5A623',
  accentDim: 'rgba(245, 166, 35, 0.2)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textTertiary: 'rgba(255, 255, 255, 0.4)',
  error: '#FF6B6B',
  border: 'rgba(255, 255, 255, 0.1)',
};
```

- [ ] **Step 2: 创建排版和间距 token**

- [ ] **Step 3: 创建通用 Button、Card、Input、LoadingOverlay 组件**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add design system with theme tokens and base components"
```

### Task C4: 状态管理 — Zustand Stores + React Query 配置

**Files:**
- Create: `apps/mobile/src/stores/onboarding.store.ts`
- Create: `apps/mobile/src/stores/auth.store.ts`
- Create: `apps/mobile/src/stores/sync.store.ts`
- Create: `apps/mobile/src/shared/api/client.ts`
- Create: `apps/mobile/src/shared/api/query-client.ts`

- [ ] **Step 1: 创建 API 客户端**

基于 fetch 封装，自动附加 JWT、处理 401 刷新、超时控制。

- [ ] **Step 2: 创建 React Query 配置**

- [ ] **Step 3: 创建 onboarding store**

管理冷启动三路径的多步骤状态：当前路径、每层输入、AI 草案、跳过标记。

- [ ] **Step 4: 创建 auth store**

管理 token 存储（expo-secure-store）、登录状态、用户上下文。

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add Zustand stores and React Query setup"
```

### Task C5: 冷启动 — 路径选择 + 手动 OKR 流程

**Files:**
- Create: `apps/mobile/app/onboarding/choose.tsx`
- Create: `apps/mobile/app/onboarding/quick.tsx`
- Create: `apps/mobile/app/onboarding/vision.tsx`
- Create: `apps/mobile/app/onboarding/manual/annual.tsx`
- Create: `apps/mobile/app/onboarding/manual/quarter.tsx`
- Create: `apps/mobile/app/onboarding/manual/month.tsx`
- Create: `apps/mobile/app/onboarding/manual/week.tsx`
- Create: `apps/mobile/app/onboarding/manual/today.tsx`
- Create: `apps/mobile/src/features/onboarding/components/PathCard.tsx`
- Create: `apps/mobile/src/features/onboarding/components/AiDraftView.tsx`
- Create: `apps/mobile/src/features/onboarding/components/ManualInput.tsx`
- Create: `apps/mobile/src/features/onboarding/hooks/useOnboarding.ts`

- [ ] **Step 1: 实现路径选择页**

三路径并列：深度愿景规划（推荐）、快速规划、手动创建 OKR。

- [ ] **Step 2: 实现手动 OKR 五层引导**

年目标 → 季度目标 → 本月目标 → 本周计划 → 今日 ToDo。
每层：继续（留空即跳过）、返回（保留内容）、AI 辅助（可选）。

- [ ] **Step 3: 实现快速规划流程**

季度目标输入 → AI 生成本周重点 + 今日清单 → 确认。

- [ ] **Step 4: 实现深度愿景规划流程**

愿景输入 → 认可 → 年度 OKR → 季度 OKR → 4 周承诺 → 天计划。
每层可返回、可重新生成、可编辑。

- [ ] **Step 5: 验证三条路径导航和状态保持**

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add cold start onboarding with 3 paths"
```

### Task C6: 能量页

**Files:**
- Modify: `apps/mobile/app/(tabs)/energy.tsx`
- Create: `apps/mobile/src/features/energy/components/EnergyOrb.tsx`
- Create: `apps/mobile/src/features/energy/components/WeeklyFocusPanel.tsx`
- Create: `apps/mobile/src/features/energy/components/EnergySlider.tsx`
- Create: `apps/mobile/src/features/energy/components/ConfirmButton.tsx`
- Create: `apps/mobile/src/features/energy/hooks/useEnergy.ts`

- [ ] **Step 1: 实现能量球组件（Skia 自绘）**

发光脉冲 + 气泡粒子。MVP 先实现基础发光效果，粒子后续优化。

- [ ] **Step 2: 实现本周重点概览面板**

展示 3-5 条本周重点。本周重点为空时隐藏面板。

- [ ] **Step 3: 实现能量滑条**

0-100 滑条，青色发光轨道。

- [ ] **Step 4: 实现确认按钮**

未查看清单时触发温和提醒。确认后播放充电动效。

- [ ] **Step 5: 组装能量页**

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add energy page with orb, slider, and weekly focus panel"
```

### Task C7: 清单页

**Files:**
- Modify: `apps/mobile/app/(tabs)/todo.tsx`
- Create: `apps/mobile/src/features/todo/components/TodoItem.tsx`
- Create: `apps/mobile/src/features/todo/components/TodoList.tsx`
- Create: `apps/mobile/src/features/todo/components/AddTodoInput.tsx`
- Create: `apps/mobile/src/features/todo/hooks/useTodos.ts`

- [ ] **Step 1: 实现 TodoItem（勾选、左滑删除）**

- [ ] **Step 2: 实现 TodoList + AddTodoInput**

- [ ] **Step 3: 实现顶部本周重点摘要**

- [ ] **Step 4: 组装清单页**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add todo page with CRUD and swipe delete"
```

### Task C8: 计划页

**Files:**
- Modify: `apps/mobile/app/(tabs)/plan.tsx`
- Create: `apps/mobile/src/features/plan/components/MonthView.tsx`
- Create: `apps/mobile/src/features/plan/components/YearView.tsx`
- Create: `apps/mobile/src/features/plan/components/EmptyLevel.tsx`
- Create: `apps/mobile/src/features/plan/hooks/usePlan.ts`

- [ ] **Step 1: 实现月计划按周视图**

最近 4 周，当前周高亮。

- [ ] **Step 2: 实现年计划按 Q 视图**

Q1-Q4 目标、阶段说明、进度。

- [ ] **Step 3: 实现空层级展示**

"暂未设置" + 补填入口。根据 source 显示不同动作。

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add plan page with month/year views"
```

### Task C9: 成长树页

**Files:**
- Modify: `apps/mobile/app/(tabs)/tree.tsx`
- Create: `apps/mobile/src/features/tree/components/GrowthTree.tsx`
- Create: `apps/mobile/src/features/tree/components/FruitCapsule.tsx`
- Create: `apps/mobile/src/features/tree/components/HonorBadge.tsx`
- Create: `apps/mobile/src/features/tree/hooks/useTree.ts`

- [ ] **Step 1: 实现成长树 Skia 自绘**

树主体按季度阶段变化（Q1 树苗 → Q4 完整）。MVP 先实现基础树形。

- [ ] **Step 2: 实现果实点击 → 时间胶囊**

- [ ] **Step 3: 实现荣誉层展示**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add growth tree page with fruits and honors"
```

### Task C10: 周结算流程

**Files:**
- Create: `apps/mobile/app/settlement/[weekId].tsx`
- Create: `apps/mobile/src/features/settlement/components/EnergyReview.tsx`
- Create: `apps/mobile/src/features/settlement/components/FocusReview.tsx`
- Create: `apps/mobile/src/features/settlement/components/ScoreAdjust.tsx`
- Create: `apps/mobile/src/features/settlement/components/ReflectionInput.tsx`
- Create: `apps/mobile/src/features/settlement/components/FruitAnimation.tsx`
- Create: `apps/mobile/src/features/settlement/hooks/useSettlement.ts`

- [ ] **Step 1: 实现周结算 7 步流程**

开场语 → 每日能量回顾 → 本周重点回顾 → 建议周结果 → 用户微调 → 周感悟 → 果实生成动画。

- [ ] **Step 2: 实现果实生成动画（reanimated）**

弹出、成形、亮起的序列动画。

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add weekly settlement flow with fruit animation"
```

---

## Track D: 本地数据层 — expo-sqlite

**Worker owned paths:** `apps/mobile/src/db/**`

**禁止修改:** `apps/api/prisma/**`、`apps/api/src/**`、`packages/shared/**`。Track D 只实现端侧 SQLite、本地 repository、sync queue 和同步引擎。

### Task D1: SQLite 初始化 + 迁移框架

**Files:**
- Create: `apps/mobile/src/db/database.ts`
- Create: `apps/mobile/src/db/migrations/index.ts`
- Create: `apps/mobile/src/db/migrations/v1.ts`

- [ ] **Step 1: 创建数据库初始化模块**

```typescript
// database.ts
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('newme.db');
  await runMigrations(db);
  return db;
}
```

- [ ] **Step 2: 创建迁移框架**

使用 PRAGMA user_version 管理版本。按版本号顺序执行迁移。迁移在事务中执行。

- [ ] **Step 3: 创建 v1 迁移 — 初始表结构**

创建所有本地表：local_goals, local_weekly_focuses, local_todos, local_energy_entries, local_settlements, local_tree_data, local_ai_drafts, sync_queue。

每条记录包含：id (UUID), remoteId, createdAt, updatedAt, deletedAt, syncStatus, version。

- [ ] **Step 4: 验证迁移执行**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add SQLite database with migration framework"
```

### Task D2: 本地数据 Repository 层

**Files:**
- Create: `apps/mobile/src/db/repositories/todo.repository.ts`
- Create: `apps/mobile/src/db/repositories/energy.repository.ts`
- Create: `apps/mobile/src/db/repositories/goal.repository.ts`
- Create: `apps/mobile/src/db/repositories/focus.repository.ts`
- Create: `apps/mobile/src/db/repositories/settlement.repository.ts`
- Create: `apps/mobile/src/db/repositories/sync-queue.repository.ts`

- [ ] **Step 1: 实现各 repository 的 CRUD 操作**

每个 repository 封装对应本地表的增删改查。写入时自动设置 syncStatus = 'pending' 并加入 sync_queue。

- [ ] **Step 2: 实现 sync-queue repository**

管理待同步队列：入队、出队、标记成功/失败、重试。

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add local SQLite repositories with sync queue"
```

### Task D3: 同步引擎

**Files:**
- Create: `apps/mobile/src/db/sync/sync-engine.ts`
- Create: `apps/mobile/src/db/sync/conflict-resolver.ts`

- [ ] **Step 1: 实现同步引擎**

网络可用时批量推送 sync_queue 中的变更到后端 /sync/push。处理返回的逐条结果。按水位从 /sync/pull 拉取远端变更。

- [ ] **Step 2: 实现冲突解决器**

版本号比较，服务端版本大的赢。结算数据以首次确认为准。

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add sync engine with conflict resolution"
```

---

## Track E: AI 编排层

**Worker owned paths:** `apps/api/src/modules/ai/**`

**禁止修改:** `packages/shared/**` 的 AI schema 由 Track A 冻结；业务表落库由 Track B 的领域模块负责。AiModule 只能保存/更新 `ai_generations`，不能直接写 goals/plans/todos 等正式业务表。

### Task E1: AI 模块基础架构

**Files:**
- Create: `apps/api/src/modules/ai/ai.module.ts`
- Create: `apps/api/src/modules/ai/ai.service.ts`
- Create: `apps/api/src/modules/ai/ai.controller.ts`
- Create: `apps/api/src/modules/ai/providers/provider-adapter.ts`
- Create: `apps/api/src/modules/ai/providers/openai.adapter.ts`
- Create: `apps/api/src/modules/ai/providers/deepseek.adapter.ts`
- Create: `apps/api/src/modules/ai/prompt/prompt-registry.ts`
- Create: `apps/api/src/modules/ai/output/output-validator.ts`
- Create: `apps/api/src/modules/ai/rate-limiter.ts`
- Create: `apps/api/src/modules/ai/circuit-breaker.ts`
- Create: `apps/api/src/modules/ai/tests/ai.service.spec.ts`

- [ ] **Step 1: 写 AiService 测试**

测试：场景调度、结构化输出校验、重试逻辑、频率限制、熔断。使用 mock provider。

- [ ] **Step 2: 运行测试确认失败**

- [ ] **Step 3: 实现 ProviderAdapter 接口**

```typescript
export interface ProviderAdapter {
  generate(prompt: string, options: GenerateOptions): Promise<string>;
}

export interface GenerateOptions {
  model: string;
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
}
```

- [ ] **Step 4: 实现 OpenAI 和 DeepSeek adapter**

- [ ] **Step 5: 实现 PromptRegistry**

按 scenario + version 管理 prompt 模板。

- [ ] **Step 6: 实现 OutputValidator**

使用 @newme/shared 的 Zod schema 校验 AI 输出。

- [ ] **Step 7: 实现 RateLimiter**

内存计数器，按 userId + scenario 维度。每分钟 3 次/场景，每小时 30 次/全局。

- [ ] **Step 8: 实现 CircuitBreaker**

滑动窗口 10 分钟内 5 次失败触发熔断，暂停 5 分钟。

- [ ] **Step 9: 实现 AiService**

整合以上组件：场景调度 → 频率检查 → 熔断检查 → prompt 构造 → provider 调用 → 输出校验 → 重试 → 记录。

- [ ] **Step 10: 实现 AiController**

路由：
- POST /ai/generations — 生成 AI 草案
- POST /ai/generations/:id/confirm — 确认草案状态，并把确认 payload 交给对应业务模块事务落库
- POST /ai/assist — 局部 AI 辅助

确认约束：
1. 请求必须符合 `AiConfirmationContract`。
2. AiService 校验 generation、scenario、contextVersion 和 schema。
3. 正式业务写入委托给 Goals/Plans/Todos 等领域 service。
4. 不允许 AI 草案自动覆盖用户已编辑内容。

- [ ] **Step 11: 运行测试确认通过**

- [ ] **Step 12: Commit**

```bash
git commit -m "feat: add AI module with provider abstraction, rate limiting, circuit breaker"
```

### Task E2: Prompt 模板 — 7 个 AI 场景

**Files:**
- Create: `apps/api/src/modules/ai/prompt/templates/quick-quarter-plan.ts`
- Create: `apps/api/src/modules/ai/prompt/templates/vision-to-annual-okr.ts`
- Create: `apps/api/src/modules/ai/prompt/templates/annual-to-quarter-okr.ts`
- Create: `apps/api/src/modules/ai/prompt/templates/quarter-to-four-weeks.ts`
- Create: `apps/api/src/modules/ai/prompt/templates/weekly-focus-to-todos.ts`
- Create: `apps/api/src/modules/ai/prompt/templates/replan-future-weeks.ts`
- Create: `apps/api/src/modules/ai/prompt/templates/manual-local-assist.ts`

- [ ] **Step 1: 实现 7 个场景的 prompt 模板**

每个模板包含：系统 prompt（角色设定 + 输出格式要求）、用户 prompt（上下文 + 输入）、修复 prompt（校验失败时的重试 prompt）。

输出格式严格对应 @newme/shared 的 Zod schema。

- [ ] **Step 2: 写集成测试验证 prompt + schema 匹配**

使用 mock provider 返回符合 schema 的输出，验证端到端流程。

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add prompt templates for all 7 AI scenarios"
```

---

## Track F: 集成 + 端到端验证

### Task F1: 前后端联调 — Auth 流程

**依赖:** B3 + C4 完成

- [ ] **Step 1: 前端登录页对接后端 /auth/login**
- [ ] **Step 2: 验证 JWT 自动附加和 401 刷新**
- [ ] **Step 3: Commit**

### Task F2: 前后端联调 — 冷启动规划

**依赖:** B5 + C5 + E1 + E2 完成

- [ ] **Step 1: 快速规划端到端：输入季度目标 → AI 生成 → 确认 → 写入**
- [ ] **Step 2: 深度愿景端到端：愿景 → 年度 OKR → 季度 OKR → 4 周承诺 → 天计划**
- [ ] **Step 3: 手动 OKR 端到端：五层引导 → 跳过 → 局部 AI 辅助**
- [ ] **Step 4: Commit**

### Task F3: 前后端联调 — 日常执行闭环

**依赖:** B6 + B7 + B8 + C6 + C7 完成

- [ ] **Step 1: 清单 CRUD 端到端**
- [ ] **Step 2: 能量记录端到端**
- [ ] **Step 3: 本周重点展示和更新**
- [ ] **Step 4: Commit**

### Task F4: 前后端联调 — 周结算 + 成长树

**依赖:** B9 + B10 + C9 + C10 完成

- [ ] **Step 1: 周结算端到端：能量回顾 → 建议分数 → 确认 → 果实生成**
- [ ] **Step 2: 成长树展示端到端：果实、时间胶囊、荣誉层**
- [ ] **Step 3: Commit**

### Task F5: 离线 + 同步联调

**依赖:** B11 + D1 + D2 + D3 完成

- [ ] **Step 1: 离线创建任务 → 恢复网络 → 自动同步**
- [ ] **Step 2: 离线记录能量 → 恢复网络 → 自动同步**
- [ ] **Step 3: 冲突场景验证**
- [ ] **Step 4: Commit**

### Task F6: Docker 部署 + 健康检查

**Files:**
- Create: `apps/api/Dockerfile`
- Create: `docker-compose.yml`
- Create: `nginx/default.conf`

- [ ] **Step 1: 创建 Dockerfile（多阶段构建）**
- [ ] **Step 2: 创建 docker-compose.yml（api + postgres + nginx）**
- [ ] **Step 3: 验证 docker compose up 启动成功**
- [ ] **Step 4: 验证 /health 返回正常**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add Docker deployment with compose and nginx"
```

### Task F7: 推送通知模块（Phase 2 optional，不阻塞 Week 2 MVP）

**范围说明：** 推送通知属于体验稳定版能力。只有当 F1-F6 全部稳定、且不会影响冷启动 → 日常执行 → 周结算 → 成长树闭环时，才允许提前启动。本任务不计入 Week 2 最终验收。

**Files:**
- Create: `apps/api/src/modules/notifications/notifications.module.ts`
- Create: `apps/api/src/modules/notifications/notifications.controller.ts`
- Create: `apps/api/src/modules/notifications/notifications.service.ts`
- Create: `apps/api/src/modules/notifications/tests/notifications.service.spec.ts`
- Create: `apps/mobile/src/features/notifications/hooks/useNotifications.ts`

- [ ] **Step 1: 写测试 → 实现后端 NotificationService**

管理推送令牌（push_tokens 表）、按场景调度推送、记录发送结果。
通过 Expo Push API 统一下发。

- [ ] **Step 2: 实现 NotificationsController**

路由：
- POST /notifications/tokens — 注册 Expo push token
- PUT /notifications/preferences — 用户开关推送场景

- [ ] **Step 3: 实现推送场景调度**

三个场景：每日能量提醒（20:00）、周结算引导（周日 10:00）、召回（3 天未打开）。
推送时间按用户时区计算。每天最多 1 条推送。

- [ ] **Step 4: 前端注册推送令牌**

App 启动时通过 expo-notifications 获取 push token，注册到后端。

- [ ] **Step 5: 实现 Deep Linking 路由映射**

推送通知携带路由参数：
- 每日能量提醒 → `/(tabs)/energy`
- 周结算引导 → `/settlement/current-week`
- 召回 → `/(tabs)/energy`

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add notification module with push scenarios and deep linking"
```

---

## 集成点时间线

### 集成点 1（Week 1 末）

**前置条件：** Track A (A1-A4) 全部完成，Track B (B1-B2+B12+B3-B8)、Track C (C1-C4)、Track D (D1-D2)、Track E (E1) 基本完成。

**验证项：**

- [ ] monorepo 构建通过（`pnpm -r typecheck`）
- [ ] 后端 API 可启动，/health 返回正常
- [ ] 前端 App 可启动，4 tab 导航正常
- [ ] 数据库迁移成功，核心表存在
- [ ] 本地 SQLite 初始化成功

### 集成点 2（Week 2 中）

**前置条件：** Track B (B1-B12) 完成，Track C (C5-C10)、Track D (D3)、Track E (E2) 完成。F7 不作为前置条件。

**验证项：**

- [ ] 冷启动三路径端到端可用
- [ ] 日常执行闭环（清单 + 能量）可用
- [ ] 周结算 → 果实生成可用
- [ ] 离线 → 同步可用
- [ ] AI 生成 → 确认 → 写入可用

### 最终验收（Week 2 末）

- [ ] 完整闭环：冷启动 → 日常执行 → 周结算 → 成长树
- [ ] 三条冷启动路径全部可用
- [ ] 手动路径空层级不阻断闭环
- [ ] Docker 部署可用
- [ ] 核心路径无崩溃
- [ ] F7 推送通知未完成时，不阻塞 MVP 验收；若提前完成，必须有独立验证记录

## 主控收口清单

主控对话在合并所有 worker 结果后执行：

- [ ] 检查 `git status`，确认没有未解释的跨轨道改动。
- [ ] 运行 `pnpm install`。
- [ ] 运行 `pnpm -r typecheck`。
- [ ] 运行后端测试：`pnpm --filter @newme/api test`。
- [ ] 运行前端可用性验证：启动 Expo，检查 4 tab 和关键页面。
- [ ] 运行数据库迁移验证：`pnpm --filter @newme/api prisma migrate dev` 或对应项目脚本。
- [ ] 运行 SQLite 初始化验证。
- [ ] 使用 `npx playwright` 对 `prototype/index.html` 做原型页面检查、截图、视觉验证，并与 Expo 客户端关键页面对照，确认移动端 UI 按终稿原型 1:1 还原；任何无法还原的差异都要记录原因并同步文档。
- [ ] 若实现与 `产品需求设计文档.md` 或架构文档不一致，按真实实现同步更新文档。
