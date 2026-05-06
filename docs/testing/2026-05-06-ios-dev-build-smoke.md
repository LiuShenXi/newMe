# 2026-05-06 iOS 真机 Dev Build Smoke

## 目标

用 iOS Development Build 在真实 iPhone 上验收移动端发布前关键链路，覆盖 Expo Go 无法完全代表的原生能力：`expo-sqlite`、`expo-secure-store`、`expo-notifications`、Deep Link/通知路由、真实登录恢复和杀进程后的本地持久化。

## 本轮代码准备

- 移动端已安装 `expo-dev-client`，版本由 Expo SDK 54 自动匹配为 `~6.0.21`。
- `apps/mobile/app/_layout.tsx` 已在入口顶部引入 `expo-dev-client`，用于增强 Dev Build 下的 native module mismatch 错误提示。
- `apps/mobile/app.json` 已配置 iOS bundle identifier：`com.newme.mobile`。
- `apps/mobile/package.json` 保留原有 `ios`/`android` Expo Go 启动脚本，并新增 `dev-client`、`ios:device` 两个 Dev Build 脚本。
- 本仓库 `.gitignore` 已忽略 `ios/`、`android/`、`.expo/`，本地 `expo run:ios` 触发的 prebuild 生成物默认不纳入 Git。

## 前置条件

- Mac 已安装 Xcode，并完成首次打开授权。
- iPhone 已通过 USB 连接 Mac，设备上点击“信任此电脑”。
- iOS 16+ 设备需开启：设置 > 隐私与安全性 > 开发者模式。
- Docker 后端已启动，且 `http://<Mac局域网IP>:37200/api/v1/health` 可从 iPhone Safari 访问。
- 如果要验真实远程推送，需要 Apple Developer Program、APNs/EAS 凭据；无凭据时仅验通知权限、Expo token 注册路径和本地/路由行为。

## 启动命令

先确认本机局域网 IP：

```bash
ipconfig getifaddr en0
```

启动后端：

```bash
docker compose up --build -d
```

首次安装 iOS Dev Build：

```bash
export EXPO_PUBLIC_API_BASE_URL="http://<Mac局域网IP>:37200/api/v1"
pnpm --filter @newme/mobile ios:device
```

后续 JS/TS 日常调试：

```bash
export EXPO_PUBLIC_API_BASE_URL="http://<Mac局域网IP>:37200/api/v1"
pnpm --filter @newme/mobile dev-client -- --clear
```

如果同网段连接失败：

```bash
export EXPO_PUBLIC_API_BASE_URL="http://<Mac局域网IP>:37200/api/v1"
pnpm --filter @newme/mobile exec expo start --dev-client --tunnel --clear
```

如果签名失败：

```bash
xed ios
```

在 Xcode 的 Signing & Capabilities 中选择 Team 后重试 `expo run:ios --device`。

## Smoke 步骤

1. 启动 Dev Build：无红屏、白屏、native module missing 或 Metro 连接异常。
2. 登录：走手机号验证码登录；杀进程重开后应通过 SecureStore 恢复会话。
3. Onboarding：快速规划、深度愿景、手动 OKR 三路径至少各完成一条主链路。
4. 日常执行：今日清单新增/完成/删除，能量页确认上报，计划页读取当前周/季度上下文。
5. SQLite 离线：断网创建 Todo/能量记录，恢复网络后同步；杀进程重开数据仍保留。
6. 通知：请求权限，注册 Expo push token；无 APNs/EAS 凭据时不把远程送达作为阻塞项。
7. 周结算/成长树：完成一次周结算，成长树果实或时间胶囊能显示。
8. 视觉：对照 `prototype/index.html` 检查关键页面；若存在产品差异，同步更新产品需求设计文档。

## 通过标准

- `pnpm --filter @newme/mobile typecheck` 通过。
- `pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过，用于确保 Dev Client 引入不破坏 Web 验证链路。
- 至少一台 iPhone 完成 Smoke 步骤 1-7；如果远程推送缺凭据，记录为发布配置阻塞，不判定 App 端 Dev Build 失败。
- 证据包记录到 `test-results/ios-dev-build-smoke/`：设备型号、iOS 版本、API base URL、登录账号、关键截图/录屏、终端输出和异常日志。

## 当前边界

Dev Build 需要真机、Xcode signing 和 Apple 开发者配置配合。若本机没有连接 iPhone，代码准备与静态验证可完成，但 `expo run:ios --device` 只能推进到设备发现/签名检查阶段。
