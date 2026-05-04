# MVP 并行开发进度交接日志

> Director/Worker 必须在每个小任务完成、遇到阻塞、准备收尾或上下文/额度可能不足时更新本文件。下次用户说“技术总监，请按照当前进度和计划文档继续开发”时，先读本文件，再检查 git 状态和计划文档。

## 当前总状态

- 当前批次：Batch 2（已完成）
- 当前阶段：MVP 后续开发计划已全部完成并合并回 `main`；F2/F4/AI provider/当前周上下文/F6 Docker/F7 推送通知均已完成，旧来源 worktree 已清理；下一步为发布前真机 smoke 与远端推送/发布流程
- 当前主控：main（领先 origin/main）
- 最近更新时间：2026-05-04
- 最近更新人：Codex

## 快速续跑入口

下次 Director 续跑时先执行：

```powershell
git status --short
git branch --show-current
git log --oneline -5
git worktree list
```

然后阅读：

1. `docs/superpowers/plans/2026-04-29-parallel-mvp-implementation.md`
2. `docs/architecture/00-技术架构总览.md`
3. `docs/architecture/04-数据与AI架构.md`
4. `docs/architecture/05-部署与运维方案.md`
5. `docs/architecture/06-技术风险与演进路线.md`
6. `产品需求设计文档.md`

## 任务状态看板

| Track/Task | 状态 | Owner/Branch | 最近 commit | 验证 | 备注 |
| --- | --- | --- | --- | --- | --- |
| A1 Monorepo 初始化 | DONE | feat/track-a-contract | dd46086 | pnpm install 通过 | Batch 0 |
| A2 Shared 枚举和常量 | DONE | feat/track-a-contract | 775d092 | pnpm --filter @newme/shared typecheck 通过 | Batch 0 |
| A3 Shared DTO 和 Zod Schema | DONE | feat/track-a-contract | 8539966 | pnpm --filter @newme/shared typecheck 通过 | Batch 0 |
| A4 契约冻结 | DONE | feat/track-a-contract | ede104e | shared typecheck + 契约 grep + pnpm -r typecheck 通过 | Batch 0 闸门已通过 |
| B1 API 初始化 | DONE | feat/track-b-api | 36994ca | pnpm --filter @newme/api test -- --runInBand；pnpm --filter @newme/api typecheck；pnpm --filter @newme/api build；pnpm -r typecheck 均通过 | A4 后已推进 |
| B2 Prisma Schema | DONE | feat/track-b-api | 78cd00d | prisma validate；prisma migrate dev；19 表存在性查询；api test/typecheck/build；pnpm -r typecheck 均通过 | Track B 独占 Prisma |
| B12 Health/Error | DONE | feat/track-b-api | b09dc70 | health controller RED/GREEN；api test/typecheck/build；pnpm -r typecheck；真实 /api/v1/health 验证均通过 | Week 1 必做闸门已通过 |
| B3 Auth | DONE | feat/track-b-auth -> main | fd9c1aa | auth.service RED/GREEN；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | 验证码为 MVP 进程内短期存储；Refresh Token 使用 SHA-256 哈希存储并轮换 |
| B4 Users | DONE | feat/track-b-users -> main | 0604318 | users.service RED/GREEN；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | `/me` 返回 shared UserContext；周/季度 ID 按用户时区计算 |
| B5 Goals | DONE | feat/track-b-goals -> main | 2ca2412 | goals.service RED/GREEN；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | 支持愿景 upsert、逻辑季度 ID 到 Quarter UUID、月目标独立创建、当前规划概览 |
| B6 Plans | DONE | feat/track-b-plans -> main | 16e3d3c | plans.service RED/GREEN；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | 获取有效本周重点；更新时确保 WeekPlan 存在、旧 AI 重点失效、新手动重点写入 |
| B7 Todos | DONE | feat/track-b-todos -> main | 71fdc0d | todos.service RED/GREEN；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | 今日清单查询、手动创建、用户隔离更新、软删除 |
| B8 Energy | DONE | feat/track-b-energy -> main | 956e0c8 | energy.service RED/GREEN；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | 每日能量 upsert；本周平均值只按已记录天数计算 |
| B9 Settlement | DONE | feat/track-b-settlements -> main | 657344b | settlements.service RED/GREEN；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | 周结算事务、建议分、快照和 TreeFruit 已完成；季度荣誉留给 B10/后续 |
| B10 Tree | DONE | feat/track-b-tree -> main | a687630 | tree.service RED/GREEN；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | 读取年度树阶段、果实和已有荣誉；不生成荣誉 |
| B11 Sync | DONE | feat/track-b-sync -> main | 21606c5 | sync.service RED/GREEN；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | MVP 级 push/pull、逐条结果、版本冲突；非字段级合并 |
| E1 AI 骨架 | DONE | feat/track-e-ai -> main | 4323f13 | ai.service RED/GREEN；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | provider 抽象、schema 校验、限流、熔断、生成记录；真实 provider 调用待环境配置 |
| E2 Prompt 模板 | DONE | feat/track-e-prompts -> main | 38455eb | prompt registry RED/GREEN；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | 7 个场景模板接入 PromptRegistry；示例输出与 shared schema 匹配 |
| F2 Quick Plan Confirm Backend | DONE | feat/track-f2-cold-start | 本轮提交 | ai.service RED/GREEN；pnpm --filter @newme/shared typecheck；pnpm --filter @newme/api typecheck；pnpm --filter @newme/api test --runInBand 均通过 | 快速规划 AI 草案确认时按用户写入季度目标、WeekPlan、WeeklyFocus、今日 Todo，并标记 onboarding 完成；移动端真实调用待下一步 |
| F2 Quick Plan Mobile API | DONE | feat/track-f2-quick-mobile | 本轮提交 | Playwright RED/GREEN；pnpm --filter @newme/shared typecheck；pnpm --filter @newme/mobile typecheck；expo export；prototype-parity 均通过 | `onboarding/quick` 从占位草案改为真实调用 `/ai/generations` 与 `/ai/generations/:id/confirm`，确认后进入能量页；真实后端运行仍依赖 F1 Auth 登录态与 provider 配置 |
| C1 Mobile Shell 初始化 | DONE | feat/track-c-mobile-shell -> main | 4e85a49 / merge 5372cd9 | pnpm --filter @newme/mobile typecheck；pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web；短启动 expo start --web HTTP 200；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | Expo 项目、核心依赖、Web 验证依赖、最小 router 页面已完成 |
| C2 Navigation | DONE | feat/track-c-navigation -> main | c6729da / merge 9d8c73d | pnpm --filter @newme/mobile typecheck；pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web；npx playwright test 导航用例通过；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | 根 Stack、4 Tab、onboarding choose、settlement layout 已完成 |
| C3 Design System | DONE | feat/track-c-design-system -> main | f8efcc0 / merge a9382f7 | pnpm --filter @newme/mobile typecheck；pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | 深色主题 token、Button/Card/Input/LoadingOverlay 已完成 |
| C4 Mobile State | DONE | feat/track-c-state -> main | 1508f00 / merge 0961b89 | pnpm --filter @newme/mobile typecheck；pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | API client、React Query 配置、onboarding/auth/sync stores 已完成 |
| C5 Onboarding 三路径 | DONE | feat/track-c-onboarding -> main | 4df1237 / merge 38fab3c | pnpm -r typecheck；pnpm --filter @newme/mobile typecheck；pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web；npx playwright test .tmp/c5-onboarding.spec.js --reporter=line；main 上 api test/typecheck/build 均通过 | 三路径入口、快速/深度输入页、手动 OKR 五层流转完成；真实 AI 生成与确认写入留到 F2 |
| C6 Energy Page | DONE | feat/track-c-energy -> main | 604d2df / merge 1c58f93 | TDD Playwright RED/GREEN；pnpm --filter @newme/mobile typecheck；pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | 能量球、本周进度概览、今日能量条、确认提醒和注入反馈完成；Skia 粒子留体验增强 |
| C7 Todo Page | DONE | feat/track-c-todo -> main | 85177ee / merge f0d0f63 | TDD Playwright RED/GREEN；pnpm --filter @newme/mobile typecheck；pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | 本周重点标签、今日清单 CRUD、本周 7 天概览完成；本轮已补左滑露出垃圾桶 |
| C8 Plan Page | DONE | feat/track-c-plan -> main | 02d73b0 / merge 56fea2f | TDD Playwright RED/GREEN；pnpm --filter @newme/mobile typecheck；pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | 月/年双视图、4 周节点、Q1-Q4 卡片、手动空层级补全入口完成 |
| C5-C10 Prototype Primitive Parity | DONE | main | 本轮提交 | pnpm --filter @newme/mobile typecheck；pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web；npx playwright test apps/mobile/tests/prototype-parity.spec.js --reporter=line；npx playwright test apps/mobile/tests/prototype-visual-regression.spec.js --reporter=line 均通过 | 已纠正此前“视觉还原完成”过宽口径，新增 prototype 原语层，底栏、按钮、胶囊、modal、sheet、toast、输入框、树侧工具统一按 `prototype/index.html` 复刻；默认 Expo tabbar 已隐藏 |
| C9 Growth Tree Page | DONE | main | 本轮提交 | pnpm --filter @newme/mobile typecheck；npx playwright test apps/mobile/tests/prototype-parity.spec.js --reporter=line 通过 | View/CSS-style 基础树形、果实点击时间胶囊、荣誉/阶段/果实统计完成；Skia 留体验增强 |
| C10 Settlement UI + Prototype Interaction Parity | DONE | main | 本轮提交 | pnpm --filter @newme/mobile typecheck；npx playwright test apps/mobile/tests/prototype-parity.spec.js --reporter=line 均通过 | 不使用视觉工具；补能量提醒原型文案/跳清单/已查看状态、清单默认日期与左滑删除、计划默认 AI 来源与 AI 重规划状态机、成长树详情按钮、`/settlement` 周结算生成第 17 周果实并跳树 |
| F1 Auth 登录入口 | DONE | main | 本轮提交 | pnpm --filter @newme/mobile exec tsc --noEmit 通过 | 验证码登录页面 UI、useAuthLogin hook、SecureStore/localStorage 兼容层、Playwright E2E 测试 |
| F2 深度愿景后端确认链路 | DONE | main | 本轮提交 | pnpm --filter @newme/api exec jest ai.service.spec 6 个测试通过 | 愿景→年度 OKR、年度→季度 OKR、季度→四周承诺三个确认落库方法；DTO 扩展 |
| F3 日常执行页 API 接入 | DONE | main | 本轮提交 | pnpm --filter @newme/mobile exec tsc --noEmit 通过 | 清单 CRUD 全部接入 API（乐观更新）；能量页接入周能量读取+确认上报；Playwright E2E 测试 |
| F2 深度愿景移动端联调 | DONE | feat/f2-vision-mobile -> main | 558d3e7 / merge | pnpm --filter @newme/mobile exec tsc --noEmit；f2-vision-onboarding Playwright；集成回归均通过 | `onboarding/vision` 接入三段 AI 生成与确认：愿景→年度 OKR→季度 OKR→四周承诺，确认后进入能量页 |
| F4 计划页 API 接入 | DONE | feat/f4-plan-api -> main | d03a6c2 + 4310e4f / merge | pnpm --filter @newme/mobile exec tsc --noEmit；f4-plan-api Playwright；prototype-parity 回归均通过 | 月视图加载/更新真实本周重点，年视图加载 `/goals/current`；修复 API 失败时原型 AI fallback 被误切到手动来源的问题 |
| F5 SQLite+Sync 运行态联调 | DONE_WITH_CONCERNS | feat/f5-sync-runtime -> main | 2f88182 / merge | pnpm --filter @newme/mobile exec tsc --noEmit；node apps/mobile/tests/f5-sync-runtime.spec.js；pnpm -r typecheck 均通过 | 新增运行态 helper 覆盖 SQLite open、离线 Todo/能量入队、push/pull 与冲突 summary；真实 Expo 设备 SQLite 文件库 smoke 仍需发布前补跑 |
| F2 手动 OKR 局部 AI 辅助 | DONE | feat/mvp-final-integration-direct | 4c88b84 / merge | mobile tsc 通过；f2-manual-ai-assist Playwright 通过；总回归 14 passed | `manual_local_assist` 接入移动端手动路径，建议只回填当前层级 |
| F4 周结算 + 成长树真实 API | DONE | feat/mvp-final-integration-direct | c12eeca / merge | mobile tsc 通过；f4-settlement-tree-api Playwright 通过；总回归 14 passed | `/settlement` 调后端结算接口，成长树读取 `/tree/years/:year`；API 失败保留原型 fallback |
| AI Provider 本地优先降级 | DONE | feat/mvp-final-integration-direct | a29fb7e / 65e78f7 | openai.adapter.spec 3 个用例通过；api 全量测试通过；api typecheck 通过 | 本地 OpenAI-compatible 服务优先，失败降级 GLM；key 仅环境变量；Nest DI 可无参数实例化 |
| 当前周上下文统一 | DONE | feat/mvp-final-integration-direct | 60e82d1 | planning-context node test 通过；mobile typecheck 通过 | 移动端优先用 `/me.currentWeekId/currentQuarterId`，无用户态用本地日期 fallback |
| F6 Docker 配置 | DONE | feat/mvp-final-integration-direct | 14e07fd + 本轮收口提交 | docker compose config 通过；docker compose up --build -d 通过；`http://localhost:8080/api/v1/health` 返回 ok/database connected | Dockerfile/compose/nginx 已完成；容器内先 build shared，再 build API，并通过 nginx 精确转发 health |
| F7 推送通知模块 | DONE | feat/mvp-final-integration-direct | b201ce2 | notifications.service 7 个单测通过；API 全量测试通过；mobile typecheck/Expo export 通过；notification routing node smoke 通过 | Expo token 注册、偏好开关、每日能量、周结算、3 天召回、Deep Link 路由映射已完成；真实 APNs/FCM 凭据仍需发布配置 |
| D1 SQLite 初始化与迁移 | DONE | feat/track-d-sqlite -> main | c6e98bb / merge 1f61a81 | pnpm --filter @newme/mobile typecheck；pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | 已建 getDatabase/runMigrations/v1 初始表；真实 DB open smoke 留到 D2 |
| D2 SQLite Repository 层 | DONE | feat/track-d-repositories -> main | 51b7cb8 / merge bf212c6 | pnpm --filter @newme/mobile typecheck；pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | Todo/Energy/Goal/Focus/Settlement/sync_queue repository 已完成；运行态 DB smoke 待 App 触发 |
| D3 Sync Engine | DONE | feat/track-d-sync-engine -> main | 8949e6d / merge 889b700 | pnpm --filter @newme/mobile typecheck；pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web；main 上 api test/typecheck/build；pnpm -r typecheck 均通过 | push/pull 引擎和版本冲突解析完成；真实 API/DB 联调待 F5 |

