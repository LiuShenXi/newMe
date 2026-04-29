# MVP 并行开发实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零搭建个人成长管理 App 的 MVP，跑通从冷启动规划到周结算的完整闭环，最大化并行开发效率。

**Architecture:** Monorepo（pnpm workspace）包含三个包：`packages/shared`（共享类型/枚举/常量）、`apps/api`（NestJS 后端）、`apps/mobile`（React Native + Expo 前端）。后端模块化单体，前端 feature-first 目录结构。AI 编排层模型无关，端侧 expo-sqlite 支持离线。

**Tech Stack:** React Native (Expo) · TypeScript · NestJS · PostgreSQL · Prisma · Zustand · React Query · expo-sqlite · expo-router · react-native-reanimated · @shopify/react-native-skia · Zod

---

## 并行轨道总览

本计划拆分为 **5 条并行轨道**，每条轨道可由独立的 agent/开发者执行。轨道之间通过 `packages/shared` 的类型契约解耦，在关键节点汇合集成。

```text
时间线（大致）：

Week 1:
  Track A: Monorepo + Shared 包 ──────────────────────┐
  Track B: 后端基础 + Auth + 核心业务模块 ─────────────┤
  Track C: 前端基础 + 导航 + 静态页面骨架 ─────────────┤
  Track D: 数据库 Schema + 本地 SQLite ────────────────┤
  Track E: AI 编排层 ─────────────────────────────────┘
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
| B: 后端 | A 的共享类型 | REST API、业务逻辑、数据持久化 |
| C: 前端 | A 的共享类型 | App UI、导航、交互 |
| D: 数据库 | A 的共享类型 | Prisma schema、SQLite 本地层 |
| E: AI 编排 | A 的共享类型、D 的 schema | AI 调用、prompt、结构化输出 |

**关键原则：Track A 必须最先完成（约 2-3 小时），之后 B/C/D/E 可完全并行。**

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

---

## Track B: 后端 — NestJS API

### Task B1: 初始化 NestJS 项目

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/tsconfig.build.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/.env.example`

- [ ] **Step 1: 创建 apps/api 目录并初始化**

Run: `mkdir -p apps/api/src`

- [ ] **Step 2: 创建 package.json**

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

- [ ] **Step 3: 创建 tsconfig.json 和 tsconfig.build.json**

```json
// tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
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

- [ ] **Step 4: 创建 nest-cli.json**

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

- [ ] **Step 5: 创建 .env.example**

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

- [ ] **Step 6: 创建 src/main.ts**

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

- [ ] **Step 7: 创建 src/app.module.ts**

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

- [ ] **Step 8: 安装依赖并验证构建**

Run: `cd apps/api && pnpm install && pnpm build`
Expected: 构建成功

- [ ] **Step 9: Commit**

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

- [ ] **Step 1: 创建 prisma/schema.prisma**

完整 schema 包含所有核心实体：users, visions, annual_objectives, quarters, quarter_goals, month_goals, month_plans, week_plans, weekly_focuses, todos, energy_entries, weekly_settlements, tree_fruits, quarter_honors, ai_generations, sync_devices, refresh_tokens, push_tokens。

每个 model 包含 id (uuid), userId, createdAt, updatedAt, deletedAt, source, version 等基础字段。具体字段参照 `04-数据与AI架构.md` 的实体定义。

- [ ] **Step 2: 创建 PrismaService**

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

- [ ] **Step 3: 创建 PrismaModule**

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

- [ ] **Step 4: 注册 PrismaModule 到 AppModule**

- [ ] **Step 5: 运行 prisma migrate dev 创建初始迁移**

Run: `cd apps/api && npx prisma migrate dev --name init`
Expected: 迁移成功，数据库表创建

- [ ] **Step 6: Commit**

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

- [ ] **Step 1: 写 AuthService 的测试**

测试登录流程：验证码校验、JWT 签发、Refresh Token 生成和轮换。

- [ ] **Step 2: 运行测试确认失败**

Run: `cd apps/api && pnpm test -- auth.service.spec`
Expected: FAIL

- [ ] **Step 3: 实现 AuthService**

包含：sendVerificationCode, verifyCode, login, refreshTokens, revokeAllTokens。
Access Token: JWT 15 分钟。Refresh Token: 随机字符串 30 天，存 refresh_tokens 表。

- [ ] **Step 4: 实现 JwtStrategy 和 JwtAuthGuard**

- [ ] **Step 5: 实现 AuthController**

路由：POST /auth/login, POST /auth/refresh, POST /auth/logout

- [ ] **Step 6: 运行测试确认通过**

Run: `cd apps/api && pnpm test -- auth.service.spec`
Expected: PASS

- [ ] **Step 7: Commit**

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

- [ ] **Step 1: 写测试 → 实现 → 验证**

GET /me 返回 UserContext（userId, phone, timezone, currentWeekId, currentQuarterId, hasCompletedOnboarding）。

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add users module with /me endpoint"
```

### Task B5: Goals 模块 — 愿景 + 年/季/月目标

**Files:**
- Create: `apps/api/src/modules/goals/goals.module.ts`
- Create: `apps/api/src/modules/goals/goals.controller.ts`
- Create: `apps/api/src/modules/goals/goals.service.ts`
- Create: `apps/api/src/modules/goals/tests/goals.service.spec.ts`

- [ ] **Step 1: 写测试 → 实现 → 验证**

