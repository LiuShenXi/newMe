# 架构图谱

- 日期：2026-05-06
- 状态：第一版 Mermaid 图谱
- 来源依据：`产品需求设计文档.md`、`docs/architecture/`、`prototype/index.html`、当前 `apps/mobile` / `apps/api` / `packages/shared` 实现

## 查看方式

1. 如果 VS Code 插件只支持 Markdown，不支持 `.mmd`，打开 `docs/architecture/diagrams/preview.md`，里面已经嵌入导出的 SVG 图。
2. 如果安装了支持 `.mmd` 的 Mermaid 插件，可以直接打开本目录的 `.mmd` 源文件预览。
3. 在支持 Mermaid 的 Markdown 中也可以嵌入：

   ```md
   ```mermaid
   flowchart LR
     Mobile --> Api
   ```
   ```

4. 需要重新导出单张图片时执行：

   ```bash
   PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     pnpm dlx @mermaid-js/mermaid-cli \
     -i docs/architecture/diagrams/01-system-context.mmd \
     -o docs/architecture/diagrams/assets/01-system-context.svg
   ```

   如果本机 Mermaid CLI 已经安装了 Puppeteer Chrome，也可以省略 `PUPPETEER_EXECUTABLE_PATH`。

5. 需要刷新全部 SVG 时执行：

   ```bash
   for f in docs/architecture/diagrams/*.mmd; do
     b=$(basename "$f" .mmd)
     PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
       pnpm dlx @mermaid-js/mermaid-cli \
       -i "$f" \
       -o "docs/architecture/diagrams/assets/$b.svg"
   done
   ```

## 图谱清单

| 文件 | 类型 | 主要用途 |
| --- | --- | --- |
| `01-system-context.mmd` | 系统上下文图 | 给产品、研发和测试统一理解系统边界。 |
| `02-container-architecture.mmd` | 容器架构图 | 展示 monorepo、移动端、API、共享契约和运行时依赖。 |
| `03-mobile-architecture.mmd` | 移动端架构图 | 展示 Expo Router、feature、store、API client、SQLite 和同步运行态。 |
| `04-backend-components.mmd` | 后端组件图 | 展示 NestJS 模块边界、Prisma、AI provider 和横切能力。 |
| `05-core-business-loop.mmd` | 核心业务闭环图 | 展示从冷启动规划到成长树回看的产品闭环。 |
| `06-cold-start-flows.mmd` | 冷启动流程图 | 展示深度愿景、快速规划、手动 OKR 三路径。 |
| `07-ai-generation-sequence.mmd` | UML 时序图 | 展示 AI 生成、降级、校验、记录和确认落库链路。 |
| `08-offline-sync-sequence.mmd` | UML 时序图 | 展示端侧离线写入、同步队列、push/pull 和冲突处理。 |
| `09-domain-er.mmd` | ER 图 | 展示 Prisma 核心数据模型和关系。 |
| `10-api-contract-map.mmd` | API 契约图 | 展示页面/功能与后端 API 的调用边界。 |
| `11-deployment-topology.mmd` | 部署拓扑图 | 展示移动端发布、ECS、Nginx、API、PostgreSQL 和外部服务。 |
| `12-auth-session-sequence.mmd` | UML 时序图 | 展示验证码登录、JWT、refresh token 和 `/me` 会话恢复。 |
| `13-settlement-tree-sequence.mmd` | UML 时序图 | 展示周结算、快照、果实生成和成长树刷新。 |
| `14-prototype-parity-map.mmd` | 原型还原映射图 | 展示 `prototype/index.html` 原语到移动端组件和测试的映射。 |
| `15-state-machines.mmd` | UML 状态机图 | 展示 onboarding、AI generation、sync queue 和周结算状态。 |
| `16-uml-use-case.mmd` | UML 用例图 | 展示用户、系统时间、AI、推送和分发渠道参与的核心用例。 |
| `17-uml-component.mmd` | UML 组件图 | 展示移动端、共享契约、后端模块和外部组件依赖。 |
| `18-uml-domain-class.mmd` | UML 类图 | 展示核心领域对象、属性和聚合关系。 |
| `19-uml-deployment.mmd` | UML 部署图 | 展示手机、开发机/CI、ECS、Docker Compose、AI 和外部服务节点。 |

## 维护规则

1. 产品闭环、页面流程或视觉真源变化时，优先更新 `05-core-business-loop.mmd`、`06-cold-start-flows.mmd`、`14-prototype-parity-map.mmd`。
2. API、模块或数据模型变化时，优先更新 `04-backend-components.mmd`、`09-domain-er.mmd`、`10-api-contract-map.mmd`。
3. AI provider、prompt、结构化输出或确认落库变化时，优先更新 `07-ai-generation-sequence.mmd` 和 `15-state-machines.mmd`。
4. SQLite、本地 repository、同步策略或冲突策略变化时，优先更新 `08-offline-sync-sequence.mmd` 和 `15-state-machines.mmd`。
5. 部署、端口、容器或环境变量变化时，优先更新 `11-deployment-topology.mmd`。
6. 需要对外做正式架构评审时，优先查看 `16-uml-use-case.mmd`、`17-uml-component.mmd`、`18-uml-domain-class.mmd`、`19-uml-deployment.mmd` 这组 UML 视角图。
