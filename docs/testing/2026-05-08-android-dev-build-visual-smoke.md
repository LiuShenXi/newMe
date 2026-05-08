# 2026-05-08 Android Dev Build 视觉 Smoke

## 目标

用 Android Development Build 验收原型视觉还原。Expo Go 只用于登录、路由、接口和红屏排查，不作为 `prototype/index.html` 1:1 视觉验收依据。

## 前置条件

- Windows 已安装 Android Studio 或 Android SDK，并能执行 `adb devices`。
- 模拟器或真机已开启 USB 调试。
- 后端已启动，设备可访问 `http://<本机局域网IP>:37200/api/v1/health`。
- 已安装依赖：`pnpm install`。

## 启动命令

启动后端：

```bash
docker compose up --build -d
```

首次安装 Android Dev Build：

```bash
$env:EXPO_PUBLIC_API_BASE_URL="http://<本机局域网IP>:37200/api/v1"
pnpm --filter @newme/mobile android:device
```

后续 JS/TS 调试：

```bash
$env:EXPO_PUBLIC_API_BASE_URL="http://<本机局域网IP>:37200/api/v1"
pnpm --filter @newme/mobile dev-client -- --clear
```

如果使用模拟器并希望从设备访问本机 Metro：

```bash
adb reverse tcp:8081 tcp:8081
pnpm --filter @newme/mobile dev-client -- --clear --host localhost
```

## 视觉检查清单

1. 能量页不应出现 Expo Go fallback 的粗硬圆环、浅色硬横条或廉价矩形滑条。
2. 背景应是深林色柔和渐变叠层，不允许出现 Android 原生端硬圆片、网格线或廉价几何拼贴。
3. 能量球应呈现透明 Skia Canvas 上的径向玻璃球芯、柔光光晕、底部柔光和 7 个气泡，不能出现 Canvas 黑盘或过硬外层大圆。
4. 今日能量条应呈现金色胶囊轨道、粒子、扫光、尾雾和喷口光效；Android Skia 路径不再叠加硬 HUD 角标/横线，也不允许出现实心白色扫光矩形。
5. 底部导航应为实色贴底栏，5 个 tab 等分，无悬浮胶囊和异常安全区留白。
6. 清单页顶部本周重点标签应是低饱和 matte 标签，不允许变成高亮大胶囊按钮或挤压变形。

## 通过标准

