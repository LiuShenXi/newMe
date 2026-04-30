const { test, expect } = require('@playwright/test');

const baseUrl = process.env.EXPO_BASE_URL || 'http://localhost:19008';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});

test('mobile screens expose prototype-level chrome and copy', async ({ page }) => {
  await page.goto(`${baseUrl}/onboarding/choose`, { waitUntil: 'networkidle' });
  await expect(page.getByText('09:07')).toBeVisible();
  await expect(page.getByText('87%')).toBeVisible();
  await expect(page.getByText('先快速规划这个季度')).toBeVisible();

  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await expect(page.getByText('本周能量')).toBeVisible();
  await expect(page.getByText('本周进度概览')).toBeVisible();
  await expect(page.getByText('今日能量条')).toBeVisible();
  await expect(page.getByRole('tab', { name: /能量/ })).toBeVisible();
});

test('energy page keeps prototype vertical rhythm', async ({ page }) => {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

  const energyLabel = await page.getByText('本周能量').boundingBox();
  const sliderLabel = await page.getByText('今日能量条').boundingBox();
  const confirmButton = await page.getByText('确认今日能量').boundingBox();

  expect(energyLabel).not.toBeNull();
  expect(sliderLabel).not.toBeNull();
  expect(confirmButton).not.toBeNull();

  expect(energyLabel.y).toBeGreaterThan(178);
  expect(energyLabel.y).toBeLessThan(215);
  expect(sliderLabel.y).toBeGreaterThan(500);
  expect(sliderLabel.y).toBeLessThan(545);
  expect(confirmButton.y).toBeGreaterThan(620);
  expect(confirmButton.y).toBeLessThan(680);
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
  await expect(page.getByText('果实亮度来自周结算确认值')).toBeVisible();
});
