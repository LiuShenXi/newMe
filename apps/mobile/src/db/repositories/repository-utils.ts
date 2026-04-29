import { SyncStatus } from '@newme/shared';

export type SyncOperation = 'create' | 'delete' | 'update';
export type SyncTableName =
  | 'local_ai_drafts'
  | 'local_energy_entries'
  | 'local_goals'
  | 'local_settlements'
  | 'local_todos'
  | 'local_tree_data'
  | 'local_weekly_focuses';

export interface LocalRecord {
  createdAt: string;
  deletedAt: string | null;
  id: string;
  remoteId: string | null;
  syncStatus: SyncStatus;
  updatedAt: string;
  version: number;
}

export function createLocalId(prefix = 'local'): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function stringifyJson(value: unknown): string {
  return JSON.stringify(value ?? {});
}

export function toBoolean(value: number | null | undefined): boolean {
  return value === 1;
}

export function toSqlBoolean(value: boolean): number {
  return value ? 1 : 0;
}
