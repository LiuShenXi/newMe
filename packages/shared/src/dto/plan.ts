import { Source } from '../enums';

export interface WeeklyFocusDto {
  id: string;
  weekId: string;
  title: string;
  reason: string | null;
  source: Source;
  invalidatedAt: string | null;
}

export interface WeekPlanDto {
  id: string;
  weekId: string;
  focuses: WeeklyFocusDto[];
}

export interface UpdateWeeklyFocusesRequest {
  focuses: { title: string; reason?: string }[];
}
