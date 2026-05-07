# NewMe 快速上手

这份文档放在仓库根目录，用来回答“怎么启动”和“端口在哪里”。更完整的产品和架构说明见 `产品需求设计文档.md` 与 `docs/architecture/README.md`。

## 端口速查

| 服务 | 默认地址 | 说明 |
| --- | --- | --- |
| 前端 Expo Web | `http://localhost:37300` | 本地浏览器预览移动端 App，建议固定使用 37300，和 Playwright 测试默认值一致 |
| Metro / Dev Client | `http://localhost:8081` | iOS/Android Dev Build 或 Expo Go 调试入口 |
| 后端 API | `http://localhost:37200/api/v1` | Docker Compose 通过 Nginx 暴露，移动端默认也请求这个地址 |
| API 容器内部端口 | `3000` | NestJS 服务端口，只在 Docker 网络内直接访问 |
| PostgreSQL 容器内部端口 | `5432` | 数据库容器内部端口，Compose 默认不暴露到宿主机 |
| 本地大模型服务 | `http://127.0.0.1:4100/v1` | 可选；连不上时后端按环境变量降级到 GLM |

## 第一次启动

前置要求：

- Node.js `>=20`
- pnpm
- Docker Desktop，用于启动 API、Nginx、PostgreSQL

安装依赖：

```bash
pnpm install
```

启动后端：

```bash
docker compose up --build -d
curl -fsS http://127.0.0.1:37200/api/v1/health
```

启动前端 Web 预览：

```bash
EXPO_PUBLIC_API_BASE_URL="http://127.0.0.1:37200/api/v1" pnpm --filter @newme/mobile web -- --port 37300
```

浏览器打开：

```text
http://localhost:37300
```

## 登录调试

开发环境可以先请求验证码接口拿到 `devCode`，再在登录页输入手机号和验证码：

```bash
curl -sS -X POST http://127.0.0.1:37200/api/v1/auth/code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000"}'
```

## 常用命令

```bash
pnpm --filter @newme/shared typecheck
pnpm --filter @newme/api typecheck
pnpm --filter @newme/mobile typecheck
pnpm test:prototype
pnpm test:mobile:e2e
```

原型静态文件在 `prototype/index.html`。客户端视觉实现必须一比一还原这个原型。

## 端口冲突时

- 前端 Web 可换端口：`pnpm --filter @newme/mobile web -- --port 37301`
- Playwright 测试跟随新端口：`EXPO_BASE_URL=http://localhost:37301 pnpm test:mobile:e2e`
- 后端 Nginx 可换端口：`NGINX_PORT=37201 docker compose up --build -d`
- 前端跟随后端新端口：`EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:37201/api/v1 ...`
