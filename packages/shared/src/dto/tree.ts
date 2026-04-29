export interface TreeFruitDto {
  id: string;
  weekId: string;
  score: number;
  label: string;
  capsuleSummary: string;
  createdAt: string;
}

export interface QuarterHonorDto {
  id: string;
  quarterId: string;
  averageScore: number;
  earnedAt: string;
}

export interface GrowthTreeDto {
  year: number;
  stage: 'q1_start' | 'q2_growth' | 'q3_flourish' | 'q4_complete';
  fruits: TreeFruitDto[];
  honors: QuarterHonorDto[];
}
