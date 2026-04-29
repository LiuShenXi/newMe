import { Source, SyncStatus } from '@newme/shared';

import { getDatabase } from '../database';
import { createLocalId, LocalRecord, nowIso, parseJson, stringifyJson } from './repository-utils';
import { enqueueSyncOperation } from './sync-queue.repository';

export type LocalGoalLevel = 'annual' | 'month' | 'quarter' | 'vision' | 'week';

export interface LocalGoal extends LocalRecord {
  content: string | null;
  level: LocalGoalLevel;
  metadata: Record<string, unknown>;
  parentId: string | null;
  periodId: string | null;
  source: Source;
  title: string;
}

interface GoalRow {
  content: string | null;
  created_at: string;
  deleted_at: string | null;
  id: string;
  level: LocalGoalLevel;
  metadata_json: string;
  parent_id: string | null;
  period_id: string | null;
  remote_id: string | null;
  source: Source;
  sync_status: SyncStatus;
  title: string;
  updated_at: string;
  version: number;
}

interface UpsertGoalInput {
  content?: string | null;
  id?: string;
  level: LocalGoalLevel;
  metadata?: Record<string, unknown>;
  parentId?: string | null;
  periodId?: string | null;
  source?: Source;
  title: string;
}

export async function upsertLocalGoal(input: UpsertGoalInput): Promise<LocalGoal> {
  const existing = input.id ? await getLocalGoal(input.id) : null;
  const db = await getDatabase();
  const id = existing?.id ?? input.id ?? createLocalId('goal');
  const now = nowIso();
  const payload = {
    content: input.content ?? null,
    id,
    level: input.level,
    metadata: input.metadata ?? {},
    parentId: input.parentId ?? null,
    periodId: input.periodId ?? null,
    source: input.source ?? Source.MANUAL,
    title: input.title,
  };

  await db.withTransactionAsync(async () => {
    if (existing) {
      await db.runAsync(
        `UPDATE local_goals
         SET title = ?, content = ?, parent_id = ?, period_id = ?, source = ?, metadata_json = ?,
             updated_at = ?, sync_status = ?, version = version + 1
         WHERE id = ?`,
        payload.title,
        payload.content,
        payload.parentId,
        payload.periodId,
        payload.source,
        stringifyJson(payload.metadata),
        now,
        SyncStatus.PENDING,
        id,
      );
    } else {
      await db.runAsync(
        `INSERT INTO local_goals (
          id, level, parent_id, period_id, title, content, source, metadata_json,
          created_at, updated_at, sync_status, version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        id,
        payload.level,
        payload.parentId,
        payload.periodId,
        payload.title,
        payload.content,
        payload.source,
        stringifyJson(payload.metadata),
        now,
        now,
        SyncStatus.PENDING,
      );
    }

    await enqueueSyncOperation({
      localId: id,
      operation: existing ? 'update' : 'create',
      payload,
      tableName: 'local_goals',
    }, db);
  });

  return getLocalGoal(id) as Promise<LocalGoal>;
}

export async function getLocalGoal(id: string): Promise<LocalGoal | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<GoalRow>('SELECT * FROM local_goals WHERE id = ? AND deleted_at IS NULL', id);
  return row ? mapGoalRow(row) : null;
}

export async function getLocalGoalsByLevel(level: LocalGoalLevel): Promise<LocalGoal[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<GoalRow>(
    'SELECT * FROM local_goals WHERE level = ? AND deleted_at IS NULL ORDER BY created_at ASC',
    level,
  );
  return rows.map(mapGoalRow);
}

function mapGoalRow(row: GoalRow): LocalGoal {
  return {
    content: row.content,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
    id: row.id,
    level: row.level,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
    parentId: row.parent_id,
    periodId: row.period_id,
    remoteId: row.remote_id,
    source: row.source,
    syncStatus: row.sync_status,
    title: row.title,
    updatedAt: row.updated_at,
    version: row.version,
  };
}