## 未提交改动记录

当前已知未提交改动：2026-05-04 本地联调收口改动已准备提交，提交后主工作区应保持干净。验证产物已清理。

## 最近工作记录

### 2026-04-29

- 技术总监正式启动开发：已在 main 提交文档基线与 `.gitignore` worktree 忽略规则，并创建 `.worktrees/track-a-contract` / `feat/track-a-contract`。
- A1 Monorepo 初始化完成：创建 root package、pnpm workspace、Node 版本、TypeScript 基础配置，扩展 `.gitignore`，并运行 `pnpm install` 通过。
- A2 Shared 枚举和常量完成：创建 `@newme/shared` 包、目标/来源/同步/AI 场景枚举、核心常量和根导出，并运行 shared typecheck 通过。
- A3 Shared DTO 和 Zod Schema 完成：安装 `zod`，补齐 auth/goal/plan/todo/energy/settlement/tree/ai/sync DTO，以及 7 个 AI 输出 schema，并运行 shared typecheck 通过。
- A4 契约冻结完成：新增同步表名契约、AI 确认落库契约，收紧 sync DTO 的 `tableName` 类型，让 confirm 请求携带确认契约，并确认 7 个 AI 输出 schema 均存在。
- Batch 0 收口验证完成：运行 `pnpm -r typecheck` 通过，Track A 可作为 B/C/D/E 并行开发前置契约基线。
- 主控已将 `feat/track-a-contract` 合并到 `main`，在主目录运行 `pnpm install` 后，`pnpm -r typecheck` 通过。
- 创建 `.worktrees/track-b-api` / `feat/track-b-api`，启动 Batch 1 Track B。
- B1 API 初始化完成：创建 NestJS API package、tsconfig、nest-cli、环境变量示例、`AppModule`、`main.ts`，并补充 AppModule smoke test。
- B1 TDD 记录：先运行 `pnpm --filter @newme/api test -- --runInBand`，确认因 `Cannot find module './app.module'` 失败；实现后测试通过。
- B1 验证完成：`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build` 均通过。
- B2 Prisma Schema 完成：创建 `apps/api/prisma/schema.prisma`、初始迁移、`PrismaService`、`PrismaModule`，并注册到 `AppModule`。
- B2 TDD 记录：先运行 `pnpm --filter @newme/api test -- prisma.module.spec --runInBand`，确认因 `prisma.module` / `prisma.service` 缺失失败；实现后测试通过。
- B2 迁移验证：使用临时 Docker Postgres `newme-b2-postgres`（`localhost:55432`）运行 `prisma migrate dev --name init` 成功，查询确认 19 张核心表均存在。
- B2 收口验证：`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- B12 全局错误处理和健康检查完成：新增 `HttpExceptionFilter`、`RequestIdInterceptor`、`HealthController`，并在 `main.ts` 注册全局 filter/interceptor。
- B12 TDD 记录：先运行 `pnpm --filter @newme/api test -- health.controller.spec --runInBand`，确认因 `health.controller` 缺失失败；实现后测试通过。
- B12 运行态修正：真实启动 `node dist/main` 时发现 root tsconfig 的 ESNext 输出导致 Node 无法解析 `dist/app.module`，已在 `apps/api/tsconfig.json` 覆盖为 `CommonJS` + `node` module resolution，并同步更新计划文档。
- B12 HTTP 验证：使用 `DATABASE_URL=postgresql://newme:newme@localhost:55432/newme_dev` 和 `PORT=3300` 启动构建产物，请求 `http://127.0.0.1:3300/api/v1/health` 返回 `{"status":"ok","database":"connected","version":"0.1.0"}`。
- B12 收口验证：`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 主控已将 `feat/track-b-api` 合并到 `main`，合并后在主目录执行 `prisma generate`、`pnpm --filter @newme/api test -- --runInBand` 和 `pnpm -r typecheck` 均通过。
- 增强并行计划，加入 AI worker 必读、worktree、多批次并行、A4 契约冻结、Owned paths、B12 health 闸门、F7 optional、主控收口清单。
- 新增技术总监续跑协议：用户只需说“技术总监，请按照当前进度和计划文档继续开发”，Director 应自动检查进度并续跑。
- 新增额度保护收尾协议：小任务提交、定期更新本文件、额度不足时优先交接。
- 明确前端 UI 还原标准：移动客户端必须以 `prototype/index.html` 终稿静态交互原型为视觉与交互基准做 1:1 还原；已同步更新实施计划和 `产品需求设计文档.md`。
- 创建 `.worktrees/track-b-auth` / `feat/track-b-auth`，继续 Batch 1 Track B 的 B3 Auth。
- B3 Auth TDD 记录：先新增 `auth.service.spec.ts` 并运行 `pnpm --filter @newme/api test -- auth.service.spec --runInBand`，确认因缺少 `../auth.service` 失败；实现后 AuthService 测试通过。
- B3 Auth 实现完成：新增 `AuthModule`、`AuthController`、`AuthService`、`JwtStrategy`、`JwtAuthGuard`、登录/刷新 DTO，并注册到 `AppModule`。
- B3 Auth 行为范围：`POST /auth/code` 生成进程内 5 分钟验证码；`POST /auth/login` 校验验证码、创建/复用用户、签发 15 分钟 JWT 和 30 天 refresh token；`POST /auth/refresh` 校验并轮换 refresh token；`POST /auth/logout` 基于 JWT 吊销当前用户 refresh token。
- B3 Auth 收口验证：`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 主控已将 `feat/track-b-auth` 合并到 `main`；合并后在主目录执行 `pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 创建 `.worktrees/track-b-users` / `feat/track-b-users`，继续 Batch 1 Track B 的 B4 Users。
- B4 Users TDD 记录：先新增 `users.service.spec.ts` 并运行 `pnpm --filter @newme/api test -- users.service.spec --runInBand`，确认因缺少 `../users.service` 失败；实现后 UsersService 测试通过。
- B4 Users 实现完成：新增 `UsersModule`、`UsersController`、`UsersService`，并注册到 `AppModule`；`GET /me` 使用 `JwtAuthGuard` 返回当前用户上下文。
- B4 Users 行为范围：读取当前用户 id、手机号、时区、onboarding 状态；按用户时区计算 `currentWeekId`（如 `2026-W18`）和 `currentQuarterId`（如 `2026-Q2`）。
- B4 Users 收口验证：`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 主控已将 `feat/track-b-users` 合并到 `main`；合并后在主目录执行 `pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 创建 `.worktrees/track-b-goals` / `feat/track-b-goals`，继续 Batch 1 Track B 的 B5 Goals。
- B5 Goals TDD 记录：先新增 `goals.service.spec.ts` 并运行 `pnpm --filter @newme/api test -- goals.service.spec --runInBand`，确认因缺少 `../goals.service` 失败；实现后 GoalsService 测试通过。
- B5 Goals 实现完成：新增 `GoalsModule`、`GoalsController`、`GoalsService`，并注册到 `AppModule`。
- B5 Goals 行为范围：`PUT /goals/vision` 创建/更新当前愿景；`POST /goals/quarters/:quarterId/goals` 支持 `YYYY-Qn` 逻辑季度 ID 并自动 upsert Quarter；`POST /goals/months/:monthId/goals` 支持无上层目标时独立创建月目标；`GET /goals/current` 返回当前愿景、当前季度目标和当前月目标概览。
- B5 Goals 收口验证：`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 主控已将 `feat/track-b-goals` 合并到 `main`；合并后在主目录执行 `pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 创建 `.worktrees/track-b-plans` / `feat/track-b-plans`，继续 Batch 1 Track B 的 B6 Plans。
- B6 Plans TDD 记录：先新增 `plans.service.spec.ts` 并运行 `pnpm --filter @newme/api test -- plans.service.spec --runInBand`，确认因缺少 `../plans.service` 失败；实现后 PlansService 测试通过。
- B6 Plans 实现完成：新增 `PlansModule`、`PlansController`、`PlansService`，并注册到 `AppModule`。
- B6 Plans 行为范围：`GET /plans/weeks/:weekId/focuses` 返回当前有效本周重点；`PUT /plans/weeks/:weekId/focuses` 确保 WeekPlan 存在，标记旧 AI 重点为失效，并写入用户确认的新手动重点。
- B6 Plans 收口验证：`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 主控已将 `feat/track-b-plans` 合并到 `main`；合并后在主目录执行 `pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 创建 `.worktrees/track-b-todos` / `feat/track-b-todos`，继续 Batch 1 Track B 的 B7 Todos。
- B7 Todos TDD 记录：先新增 `todos.service.spec.ts` 并运行 `pnpm --filter @newme/api test -- todos.service.spec --runInBand`，确认因缺少 `../todos.service` 失败；实现后 TodosService 测试通过。
- B7 Todos 实现完成：新增 `TodosModule`、`TodosController`、`TodosService`，并注册到 `AppModule`。
- B7 Todos 行为范围：`GET /todos/today` 获取指定日期今日清单；`POST /todos` 创建手动任务；`PATCH /todos/:id` 用户隔离更新并标记 `userEdited`；`DELETE /todos/:id` 软删除任务。
- B7 Todos 收口验证：`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 主控已将 `feat/track-b-todos` 合并到 `main`；合并后在主目录执行 `pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 创建 `.worktrees/track-b-energy` / `feat/track-b-energy`，继续 Batch 1 Track B 的 B8 Energy。
- B8 Energy TDD 记录：先新增 `energy.service.spec.ts` 并运行 `pnpm --filter @newme/api test -- energy.service.spec --runInBand`，确认因缺少 `../energy.service` 失败；实现后 EnergyService 测试通过。
- B8 Energy 实现完成：新增 `EnergyModule`、`EnergyController`、`EnergyService`，并注册到 `AppModule`。
- B8 Energy 行为范围：`PUT /energy/days/:date` 按用户+日期 upsert 当日能量；`GET /energy/weeks/:weekId` 返回本周能量明细、已记录天数和平均值；平均值按已记录每日能量求均值，不按 7 天摊平。
- B8 Energy 收口验证：`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 主控已将 `feat/track-b-energy` 合并到 `main`；合并后在主目录执行 `pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 创建 `.worktrees/track-b-settlements` / `feat/track-b-settlements`，继续 Batch 1 Track B 的 B9 Settlement。
- B9 Settlement TDD 记录：先新增 `settlements.service.spec.ts` 并运行 `pnpm --filter @newme/api test -- settlements.service.spec --runInBand`，确认因缺少 `../settlements.service` 失败；实现后 SettlementsService 测试通过。
- B9 Settlement 实现完成：新增 `SettlementsModule`、`SettlementsController`、`SettlementsService`，并注册到 `AppModule`。
- B9 Settlement 行为范围：`POST /settlements/weeks/:weekId` 在事务中读取本周能量与任务，计算建议周结果，保存结算快照，创建 WeeklySettlement，并生成 TreeFruit。
- B9 Settlement 范围调整：季度完成检测与 QuarterHonor 生成未在 B9 中硬猜 `weekId` 实现，留给 B10 Tree/后续季度结算能力基于明确季度边界补齐。
- B9 Settlement 收口验证：`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 主控已将 `feat/track-b-settlements` 合并到 `main`；合并后在主目录执行 `pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 创建 `.worktrees/track-b-tree` / `feat/track-b-tree`，继续 Batch 1 Track B 的 B10 Tree。
- B10 Tree TDD 记录：先新增 `tree.service.spec.ts` 并运行 `pnpm --filter @newme/api test -- tree.service.spec --runInBand`，确认因缺少 `../tree.service` 失败；实现后 TreeService 测试通过。
- B10 Tree 实现完成：新增 `TreeModule`、`TreeController`、`TreeService`，并注册到 `AppModule`。
- B10 Tree 行为范围：`GET /tree/years/:year` 返回年度树阶段、该年果实列表和已有季度荣誉；树阶段按当前季度计算，荣誉只读取不生成。
- B10 Tree 收口验证：`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 主控已将 `feat/track-b-tree` 合并到 `main`；合并后在主目录执行 `pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 创建 `.worktrees/track-b-sync` / `feat/track-b-sync`，继续 Batch 1 Track B 的 B11 Sync。
- B11 Sync TDD 记录：先新增 `sync.service.spec.ts` 并运行 `pnpm --filter @newme/api test -- sync.service.spec --runInBand`，确认因缺少 `../sync.service` 失败；实现后 SyncService 测试通过。
- B11 Sync 实现完成：新增 `SyncModule`、`SyncController`、`SyncService`，并注册到 `AppModule`。
- B11 Sync 行为范围：`POST /sync/push` 按表名映射 Prisma delegate，逐条处理 create/update/delete，服务端版本大于客户端版本时返回 conflict；`POST /sync/pull` 按 `updatedAt > lastPulledAt` 拉取远端变更，软删除记录返回 delete 操作。
- B11 Sync 范围说明：当前为 MVP 级同步能力，不做字段级合并、操作日志回放或多设备复杂冲突合并。
- B11 Sync 收口验证：`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 主控已将 `feat/track-b-sync` 合并到 `main`；合并后在主目录执行 `pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 创建 `.worktrees/track-e-ai` / `feat/track-e-ai`，启动 Track E 的 E1 AI 骨架。
- E1 AI TDD 记录：先新增 `ai.service.spec.ts` 并运行 `pnpm --filter @newme/api test -- ai.service.spec --runInBand`，确认因缺少 AI 服务/限流/熔断/校验文件失败；实现后 AiService 测试通过。
- E1 AI 实现完成：新增 `AiModule`、`AiController`、`AiService`、ProviderAdapter、OpenAI/DeepSeek adapter 骨架、PromptRegistry、OutputValidator、RateLimiter、CircuitBreaker，并注册到 `AppModule`。
- E1 AI 行为范围：`POST /ai/generations` 走场景 prompt、provider 调用、JSON parse、shared Zod schema 校验、ai_generations 记录；同用户同场景每分钟 3 次限流；失败计入熔断；`POST /ai/generations/:id/confirm` 标记 confirmed；`POST /ai/assist` 走手动局部辅助场景。
- E1 AI 范围说明：OpenAI/DeepSeek adapter 当前为可替换骨架，未在无密钥环境里直接发起真实外部调用；完整 7 场景 prompt 模板留给 E2。
- E1 AI 收口验证：`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 主控已将 `feat/track-e-ai` 合并到 `main`；合并后在主目录执行 `pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 创建 `.worktrees/track-e-prompts` / `feat/track-e-prompts`，继续 Track E 的 E2 Prompt 模板。
- E2 Prompt TDD 记录：先新增 `prompt-registry.spec.ts` 并运行 `pnpm --filter @newme/api test -- prompt-registry.spec --runInBand`，确认现有 registry 缺少明确 JSON-only 约束；实现后测试通过。
- E2 Prompt 实现完成：新增 7 个场景 prompt 模板并接入 `PromptRegistry`：快速季度规划、愿景到年度 OKR、年度到季度 OKR、季度到 4 周承诺、本周重点到清单、后续周重规划、手动局部辅助。
- E2 Prompt 验证范围：每个模板包含 `scenario`、版本号、只输出 JSON、不要 Markdown 的结构化约束；示例输出全部通过 shared Zod schema。
- E2 Prompt 收口验证：`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 主控已将 `feat/track-e-prompts` 合并到 `main`；合并后在主目录执行 `pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck` 均通过。
- 创建 `.worktrees/track-c-mobile-shell` / `feat/track-c-mobile-shell`，启动 Track C 的 C1 Expo 初始化。
- C1 Expo 初始化完成：使用 `create-expo-app` 生成 `apps/mobile`，改包名为 `@newme/mobile`，接入 pnpm workspace，配置 `expo-router/entry`、`scheme: newme` 和 Expo 插件。
- C1 依赖范围：安装 `expo-router`、`expo-sqlite`、`expo-secure-store`、`expo-notifications`、`react-native-reanimated`、`react-native-gesture-handler`、`react-native-safe-area-context`、`zustand`、`@tanstack/react-query`、`@newme/shared@workspace:*`；为后续 Playwright/Expo Web 验证同步补齐 `react-native-web`、`react-dom`、`@expo/metro-runtime`。
- C1 最小路由：新增 `apps/mobile/app/index.tsx` 和 `apps/mobile/app/(tabs)/energy.tsx` 作为 Expo Router 可启动壳；正式 4 Tab、主题和状态管理留给 C2-C4。
- C1 调试记录：`pnpm -r typecheck` 初次失败，根因是本 worktree 重新安装依赖后 Prisma Client 生成物缺失；运行 `pnpm --filter @newme/api exec prisma generate --schema prisma/schema.prisma` 后 workspace typecheck 通过。
- C1 验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过；短启动 `expo start --web --port 19006 --non-interactive` 并请求 `http://127.0.0.1:19006` 返回 HTTP 200；清理启动进程和验证导出产物后，`pnpm -r typecheck` 通过。
- 主控已将 `feat/track-c-mobile-shell` 合并到 `main`；合并提交 `5372cd9`。合并后在主目录执行 `pnpm install`、`pnpm --filter @newme/api exec prisma generate --schema prisma/schema.prisma`、`pnpm --filter @newme/mobile typecheck`、`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck`、`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 均通过；验证导出产物已清理。
- 创建 `.worktrees/track-c-navigation` / `feat/track-c-navigation`，启动 Track C 的 C2 导航结构。
- C2 导航结构完成：新增 `apps/mobile/app/_layout.tsx`，用 `GestureHandlerRootView`、`SafeAreaProvider`、`QueryClientProvider` 包住 Expo Router Stack；新增 `(tabs)/_layout.tsx` 和能量/清单/计划/成长树 4 个 Tab；首页默认重定向到能量页。
- C2 路由组完成：新增 `onboarding/_layout.tsx`、`onboarding/choose.tsx`、`settlement/_layout.tsx`；onboarding choose 保留产品文档文案“你想怎样开始今年？”作为 C5 三路径入口占位。
- C2 验证工具调整：为后续稳定执行 `npx playwright test`，root devDependency 增加 `@playwright/test`；移动端增加 `@expo/vector-icons` 用于 Tab 图标。
- C2 验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过；启动 `expo start --web --port 19007 --non-interactive` 后运行 `npx playwright test .tmp/c2-navigation.spec.js --reporter=line`，1 个用例通过，覆盖 4 Tab 可见与切换、`/onboarding/choose` 可访问；清理临时产物后 `pnpm -r typecheck` 通过。
- 主控已将 `feat/track-c-navigation` 合并到 `main`；合并提交 `9d8c73d`。合并后在主目录执行 `pnpm install`、`pnpm --filter @newme/api exec prisma generate --schema prisma/schema.prisma`、`pnpm --filter @newme/mobile typecheck`、`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck`、`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web`、`npx playwright test .tmp/c2-navigation.spec.js --reporter=line` 均通过；验证导出产物和临时截图已清理。
- 创建 `.worktrees/track-c-design-system` / `feat/track-c-design-system`，启动 Track C 的 C3 设计系统。
- C3 主题 token 完成：新增 `colors`、`spacing/radii`、`typography` 和主题统一导出；颜色沿用计划中的深色背景、青绿色能量反馈、琥珀色果实反馈和玻璃态 surface/border。
- C3 基础组件完成：新增 `Button`、`Card`、`Input`、`LoadingOverlay` 和组件统一导出；Button 支持 primary/secondary/ghost、loading、disabled 和 icon 插槽。
- C3 验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`pnpm -r typecheck` 通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过；验证导出产物已清理。
- 主控已将 `feat/track-c-design-system` 合并到 `main`；合并提交 `a9382f7`。合并后在主目录执行 `pnpm --filter @newme/mobile typecheck`、`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck`、`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 均通过；验证导出产物已清理。
- 创建 `.worktrees/track-c-state` / `feat/track-c-state`，启动 Track C 的 C4 状态管理。
- C4 API/Query 基础完成：新增 `src/shared/api/client.ts`，支持 baseUrl 配置、JWT 自动附加、请求超时、401 refresh 重试和统一 ApiError；新增 `query-client.ts`，根布局改用共享 `queryClient`。
- C4 stores 完成：新增 `onboarding.store.ts` 管理三路径、层级输入、AI 草案和跳过层级；新增 `auth.store.ts` 管理 SecureStore token、水合、清会话、刷新 token 和 `/me` 加载；新增 `sync.store.ts` 管理在线状态、同步中、待同步数量、水位和错误。
- C4 调试记录：移动端 typecheck 初次因直接读取 `process.env` 缺少 Node 类型失败；已改为从 `globalThis.process?.env` 安全读取 `EXPO_PUBLIC_API_BASE_URL`，避免引入 Node 类型污染 RN。
- C4 验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`pnpm -r typecheck` 通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过；验证导出产物已清理。
- 主控已将 `feat/track-c-state` 合并到 `main`；合并提交 `0961b89`。合并后在主目录执行 `pnpm --filter @newme/mobile typecheck`、`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck`、`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 均通过；验证导出产物已清理。
- 创建 `.worktrees/track-d-sqlite` / `feat/track-d-sqlite`，启动 Track D 的 D1 SQLite 初始化与迁移框架。
- D1 数据库初始化完成：新增 `getDatabase()` 打开 `newme.db` 并运行迁移，新增 `closeDatabase()` 供后续测试/开发清理连接。
- D1 迁移框架完成：新增 `runMigrations()`，读取 `PRAGMA user_version`，按版本顺序在事务中执行 pending migration，并更新 user_version。
- D1 v1 表结构完成：创建 `local_goals`、`local_weekly_focuses`、`local_todos`、`local_energy_entries`、`local_settlements`、`local_tree_data`、`local_ai_drafts`、`sync_queue`，本地业务表都包含 id、remote_id、created_at、updated_at、deleted_at、sync_status、version。
- D1 验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过；`pnpm -r typecheck` 通过；验证导出产物已清理。限制：`expo-sqlite` 无法在 Node 环境直接打开数据库，真实 DB open + migration smoke 建议在 D2 repository 接入后通过 App 运行态验证。
- 主控已将 `feat/track-d-sqlite` 合并到 `main`；合并提交 `1f61a81`。合并后在主目录执行 `pnpm --filter @newme/mobile typecheck`、`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck`、`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 均通过；验证导出产物已清理。
- 创建 `.worktrees/track-d-repositories` / `feat/track-d-repositories`，启动 Track D 的 D2 SQLite Repository 层。
- D2 共用工具完成：新增 `repository-utils.ts`，提供本地 ID、时间戳、JSON 序列化、布尔转换、同步表名和操作类型。
- D2 sync queue 完成：新增 `sync-queue.repository.ts`，支持写操作入队、查询 pending 队列、标记 synced/failed 和失败重试次数递增。
- D2 本地 repository 完成：新增 todo、energy、goal、focus、settlement repository；写操作均在事务内更新本地表并调用 `enqueueSyncOperation()` 写入 `sync_queue`。
- D2 验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`pnpm -r typecheck` 通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过；验证导出产物已清理。限制：当前验证仍是编译和打包级，真实 `expo-sqlite` DB open/迁移执行需要在后续 App 运行态或 D3 集成 smoke 中触发。
- 主控已将 `feat/track-d-repositories` 合并到 `main`；合并提交 `bf212c6`。合并后在主目录执行 `pnpm --filter @newme/mobile typecheck`、`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck`、`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 均通过；验证导出产物已清理。
- 创建 `.worktrees/track-d-sync-engine` / `feat/track-d-sync-engine`，启动 Track D 的 D3 Sync Engine。
- D3 同步引擎完成：新增 `sync-engine.ts`，支持读取 pending sync_queue、转换本地表名到后端共享同步表名、调用 `/sync/push`、按逐条结果标记 queue synced/failed，并在成功时回写本地记录 remote_id/version/sync_status。
- D3 拉取能力完成：新增 `pullRemoteChanges()` 调用 `/sync/pull` 返回远端 changes；当前不盲目覆盖本地表，后续 F5/业务联调按表处理应用策略。
- D3 冲突解析完成：新增 `conflict-resolver.ts`，按版本号判断 remote_wins/local_wins/same_version；服务端返回 conflict 时保留队列失败原因，避免无提示覆盖用户本地修改。
- D3 验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`pnpm -r typecheck` 通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过；验证导出产物已清理。限制：真实 API + SQLite 联调需等认证态和运行时设备环境，留到 F5。
- 主控已将 `feat/track-d-sync-engine` 合并到 `main`；合并提交 `889b700`。合并后在主目录执行 `pnpm --filter @newme/mobile typecheck`、`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck`、`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 均通过；验证导出产物已清理。
- 创建 `.worktrees/track-c-onboarding` / `feat/track-c-onboarding`，启动 Track C 的 C5 冷启动三路径。
- C5 原型对照记录：使用 `npx playwright test .tmp/prototype-onboarding.spec.js --reporter=line` 打开 `prototype/index.html`，确认原型首屏需点击 `开始规划` 后出现三路径卡片，并截图对照。
- C5 实现完成：新增三路径选择页、快速规划输入页、深度愿景输入页、手动 OKR 年/季/月/周/日五层页面，以及 `PathCard`、`OnboardingScreen`、`ManualStepScreen`、`ManualInput`、`AiDraftView`、`useOnboarding`。
- C5 范围说明：当前先完成导航、输入留存、AI 草案预览占位和进入执行闭环；快速/深度路径真实 AI 生成、确认写入、本周重点和今日清单落库留到 F2 联调。
- C5 验证记录：`pnpm -r typecheck` 通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过；启动 Expo Web 后运行 `npx playwright test .tmp/c5-onboarding.spec.js --reporter=line`，1 个用例通过，覆盖三路径入口、quick/vision 页面和手动五层流转。
- 主控已将 `feat/track-c-onboarding` 合并到 `main`；合并提交 `38fab3c`。合并后在主目录执行 `pnpm --filter @newme/mobile typecheck`、`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck`、`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web`、`npx playwright test .tmp/c5-onboarding.spec.js --reporter=line` 均通过；验证导出产物和临时测试目录已清理。
- 创建 `.worktrees/track-c-energy` / `feat/track-c-energy`，启动 Track C 的 C6 能量页。
- C6 TDD 记录：先新增 Playwright 用例 `.tmp/c6-energy.spec.js` 并运行，确认当前占位页因缺少 `本周能量` 失败；实现后同一用例通过。
- C6 实现完成：新增 `useEnergy`、`EnergyOrb`、`WeeklyFocusPanel`、`EnergySlider`、`ConfirmButton`，并组装能量页一屏结构。能量页支持本周能量展示、本周进度概览、今日能量条、未查看清单提醒、仍然确认后的充能状态和 toast。
- C6 范围说明：当前动效使用 React Native Animated/View 实现基础发光、气泡和充能状态，未引入 Skia；Skia 自绘粒子和更复杂涌入效果留体验增强阶段。
- C6 验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过；启动 Expo Web 后运行 `npx playwright test .tmp/c6-energy.spec.js --reporter=line`，1 个用例通过，并生成 `.tmp/c6-energy.png` 做视觉检查。
- 主控已将 `feat/track-c-energy` 合并到 `main`；合并提交 `1c58f93`。合并后在主目录执行 `pnpm --filter @newme/mobile typecheck`、`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck`、`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web`、`npx playwright test .tmp/c6-energy.spec.js --reporter=line` 均通过；验证导出产物和临时测试目录已清理。
- 创建 `.worktrees/track-c-todo` / `feat/track-c-todo`，启动 Track C 的 C7 清单页。
- C7 TDD 记录：先新增 Playwright 用例 `.tmp/c7-todo.spec.js` 并运行，确认当前占位页因缺少本周重点标签失败；实现后同一用例通过。中途截图发现 Modal 层级混入底层内容，已改为页面内 absolute overlay 并重新验证。
- C7 实现完成：新增 `useTodos`、`TodoItem`、`TodoList`、`AddTodoInput`，并组装清单页。清单页支持本周重点标签、今日完成数、勾选、新增、编辑、删除和本周 7 天概览。
- C7 范围说明：当前删除采用显式垃圾桶按钮保证 Web/移动端一致可测；左滑删除手势留体验增强阶段。
- C7 验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过；启动 Expo Web 后运行 `npx playwright test .tmp/c7-todo.spec.js --reporter=line`，1 个用例通过，并生成 `.tmp/c7-todo.png` 做视觉检查。
- 主控已将 `feat/track-c-todo` 合并到 `main`；合并提交 `f0d0f63`。合并后在主目录执行 `pnpm --filter @newme/mobile typecheck`、`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck`、`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web`、`npx playwright test .tmp/c7-todo.spec.js --reporter=line` 均通过；验证导出产物和临时测试目录已清理。
- 创建 `.worktrees/track-c-plan` / `feat/track-c-plan`，启动 Track C 的 C8 计划页。
- C8 TDD 记录：先新增 Playwright 用例 `.tmp/c8-plan.spec.js` 并运行，确认当前占位页因缺少 `周/月计划` 切换失败；实现后同一用例通过。中途补充了当前周明文标记，避免只依赖边框高亮。
- C8 实现完成：新增 `usePlan`、`EmptyLevel`、`MonthView`、`YearView`，并组装计划页。计划页支持 `周/月计划` 和 `年/季度` 切换、手动来源空层级补全入口、最近 4 周节点、当前周标记、Q1-Q4 阶段卡片。
- C8 验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过；启动 Expo Web 后运行 `npx playwright test .tmp/c8-plan.spec.js --reporter=line`，1 个用例通过，并生成 `.tmp/c8-plan.png` 做视觉检查。
- 主控已将 `feat/track-c-plan` 合并到 `main`；合并提交 `56fea2f`。合并后在主目录执行 `pnpm --filter @newme/mobile typecheck`、`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/api build`、`pnpm -r typecheck`、`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web`、`npx playwright test .tmp/c8-plan.spec.js --reporter=line` 均通过；验证导出产物和临时测试目录已清理。

