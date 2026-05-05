const { chromium } = require("@playwright/test");
const path = require("path");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function expectVisible(page, text) {
  try {
    await page.waitForFunction((needle) => document.body.innerText.includes(needle), text, { timeout: 3000 });
  } catch (error) {
    throw new Error(`页面上未找到：${text}`);
  }
}

async function expectActionVisible(page, action) {
  await page.locator(`[data-action="${action}"]`).first().waitFor({ state: "visible", timeout: 3000 });
}

async function waitForSuggestion(page) {
  const firstSuggestion = page.locator(".suggestion-item p").first();
  await firstSuggestion.waitFor({ state: "visible", timeout: 3000 });
  return firstSuggestion.innerText();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const prototypeUrl = `file://${path.join(__dirname, "index.html")}`;

  page.on("pageerror", (error) => {
    throw error;
  });

  await page.goto(prototypeUrl);

  const quickGoal = "\u505a\u4e00\u4e2a\u80fd\u516c\u5f00\u6f14\u793a\u7684\u4e2a\u4eba\u6210\u957f App";
  const deepVision = "\u8eab\u4f53\u7a33\u5b9a\uff0c\u6301\u7eed\u521b\u4f5c\uff0c\u6709\u81ea\u5df1\u7684\u4f5c\u54c1\u6536\u5165";

  await page.locator('[data-action="onboard-next"]').click();
  await page.locator('[data-action="choose-quick-planning"]').click();
  await page.locator('[data-action="onboarding-back"]').click();
  await expectActionVisible(page, "choose-deep-planning");
  await page.locator('[data-action="choose-quick-planning"]').click();
  await page.locator("#goal-input").fill(quickGoal);
  await page.locator('[data-action="start-ai"]').click();
  const firstQuickSuggestion = await waitForSuggestion(page);
  await page.locator('[data-action="onboarding-back"]').click();
  assert(await page.locator("#goal-input").inputValue() === quickGoal, "quick planning input should be preserved after back");
  await page.locator('[data-action="start-ai"]').click();
  const quickSuggestionAfterReturn = await waitForSuggestion(page);
  assert(quickSuggestionAfterReturn === firstQuickSuggestion, "starting again after back should not auto-change action suggestions");
  await page.locator('[data-action="regenerate-current-onboarding"]').click();
  const regeneratedQuickSuggestion = await waitForSuggestion(page);
  assert(regeneratedQuickSuggestion !== firstQuickSuggestion, "regenerating action suggestions should change the first suggestion");

  await page.goto(prototypeUrl);
  await page.locator('[data-action="onboard-next"]').click();
  await page.locator('[data-action="choose-deep-planning"]').click();
  await page.locator('[data-action="onboarding-back"]').click();
  await expectActionVisible(page, "choose-quick-planning");
  await page.locator('[data-action="choose-deep-planning"]').click();
  await page.locator("#vision-input").fill(deepVision);
  await page.locator('[data-action="submit-vision"]').click();
  await page.locator('[data-action="onboarding-back"]').click();
  assert(await page.locator("#vision-input").inputValue() === deepVision, "deep planning vision should be preserved after back");
  await page.locator('[data-action="submit-vision"]').click();
  await page.locator('[data-action="build-annual-okr"]').click();
  const firstAnnualOkr = await page.locator("#annual-okr-0").inputValue();
  await page.locator('[data-action="regenerate-current-onboarding"]').click();
  const regeneratedAnnualOkr = await page.locator("#annual-okr-0").inputValue();
  assert(regeneratedAnnualOkr !== firstAnnualOkr, "regenerating annual OKR should change annual-okr-0");
  await page.locator('[data-action="confirm-annual-okrs"]').click();
  await page.locator('[data-action="onboarding-back"]').click();
  assert(await page.locator("#annual-okr-0").inputValue() === regeneratedAnnualOkr, "annual OKR should be preserved after returning from quarter page");

  await page.goto(prototypeUrl);
  await page.locator('[data-action="skip-onboarding"]').click();
  await page.locator('[data-action="change-tab"][data-tab="list"]').first().click();

  await page.locator('[data-action="edit-todo"]').first().click();
  await page.locator("#edit-input").fill("整理本周 3 个重点承诺和边界");
  await page.locator('[data-action="save-edit"]').click();
  await page.waitForTimeout(100);
  const editedTodo = await page.locator(".todo-text").first().innerText();
  assert(editedTodo.includes("整理本周 3 个重点承诺和边界"), "编辑后的待办文案未更新");

  assert(await page.locator('[data-action="move-todo"]').count() === 0, "不应再展示上下移动按钮");

  const firstSurface = page.locator(".todo-surface").first();
  const box = await firstSurface.boundingBox();
  assert(box, "找不到待办卡片");
  await page.mouse.move(box.x + box.width * 0.72, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.18, box.y + box.height / 2, { steps: 6 });
  await page.mouse.up();
  await page.locator('[data-action="delete-todo"]').first().click();
  assert(await page.getByText("整理本周 3 个重点承诺和边界").count() === 0, "左滑删除后的待办仍然可见");

  await page.locator('[data-action="open-week"]').click();
  assert(await page.getByText("整理本周 3 个重点承诺和边界").count() === 0, "本周概览仍显示已删除待办");
  await expectVisible(page, "跑步 30 分钟");

  await page.goto(prototypeUrl);
  await page.locator('[data-action="onboard-next"]').click();
  await page.locator('[data-action="choose-quick-planning"]').click();
  await page.getByRole("button", { name: /让 AI 帮我拆成这周行动/ }).click();
  await page.waitForTimeout(1100);
  await expectVisible(page, "今日清单建议");
  await page.getByRole("button", { name: "先看今日清单" }).click();
  await expectVisible(page, "4 月 26 日");

  await page.locator('[data-action="change-tab"][data-tab="plan"]').first().click();
  await page.locator('[data-action="replan"]').click();
  await page.locator("#plan-feedback").fill("这周工作会比较忙，阅读拆小，保留晨跑。");
  await page.locator('[data-action="submit-plan-feedback"]').click();
  await page.waitForTimeout(1100);
  await expectVisible(page, "根据反馈重排 AI 任务");

  await page.goto(prototypeUrl);
  await page.locator('[data-action="skip-onboarding"]').click();
  await page.locator('[data-action="change-tab"][data-tab="settlement"]').click();
  await page.locator("#settlement-score").evaluate((input) => {
    input.value = "91";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.locator("#settlement-reflection").fill("这一周把关键交互补上了，树应该记住这次推进。");
  await page.locator('[data-action="settle-confirm"]').click();
  await page.waitForTimeout(1000);
  assert(await page.locator('[data-action="open-fruit"]').count() === 7, "周结算后未生成新果实");

  await page.locator('[data-action="open-fruit"]').last().click();
  await expectVisible(page, "第 17 周");
  await expectVisible(page, "本周重点");
  await expectVisible(page, "这一周把关键交互补上了，树应该记住这次推进。");

  await browser.close();
  console.log("prototype interaction smoke passed");
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