路由：
- PUT /goals/vision — 创建/更新愿景
- POST /goals/quarters/:quarterId/goals — 设置季度目标
- POST /goals/months/:monthId/goals — 设置月目标
- GET /goals/current — 获取当前规划概览

支持手动路径：各层级可独立存在，外键允许 null。

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add goals module with vision, quarter, month goals"
```

### Task B6: Plans 模块 — 月计划 + 本周重点

**Files:**
- Create: `apps/api/src/modules/plans/plans.module.ts`
- Create: `apps/api/src/modules/plans/plans.controller.ts`
- Create: `apps/api/src/modules/plans/plans.service.ts`
- Create: `apps/api/src/modules/plans/tests/plans.service.spec.ts`

- [ ] **Step 1: 写测试 → 实现 → 验证**

路由：
- GET /plans/weeks/:weekId/focuses — 获取本周重点
- PUT /plans/weeks/:weekId/focuses — 更新本周重点（标记旧 AI 建议失效）

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add plans module with weekly focuses"
```

### Task B7: Todos 模块

**Files:**
- Create: `apps/api/src/modules/todos/todos.module.ts`
- Create: `apps/api/src/modules/todos/todos.controller.ts`
- Create: `apps/api/src/modules/todos/todos.service.ts`
- Create: `apps/api/src/modules/todos/tests/todos.service.spec.ts`

- [ ] **Step 1: 写测试 → 实现 → 验证**

路由：
- GET /todos/today — 获取今日任务
- POST /todos — 创建任务
- PATCH /todos/:id — 更新任务
- DELETE /todos/:id — 软删除任务

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add todos module with CRUD"
```

### Task B8: Energy 模块

**Files:**
- Create: `apps/api/src/modules/energy/energy.module.ts`
- Create: `apps/api/src/modules/energy/energy.controller.ts`
- Create: `apps/api/src/modules/energy/energy.service.ts`
- Create: `apps/api/src/modules/energy/tests/energy.service.spec.ts`

- [ ] **Step 1: 写测试 → 实现 → 验证**

路由：
- PUT /energy/days/:date — 记录今日能量（当天可多次修改）
- GET /energy/weeks/:weekId — 获取本周能量（含每日记录和均值）

计算规则：本周累计 = 已记录每日能量之和 / 已记录天数

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add energy module with daily recording and weekly summary"
```

### Task B9: Settlement 模块 — 周结算 + 果实

**Files:**
- Create: `apps/api/src/modules/settlements/settlements.module.ts`
- Create: `apps/api/src/modules/settlements/settlements.controller.ts`
- Create: `apps/api/src/modules/settlements/settlements.service.ts`
- Create: `apps/api/src/modules/settlements/tests/settlements.service.spec.ts`

- [ ] **Step 1: 写测试 → 实现 → 验证**

路由：
- POST /settlements/weeks/:weekId — 创建周结算

事务逻辑：
1. 读取本周每日能量和任务完成情况
2. 计算建议周结果（本周能量均值）
3. 用户确认最终分数和感悟
4. 生成结算快照（snapshotJson）
5. 创建 TreeFruit
6. 检查季度是否完成，若完成则计算季度均值和荣誉

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add settlement module with weekly settlement and fruit generation"
```

### Task B10: Tree 模块

**Files:**
- Create: `apps/api/src/modules/tree/tree.module.ts`
- Create: `apps/api/src/modules/tree/tree.controller.ts`
- Create: `apps/api/src/modules/tree/tree.service.ts`
- Create: `apps/api/src/modules/tree/tests/tree.service.spec.ts`

- [ ] **Step 1: 写测试 → 实现 → 验证**

路由：
- GET /tree/years/:year — 获取成长树（树阶段、果实、荣誉）

树阶段由当前季度决定（Q1-Q4）。荣誉层只增不减。

- [ ] **Step 2: Commit**

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
- GET /sync/pull — 按水位拉取远端变更

冲突解决：版本号比较，服务端版本大的赢。批量推送部分失败返回逐条结果。

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add sync module with push/pull and conflict resolution"
```

### Task B12: 全局错误处理 + 健康检查

**Files:**
- Create: `apps/api/src/common/filters/http-exception.filter.ts`
- Create: `apps/api/src/common/interceptors/request-id.interceptor.ts`
- Create: `apps/api/src/health/health.controller.ts`

- [ ] **Step 1: 实现统一错误响应格式**

```json
{ "code": "ERROR_CODE", "message": "用户友好文案", "requestId": "req_xxx" }
```

- [ ] **Step 2: 实现健康检查 GET /health**

返回 API 状态、数据库连接、版本号。

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add global error handling and health check"
```

---

## Track C: 前端 — React Native + Expo

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
- POST /ai/generations/:id/confirm — 确认草案
- POST /ai/assist — 局部 AI 辅助

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

### Task F7: 推送通知模块（阶段 2 可提前启动）

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

**前置条件：** Track A 全部完成，Track B (B1-B8)、Track C (C1-C4)、Track D (D1-D2)、Track E (E1) 基本完成。

**验证项：**

- [ ] monorepo 构建通过（`pnpm -r typecheck`）
- [ ] 后端 API 可启动，/health 返回正常
- [ ] 前端 App 可启动，4 tab 导航正常
- [ ] 数据库迁移成功，核心表存在
- [ ] 本地 SQLite 初始化成功

### 集成点 2（Week 2 中）

**前置条件：** Track B 全部完成，Track C (C5-C10)、Track D (D3)、Track E (E2) 完成。

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
