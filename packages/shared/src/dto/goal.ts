import { GoalType, Source } from '../enums';

export interface VisionDto {
  id: string;
  content: string;
  source: Source;
  createdAt: string;
}

export interface AnnualObjectiveDto {
  id: string;
  year: number;
  objectives: { title: string; keyResults: string[] }[];
  source: Source;
}

export interface QuarterGoalDto {
  id: string;
  quarterId: string;
  title: string;
  goalType: GoalType | null;
  source: Source;
}

export interface MonthGoalDto {
  id: string;
  monthId: string;
  title: string;
  source: Source;
}

export interface CreateVisionRequest {
  content: string;
}

export interface CreateQuarterGoalRequest {
  title: string;
}

export interface CreateMonthGoalRequest {
  title: string;
}