### 2026-04-30

- 设计总监返工启动：用户明确要求移动端前端界面按 `prototype/index.html` 1:1 还原，不再只做结构参考。
- 新增原型还原红测 `apps/mobile/tests/prototype-parity.spec.js`：初始失败点为缺少原型状态栏、冷启动文案不一致、成长树仍为占位。
- 公共视觉壳完成：新增 `PrototypeShell`，补齐原型内状态栏 `09:07 / 87%`、深绿色背景、玻璃卡和页面光晕；底部 Tab 改为原型胶囊式悬浮导航。
- C5-C8 视觉返工完成：冷启动三路径卡片改为原型玻璃样式并修正文案为 `先快速规划这个季度`；能量页、清单页、计划页改回原型深绿玻璃层级、圆角、光效和间距。
- C9 成长树完成：新增 `GrowthTree`、`FruitCapsule` 和果实数据，展示树干、枝干、树冠、6 个金色果实、`Q2 阶段`、`1 荣誉`，点击果实可打开时间胶囊。
- 依赖更新：移动端新增 `expo-linear-gradient@^15.0.8` 用于还原原型背景渐变；Metro 需要 `expo start -c` 清缓存后识别新依赖。
- 验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`npx playwright test apps/mobile/tests/prototype-parity.spec.js --reporter=line` 2 个用例通过；使用 Playwright 生成 `final-onboarding/energy/todo/plan/tree` 截图完成肉眼检查。
- 总监续跑代码级还原补强：按用户要求派发 3 个只读子 agent，分别审计原型 CSS token/布局、交互状态机、移动端实现差异；全程未使用截图、浏览器视觉检查或图像工具作为验收依据。
- 新增并扩展 `apps/mobile/tests/prototype-parity.spec.js` 交互红测：初始失败于能量确认提醒文案不一致；review 后继续补红测覆盖访问清单后返回能量不再重复提醒、`AI 重规划` 生成 W17 新任务、左滑删除 `跑步 30 分钟`、`/settlement` 确认后生成第 17 周果实并跳成长树、成长树 time capsule 文案。
- 设计 token/公共壳补强：`colors.ts` 对齐深林绿、能量青、果实金和原型文本色；`PrototypeShell`、`Button`、底部 Tab 继续向原型 phone 内状态栏、深绿背景、玻璃卡、70px 胶囊导航靠拢。
- 能量页补强：提醒弹层文案改为 `要不要先看看今天的清单？`，按钮改为 `先看清单` 跳转 `/todo`、`继续注入` 直接确认；新增 `prototype.store` 保存 `viewedList`，访问清单后返回能量页不再重复提醒；默认能量值和本周重点数据对齐原型。
- 清单页补强：默认标题改为 `4 月 26 日`，默认 4 条任务、本周重点标签和本周 7 天概览数据对齐原型；TodoItem 改为左滑露出 78px 垃圾桶删除，编辑按钮保留在 surface 内。
- 计划页补强：默认 `planSource=ai` 时不再展示手动来源卡；月视图标题改为 `只规划最近一个月，避免计划过远失效`，`AI 重规划` 可打开反馈面板，提交后进入生成中并更新 W17 后续计划；年视图 AI 来源文案对齐原型。
- 成长树补强：树旁 `果实 / Q2 阶段 / 1 荣誉` 按钮可进入详情页并返回；果实时间胶囊维持原型 `time capsule`、本周结果和重点回顾。
- C10 周结算 UI 完成：新增 `apps/mobile/app/settlement/index.tsx`，覆盖周结算开场语、每日能量柱状图、本周重点推进、最终周结果微调、周感悟和确认生成果实按钮；确认后写入 `prototype.store` 的第 17 周果实，并延迟跳转成长树。
- 验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`npx playwright test apps/mobile/tests/prototype-parity.spec.js --reporter=line` 3 个用例通过。
- 原型真源重构补强完成：新增 `apps/mobile/src/shared/theme/prototype.ts` 抽取 phone 尺寸、深林绿背景、玻璃卡、底栏、按钮阴影等原型 token；`PrototypeShell` 和 Tab 底栏改为统一使用 prototype 背景/网格/玻璃模糊，避免页面散落重复样式。
- 能量页视觉锚点补强：先新增 `energy page keeps prototype vertical rhythm` 红测并确认现状失败，再将能量球回到原型 242/224 尺寸、7 个气泡、58px 数字、进度卡去除非原型 note 行、氮气条补金色填充/青色拖尾/发光头，确认按钮回到原型 49px 高度。
- 清单/计划/成长树补强：清单标题字号回到原型 16px，完成勾选态改为低亮青色描边；计划分段控件、月计划 intro、当前周卡片改回原型半透明层级；成长树树干补原型横向渐变和内阴影。
- 新增视觉回归脚本 `apps/mobile/tests/prototype-visual-regression.spec.js`：自动打开 `prototype/index.html` 和 Expo Web，分别截图能量、清单、计划、成长树，并对关键文本锚点坐标做容差对照，避免只测文案导致视觉漂移。
- 文档同步：`产品需求设计文档.md` 更新为客户端以 `prototype/index.html` 为唯一视觉与交互基准；实施计划主控收口清单标记已完成，并记录新增视觉回归脚本。
- 验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`npx playwright test apps/mobile/tests/prototype-visual-regression.spec.js --reporter=line` 通过；`npx playwright test apps/mobile/tests/prototype-parity.spec.js --reporter=line` 4 个用例通过。
- 用户复核后修正口径：此前“视觉还原完成”不准确，实际只是页面级视觉锚点靠拢，底栏之外的按钮、胶囊、弹窗、sheet、toast 等 UI 原语仍与 `prototype/index.html` 差异明显。本轮验收标准改为“原型原语级复刻”。
- TDD 记录：先升级 `apps/mobile/tests/prototype-visual-regression.spec.js`，将底部 nav 几何容差从 60px 收紧到 2px，并新增 `prototype-bottom-nav`、`prototype-button-primary`、`prototype-button-pill`、`prototype-modal-card`、`prototype-edit-sheet`、`prototype-button-replan`、`prototype-button-tree-tool`、`prototype-toast` 等结构断言；红测初始失败于缺失自绘原语/编辑 sheet 几何。
- 原语层实现：新增 `apps/mobile/src/shared/components/PrototypePrimitives.tsx`，统一 `PrototypeBottomNav`、`PrototypeButton`、`PrototypeModalLayer`、`PrototypeModalCard`、`PrototypeEditSheet`、`PrototypeActionRow`、`PrototypeToast`、`PrototypeInput`、`PrototypeTextarea`、`PrototypeTreeTool`；`apps/mobile/app/(tabs)/_layout.tsx` 隐藏 Expo Router 默认 tabbar，由自绘底栏接管视觉。
- 页面引用改造：能量提醒、清单本周弹窗、编辑底部 sheet、添加待办、计划 `AI 重规划`、成长树侧边工具、周结算输入与按钮均切到 prototype 原语；`PrototypeScreen` 修正状态栏与 `phone-main` 的 12px 顶距，避免页面首屏整体下沉；清单卡片恢复原型主区域填充，待办条目回到 58px 节奏。
- Demo 数据校准：能量页 `weekEnergy` 改为按原型本周已记录能量均值计算，默认首屏回到 78%，避免视觉截图与原型主数值不一致。
- 文档同步：`产品需求设计文档.md` 与本进度日志均已说明“视觉还原完成”旧表述不准确，当前改为“原型原语级复刻”；剩余差异主要来自 RN Web 与原生 HTML/CSS 的字体渲染、Ionicons 图标路径和滤镜能力差异。
- 验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过；`npx playwright test apps/mobile/tests/prototype-parity.spec.js --reporter=line` 4 个用例通过；`npx playwright test apps/mobile/tests/prototype-visual-regression.spec.js --reporter=line` 1 个用例通过。
- 技术总监续跑 F2：创建 `.worktrees/track-f2-cold-start` / `feat/track-f2-cold-start`，基于当前 main `dab351c` 开始冷启动 AI 联调后端切片。
- F2 TDD 记录：先在 `ai.service.spec.ts` 新增快速规划确认落库红测，确认现有 `confirmGeneration` 只更新 `ai_generations` 状态、不会写季度目标/本周重点/今日清单；实现后同一用例转绿。
- F2 后端切片完成：`POST /ai/generations/:id/confirm` 现在按登录用户确认草案，校验 `generationId` 和场景一致性；快速规划草案确认时在事务中创建/复用 Quarter、创建 AI 来源 QuarterGoal、upsert AI 来源 WeekPlan、创建 WeeklyFocus 和今日 Todo，并标记用户 onboarding 完成。
- 共享契约补充：`packages/shared/src/dto/ai.ts` 新增 `ConfirmGenerationResponse`，返回确认后的 generation 和实际写入数量，便于移动端下一步真实对接。
- F2 验证记录：`pnpm --filter @newme/api test --runTestsByPath src/modules/ai/tests/ai.service.spec.ts --runInBand` 通过；`pnpm --filter @newme/shared typecheck` 通过；`pnpm --filter @newme/api typecheck` 通过；`pnpm --filter @newme/api test --runInBand` 14 个 test suite / 27 个测试通过。
- F2 主线合并：`feat/track-f2-cold-start` 已提交 `1bcbc13 feat: apply quick plan ai confirmations` 并 fast-forward 合并回 `main`；主目录补跑 `prisma generate` 后，`pnpm --filter @newme/api typecheck` 与 `pnpm --filter @newme/api test --runTestsByPath src/modules/ai/tests/ai.service.spec.ts --runInBand` 均通过。
- F2 移动端 quick 联调切片：创建 `.worktrees/track-f2-quick-mobile` / `feat/track-f2-quick-mobile`，先新增 `apps/mobile/tests/f2-quick-onboarding.spec.js` 红测，确认 quick 页面仍停留在占位草案和直接进能量页；实现后测试转绿。
- F2 quick 页面实现：`apps/mobile/app/onboarding/quick.tsx` 现在会调用 `/ai/generations` 生成 `quick_quarter_plan` 草案，把返回的 `weeklyFocuses` 和 `todayTodos` 展示在草案卡片中；用户确认后调用 `/ai/generations/:id/confirm`，携带 `generationId/scenario/target/contextVersion/edits`，成功后进入能量页。
- F2 移动端验证记录：`pnpm --filter @newme/shared typecheck` 通过；`pnpm --filter @newme/mobile typecheck` 通过；`EXPO_BASE_URL=http://127.0.0.1:19009 npx playwright test apps/mobile/tests/f2-quick-onboarding.spec.js --reporter=line` 1 个用例通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过；`EXPO_BASE_URL=http://127.0.0.1:19009 npx playwright test apps/mobile/tests/prototype-parity.spec.js --reporter=line` 4 个用例通过。