- `pnpm --filter @newme/mobile typecheck` 通过。
- `pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过。
- Android 相关源码防回归断言通过，至少覆盖全局背景禁用 Skia 径向渐变、能量球/能量条透明 Skia Canvas、能量条硬 HUD/硬扫光禁用、清单标签 matte 样式。
- 完整 `prototype-parity.spec.js` 必须在发布前重跑；若本地静态服务未启动或超时，不能宣称完整 parity 已通过。
- Android Dev Build 能进入能量页，并按上方视觉检查清单留存截图到 `test-results/android-dev-build-visual-smoke/`。

## 2026-05-08 设备验证记录

- Android SDK/adb 已可用，实际路径为 `C:\Users\Administrator\AppData\Local\Android\Sdk\platform-tools\adb.exe`；`where.exe adb` 不在 PATH 不再等同于 adb 不可用。
- Dev Build 已通过短路径临时 worktree `C:\n` 构建安装到模拟器，包名为 `com.newme.mobile`，前台 Activity 为 `com.newme.mobile/.MainActivity`。
- Metro 已按 Dev Client 模式重启：`pnpm --filter @newme/mobile dev-client -- --clear --host localhost`，并已执行 `adb reverse tcp:8081 tcp:8081` 与 `adb reverse tcp:37200 tcp:37200`。
- 已用开发验证码登录并通过 deep link 进入能量页；UI 树确认存在 `energy-orb`、`plasma-energy-slider`、`prototype-bottom-nav`，且能量球/能量条内部出现 `TextureView`，说明当前截图走 Dev Build 原生渲染路径。
- 2026-05-08 追加修正：Android Dev Build 截图已更新到 `test-results/android-dev-build-visual-smoke/2026-05-08-clean-bg/`。本轮移除原生背景网格、横向脏带和硬圆片，改为单层全屏柔和环境渐变；Skia 能量球/能量条 Canvas 均改为透明；Android Skia 能量条移除硬 HUD 角标、横线和实心白色扫光矩形；清单页 focus chip 降低饱和度和字重，回到 matte 标签处理。
- 有效登录态截图证据：`test-results/android-dev-build-visual-smoke/2026-05-08-clean-bg/energy-soft-sweep-auth.png`、`test-results/android-dev-build-visual-smoke/2026-05-08-clean-bg/todo-soft-chips-auth.png`。
- 本轮命令验证：`pnpm --filter @newme/mobile typecheck` 通过；`pnpm --filter @newme/mobile exec expo export --platform web --output-dir dist-web` 通过；`pnpm --filter @newme/mobile exec playwright test tests/prototype-parity.spec.js --grep "native Android energy visuals|native energy bar|native energy orb|native prototype shell|todo focus chips"` 7 个 focused 用例通过。
- 完整 `prototype-parity.spec.js` 曾在 `http://127.0.0.1:37300` 静态服务下尝试重跑，但 180 秒超时，未作为通过依据。
- 2026-05-08 再次复核根因：曾判断上一版全局背景由 `expo-linear-gradient` 在 Android 原生端绘制导致横向色带，并尝试改为 Skia 背景；后续设备复核证明该判断不完整，真正不可接受的是 Android Skia 透明径向渐变会产生大圆弧、黑色锯齿和分层脏块。当前有效实现以最后的“色带根因收口”为准：全局背景不用 Skia 径向层。
- 新有效截图证据：`test-results/android-dev-build-visual-smoke/2026-05-08-skia-bg/energy-skia-bg-auth.png`、`test-results/android-dev-build-visual-smoke/2026-05-08-skia-bg/me-skia-bg-auth.png`。
- 2026-05-08 色带根因收口：已补跑 Web 原型/客户端对照，输出到 `test-results/web-compare-2026-05-08/`，确认 Web 基准背景为连续深林绿柔光，不存在 Android 截图中的大圆弧、黑色锯齿或分层脏块。复核确认 Android 背景层继续使用 Skia 透明 `RadialGradient` 会把透明径向层混合成脏形状，即使 `Canvas opaque={false}` 也不足以作为可靠验收路径。本轮移除 `PrototypeNativeBackground.native.tsx` 背景 Skia，改为 `expo-linear-gradient` 全屏纵向渐变、顶部线性柔光和底部弱绿色线性收尾；源码断言禁止背景层出现 `@shopify/react-native-skia`、`Canvas`、`RadialGradient`、`Rect`。
- 新有效截图证据：`test-results/android-dev-build-visual-smoke/2026-05-08-linear-bg-restart-auth/energy-linear-bg-auth.png`、`test-results/android-dev-build-visual-smoke/2026-05-08-linear-bg-restart-auth/todo-linear-bg-auth.png`、`test-results/android-dev-build-visual-smoke/2026-05-08-linear-bg-restart-auth/me-linear-bg-auth.png`。
- 本轮命令验证：`pnpm --filter @newme/mobile typecheck` 通过；`pnpm --filter @newme/mobile exec playwright test tests/prototype-parity.spec.js --grep "native prototype background" --reporter=line --workers=1 --timeout=60000 --output=../../.tmp/pw-mobile-output` 1 个 focused 用例通过；`pnpm --filter @newme/mobile exec playwright test tests/prototype-visual-regression.spec.js --reporter=line --workers=1 --timeout=120000 --output=../../test-results/web-compare-2026-05-08-final` 1 个 Web 对照用例通过。运行态已重启 Metro dev-client，执行 `adb reverse tcp:8081 tcp:8081`、`adb reverse tcp:37200 tcp:37200`，强停并重新打开 `com.newme.mobile` 后重新登录截图。
- 2026-05-08 断层修正：用户复核指出“我的”页中下段仍有明显断层。根因是上一版底色 `#020504` 叠加 `rgba(0, 0, 0, 0.24)` 全屏黑色暗角，把下半屏压成接近纯黑。本轮改为对齐 Web 原型的 `#091411 -> #060b0a -> #030605` 纵向渐变，取消强黑暗角，只保留底部极弱绿色线性收尾；防回归断言补充禁止 `#020504` 和 `rgba(0, 0, 0, 0.24)`。
- 新有效截图证据：`test-results/android-dev-build-visual-smoke/2026-05-08-linear-bg-continuity/energy-continuity.png`、`test-results/android-dev-build-visual-smoke/2026-05-08-linear-bg-continuity/todo-continuity-final.png`、`test-results/android-dev-build-visual-smoke/2026-05-08-linear-bg-continuity/me-continuity-now.png`。
