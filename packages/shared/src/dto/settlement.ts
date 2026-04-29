export interface WeeklySettlementDto {
  id: string;
  weekId: string;
  suggestedScore: number;
  finalScore: number;
  reflection: string | null;
  snapshotJson: Record<string, unknown>;
  confirmedAt: string;
}

export interface CreateSettlementRequest {
  finalScore: number;
  reflection?: string;
}