### 2026-04-30（续）

- 三路并行子 agent 开发启动：F1 Auth 登录入口、F2 深度愿景后端确认链路、F3 日常执行页真实 API 接入。
- F1 Auth 登录入口完成：新增 `apps/mobile/app/auth/index.tsx`（路由重定向）、`apps/mobile/app/auth/login.tsx`（验证码登录页面 UI）、`apps/mobile/src/features/auth/useAuthLogin.ts`（发验证码→登录→存 token→跳转 hook）；`apps/mobile/src/stores/auth.store.ts` 新增 SecureStore/localStorage 兼容层，支持 Web 环境下 fallback 到 localStorage。
- F1 Playwright 测试：新增 `apps/mobile/tests/f1-auth-login.spec.js`，覆盖发验证码、登录、JWT 存储、`/me` 加载和跳转 onboarding。
- F2 深度愿景后端确认链路完成：`apps/api/src/modules/ai/ai.service.ts` 新增 `applyVisionToAnnualOkr`（愿景→年度 OKR 写入 AnnualObjective）、`applyAnnualToQuarterOkr`（年度→季度 OKR 写入 Quarter + QuarterGoal）、`applyQuarterToFourWeekCommitments`（季度→四周承诺写入 WeekPlan + WeeklyFocus）三个确认落库方法；`confirmGeneration` 路由新增 `VISION_TO_ANNUAL_OKR`、`ANNUAL_TO_QUARTER_OKR`、`QUARTER_TO_FOUR_WEEK_COMMITMENTS` 三个场景分支。
- F2 共享契约更新：`packages/shared/src/dto/ai.ts` 的 `ConfirmGenerationResponse.applied` 改为可选字段，新增 `annualObjectives` 和 `weekPlans`。
- F2 单元测试：`apps/api/src/modules/ai/tests/ai.service.spec.ts` 新增 3 个测试用例，覆盖年度 OKR、季度 OKR 和四周承诺确认落库，全部通过。
- F3 日常执行页真实 API 接入完成：`apps/mobile/src/features/todo/hooks/useTodos.ts` 改为从 `/todos/today` 加载远程清单，新增/编辑/删除/勾选均调用后端 API 并使用乐观更新；`apps/mobile/src/features/energy/hooks/useEnergy.ts` 改为从 `/energy/weeks/:weekId` 加载周能量，确认能量时调用 `PUT /energy/days/:date`。
- F3 Playwright 测试：新增 `apps/mobile/tests/f3-daily-api.spec.js`，覆盖清单 API 加载/新增和能量 API 加载/确认。
- 验证记录：`pnpm --filter @newme/mobile exec tsc --noEmit` 通过；`pnpm --filter @newme/api exec tsc --noEmit` 通过；`pnpm --filter @newme/api exec jest --testPathPattern=ai.service.spec --no-coverage` 6 个测试全部通过。
- 技术总监续跑清理：已确认旧 `.worktrees/*` 分支均已合入 `main`，移除所有旧 worktree、删除已合并的 `feat/track-*` 本地分支，并清理已合并的 `feat/static-html-prototype`；清理后 `git worktree list` 仅剩主工作区，`git branch --list` 仅剩 `main`。
- 技术总监并行派发第一批后续开发：创建 `.worktrees/f2-vision-mobile` / `feat/f2-vision-mobile`、`.worktrees/f4-plan-api` / `feat/f4-plan-api`、`.worktrees/f5-sync-runtime` / `feat/f5-sync-runtime`；分别负责 F2 深度愿景移动端联调、计划页 API 接入、SQLite+Sync 运行态联调。主控只做调度、review、合并和文档收口。
- F2 深度愿景移动端联调完成：`apps/mobile/app/onboarding/vision.tsx` 接入 shared `AiScenario` 与 `/ai/generations`、`/ai/generations/:id/confirm`，按愿景→年度 OKR→季度 OKR→四周承诺级联生成和确认；新增 `apps/mobile/tests/f2-vision-onboarding.spec.js` 覆盖三段生成、三段确认和最终跳能量页。
- F4 计划页 API 接入完成：`usePlan` 从 `/plans/weeks/2026-W17/focuses` 加载本周重点、从 `/goals/current` 加载愿景/季度/月目标，`AI 重规划` 后通过 `PUT /plans/weeks/2026-W17/focuses` 更新重点；新增 `apps/mobile/tests/f4-plan-api.spec.js` 覆盖 API 加载、空状态、更新请求和 API 失败时的原型 AI fallback。
- F5 SQLite+Sync 运行态联调完成：新增 `apps/mobile/src/db/sync/runtime.ts`，提供 `createOfflineTodoForSync`、`createOfflineEnergyForSync`、`syncOfflineChanges` 和 `runSyncRuntimeSmoke`；`sync.store.ts` 新增 `runRuntimeSync`，新增 Node smoke 测试覆盖 SQLite open、离线入队和冲突 summary。
- 主控 review 记录：第一次集成回归发现计划页 API 失败 fallback 破坏 `prototype-parity`，根因为 API 未加载时 `planSource` 被推断为 `manual`；已通过 `feat/f4-plan-parity-fix` 修复为 API 失败/未加载保持原型 AI fallback，API 成功返回空层级仍展示手动空状态。
- 主控集成验证记录：补跑 `pnpm install` 安装已在 package 中声明但本地缺失的 `expo-linear-gradient`；随后 `pnpm -r typecheck`、`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web`、`node apps/mobile/tests/f5-sync-runtime.spec.js`、`npx playwright test apps/mobile/tests/f2-vision-onboarding.spec.js apps/mobile/tests/f4-plan-api.spec.js apps/mobile/tests/prototype-parity.spec.js --reporter=line`、`npx playwright test apps/mobile/tests/prototype-visual-regression.spec.js --reporter=line` 均通过。
- 按用户要求切换为直接分支开发：从 `main` 创建 `feat/mvp-final-integration-direct`，未再创建新 worktree；主工作区已有 `AGENTS.md`、`CLAUDE.md` 未提交改动保持不纳入功能提交。
- F2/F4 已完成分支合入：`feat/f2-manual-ai-assist` 与 `feat/f4-settlement-tree-api` 均通过 no-ff merge 合入直接开发分支，合并后 mobile/api typecheck 均通过。
- AI Provider TDD 记录：新增 `apps/api/src/modules/ai/providers/openai.adapter.spec.ts`，先确认 OpenAiAdapter 不支持注入 fetch、不会本地优先/GLM 降级而红；实现后 3 个用例转绿。`.env.example` 已改为本地 OpenAI-compatible 服务与 GLM fallback 的占位变量，不提交真实 key。
- 当前周上下文 TDD 记录：新增 `apps/mobile/tests/planning-context.spec.js`，先确认缺少统一 helper 红测；实现 `planning-context` 与 `usePlanningContext` 后转绿，并替换能量、清单、计划、quick、vision、manual、周结算、成长树中的硬编码周/季度/日期。
- F6 Docker 配置完成：新增 `.dockerignore`、`apps/api/Dockerfile`、`docker-compose.yml`、`nginx/default.conf`，`docker compose config`、`docker compose up --build -d` 和 `http://localhost:8080/api/v1/health` 均通过。容器构建已补齐 `@newme/shared` CommonJS build、API runtime node_modules 复制、Prisma migrate deploy 路径和 nginx health 精确代理。
- 集成回归完成：`pnpm -r typecheck`、API 全量测试、Expo Web export、F2/F4/F3/原型 Playwright 总回归、F5 sync runtime 和 planning-context node smoke 均已通过；本机 `127.0.0.1:8080` 被本地 llama.cpp 服务占用，Docker health 验证使用 `localhost:8080`。
- 旧来源 worktree 清理完成：`feat/f2-manual-ai-assist`、`feat/f4-settlement-tree-api`、`feat/f6-docker-deploy` 均已合入当前直接开发分支并删除本地分支，`.worktrees/*` 残留目录已清空；清理 `f4-settlement-tree-api` 时先停止了指向旧 worktree 的 Expo/Node 进程。
- F7 推送通知模块完成：后端新增 `NotificationsModule`，提供 `POST /notifications/tokens` 与 `PUT /notifications/preferences`；`NotificationsService` 管理 Expo token、偏好、三类场景调度和 Expo Push API 发送，且按用户时区计算、单 token 单次最多一条；移动端新增 `useNotifications`，登录态申请权限并注册 token，通知点击按 route/scenario 进入能量页或周结算页。
- 计划完成回填：`docs/superpowers/plans/2026-04-29-parallel-mvp-implementation.md` 中所有任务和集成点 checkbox 已回填完成；补跑 `pnpm install --frozen-lockfile` 通过；补跑 F2 手动 AI、F4 周结算成长树、prototype parity、prototype visual regression Playwright 共 7 个用例通过。
- 最终合并收口：`feat/mvp-final-integration-direct` 已通过 `merge: complete mvp final integration` 合并回 `main`。合并后重新验证：`pnpm -r typecheck`、`pnpm --filter @newme/api test -- --runInBand`、`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web`、F5/planning-context/notification-routing Node smoke、F2/F4/原型 Playwright 7 个用例、`http://localhost:8080/api/v1/health` 均通过。

