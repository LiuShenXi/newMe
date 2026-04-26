import React, { useMemo, useState } from "react";

const DEFAULT_WEEK = [
  { d: "一", v: 72, tasks: "3/3" },
  { d: "二", v: 84, tasks: "3/3" },
  { d: "三", v: 66, tasks: "2/4" },
  { d: "四", v: 88, tasks: "4/4" },
  { d: "五", v: 78, tasks: "2/3" },
  { d: "六", v: 0, tasks: "0/2" },
  { d: "日", v: 0, tasks: "0/3" },
];

const DEFAULT_FOCUS = [
  { title: "完成能量页交互原型", value: 68, note: "前端结构已完成" },
  { title: "晨跑 5 次", value: 60, note: "已完成 3 / 5" },
  { title: "读完两章社会学", value: 40, note: "第 2 章进行中" },
];

const DEFAULT_TODOS = [
  { id: 1, text: "整理本周 3 个重点承诺", done: true },
  { id: 2, text: "完成能量球动效第一版", done: true },
  { id: 3, text: "跑步 30 分钟", done: false },
  { id: 4, text: "睡前阅读 20 分钟", done: false },
];

const MONTH_WEEKS = [
  { week: "W15", state: "已结算", title: "冷启动闭环", score: 76, items: ["季度目标输入", "AI 拆解", "首次能量记录"] },
  { week: "W16", state: "当前周", title: "能量页体验打磨", score: 78, items: ["能量球动效", "本周概览", "打分提醒"] },
  { week: "W17", state: "计划中", title: "AI 拆解优化", score: null, items: ["目标类型识别", "任务质量优化", "重新规划"] },
  { week: "W18", state: "计划中", title: "成长树时间胶囊", score: null, items: ["果实详情", "周回顾", "荣誉层"] },
];

const YEAR_QUARTERS = [
  { q: "Q1", title: "起始阶段", score: 76, desc: "跑通目标 → 清单 → 能量 → 果实的核心闭环。" },
  { q: "Q2", title: "成长阶段", score: 43, desc: "打磨 AI 拆解、月计划和成长树反馈。" },
  { q: "Q3", title: "丰茂阶段", score: null, desc: "扩大目标类型，验证持续使用意愿。" },
  { q: "Q4", title: "年度完成", score: null, desc: "完成年度回看和荣誉层沉淀。" },
];

const FRUITS = [
  { week: "第 11 周", date: "2026-03-15", score: 72, x: 94, y: 226, s: 18, note: "完成登录模块前后端，恢复晨跑节奏。" },
  { week: "第 12 周", date: "2026-03-22", score: 86, x: 145, y: 170, s: 24, note: "原型推进明显，阅读完成两章。" },
  { week: "第 13 周", date: "2026-03-29", score: 64, x: 224, y: 214, s: 20, note: "工作较忙，但保留了最低推进。" },
  { week: "第 14 周", date: "2026-04-05", score: 79, x: 252, y: 150, s: 16, note: "完成清单页基础结构。" },
  { week: "第 15 周", date: "2026-04-12", score: 76, x: 122, y: 132, s: 14, note: "冷启动闭环跑通。" },
  { week: "第 16 周", date: "2026-04-19", score: 78, x: 176, y: 260, s: 22, note: "能量球方向确认，准备做交互版本。" },
];

