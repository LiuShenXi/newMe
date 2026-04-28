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

assert(!listScreen.includes("week-strip"), "清单页应专注今日事项，不应再渲染底部日期切换条。");
assert(weekData.includes("todos:"), "本周数据需要为每天提供 todos 明细，而不是只有完成数和百分比。");
assert(weekModal.includes("day.todos") && weekModal.includes("week-modal-task"), "本周弹窗应展开每天的 TDL 明细。");
assert(planScreen.includes("plan-task-list"), "计划页的周计划应列出具体行动明细，而不是只给标签。");
assert(planScreen.includes("quarter-goal-list"), "计划页的季度视图应列出季度目标或阶段计划明细。");

if (!process.exitCode) {
  console.log("prototype regression checks passed");
}
