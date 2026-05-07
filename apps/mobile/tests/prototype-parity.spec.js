const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { mockPrototypeApp } = require('./prototype-test-utils');

const baseUrl = process.env.EXPO_BASE_URL || 'http://localhost:37300';
const mobileRoot = path.resolve(__dirname, '..');

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});

test.beforeEach(async ({ page }) => {
  await mockPrototypeApp(page);
});

test('mobile screens expose prototype-level chrome and copy', async ({ page }) => {
  await page.goto(`${baseUrl}/onboarding/choose`, { waitUntil: 'networkidle' });
  await expect(page.getByText('09:07')).toHaveCount(0);
  await expect(page.getByText('87%')).toHaveCount(0);
  await expect(page.getByText('先快速规划这个季度')).toBeVisible();

  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await expect(page.getByText('本周能量')).toBeVisible();
  await expect(page.getByText('本周进度概览')).toBeVisible();
  await expect(page.getByText('今日能量条')).toBeVisible();
  await expect(page.getByRole('tab', { name: /能量/ })).toBeVisible();
});

test('top chrome keeps invisible status spacer without fake system text', async ({ page }) => {
  await page.goto(`${baseUrl}/plan`, { waitUntil: 'networkidle' });

  await expect(page.getByText('09:07')).toHaveCount(0);
  await expect(page.getByText('87%')).toHaveCount(0);

  const spacer = await page.getByTestId('prototype-status-spacer').boundingBox();
  const segmented = await page.getByText('周/月计划').boundingBox();

  expect(spacer).not.toBeNull();
  expect(segmented).not.toBeNull();
  expect(Math.round(spacer.height)).toBe(32);
  expect(segmented.y).toBeGreaterThanOrEqual(60);
});

test('energy page keeps prototype vertical rhythm', async ({ page }) => {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

  const energyLabel = await page.getByText('本周能量').boundingBox();
  const sliderLabel = await page.getByText('今日能量条').boundingBox();
  const confirmButton = await page.getByText('确认今日能量').boundingBox();

  expect(energyLabel).not.toBeNull();
  expect(sliderLabel).not.toBeNull();
  expect(confirmButton).not.toBeNull();

  expect(energyLabel.y).toBeGreaterThan(190);
  expect(energyLabel.y).toBeLessThan(227);
  expect(sliderLabel.y).toBeGreaterThan(512);
  expect(sliderLabel.y).toBeLessThan(557);
  expect(confirmButton.y).toBeGreaterThan(632);
  expect(confirmButton.y).toBeLessThan(692);
});

test('energy orb exposes prototype visual structure anchors', async ({ page }) => {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

  await expect(page.getByTestId('energy-orb')).toBeVisible();
  await expect(page.getByTestId('energy-orb-aura')).toBeVisible();
  await expect(page.getByTestId('energy-orb-core')).toBeVisible();
  await expect(page.getByTestId('energy-orb-shadow')).toBeVisible();
  await expect(page.getByTestId('energy-orb-bubble')).toHaveCount(7);
  await expect(page.getByTestId('energy-orb-status')).toHaveText('静默充能中');
});

test('weekly progress panel uses a matte integrated treatment without card chrome', async ({ page }) => {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

  const panel = page.getByTestId('weekly-progress-panel');
  const badge = page.getByTestId('weekly-progress-badge');
  const track = page.getByTestId('weekly-progress-track').first();
  const fill = page.getByTestId('weekly-progress-fill').first();
  const value = page.getByTestId('weekly-progress-value').first();

  await expect(panel).toBeVisible();
  await expect(badge).toBeVisible();
  await expect(track).toBeVisible();
  await expect(fill).toBeVisible();

  const panelStyles = await panel.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      boxShadow: style.boxShadow,
    };
  });
  expect(panelStyles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(panelStyles.borderColor).toBe('rgba(0, 0, 0, 0)');
  expect(panelStyles.boxShadow).toBe('none');

  const badgeStyles = await badge.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      borderWidth: style.borderWidth,
    };
  });
  expect(badgeStyles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(badgeStyles.borderWidth).toBe('1px');

  const trackBox = await track.boundingBox();
  expect(trackBox).not.toBeNull();
  expect(trackBox.height).toBeLessThanOrEqual(3);

  const fillColor = await fill.evaluate((element) => getComputedStyle(element).backgroundColor);
  const valueColor = await value.evaluate((element) => getComputedStyle(element).color);
  expect(fillColor).toBe('rgb(125, 211, 202)');
  expect(valueColor).toBe('rgb(207, 221, 218)');
});

