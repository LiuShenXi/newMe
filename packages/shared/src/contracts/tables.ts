export const SYNC_TABLES = [
  'visions',
  'annual_objectives',
  'quarter_goals',
  'month_goals',
  'month_plans',
  'week_plans',
  'weekly_focuses',
  'todos',
  'energy_entries',
  'weekly_settlements',
  'tree_fruits',
  'quarter_honors',
  'ai_generations',
] as const;

export type SyncTableName = (typeof SYNC_TABLES)[number];