function Icon({ type }) {
  if (type === "energy") {
    return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M13 2 5 14h6l-1 8 9-13h-6l0-7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>;
  }
  if (type === "list") {
    return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
  }
  if (type === "plan") {
    return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M7 3v18M7 6h9l-2 3 2 3H7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M12 21v-8M12 13c-4.2 0-6-2.2-6-5.5C9 7.5 11 9 12 13Zm0 0c4.2 0 6-2.2 6-5.5-3 0-5 1.5-6 5.5ZM12 21c3.5-1.6 6-4.4 6-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Phone({ children, tab = "energy", onTabChange, showNav = true }) {
  const tabs = [["energy", "能量"], ["list", "清单"], ["plan", "计划"], ["tree", "成长树"]];
  return (
    <div className="relative h-[812px] w-[393px] shrink-0 overflow-hidden rounded-[46px] border border-emerald-200/10 bg-[#07110f] shadow-[0_30px_90px_rgba(0,0,0,.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(37,255,219,.12),transparent_28%),radial-gradient(circle_at_20%_90%,rgba(120,255,175,.10),transparent_35%),linear-gradient(180deg,#091411_0%,#060b0a_55%,#030605_100%)]" />
      <div className="absolute inset-0 opacity-[.15]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <div className="relative flex h-full flex-col px-5 pb-5 pt-4 text-slate-100">
        <div className="flex h-5 items-center justify-between text-[12px] text-slate-300/70">
          <span>09:07</span>
          <div className="h-4 w-28 rounded-full bg-black/35 shadow-inner" />
          <span>87%</span>
        </div>
        <main className="min-h-0 flex-1 pt-3">{children}</main>
        {showNav && (
          <nav className="grid h-[70px] grid-cols-4 rounded-[26px] border border-emerald-100/10 bg-[#0a1613]/85 p-2 shadow-[0_-10px_40px_rgba(0,0,0,.3)] backdrop-blur-2xl">
            {tabs.map(([id, label]) => (
              <button key={id} onClick={() => onTabChange?.(id)} className={`flex flex-col items-center justify-center gap-1 rounded-2xl text-[11px] transition active:scale-[.96] ${tab === id ? "bg-cyan-200/10 text-cyan-100 shadow-[inset_0_0_24px_rgba(65,255,226,.11)]" : "text-slate-500 hover:bg-white/[0.035] hover:text-slate-300"}`}>
                <Icon type={id} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

function GlassCard({ children, className = "" }) {
  return <section className={`rounded-[26px] border border-emerald-200/10 bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_20px_48px_rgba(0,0,0,.22)] backdrop-blur-xl ${className}`}>{children}</section>;
}

function Modal({ children, onClose }) {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-black/55 px-6 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full rounded-[30px] border border-cyan-100/15 bg-[#07110f]/95 p-5 shadow-[0_30px_80px_rgba(0,0,0,.55)] animate-panel" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function EnergyOrb({ value, charging }) {
  return (
    <div className="relative mx-auto grid h-[242px] w-[242px] place-items-center">
      <div className={`absolute inset-0 rounded-full bg-cyan-200/10 blur-3xl ${charging ? "animate-orb-aura" : ""}`} />
      <div className={`absolute h-[224px] w-[224px] rounded-full border border-cyan-100/45 bg-[radial-gradient(circle_at_45%_38%,rgba(121,255,234,.22),rgba(15,32,38,.7)_50%,rgba(5,12,13,.95)_72%)] shadow-[0_0_42px_rgba(77,255,230,.28),inset_0_-28px_42px_rgba(95,255,215,.22),inset_0_18px_60px_rgba(255,255,255,.07)] ${charging ? "animate-orb-charge" : ""}`} />
      <div className="absolute bottom-2 h-8 w-40 rounded-full bg-cyan-200/40 blur-2xl" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span key={i} className={`absolute rounded-full border border-cyan-100/40 bg-cyan-200/10 shadow-[inset_0_-8px_18px_rgba(74,255,224,.24),0_0_20px_rgba(74,255,224,.25)] ${charging ? "animate-bubble-rise" : ""}`} style={{ width: 16 + i * 5, height: 16 + i * 5, left: `${42 + (i % 4) * 40}px`, bottom: `${12 + (i % 5) * 20}px`, opacity: 0.42 - i * 0.026, animationDelay: `${i * 90}ms` }} />
      ))}
      <div className="relative text-center">
        <div className="text-[58px] font-light leading-none tracking-[-0.08em] text-white transition-all duration-300">{value}<span className="text-2xl tracking-normal text-cyan-100/90">%</span></div>
        <div className="mt-3 text-[13px] font-medium tracking-[0.18em] text-amber-200/90">本周能量</div>
        <div className={`mx-auto mt-3 w-fit rounded-lg border px-3 py-1 text-xs transition ${charging ? "border-amber-100/40 bg-amber-100/10 text-amber-50" : "border-cyan-100/20 text-cyan-50/70"}`}>{charging ? "能量注入中" : "静默充能中"}</div>
      </div>
    </div>
  );
}

function OnboardingScreen({ goal, setGoal, onFinish }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const startAI = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); }, 1000);
  };

  return (
    <Phone tab="tree" showNav={false}>
      {step === 0 && (
        <div className="animate-panel pt-4">
          <div className="rounded-[34px] border border-emerald-200/10 bg-[radial-gradient(circle_at_50%_28%,rgba(123,255,194,.18),transparent_44%),rgba(255,255,255,.035)] p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
            <div className="relative mx-auto h-80 w-60">
              <div className="absolute bottom-5 left-1/2 h-40 w-4 -translate-x-1/2 rounded-t-full bg-[#51351d]" />
              <div className="absolute bottom-40 left-[92px] h-24 w-24 rounded-full bg-[radial-gradient(circle_at_38%_30%,rgba(152,255,197,.8),rgba(32,101,70,.72))] shadow-[0_0_45px_rgba(97,255,184,.22)]" />
              <div className="absolute bottom-26 left-[58px] h-28 w-28 rounded-full bg-[radial-gradient(circle_at_38%_30%,rgba(152,255,197,.65),rgba(30,86,62,.72))]" />
              <div className="absolute bottom-22 right-[42px] h-28 w-28 rounded-full bg-[radial-gradient(circle_at_38%_30%,rgba(152,255,197,.58),rgba(27,78,58,.75))]" />
              <div className="absolute bottom-0 left-1/2 h-5 w-44 -translate-x-1/2 rounded-full bg-emerald-200/30 blur-2xl" />
            </div>
            <p className="text-sm leading-6 text-slate-300">这是你今年的成长树，<br />它会陪你走过四个季节。</p>
          </div>
          <button onClick={() => setStep(1)} className="mt-5 w-full rounded-2xl border border-cyan-100/20 bg-cyan-100/10 py-4 text-sm font-medium text-cyan-50 shadow-[0_0_30px_rgba(63,255,227,.12)] active:scale-[.98]">开始设置这个季度</button>
        </div>
      )}
      {step === 1 && (
        <div className="animate-panel pt-10">
          <GlassCard className="p-5">
            <p className="text-lg font-medium leading-7 text-white">这个季度，你最想推进的一件事是什么？</p>
            <textarea value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-5 h-40 w-full resize-none rounded-3xl border border-white/[0.08] bg-black/25 p-4 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-100/30" placeholder="例如：开发一款 App，上架到应用商店" />
            <p className="mt-3 text-xs leading-5 text-slate-400">先用一件事跑通完整闭环，之后再补充其他方向。</p>
          </GlassCard>
          <button disabled={!goal.trim() || loading} onClick={startAI} className="mt-5 w-full rounded-2xl bg-cyan-100/12 py-4 text-sm font-medium text-cyan-50 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[.98]">{loading ? "正在拆成本周行动…" : "让 AI 帮我拆成这周行动"}</button>
          {loading && <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-[linear-gradient(90deg,#70ffbe,#55ffe0,#e9d58a)] animate-loading-bar" /></div>}
        </div>
      )}
      {step === 2 && (
        <div className="animate-panel pt-5">
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/50">weekly focus</p>
            <h3 className="mt-2 text-lg font-semibold text-white">本周先推进这 3 件事</h3>
            <div className="mt-5 space-y-3">
              {DEFAULT_FOCUS.map((item, i) => (
                <div key={item.title} className="rounded-2xl border border-white/[0.06] bg-black/18 p-3">
                  <p className="text-sm text-slate-100">{i + 1}. {item.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.note}</p>
                </div>
              ))}
            </div>
          </GlassCard>
          <button onClick={onFinish} className="mt-5 w-full rounded-2xl border border-cyan-100/20 bg-cyan-100/10 py-4 text-sm font-medium text-cyan-50 shadow-[0_0_30px_rgba(63,255,227,.12)] active:scale-[.98]">进入 NewMe</button>
        </div>
      )}
    </Phone>
  );
}

function EnergyScreen({ energyValue, setEnergyValue, weekEnergy, charging, focusItems, viewedList, onConfirm, onTabChange }) {
  const [showReminder, setShowReminder] = useState(false);
  const [toast, setToast] = useState(false);

  const doConfirm = () => {
    onConfirm();
    setToast(true);
    setTimeout(() => setToast(false), 1400);
  };
  const confirm = () => {
    if (!viewedList) return setShowReminder(true);
    doConfirm();
  };

  return (
    <Phone tab="energy" onTabChange={onTabChange}>
      <div className="flex h-full flex-col gap-3 overflow-hidden pb-2">
        <EnergyOrb value={weekEnergy} charging={charging} />

        <GlassCard className="shrink-0 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">本周进度概览</h3>
            <span className="rounded-full bg-emerald-200/10 px-3 py-1 text-[11px] text-emerald-100/70">打分参照</span>
          </div>
          <div className="space-y-3">
            {focusItems.map((item) => (
              <div key={item.title}>
                <div className="mb-1.5 flex justify-between gap-3 text-xs">
                  <span className="truncate text-slate-200">{item.title}</span>
                  <span className="text-cyan-100">{item.value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100/10">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,rgba(112,255,190,.75),rgba(75,229,255,.95))] transition-all duration-300" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="shrink-0 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-white">今日能量条</span>
            <span className="text-amber-100">{energyValue}%</span>
          </div>
          <input aria-label="今日推进度" type="range" min="0" max="100" value={energyValue} onChange={(e) => setEnergyValue(Number(e.target.value))} className="w-full accent-cyan-200" />
        </GlassCard>

        <button onClick={confirm} className="shrink-0 rounded-2xl border border-cyan-100/20 bg-cyan-100/10 py-3.5 text-sm font-medium text-cyan-50 shadow-[0_0_30px_rgba(63,255,227,.12)] active:scale-[.98]">确认今日能量</button>
      </div>

      {toast && <div className="absolute bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full border border-cyan-100/20 bg-black/55 px-4 py-2 text-xs text-cyan-50 backdrop-blur-xl animate-panel">今日能量已注入</div>}
      {showReminder && (
        <Modal onClose={() => setShowReminder(false)}>
          <p className="text-sm font-medium text-white">要不要先看看今天的清单？</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">看起来今天的清单还没看过。你可以先看一眼，再决定今日推进度。</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={() => { setShowReminder(false); onTabChange?.("list"); }} className="rounded-2xl bg-cyan-100/12 py-3 text-sm text-cyan-50">先看清单</button>
            <button onClick={() => { setShowReminder(false); doConfirm(); }} className="rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm text-slate-200">继续注入</button>
          </div>
        </Modal>
      )}
    </Phone>
  );
}

function ListScreen({ todos, setTodos, focusItems, weekRecords, onOpenWeek, onTabChange, selectedWeek }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const doneCount = todos.filter((t) => t.done).length;
  const toggleTodo = (id) => setTodos((prev) => prev.map((todo) => todo.id === id ? { ...todo, done: !todo.done } : todo));
  const addTodo = () => {
    if (!draft.trim()) return;
    setTodos((prev) => [...prev, { id: Date.now(), text: draft.trim(), done: false }]);
    setDraft("");
    setAdding(false);
  };

  return (
    <Phone tab="list" onTabChange={onTabChange}>
      <div className="flex h-full flex-col gap-4 overflow-hidden pb-2">
        <div className="flex gap-2 overflow-hidden pt-1">
          {focusItems.map((item) => <span key={item.title} className="shrink-0 rounded-full border border-emerald-200/10 bg-emerald-200/8 px-3 py-2 text-xs text-emerald-50/75">{item.title.slice(0, 7)}</span>)}
        </div>
        <GlassCard className="min-h-0 flex-1 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">4 月 26 日</h3>
              <p className="mt-1 text-xs text-slate-400">{selectedWeek ? `来自 ${selectedWeek} 的计划` : `已完成 ${doneCount} / ${todos.length}`}</p>
            </div>
            <button onClick={onOpenWeek} className="rounded-full border border-cyan-100/15 bg-cyan-100/8 px-3 py-2 text-xs text-cyan-100 active:scale-[.96]">本周</button>
          </div>
          <div className="mt-5 space-y-3 overflow-y-auto pr-1">
            {todos.map((todo, i) => (
              <button key={todo.id} onClick={() => toggleTodo(todo.id)} className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.06] bg-black/18 px-3 py-3 text-left transition hover:border-cyan-100/20 active:scale-[.99]">
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${todo.done ? "border-cyan-100/40 bg-cyan-100/20 text-cyan-50" : "border-slate-500/50 text-slate-500"}`}>{todo.done ? "✓" : i + 1}</span>
                <span className={`text-sm ${todo.done ? "text-slate-400 line-through decoration-cyan-100/40" : "text-slate-100"}`}>{todo.text}</span>
              </button>
            ))}
          </div>
          {adding ? (
            <div className="mt-4 rounded-2xl border border-cyan-100/15 bg-black/20 p-3">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTodo()} autoFocus className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="写下一件今天要做的小事" />
              <div className="mt-3 flex gap-2">
                <button onClick={addTodo} className="flex-1 rounded-xl bg-cyan-100/12 py-2 text-xs text-cyan-50">添加</button>
                <button onClick={() => setAdding(false)} className="flex-1 rounded-xl bg-white/[0.04] py-2 text-xs text-slate-300">取消</button>
              </div>
            </div>
          ) : <button onClick={() => setAdding(true)} className="mt-4 w-full rounded-2xl border border-emerald-200/10 bg-white/[0.04] py-3 text-sm text-emerald-50/80 active:scale-[.98]">＋ 添加一件小事</button>}
        </GlassCard>
        <GlassCard className="shrink-0 p-4">
          <div className="grid grid-cols-7 gap-2">
            {weekRecords.map((day, i) => <div key={day.d} className={`rounded-2xl border px-2 py-2 text-center ${i === 6 ? "border-cyan-100/35 bg-cyan-100/10" : "border-white/[0.06] bg-white/[0.035] opacity-70"}`}><p className="text-xs text-slate-300">{day.d}</p><p className="mt-1 text-xs text-white">{day.tasks}</p></div>)}
          </div>
        </GlassCard>
      </div>
    </Phone>
  );
}

function PlanScreen({ monthWeeks, yearQuarters, setMonthWeeks, onTabChange, onSelectWeek }) {
  const [view, setView] = useState("month");
  const [planning, setPlanning] = useState(false);
  const replan = () => {
    setPlanning(true);
    setTimeout(() => {
      setMonthWeeks((prev) => prev.map((item) => item.week === "W17" ? { ...item, title: "根据本周结果重排 AI 任务", items: ["调整任务密度", "保留晨跑", "压缩阅读量"] } : item));
      setPlanning(false);
    }, 1000);
  };

  return (
    <Phone tab="plan" onTabChange={onTabChange}>
      <div className="flex h-full flex-col overflow-hidden pb-2">
        <div className="grid grid-cols-2 gap-2 rounded-[22px] border border-white/10 bg-black/22 p-1.5">
          <button onClick={() => setView("month")} className={`rounded-[17px] py-2.5 text-sm transition active:scale-[.98] ${view === "month" ? "bg-cyan-100/12 text-cyan-50 shadow-[0_0_24px_rgba(77,255,230,.12)]" : "text-slate-500"}`}>月计划 · 按周</button>
          <button onClick={() => setView("year")} className={`rounded-[17px] py-2.5 text-sm transition active:scale-[.98] ${view === "year" ? "bg-cyan-100/12 text-cyan-50 shadow-[0_0_24px_rgba(77,255,230,.12)]" : "text-slate-500"}`}>年计划 · 按 Q</button>
        </div>

        {view === "month" ? (
          <div className="min-h-0 flex-1 overflow-y-auto pt-5 pr-1 animate-panel">
            <GlassCard className="mb-5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs uppercase tracking-[0.2em] text-emerald-100/50">April · 4 weeks</p><h3 className="mt-2 text-base font-semibold tracking-[-0.03em] text-white">只规划最近一个月，避免计划过远失效</h3></div>
                <button onClick={replan} className="shrink-0 rounded-full bg-amber-200/10 px-3 py-2 text-xs text-amber-100 active:scale-[.96]">{planning ? "生成中" : "AI 重规划"}</button>
              </div>
              {planning && <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-[linear-gradient(90deg,#70ffbe,#55ffe0,#e9d58a)] animate-loading-bar" /></div>}
            </GlassCard>
            <div className="space-y-3">
              {monthWeeks.map((node) => (
                <button key={node.week} onClick={() => onSelectWeek(node.week)} className={`w-full rounded-[26px] border p-4 text-left transition active:scale-[.99] ${node.state === "当前周" ? "border-cyan-100/30 bg-cyan-100/8" : "border-white/[0.07] bg-white/[0.035]"}`}>
                  <div className="flex items-center justify-between"><span className="text-sm font-medium text-white">{node.week} · {node.title}</span><span className="text-xs text-cyan-100/80">{node.score ? `${node.score}%` : node.state}</span></div>
                  <div className="mt-3 flex flex-wrap gap-2">{node.items.map((it) => <span key={it} className="rounded-full border border-white/10 bg-black/18 px-2.5 py-1 text-[11px] text-slate-300">{it}</span>)}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pt-5 pr-1 animate-panel">
            <GlassCard className="mb-5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/50">2026 · yearly map</p>
              <h3 className="mt-2 text-base font-semibold tracking-[-0.03em] text-white">年度只看四个季度的阶段变化</h3>
            </GlassCard>
            <div className="space-y-3">
              {yearQuarters.map((q, i) => (
                <div key={q.q} className={`rounded-[28px] border p-4 ${q.q === "Q2" ? "border-cyan-100/30 bg-cyan-100/8" : "border-white/[0.07] bg-white/[0.035]"}`}>
                  <div className="flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-full border border-emerald-100/15 bg-black/22 text-sm text-white">{q.q}</div><span className="text-xs text-slate-400">{q.score === null ? "未开始" : `${q.score}%`}</span></div>
                  <h3 className="mt-3 text-base font-medium text-white">{q.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{q.desc}</p>
                  <div className="mt-4 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-[linear-gradient(90deg,#5effba,#56edff,#e6ca78)]" style={{ width: `${q.score || 0}%`, opacity: q.score === null ? .18 : 1 }} /></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Phone>
  );
}

function TreeCanvas({ onOpenFruit, onOpenDetail }) {
  return (
    <div className="relative h-full overflow-hidden rounded-[34px] border border-emerald-200/10 bg-[radial-gradient(circle_at_50%_35%,rgba(77,255,213,.15),transparent_45%),linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.015))] shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
      <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(0deg,rgba(12,30,20,.92),transparent)]" />
      <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/12 blur-3xl animate-tree-aura" />
      <div className="absolute bottom-10 left-1/2 h-[310px] w-12 -translate-x-1/2 rounded-t-full bg-[linear-gradient(90deg,#1c120c,#4d3521,#1a110d)] shadow-[inset_-7px_0_20px_rgba(0,0,0,.35)]" />
      <div className="absolute bottom-[306px] left-[112px] h-5 origin-right rotate-[24deg] rounded-full bg-[#3b2718]" style={{ width: 148 }} />
      <div className="absolute bottom-[330px] right-[105px] h-5 origin-left -rotate-[26deg] rounded-full bg-[#3b2718]" style={{ width: 142 }} />
      <div className="absolute bottom-[252px] left-[88px] h-4 origin-right rotate-[8deg] rounded-full bg-[#3b2718]" style={{ width: 160 }} />
      {["left-[42px] top-[68px] h-44 w-44", "left-[122px] top-[34px] h-56 w-56", "left-[186px] top-[112px] h-44 w-44", "left-[72px] top-[164px] h-52 w-52", "left-[144px] top-[202px] h-44 w-44"].map((cls) => <div key={cls} className={`absolute ${cls} rounded-full bg-[radial-gradient(circle_at_42%_38%,rgba(129,255,188,.30),rgba(22,83,62,.55)_55%,rgba(8,30,25,.88))] blur-[0.2px]`} />)}
      {FRUITS.map((f, i) => (
        <button key={f.week} onClick={() => onOpenFruit(f)} className="absolute rounded-full border border-amber-100/60 bg-[radial-gradient(circle_at_34%_28%,#fff3b0,#dfb64c_45%,#725626)] shadow-[0_0_22px_rgba(239,201,102,.35)] transition hover:scale-125 active:scale-95 animate-fruit" style={{ left: f.x, top: f.y, width: f.s, height: f.s, animationDelay: `${i * 240}ms` }} aria-label={`打开${f.week}`} />
      ))}

      <div className="absolute right-3 top-5 flex flex-col gap-2">
        <button onClick={() => onOpenDetail("fruit")} className="rounded-2xl border border-amber-100/20 bg-black/36 px-3 py-2 text-right text-xs text-amber-50 backdrop-blur-xl active:scale-[.96]"><b className="block text-sm">16</b>果实</button>
        <button onClick={() => onOpenDetail("quarter")} className="rounded-2xl border border-cyan-100/20 bg-black/36 px-3 py-2 text-right text-xs text-cyan-50 backdrop-blur-xl active:scale-[.96]"><b className="block text-sm">Q2</b>阶段</button>
        <button onClick={() => onOpenDetail("honor")} className="rounded-2xl border border-emerald-100/20 bg-black/36 px-3 py-2 text-right text-xs text-emerald-50 backdrop-blur-xl active:scale-[.96]"><b className="block text-sm">1</b>荣誉</button>
      </div>

      <div className="absolute bottom-5 left-5 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-slate-300 backdrop-blur-xl">点击果实查看时间胶囊</div>
    </div>
  );
}

function TreeDetailPage({ type, onBack }) {
  const map = {
    fruit: { title: "果实数据", sub: "每周一颗果实，记录这一周的推进质量。", stats: [["16", "累计果实"], ["78%", "最近一周"], ["72%", "季度均值"]] },
    quarter: { title: "季度阶段", sub: "树的形态按时间自然进入下一阶段，荣誉由季度达标决定。", stats: [["Q2", "当前阶段"], ["43%", "年度进度"], ["80%", "达标线"]] },
    honor: { title: "荣誉层", sub: "季度达标后叠加永久荣誉效果，只增不减。", stats: [["1", "已获得"], ["4", "年度上限"], ["永久", "保留规则"]] },
  };
  const data = map[type] || map.fruit;
  return (
    <div className="h-full animate-panel pt-2">
      <button onClick={onBack} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 active:scale-[.96]">← 返回成长树</button>
      <GlassCard className="mt-5 p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/50">tree detail</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{data.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">{data.sub}</p>
      </GlassCard>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {data.stats.map(([v, l]) => <GlassCard key={l} className="p-4 text-center"><p className="text-xl font-light text-white">{v}</p><p className="mt-1 text-[11px] text-slate-400">{l}</p></GlassCard>)}
      </div>
      <GlassCard className="mt-4 p-5">
        <h4 className="text-sm font-medium text-white">说明</h4>
        <p className="mt-3 text-xs leading-6 text-slate-400">数据不压在成长树主画面上，主画面保持沉浸。需要时通过树旁按钮进入详情，避免把成长树做成成就面板或 Dashboard。</p>
      </GlassCard>
    </div>
  );
}

function TreeScreen({ onTabChange, onOpenFruit }) {
  const [detail, setDetail] = useState(null);
  return (
    <Phone tab="tree" onTabChange={onTabChange}>
      <div className="h-full pb-2">
        {detail ? <TreeDetailPage type={detail} onBack={() => setDetail(null)} /> : <TreeCanvas onOpenFruit={onOpenFruit} onOpenDetail={setDetail} />}
      </div>
    </Phone>
  );
}

function SettlementScreen({ weekRecords, weekEnergy, onTabChange, onFinish }) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <Phone tab="tree" onTabChange={onTabChange}>
      <div className="flex h-full flex-col gap-4 overflow-hidden pb-2">
        <GlassCard className="p-5 text-center">
          <p className="text-sm leading-6 text-slate-300">这一周辛苦了，<br />我们一起看看这周的收获吧。</p>
          <div className={`mx-auto mt-5 grid h-28 w-28 place-items-center rounded-full border border-amber-100/50 bg-[radial-gradient(circle_at_35%_28%,#fff3bc,#d8ae46_45%,#3b2b11_80%)] shadow-[0_0_60px_rgba(225,192,99,.35)] ${confirmed ? "animate-fruit-born" : ""}`}><span className="text-3xl font-light text-[#221909]">{weekEnergy}%</span></div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex h-36 items-end justify-between gap-3">
            {weekRecords.map((day) => <div key={day.d} className="flex flex-1 flex-col items-center gap-2"><div className="relative h-28 w-full rounded-full bg-white/[0.055]"><div className="absolute bottom-0 left-0 right-0 rounded-full bg-[linear-gradient(180deg,rgba(101,255,226,.9),rgba(80,255,177,.45))] transition-all duration-500" style={{ height: `${Math.max(day.v, 8)}%`, opacity: day.v ? 1 : .2 }} /></div><span className="text-[11px] text-slate-400">{day.d}</span></div>)}
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center justify-between"><h3 className="text-sm font-medium text-white">建议周结果</h3><span className="text-lg text-cyan-100">{weekEnergy}%</span></div>
          <button onClick={() => { setConfirmed(true); setTimeout(onFinish, 900); }} className="mt-4 w-full rounded-2xl bg-amber-100/15 py-3 text-sm font-medium text-amber-50 active:scale-[.98]">确认并生成果实</button>
        </GlassCard>
      </div>
    </Phone>
  );
}

function WeekModal({ records, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.28em] text-emerald-100/50">week overview</p><h3 className="mt-2 text-lg font-semibold text-white">本周 7 天概览</h3></div><button onClick={onClose} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-slate-300">关闭</button></div>
      <div className="mt-5 space-y-2">{records.map((day, i) => <div key={day.d} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${i === 6 ? "border-cyan-100/30 bg-cyan-100/10" : "border-white/[0.06] bg-white/[0.035]"}`}><div><p className="text-sm text-white">周{day.d}</p><p className="mt-1 text-xs text-slate-400">清单 {day.tasks}</p></div><span className="text-sm text-cyan-100">{day.v ? `${day.v}%` : "未记录"}</span></div>)}</div>
    </Modal>
  );
}

function FruitModal({ fruit, onClose }) {
  if (!fruit) return null;
  return (
    <Modal onClose={onClose}>
      <p className="text-xs uppercase tracking-[0.28em] text-amber-100/60">time capsule</p>
      <h3 className="mt-2 text-xl font-semibold text-white">{fruit.week}</h3>
      <p className="mt-1 text-xs text-slate-400">{fruit.date}</p>
      <div className="my-5 flex items-center gap-4 rounded-3xl border border-amber-100/15 bg-amber-100/8 p-4">
        <div className="grid h-16 w-16 place-items-center rounded-full border border-amber-100/50 bg-[radial-gradient(circle_at_35%_28%,#fff3bc,#d8ae46_45%,#3b2b11_80%)] shadow-[0_0_40px_rgba(225,192,99,.3)]"><span className="text-sm text-[#221909]">{fruit.score}%</span></div>
        <div><p className="text-sm text-white">本周结果</p><p className="mt-1 text-xs text-slate-400">果实亮度来自周结算确认值</p></div>
      </div>
      <p className="text-sm leading-6 text-slate-300">{fruit.note}</p>
      <button onClick={onClose} className="mt-5 w-full rounded-2xl bg-cyan-100/12 py-3 text-sm text-cyan-50">收起</button>
    </Modal>
  );
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const [tab, setTab] = useState("energy");
  const [goal, setGoal] = useState("开发一款个人成长 App，上架到应用商店");
  const [todos, setTodos] = useState(DEFAULT_TODOS);
  const [focusItems] = useState(DEFAULT_FOCUS);
  const [monthWeeks, setMonthWeeks] = useState(MONTH_WEEKS);
  const [weekRecords, setWeekRecords] = useState(DEFAULT_WEEK);
  const [energyValue, setEnergyValue] = useState(82);
  const [charging, setCharging] = useState(false);
  const [viewedList, setViewedList] = useState(false);
  const [showWeek, setShowWeek] = useState(false);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);

  const weekEnergy = useMemo(() => {
    const values = weekRecords.map((d) => d.v).filter(Boolean);
    if (!values.length) return 0;
    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
  }, [weekRecords]);

  const changeTab = (id) => { setTab(id); if (id === "list") setViewedList(true); };
  const confirmEnergy = () => {
    setCharging(true);
    setWeekRecords((prev) => prev.map((day, index) => index === 6 ? { ...day, v: energyValue, tasks: `${todos.filter((t) => t.done).length}/${todos.length}` } : day));
    setTimeout(() => setCharging(false), 1300);
  };
  const selectWeek = (week) => { setSelectedWeek(week); setViewedList(true); setTab("list"); };
  const resetPrototype = () => {
    setBooted(false); setTab("energy"); setTodos(DEFAULT_TODOS); setMonthWeeks(MONTH_WEEKS); setWeekRecords(DEFAULT_WEEK); setEnergyValue(82); setViewedList(false); setSelectedWeek(null); setSelectedFruit(null);
  };

  const screen = !booted ? <OnboardingScreen goal={goal} setGoal={setGoal} onFinish={() => setBooted(true)} />
    : tab === "energy" ? <EnergyScreen energyValue={energyValue} setEnergyValue={setEnergyValue} weekEnergy={weekEnergy} charging={charging} focusItems={focusItems} viewedList={viewedList} onConfirm={confirmEnergy} onTabChange={changeTab} />
    : tab === "list" ? <ListScreen todos={todos} setTodos={setTodos} focusItems={focusItems} weekRecords={weekRecords} onOpenWeek={() => setShowWeek(true)} onTabChange={changeTab} selectedWeek={selectedWeek} />
    : tab === "plan" ? <PlanScreen monthWeeks={monthWeeks} yearQuarters={YEAR_QUARTERS} setMonthWeeks={setMonthWeeks} onTabChange={changeTab} onSelectWeek={selectWeek} />
    : tab === "tree" ? <TreeScreen onTabChange={changeTab} onOpenFruit={setSelectedFruit} />
    : <SettlementScreen weekRecords={weekRecords} weekEnergy={weekEnergy} onTabChange={changeTab} onFinish={() => setTab("tree")} />;

  return (
    <div className="min-h-screen bg-[#030606] px-6 py-8 text-white">
      <style>{`
        @keyframes panel { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes loadingBar { 0% { transform: translateX(-90%); } 100% { transform: translateX(160%); } }
        @keyframes bubbleRise { 0% { transform: translateY(18px) scale(.8); opacity: .12; } 35% { opacity: .7; } 100% { transform: translateY(-90px) scale(1.15); opacity: 0; } }
        @keyframes orbCharge { 0%,100% { filter: brightness(1); transform: scale(1); } 45% { filter: brightness(1.32); transform: scale(1.025); } }
        @keyframes orbAura { 0%,100% { opacity: .4; transform: scale(1); } 50% { opacity: .95; transform: scale(1.12); } }
        @keyframes fruitPulse { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.25); } }
        @keyframes fruitBorn { 0% { transform: scale(.72); opacity: .45; } 60% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes treeAura { 0%,100% { opacity: .5; transform: translateX(-50%) scale(1); } 50% { opacity: .9; transform: translateX(-50%) scale(1.08); } }
        .animate-panel { animation: panel .28s cubic-bezier(.2,.8,.2,1) both; }
        .animate-loading-bar { animation: loadingBar 1.05s ease-in-out infinite; }
        .animate-bubble-rise { animation: bubbleRise 1.25s ease-in-out both; }
        .animate-orb-charge { animation: orbCharge 1.25s ease-in-out both; }
        .animate-orb-aura { animation: orbAura 1.25s ease-in-out both; }
        .animate-fruit { animation: fruitPulse 3.8s ease-in-out infinite; }
        .animate-fruit-born { animation: fruitBorn .9s ease-in-out both; }
        .animate-tree-aura { animation: treeAura 5s ease-in-out infinite; }
        input[type='range'] { height: 24px; background: transparent; }
      `}</style>

      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
        <div className="shrink-0">
          <div className="mb-3 flex items-center justify-between px-2"><span className="text-sm text-slate-300">可交互原型</span><span className="text-[11px] uppercase tracking-[0.28em] text-slate-600">iPhone 14 Pro</span></div>
          <div className="relative">{screen}{showWeek && <WeekModal records={weekRecords} onClose={() => setShowWeek(false)} />}{selectedFruit && <FruitModal fruit={selectedFruit} onClose={() => setSelectedFruit(null)} />}</div>
        </div>

        <aside className="w-full max-w-[520px] rounded-[34px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_90px_rgba(0,0,0,.35)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.46em] text-emerald-200/50">NewMe Prototype</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">交互原型 · 精简版</h1>
          <p className="mt-4 text-sm leading-7 text-slate-400">已去掉手机内页顶部大标题，主体内容上移。能量页压缩为一屏四元素；计划页加入「月计划 / 年计划」切换；成长树页改为沉浸式整屏树，数据通过树旁按钮进入详情。</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {["energy", "list", "plan", "tree", "settlement"].map((id) => (
              <button key={id} disabled={!booted} onClick={() => changeTab(id)} className={`rounded-2xl border px-4 py-3 text-left text-sm transition active:scale-[.98] ${tab === id && booted ? "border-cyan-100/35 bg-cyan-100/10 text-cyan-50" : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"}`}>{id === "energy" ? "能量页" : id === "list" ? "清单页" : id === "plan" ? "计划页" : id === "tree" ? "成长树" : "周结算"}</button>
            ))}
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><span className="text-cyan-100">能量页：</span>一屏展示：能量球、本周进度概览、能量条、确认按钮。</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><span className="text-cyan-100">计划页：</span>顶部切换「月计划 · 按周」与「年计划 · 按 Q」。</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><span className="text-cyan-100">成长树：</span>主画面只保留一棵树，数据隐藏到树旁按钮与详情页。</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={resetPrototype} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 hover:text-white">重置原型</button>
            {!booted && <button onClick={() => setBooted(true)} className="rounded-full border border-cyan-100/25 bg-cyan-100/10 px-4 py-2 text-sm text-cyan-50">跳过冷启动</button>}
          </div>
        </aside>
      </div>
    </div>
  );
}
