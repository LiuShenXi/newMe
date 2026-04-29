import { Source, SyncStatus } from '@newme/shared';

import { getDatabase } from '../database';
import { createLocalId, LocalRecord, nowIso, parseJson, stringifyJson } from './repository-utils';
import { enqueueSyncOperation } from './sync-queue.repository';

export interface LocalWeeklyFocus extends LocalRecord {
  invalidatedAt: string | null;
  metadata: Record<string, unknown>;
  reason: string | null;
  source: Source;
  title: string;
  weekId: string;
}

interface FocusRow {
  created_at: string;
  deleted_at: string | null;
  id: string;
  invalidated_at: string | null;
  metadata_json: string;
  reason: string | null;
  remote_id: string | null;
  source: Source;
  sync_status: SyncStatus;
  title: string;
  updated_at: string;
  version: number;
  week_id: string;
}

interface CreateFocusInput {
  id?: string;
  metadata?: Record<string, unknown>;
  reason?: string | null;
  source?: Source;
  title: string;
  weekId: string;
}

export async function createLocalWeeklyFocus(input: CreateFocusInput): Promise<LocalWeeklyFocus> {
  const db = await getDatabase();
  const id = input.id ?? createLocalId('focus');
  const now = nowIso();
  const payload = {
    id,
    metadata: input.metadata ?? {},
    reason: input.reason ?? null,
    source: input.source ?? Source.MANUAL,
    title: input.title,
    weekId: input.weekId,
  };

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO local_weekly_focuses (
        id, week_id, title, reason, source, metadata_json, created_at, updated_at, sync_status, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      id,
      payload.weekId,
      payload.title,
      payload.reason,
      payload.source,
      stringifyJson(payload.metadata),
      now,
      now,
      SyncStatus.PENDING,
    );
    await enqueueSyncOperation({ localId: id, operation: 'create', payload, tableName: 'local_weekly_focuses' }, db);
  });

  return getLocalWeeklyFocus(id) as Promise<LocalWeeklyFocus>;
}

export async function getLocalWeeklyFocus(id: string): Promise<LocalWeeklyFocus | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<FocusRow>(
    'SELECT * FROM local_weekly_focuses WHERE id = ? AND deleted_at IS NULL',
    id,
  );
  return row ? mapFocusRow(row) : null;
}

export async function getLocalWeeklyFocuses(weekId: string): Promise<LocalWeeklyFocus[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<FocusRow>(
    `SELECT * FROM local_weekly_focuses
     WHERE week_id = ? AND deleted_at IS NULL AND invalidated_at IS NULL
     ORDER BY created_at ASC`,
    weekId,
  );
  return rows.map(mapFocusRow);
}

export async function invalidateLocalWeeklyFocus(id: string): Promise<void> {
  const db = await getDatabase();
  const now = nowIso();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE local_weekly_focuses
       SET invalidated_at = ?, updated_at = ?, sync_status = ?, version = version + 1
       WHERE id = ?`,
      now,
      now,
      SyncStatus.PENDING,
      id,
    );
    await enqueueSyncOperation({
      localId: id,
      operation: 'update',
      payload: { id, invalidatedAt: now },
      tableName: 'local_weekly_focuses',
    }, db);
  });
}

function mapFocusRow(row: FocusRow): LocalWeeklyFocus {
  return {
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
    id: row.id,
    invalidatedAt: row.invalidated_at,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
    reason: row.reason,
    remoteId: row.remote_id,
    source: row.source,
    syncStatus: row.sync_status,
    title: row.title,
    updatedAt: row.updated_at,
    version: row.version,
    weekId: row.week_id,
  };
}