test('native energy orb is implemented with Skia instead of web-only CSS', async () => {
  const nativeOrbPath = path.join(mobileRoot, 'src/features/energy/components/EnergyOrb.native.tsx');
  const source = fs.readFileSync(nativeOrbPath, 'utf8');

  expect(source).toContain("@shopify/react-native-skia");
  expect(source).toContain("RadialGradient");
  expect(source).toContain("BlurMask");
  expect(source).not.toContain("backgroundImage");
  expect(source).not.toContain("boxShadow");
  expect(source).not.toContain("filter:");
});

test('native energy orb avoids the Expo Go Reanimated bridge at runtime', async () => {
  const nativeOrbPath = path.join(mobileRoot, 'src/features/energy/components/EnergyOrb.native.tsx');
  const source = fs.readFileSync(nativeOrbPath, 'utf8');

  expect(source).not.toContain("from '@shopify/react-native-skia';");
  expect(source).not.toContain("from 'react-native-reanimated';");
});

test('native energy orb declares Skia animation peer dependencies', async () => {
  const packageJsonPath = path.join(mobileRoot, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  expect(manifest.dependencies['@shopify/react-native-skia']).toBeTruthy();
  expect(manifest.dependencies['react-native-reanimated']).toBeTruthy();
  expect(manifest.dependencies['react-native-worklets']).toBeTruthy();
});

test('native animation stack enables the Worklets Babel plugin', async () => {
  const babelConfigPath = path.join(mobileRoot, 'babel.config.js');
  const source = fs.readFileSync(babelConfigPath, 'utf8');

  expect(source).toContain('babel-preset-expo');
  expect(source).toContain('react-native-worklets/plugin');
});

test('auth bootstrap catches stale-token profile loads', async () => {
  const layoutPath = path.join(mobileRoot, 'app/_layout.tsx');
  const source = fs.readFileSync(layoutPath, 'utf8');

  expect(source).toContain('void loadMe().catch');
});

test('bottom nav sits on the prototype bottom edge', async ({ page }) => {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

  const nav = await page.getByTestId('prototype-bottom-nav').boundingBox();
  const activeTab = page.getByTestId('prototype-nav-button').first();
  const activeTabBackground = await activeTab.evaluate((element) => getComputedStyle(element).backgroundColor);

  expect(nav).not.toBeNull();
  expect(Math.round(nav.x)).toBe(0);
  expect(Math.round(nav.width)).toBe(390);
  expect(Math.round(844 - (nav.y + nav.height))).toBe(0);
  expect(activeTabBackground).toBe('rgba(0, 0, 0, 0)');
});

test('energy bar matches the gold capsule reference composition', async ({ page }) => {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

  await expect(page.getByTestId('energy-value-label')).toHaveText('62%');
  await expect(page.getByTestId('energy-bar-card')).toBeVisible();
  await expect(page.getByTestId('energy-bar-hud-line')).toHaveCount(4);
  await expect(page.getByTestId('energy-bar-hud-corner')).toHaveCount(4);
  await expect(page.getByTestId('energy-bar-fill')).toBeVisible();
  await expect(page.getByTestId('energy-bar-tail-fade')).toHaveCount(1);
  await expect(page.getByTestId('energy-bar-particle')).toHaveCount(22);
  await expect(page.getByTestId('legacy-energy-thumb')).toHaveCount(0);

  const card = await page.getByTestId('energy-bar-card').boundingBox();
  const track = await page.getByTestId('energy-bar-track').boundingBox();
  const fill = await page.getByTestId('energy-bar-fill').boundingBox();

  expect(card).not.toBeNull();
  expect(track).not.toBeNull();
  expect(fill).not.toBeNull();
  expect(card.height).toBeGreaterThanOrEqual(104);
  expect(card.height).toBeLessThanOrEqual(124);
  expect(track.height).toBeGreaterThanOrEqual(35);
  expect(track.height).toBeLessThanOrEqual(45);
  expect(fill.width / track.width).toBeGreaterThan(0.58);
  expect(fill.width / track.width).toBeLessThan(0.66);

  const cardChrome = await page.getByTestId('energy-bar-card').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      borderWidth: style.borderWidth,
      boxShadow: style.boxShadow,
    };
  });
  expect(cardChrome.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(cardChrome.borderColor).toBe('rgba(0, 0, 0, 0)');
  expect(cardChrome.borderWidth).toBe('0px');
  expect(cardChrome.boxShadow).toBe('none');

  const tailBackground = await page.getByTestId('energy-bar-tail').evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(tailBackground).toBe('rgba(0, 0, 0, 0)');
});

