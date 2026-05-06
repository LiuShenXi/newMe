# 2026-05-05 设备级 SQLite Smoke

## 目标

在真实 Expo 运行态验证 F5 SQLite + Sync 链路，而不是只依赖 Node 依赖注入测试。发布前至少在一台 iOS 或 Android 真机/模拟器完成一次，并把设备、系统版本、API 地址、截图或录屏、终端输出记录到 `test-results/device-sqlite-smoke/`。

## 命令入口

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://<LAN-IP>:37200/api/v1"
pnpm test:device-sqlite-smoke
pnpm --filter @newme/mobile exec expo start --clear --host lan
```

如果用 Android 模拟器且 API 跑在同一台电脑，App 需要使用 `http://10.0.2.2:37200/api/v1`，预检脚本会自动把宿主机 health check 映射回 `http://127.0.0.1:37200/api/v1`。如果是真机，必须使用电脑局域网 IP，不能用 `127.0.0.1`。

## 前置条件

- `docker compose up -d` 后，`http://<LAN-IP>:37200/api/v1/health` 返回 healthy。
- 移动端通过 Expo Go 或 dev build 启动，`apps/mobile/app.json` 包含 `expo-sqlite`。
- 使用真实登录流程：打开 `/auth/login`，调用 `/auth/code` 获取当前 `devCode`，再登录；不要绕过 AuthGuard。
- 开始前清理 App 数据或卸载重装，确保本轮会重新打开 `newme.db` 并跑迁移。

## Smoke 步骤

1. 登录与初始化：完成验证码登录，进入 onboarding 或主流程；终端与设备上不能出现 SQLite open/migration 异常。
2. DB open/migration：进入清单页、能量页、计划页、成长树页各一次；应用无白屏、无红屏、无崩溃。
3. 离线写入：断开设备网络，新增一条待办，拖动并确认今日能量；页面应保留本地乐观结果，并显示失败/本地保留提示。
4. 入队验证：恢复网络后，触发同步运行态；本地 `sync_queue` 应有 pending 记录进入 push，成功后 pending 数下降。
5. push/pull 验证：后端 `/sync/push` 返回 success，`/sync/pull` 返回 `pulledAt`；再次打开清单/能量页能看到远端一致状态。
6. 冲突摘要：用同一账号在另一端更新同一条记录后再同步；如果版本冲突，App 不能崩溃，summary 需要体现 conflict 或 error。

## 通过标准

- `pnpm test:device-sqlite-smoke` 预检 exit 0。
- 真机完成登录、DB open、迁移、离线写入、恢复网络同步、pull 回读。
- 没有红屏、白屏、未捕获异常或 token 丢失。
- 证据包至少包含：设备型号/系统版本、API base URL、登录账号、关键截图或录屏、`pnpm test:device-sqlite-smoke` 输出。

## 当前边界

当前仓库已覆盖 `apps/mobile/tests/f5-sync-runtime.spec.js` 的 Node runtime smoke；设备级 smoke 用于补齐真实 Expo SQLite 文件库与网络恢复路径。若发现 UI 仍只走远端 API fallback，没有调用本地 repository 入队，需要把该问题登记为 F5 后续修复项，不能用 Node smoke 代替设备验收。
