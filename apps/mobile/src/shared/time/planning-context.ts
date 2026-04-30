import type { UserContext } from '@newme/shared';

export interface PlanningContext {
  currentQuarterId: string;
  currentWeekId: string;
  todayDate: string;
  year: number;
}

type ServerPlanningContext = Pick<UserContext, 'currentQuarterId' | 'currentWeekId'> | null | undefined;

export function getPlanningContext(user: ServerPlanningContext, now = new Date()): PlanningContext {
  const todayDate = formatDate(now);

  return {
    currentQuarterId: user?.currentQuarterId ?? getQuarterId(now),
    currentWeekId: user?.currentWeekId ?? getIsoWeekId(now),
    todayDate,
    year: Number(todayDate.slice(0, 4)),
  };
}

export function getIsoWeekId(date: Date) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  utc.setUTCDate(utc.getUTCDate() + 4 - (utc.getUTCDay() || 7));
  const weekYear = utc.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${weekYear}-W${String(week).padStart(2, '0')}`;
}

export function getQuarterId(date: Date) {
  return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
}

export function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
