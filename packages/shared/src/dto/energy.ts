export interface EnergyEntryDto {
  id: string;
  date: string;
  score: number;
  weekId: string;
  hasViewedTodos: boolean;
}

export interface WeeklyEnergyDto {
  weekId: string;
  entries: EnergyEntryDto[];
  average: number | null;
  recordedDays: number;
}

export interface RecordEnergyRequest {
  score: number;
  hasViewedTodos: boolean;
}