### 2026-05-04

- 本地联调收口：API 开启 CORS；验证码发送接口在开发态返回 `devCode` 并打印 `[DEV] verification code`，移动端登录页展示开发验证码，方便无短信服务时完成端到端登录。
- 登录链路收口：移动端根布局新增 AuthGuard，未水合完成前不渲染跳转，未登录访问 App 页面时跳转 `/auth/login`；登录后继续加载 `/me` 并按现有逻辑进入 onboarding 或主流程。
- 本地端口统一：Docker Nginx 默认端口改为 `37200`，Expo Web 默认端口改为 `37300`，移动端默认 API base URL 改为 `http://127.0.0.1:37200/api/v1`；相关 Playwright 用例默认端口同步更新。
- 文档同步：`docs/architecture/05-部署与运维方案.md` 已记录 2026-05-04 本地联调默认端口与覆盖方式。
- 验证记录：`pnpm -r typecheck` 通过；`pnpm --filter @newme/api test -- --runInBand` 通过，16 个 test suite / 40 个测试全部通过。
- 原型复刻差异审计：按用户要求新增 `docs/prototype-parity/2026-05-04-full-page-diff-audit.md`，明确 `prototype/index.html` 是唯一真源，逐页记录当前 App 在布局、排版、样式、按钮、跳转、弹层和基础交互逻辑上的差异。本轮只做文档审计，不修 App 代码。
- 审计取证：使用 Playwright 截取原型和 App 的代表性状态，截图临时保存在 `test-results/prototype-parity-audit/`，该目录已被 `.gitignore` 忽略，不作为正式交付入库。
- 原型 P0 复刻修复：按审计文档修复路径选择、快速规划、五年愿景、手动 OKR、计划页周卡跳清单、周结算 slider、结算后成长树果实反馈等关键结构/交互差异；新增 `apps/mobile/tests/prototype-p0-parity.spec.js` 覆盖这些断点，并为旧 prototype parity/visual regression 测试补登录态和 API mock，避免认证守卫干扰验收。
- 本轮验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`npx playwright test apps/mobile/tests/prototype-p0-parity.spec.js --reporter=line` 6 个用例通过；`npx playwright test apps/mobile/tests/prototype-parity.spec.js apps/mobile/tests/prototype-visual-regression.spec.js --reporter=line` 5 个用例通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过。
- 深度愿景可编辑草案修复：修复年度 OKR/季度 OKR/首月 4 周承诺被渲染成只读编号文本的问题，恢复原型 `可修改` textarea；确认年度 OKR 后，移动端会把用户编辑后的年度草案传给季度生成，API 确认落库也优先使用 `edits.annualOkr`、`edits.quarterOkr`、`edits.weeks`；右上重新生成已拆为纯生成当前层级，不再再次 confirm 或重复写入上一层。
- 深度愿景编辑回归验证：先新增/扩展失败用例覆盖“年度方向 1 可修改”输入框、编辑内容进入 `annual_to_quarter_okr` 请求，以及季度页右上重新生成不重复 confirm 上一层；修复后验证 `pnpm --filter @newme/api test -- --runTestsByPath src/modules/ai/tests/ai.service.spec.ts --runInBand`、`pnpm --filter @newme/api typecheck`、`pnpm --filter @newme/mobile typecheck`、`npx playwright test apps/mobile/tests/prototype-p0-parity.spec.js --reporter=line`、`npx playwright test apps/mobile/tests/prototype-parity.spec.js apps/mobile/tests/prototype-visual-regression.spec.js --reporter=line`、`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 均通过。
- 2026-05-04 提交前复核：已重启 `@newme/mobile` Expo Web 到 `http://127.0.0.1:37300` 并返回 HTTP 200；重新验证 `pnpm --filter @newme/api test -- --runTestsByPath src/modules/ai/tests/ai.service.spec.ts --runInBand` 7 个用例通过、`pnpm --filter @newme/api typecheck` 通过、`pnpm --filter @newme/mobile typecheck` 通过、`npx playwright test apps/mobile/tests/prototype-p0-parity.spec.js --reporter=line` 6 个用例通过、`npx playwright test apps/mobile/tests/prototype-parity.spec.js apps/mobile/tests/prototype-visual-regression.spec.js --reporter=line` 5 个用例通过、`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过。
- 2026-05-04 底栏沉底修正：按用户截图反馈，将 `PrototypeBottomNav` 的底部距离从 52px 调整为 20px，`PrototypeShell` 主内容底部预留同步改为 `bottomNavHeight + bottomNavInsetWeb`；先新增 `bottom nav sits on the prototype bottom edge` Playwright 断言并确认红测收到 52px，再修复到 20px 后绿测通过。

