const { chromium } = require("playwright");
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

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const prototypeUrl = `file://${path.join(__dirname, "index.html")}`;

  page.on("pageerror", (error) => {
    throw error;
  });

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
  await page.getByRole("button", { name: "开始设置这个季度" }).click();
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
