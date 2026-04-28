const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exitCode = 1;
  }
}

function sliceBetween(startToken, endToken) {
  const start = html.indexOf(startToken);
  const end = html.indexOf(endToken, start + startToken.length);
  assert(start !== -1, `缺少片段：${startToken}`);
  assert(end !== -1, `缺少片段结束：${endToken}`);
  return start !== -1 && end !== -1 ? html.slice(start, end) : "";
}

const listScreen = sliceBetween("function renderListScreen()", "function renderPlanScreen()");
const weekModal = sliceBetween("function renderWeekModal()", "function renderFruitModal()");
const weekData = sliceBetween("const DEFAULT_WEEK", "const DEFAULT_FOCUS");
const planScreen = sliceBetween("function renderPlanScreen()", "function renderTreeCanvas()");
const onboarding = sliceBetween("function renderOnboarding()", "function renderEnergyOrb()");
const settlement = sliceBetween("function renderSettlementScreen()", "function renderReminderModal()");
const fruitModal = sliceBetween("function renderFruitModal()", "function renderOverlays()");

assert(!listScreen.includes("week-strip"), "清单页应专注今日事项，不应再渲染底部日期切换条。");
assert(weekData.includes("todos:"), "本周数据需要为每天提供 todos 明细，而不是只有完成数和百分比。");
assert(weekModal.includes("day.todos") && weekModal.includes("week-modal-task"), "本周弹窗应展开每天的 TDL 明细。");
assert(planScreen.includes("plan-task-list"), "计划页的周计划应列出具体行动明细，而不是只给标签。");
assert(planScreen.includes("quarter-goal-list"), "计划页的季度视图应列出季度目标或阶段计划明细。");
assert(listScreen.includes('data-action="edit-todo"'), "清单页应提供编辑 todo 的交互入口。");
assert(listScreen.includes('data-action="delete-todo"'), "清单页应提供删除 todo 的交互入口。");
assert(listScreen.includes("todo-delete-reveal"), "清单页删除应通过左滑露出的垃圾桶完成。");
assert(!listScreen.includes('data-action="move-todo"'), "清单页不应再展示上下移动按钮。");
assert(onboarding.includes("今日清单建议"), "冷启动 AI 拆解结果应展示今日任务建议。");
assert(onboarding.includes("体验深度愿景规划"), "冷启动应推荐深度愿景规划入口。");
assert(onboarding.includes("先快速规划这个季度"), "冷启动应保留快速规划入口。");
assert(onboarding.includes("五年后，你希望自己成为一个什么样的人？"), "深度愿景规划应先询问五年愿景。");
assert(onboarding.includes("年度 OKR") && onboarding.includes("4 个季度 OKR"), "深度愿景规划应覆盖年度和季度 OKR。");
assert(onboarding.includes("首月 4 周承诺"), "深度愿景规划应拆到首月 4 周承诺。");
assert(settlement.includes("settlement-score") && settlement.includes("settlement-reflection"), "周结算应支持微调最终周结果并填写本周感悟。");
assert(fruitModal.includes("本周重点") && fruitModal.includes("fruit.focuses"), "果实时间胶囊应展示该周重点列表。");

if (!process.exitCode) {
  console.log("prototype regression checks passed");
}
