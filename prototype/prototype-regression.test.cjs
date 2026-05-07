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
const profileScreen = sliceBetween("function renderProfileScreen()", "function renderSettlementScreen()");
const onboarding = sliceBetween("function renderOnboardingTopActions", "function renderEnergyOrb()");
const clickHandler = sliceBetween('document.addEventListener("click"', 'document.addEventListener("input"');
const settlement = sliceBetween("function renderSettlementScreen()", "function renderReminderModal()");
const fruitModal = sliceBetween("function renderFruitModal()", "function renderOverlays()");
const phoneShell = sliceBetween("function renderPhone(children, options = {})", "function renderOnboarding()");

assert(!listScreen.includes("week-strip"), "清单页应专注今日事项，不应再渲染底部日期切换条。");
assert(phoneShell.includes("phone-status-spacer"), "移除虚拟时间/电量后仍需要保留顶部状态栏安全占位。");
assert(!phoneShell.includes("09:07") && !phoneShell.includes("87%"), "顶部占位不应重新渲染写死的虚拟时间或电量。");
assert(html.includes("height: 32px;") && html.includes("flex: 0 0 32px;"), "顶部状态栏安全占位需要为灵动岛设备保留 32px。");
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
assert(html.includes('["me", "我的"]'), "底部导航需要包含第 5 个“我的”tab。");
assert(profileScreen.includes("profile-avatar") && profileScreen.includes("profile-edit-name"), "我的页需要提供头像和昵称编辑入口。");
assert(html.includes("profile-save-name") && html.includes("profile-confirm-logout"), "我的页需要支持保存昵称和确认退出。");
assert(clickHandler.includes('if (action === "profile-avatar")'), "点击处理需要支持头像 sheet。");
assert(clickHandler.includes('if (action === "profile-confirm-logout")'), "点击处理需要支持退出登录确认。");

assert(onboarding.includes('data-action="onboarding-back"'), "冷启动后续步骤需要提供返回上一步。");
assert(onboarding.includes('data-action="regenerate-current-onboarding"'), "冷启动 AI 草案层级需要提供重新生成入口。");
assert(onboarding.includes("重新生成年度 OKR"), "年度 OKR 页需要重新生成按钮。");
assert(onboarding.includes("重新生成季度 OKR"), "季度 OKR 页需要重新生成按钮。");
assert(onboarding.includes("重新生成 4 周承诺"), "4 周承诺页需要重新生成按钮。");
assert(onboarding.includes("重新生成行动建议"), "行动建议页需要重新生成按钮。");
assert(clickHandler.includes('if (action === "onboarding-back")'), "点击处理需要支持返回上一步。");
assert(clickHandler.includes('if (action === "regenerate-current-onboarding")'), "点击处理需要支持重新生成当前层级。");

if (!process.exitCode) {
  console.log("prototype regression checks passed");
}