### 2026-05-05

- 等离子氮气能量条升级：按用户反馈，旧黄条 + 圆头滑块视觉张力不足，本轮将 `prototype/index.html` 和移动端 `EnergySlider` 同步升级为无圆形 thumb 的等离子氮气轨道；视觉包含斜切喷口、黄白能量核心、青色电离辉光、多层尾焰和 16 个粒子逸散点。
- NaN 回归修复：`EnergySlider` 对外部 value 和点击/拖动输入统一做 finite check 与 `0-100` clamp，避免 Web 点击事件缺少 `locationX` 时把 `NaN%` 渲染到页面。
- TDD 记录：先新增 `plasma energy rail has no round thumb and never renders NaN` Playwright 断言，确认红测失败于缺失 `plasma-energy-slider`；实现后 focused 用例已转绿。
- 用户复核后纠偏：第一版尾焰固定宽度导致 0% 左侧出现块状光斑，默认态青色辉光也过厚；已改为尾焰随能量填充宽度收缩，0% 隐藏喷口/尾焰，默认态只保留细黄白主轨和局部青色尾焰。
- 验证记录：`pnpm --filter @newme/mobile typecheck` 通过；`npx playwright test apps/mobile/tests/prototype-parity.spec.js --reporter=line` 7 个用例通过；`npx playwright test apps/mobile/tests/prototype-visual-regression.spec.js --reporter=line` 1 个用例通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过。