test('energy bar remains clean at zero without stray glow blocks', async ({ page }) => {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

  const track = await page.getByTestId('energy-bar-track').boundingBox();
  expect(track).not.toBeNull();
  await page.mouse.click(track.x + 1, track.y + track.height / 2);

  await expect(page.getByTestId('energy-value-label')).toHaveText('0%');
  const fill = await page.getByTestId('energy-bar-fill').boundingBox();
  const tail = await page.getByTestId('energy-bar-tail').boundingBox();

  expect(fill).not.toBeNull();
  expect(tail).not.toBeNull();
  expect(fill.width).toBeLessThanOrEqual(4);
  expect(tail.width).toBeLessThanOrEqual(4);
});

test('energy bar follows the finger while dragging', async ({ page }) => {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

  const track = await page.getByTestId('energy-bar-track').boundingBox();
  expect(track).not.toBeNull();

  await page.mouse.move(track.x + track.width * 0.12, track.y + track.height / 2);
  await page.mouse.down();
  await page.mouse.move(track.x + track.width * 0.82, track.y + track.height / 2, { steps: 12 });

  await expect(page.getByTestId('energy-value-label')).toHaveText(/8[0-4]%/);
  await page.mouse.up();
});

test('energy confirm button keeps a mis-tap gap below the energy bar', async ({ page }) => {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

  const energyBar = await page.getByTestId('energy-bar-card').boundingBox();
  const confirmButton = await page.getByTestId('prototype-button-primary').first().boundingBox();

  expect(energyBar).not.toBeNull();
  expect(confirmButton).not.toBeNull();
  expect(confirmButton.y - (energyBar.y + energyBar.height)).toBeGreaterThanOrEqual(26);
});

test('growth tree is no longer a placeholder', async ({ page }) => {
  await page.goto(`${baseUrl}/tree`, { waitUntil: 'networkidle' });
  await expect(page.getByText('6')).toBeVisible();
  await expect(page.getByText('果实', { exact: true })).toBeVisible();
  await expect(page.getByText('Q2')).toBeVisible();
  await expect(page.getByText('阶段')).toBeVisible();
  await expect(page.getByText('1')).toBeVisible();
  await expect(page.getByText('荣誉')).toBeVisible();
  await expect(page.getByText('点击果实查看时间胶囊')).toBeVisible();
  await expect(page.getByText('年度成长树、果实和荣誉层会在 C9 接入。')).toHaveCount(0);
});

test('mobile interactions match prototype copy without visual inspection', async ({ page }) => {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

  await page.getByText('确认今日能量').click();
  await expect(page.getByText('要不要先看看今天的清单？')).toBeVisible();
  await expect(page.getByText('先看清单')).toBeVisible();
  await expect(page.getByText('继续注入')).toBeVisible();
  await page.getByText('先看清单').click();
  await expect(page).toHaveURL(/\/todo$/);
  await expect(page.getByText('4 月 26 日')).toBeVisible();
  await page.getByRole('tab', { name: /能量/ }).click();
  await page.getByText('确认今日能量').click();
  await expect(page.getByText('要不要先看看今天的清单？')).toHaveCount(0);
  await expect(page.getByText('今日能量已注入')).toBeVisible();

  await page.goto(`${baseUrl}/plan`, { waitUntil: 'networkidle' });
  await expect(page.getByText('只规划最近一个月，避免计划过远失效')).toBeVisible();
  await expect(page.getByText('AI 重规划')).toBeVisible();
  await expect(page.getByText('手动 OKR')).toHaveCount(0);
  await page.getByText('AI 重规划').click();
  await expect(page.getByText('告诉 AI 这周哪里变了')).toBeVisible();
  await page.getByText('生成新版本').click();
  await expect(page.getByText('把任务密度从 4 件降到 3 件，先保证能完成')).toBeVisible();

  await page.goto(`${baseUrl}/todo`, { waitUntil: 'networkidle' });
  const todo = page.getByLabel('切换 跑步 30 分钟');
  const box = await todo.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box.x + box.width - 8, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 20, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.getByLabel('删除 跑步 30 分钟').click();
  await expect(page.getByText('跑步 30 分钟')).toHaveCount(0);

  await page.goto(`${baseUrl}/settlement`, { waitUntil: 'networkidle' });
  await expect(page.getByText('这一周辛苦了，')).toBeVisible();
  await expect(page.getByText('最终周结果')).toBeVisible();
  await expect(page.getByText('确认并生成果实')).toBeVisible();
  await page.getByText('确认并生成果实').click();
  await expect(page).toHaveURL(/\/tree$/);
  await expect(page.getByLabel('打开第 17 周')).toBeVisible();

  await page.goto(`${baseUrl}/tree`, { waitUntil: 'networkidle' });
  await page.getByLabel('打开第 16 周').click();
  await expect(page.getByText('time capsule')).toBeVisible();
  await expect(page.getByText('果实亮度来自周结算确认值').first()).toBeVisible();
});
