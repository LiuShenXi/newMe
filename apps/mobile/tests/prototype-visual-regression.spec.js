const path = require('path');
const { expect, test } = require('@playwright/test');
const { mockPrototypeApp } = require('./prototype-test-utils');

const baseUrl = process.env.EXPO_BASE_URL || 'http://localhost:37300';
const prototypeUrl = `file://${path.resolve(__dirname, '../../../prototype/index.html')}`;

test.use({
  viewport: { width: 430, height: 900 },
  isMobile: true,
});

async function bootPrototype(page) {
  await page.goto(prototypeUrl, { waitUntil: 'networkidle' });
  await page.getByText('开始规划').click();
  await page.getByText('先快速规划这个季度').click();
  await page.locator('#goal-input').fill('开发一款 App，上架到应用商店');
  await page.getByText('让 AI 帮我拆成这周行动').click();
  await page.waitForTimeout(1100);
  await page.getByText('进入能量页').click();
}

async function screenshotPrototype(page, name) {
  await page.locator('.phone').screenshot({ path: test.info().outputPath(`prototype-${name}.png`) });
}

async function screenshotClient(page, name) {
  await page.screenshot({ path: test.info().outputPath(`client-${name}.png`), fullPage: true });
}

async function boxFor(locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box;
}

function expectClose(actual, expected, tolerance = 2) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

function expectBoxClose(actual, expected, tolerance = 2) {
  expectClose(actual.x, expected.x, tolerance);
  expectClose(actual.y, expected.y, tolerance);
  expectClose(actual.width, expected.width, tolerance);
  expectClose(actual.height, expected.height, tolerance);
}

test('captures and compares prototype/client visual anchors', async ({ browser }) => {
  const proto = await browser.newPage({ viewport: { width: 430, height: 900 }, isMobile: true });
  await bootPrototype(proto);

  const client = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mockPrototypeApp(client);
  await client.goto(baseUrl, { waitUntil: 'networkidle' });

  await screenshotPrototype(proto, 'energy');
  await screenshotClient(client, 'energy');
  const clientNav = await boxFor(client.getByTestId('prototype-bottom-nav'));
  expectBoxClose(clientNav, { x: 0, y: 756, width: 390, height: 88 });
  const navButtons = await client.getByTestId('prototype-nav-button').all();
  expect(navButtons).toHaveLength(5);
  expectBoxClose(await boxFor(navButtons[0]), { x: 20, y: 766, width: 70, height: 58 }, 3);

  const primaryButton = await boxFor(client.getByTestId('prototype-button-primary').first());
  expect(primaryButton.height).toBeGreaterThanOrEqual(48);
  expect(primaryButton.height).toBeLessThanOrEqual(50);

  await proto.locator('.bottom-nav [data-tab="list"]').click();
  await client.goto(`${baseUrl}/todo`, { waitUntil: 'networkidle' });
  await screenshotPrototype(proto, 'list');
  await screenshotClient(client, 'list');
  const pill = await boxFor(client.getByTestId('prototype-button-pill').first());
  expect(pill.height).toBeGreaterThanOrEqual(33);
  expect(pill.height).toBeLessThanOrEqual(37);

  await client.getByLabel('打开本周概览').click();
  const weekModalLayer = await boxFor(client.getByTestId('prototype-modal-layer'));
  const weekModalCard = await boxFor(client.getByTestId('prototype-modal-card'));
  expectBoxClose(weekModalLayer, { x: 0, y: 0, width: 390, height: 844 });
  expect(weekModalCard.width).toBeGreaterThan(338);
  expect(weekModalCard.width).toBeLessThanOrEqual(342);
  await client.getByText('关闭').click();

  await client.getByLabel('编辑 跑步 30 分钟').click();
  const editSheet = await boxFor(client.getByTestId('prototype-edit-sheet'));
  expectBoxClose(editSheet, { x: 18, y: 529, width: 354, height: 297 });
  await client.getByText('取消').click();

  await proto.locator('.bottom-nav [data-tab="plan"]').click();
  await client.goto(`${baseUrl}/plan`, { waitUntil: 'networkidle' });
  await screenshotPrototype(proto, 'plan');
  await screenshotClient(client, 'plan');
  const replanButton = await boxFor(client.getByTestId('prototype-button-replan').first());
  expect(replanButton.height).toBeGreaterThanOrEqual(32);
  expect(replanButton.height).toBeLessThanOrEqual(36);

  await proto.locator('.bottom-nav [data-tab="tree"]').click();
  await client.goto(`${baseUrl}/tree`, { waitUntil: 'networkidle' });
  await screenshotPrototype(proto, 'tree');
  await screenshotClient(client, 'tree');
  const treeTools = await client.getByTestId('prototype-button-tree-tool').all();
  expect(treeTools).toHaveLength(3);

  await client.goto(baseUrl, { waitUntil: 'networkidle' });
  await client.getByText('确认今日能量').click();
  if (await client.getByText('继续注入').isVisible().catch(() => false)) {
    await client.getByText('继续注入').click();
  }
  const toast = await boxFor(client.getByTestId('prototype-toast'));
  expect(toast.y).toBeGreaterThan(680);
  expect(toast.height).toBeGreaterThanOrEqual(32);
  expect(toast.height).toBeLessThanOrEqual(34);
});