## 阻塞与风险

- pnpm v10 默认忽略 build scripts 的风险已通过根 `package.json` 的 `pnpm.onlyBuiltDependencies` 收口，允许 `@nestjs/core`、`@prisma/client`、`@prisma/engines`、`bcrypt`、`prisma` 执行必要构建脚本。
- B3 Auth 的验证码为 MVP 进程内存储，服务重启会丢失；后续若接入真实短信或多实例部署，应迁移到 Redis/数据库验证码表。
- B3 Auth 的 refresh token 使用 Node `crypto` SHA-256 哈希，未使用 `bcrypt`，避免当前 pnpm 忽略 bcrypt build scripts 对登录链路造成运行风险。
- B5 Goals 对外使用 `YYYY-Qn` 逻辑季度 ID，与 B4 `/me.currentQuarterId` 保持一致；服务端内部会映射到 Prisma `quarters.id` UUID，后续 Plans/Todos 若引用季度也应复用该转换策略。
- B9 Settlement 尚未生成 QuarterHonor；不要把季度荣誉视为后端已完成能力，B10 或后续季度结算任务需要补齐。
- B11 Sync 目前按整条记录版本冲突处理，符合 MVP 单设备优先策略；多端字段级合并仍是后续演进项。
- E1 AI provider 已支持本地 OpenAI-compatible 服务优先和 GLM fallback；真实调用仍依赖运行环境正确配置 `AI_LOCAL_*` 或 `AI_FALLBACK_*`，且不要把真实 key 写入仓库。
- F7 推送通知真实到达仍依赖发布环境配置 APNs/FCM/Expo push 凭据；本轮已完成应用内注册、调度构造和路由映射，尚未在真机系统通知层做端到端到达测试。
- 当前周上下文已统一为 `/me.currentWeekId/currentQuarterId` 优先、本地日期 fallback；如果未登录态测试日期变化，相关 Playwright mock 周需要同步调整。
- F5 Sync 本轮为依赖注入式 Node smoke 和运行态 helper 验证，尚未在真实 Expo 设备/Web SQLite 文件库中打开 `newme.db` 做端到端 smoke；发布前需补一轮设备级验证。
- Docker MVP 部署已可用；2026-05-04 起本地默认 Nginx 端口为 `37200`，后续本机验收优先使用 `http://localhost:37200/api/v1/health`，如端口冲突再调整 `NGINX_PORT`。
- 旧 `feat/track-*` worktree 与本轮来源 worktree 均已清理；本轮按用户要求未再创建新 worktree。

## 下次建议

如果用户要求继续开发，建议按以下顺序：

1. 发布前设备级 SQLite smoke：在真实 Expo 运行态验证 DB open、migration、离线入队、push/pull。
2. 推送远端前确认是否要包含或另行处理 `AGENTS.md`、`CLAUDE.md` 的用户侧未提交改动；当前功能提交未包含这两个文件。
3. 若本机 37200 已被其它服务占用，设置 `NGINX_PORT` 后重新 `docker compose up --build`，并同步调整移动端 `EXPO_PUBLIC_API_BASE_URL`。

## 收尾模板

每次暂停前复制并填写：

```text
本轮完成：
- 

修改文件：
- 

已提交 commit：
- 

验证命令：
- 

未完成：
- 

阻塞：
- 

下次从这里继续：
- 
```
