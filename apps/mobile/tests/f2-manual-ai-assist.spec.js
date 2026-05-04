const { expect, test } = require('@playwright/test');

const baseUrl = process.env.EXPO_BASE_URL || 'http://localhost:37300';
const apiBase = 'http://127.0.0.1:37200/api/v1';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});

test('manual week step generates local AI suggestions, accepts one, and continues to today todos', async ({ page }) => {
  const generateRequests = [];

  await page.route(`${apiBase}/ai/generations`, async (route) => {
    const request = route.request();
    generateRequests.push(JSON.parse(request.postData() || '{}'));

    await route.fulfill({
      contentType: 'application/json',
      json: {
        createdAt: '2026-04-30T09:07:00.000Z',
        id: 'generation-manual-week-1',
        outputJson: {
          suggestions: [
            {
              reason: '把当前开发目标收束到可验证的本周结果',
              title: '完成手动 OKR 局部 AI 辅助，并补一条端到端测试',
            },
            {
              reason: '保留用户主动掌控感',
              title: '确认留空继续不会覆盖年、季、月目标',
            },
          ],
        },
        scenario: 'manual_local_assist',
        status: 'completed',
      },
    });
  });

  await page.goto(`${baseUrl}/onboarding/manual/week`, { waitUntil: 'networkidle' });
  await page.getByPlaceholder('例如：完成手动 OKR 冷启动；计划页展示暂未设置；保留 3 次运动。').fill('本周先跑通手动路径');

  await page.getByText('AI 辅助').click();
  await expect(page.getByText('完成手动 OKR 局部 AI 辅助，并补一条端到端测试')).toBeVisible();

  await page.getByText('接受这条建议').first().click();
  await expect(page.getByPlaceholder('例如：完成手动 OKR 冷启动；计划页展示暂未设置；保留 3 次运动。')).toHaveValue(
    '完成手动 OKR 局部 AI 辅助，并补一条端到端测试',
  );

  await page.getByText('继续', { exact: true }).click();
  await expect(page.getByText('05 / 今日 ToDo')).toBeVisible();

  expect(generateRequests).toHaveLength(1);
  expect(generateRequests[0]).toMatchObject({
    input: {
      currentLevel: 'week',
      currentValue: '本周先跑通手动路径',
    },
    scenario: 'manual_local_assist',
  });
});
