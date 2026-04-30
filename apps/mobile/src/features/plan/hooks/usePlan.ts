import { useState } from 'react';

export type PlanView = 'month' | 'year';
export type PlanSource = 'ai' | 'manual' | 'mixed';

export interface ManualLevel {
  action: string;
  label: string;
  value: string;
}

export interface MonthWeek {
  id: string;
  items: string[];
  score: number | null;
  state: string;
  title: string;
  week: string;
}

export interface QuarterPlan {
  desc: string;
  goals: string[];
  id: string;
  score: number | null;
  title: string;
}

const manualLevels: ManualLevel[] = [
  { action: '补全年', label: '年目标', value: '' },
  { action: '补全季度', label: '季度目标', value: '跑通目标、清单、能量、果实的核心闭环。' },
  { action: '补全本月', label: '本月目标', value: '' },
  { action: '设置本周', label: '本周计划', value: '完成手动 OKR 冷启动、计划页空层级展示和 3 次运动。' },
];

const monthWeeks: MonthWeek[] = [
  {
    id: 'W15',
    items: ['完成季度目标输入与 AI 拆解的首轮流程', '生成本周 3 个重点和第一天今日清单', '跑通一次能量记录、提醒与周结算'],
    score: 76,
    state: '已结算',
    title: '冷启动闭环',
    week: 'W15',
  },
  {
    id: 'W16',
    items: ['完成能量球和今日能量条的交互反馈', '把本周概览改成可查看每天 TDL 的弹窗', '让打分前提醒能自然跳到今日清单'],
    score: 78,
    state: '当前周',
    title: '能量页体验打磨',
    week: 'W16',
  },
  {
    id: 'W17',
    items: ['识别目标是项目型、习惯型还是阅读学习型', '按目标类型生成更贴近本周的行动建议', '根据本周结果重排后续两周任务密度'],
    score: null,
    state: '计划中',
    title: 'AI 拆解优化',
    week: 'W17',
  },
  {
    id: 'W18',
    items: ['补全果实详情中的本周重点和结果说明', '设计周回顾输入与果实生成的连接', '明确季度荣誉层如何在树上永久保留'],
    score: null,
    state: '计划中',
    title: '成长树时间胶囊',
    week: 'W18',
  },
];

const quarters: QuarterPlan[] = [
  {
    desc: '跑通目标、清单、能量、果实的核心闭环。',
    goals: ['完成冷启动最小闭环', '验证今日清单和每日能量能否形成稳定记录习惯', '确认成长树反馈是否有吸引力'],
    id: 'Q1',
    score: 76,
    title: '起始阶段',
  },
  {
    desc: '打磨 AI 拆解、月计划和成长树反馈。',
    goals: ['把 AI 拆解升级为按目标类型生成周计划', '完善计划页 4 周滚动计划', '让成长树时间胶囊回看每周重点'],
    id: 'Q2',
    score: 43,
    title: '成长阶段',
  },
  {
    desc: '形成第二件作品并复用当前系统。',
    goals: ['沉淀可复用计划模板', '完善后续周重规划', '补齐跨周回看'],
    id: 'Q3',
    score: null,
    title: '复用阶段',
  },
  {
    desc: '年度回看和稳定输出。',
    goals: ['整理年度成长轨迹', '确认季度荣誉层展示', '准备下一年起始计划'],
    id: 'Q4',
    score: null,
    title: '收束阶段',
  },
];

export function usePlan() {
  const [view, setView] = useState<PlanView>('month');

  return {
    manualLevels,
    monthWeeks,
    planSource: 'ai' as PlanSource,
    quarters,
    setView,
    view,
  };
}
