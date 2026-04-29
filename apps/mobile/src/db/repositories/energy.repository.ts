import { SyncStatus } from '@newme/shared';

import { getDatabase } from '../database';
import { createLocalId, LocalRecord, nowIso, toBoolean, toSqlBoolean } from './repository-utils';
import { enqueueSyncOperation } from './sync-queue.repository';

export interface LocalEnergyEntry extends LocalRecord {
  date: string;
  hasViewedTodos: boolean;
  score: number;
  weekId: string;
}

interface EnergyRow {
  created_at: string;
  date: string;
  deleted_at: string | null;
  has_viewed_todos: number;
  id: string;
  remote_id: string | null;
  score: number;
  sync_status: SyncStatus;
  updated_at: string;
  version: number;
  week_id: string;
}

interface UpsertEnergyInput {
  date: string;
  hasViewedTodos: boolean;
  score: number;
  weekId: string;
}

export async function upsertLocalEnergyEntry(input: UpsertEnergyInput): Promise<LocalEnergyEntry> {
  const existing = await getLocalEnergyEntryByDate(input.date);
  const db = await getDatabase();
  const id = existing?.id ?? createLocalId('energy');
  const now = nowIso();
  const operation = existing ? 'update' : 'create';

  await db.withTransactionAsync(async () => {
    if (existing) {
      await db.runAsync(
        `UPDATE local_energy_entries
         SET week_id = ?, score = ?, has_viewed_todos = ?, updated_at = ?, sync_status = ?, version = version + 1
         WHERE id = ?`,
        input.weekId,
        input.score,
        toSqlBoolean(input.hasViewedTodos),
        now,
        SyncStatus.PENDING,
        id,
      );
    } else {
      await db.runAsync(
        `INSERT INTO local_energy_entries (
          id, date, week_id, score, has_viewed_todos, created_at, updated_at, sync_status, version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        id,
        input.date,
        input.weekId,
        input.score,
        toSqlBoolean(input.hasViewedTodos),
        now,
        now,
        SyncStatus.PENDING,
      );
    }

    await enqueueSyncOperation({ localId: id, operation, payload: { ...input, id }, tableName: 'local_energy_entries' }, db);
  });

  return getLocalEnergyEntryByDate(input.date) as Promise<LocalEnergyEntry>;
}

export async function getLocalEnergyEntryByDate(date: string): Promise<LocalEnergyEntry | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<EnergyRow>(
    'SELECT * FROM local_energy_entries WHERE date = ? AND deleted_at IS NULL',
    date,
  );
  return row ? mapEnergyRow(row) : null;
}

export async function getLocalEnergyEntriesByWeek(weekId: string): Promise<LocalEnergyEntry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<EnergyRow>(
    'SELECT * FROM local_energy_entries WHERE week_id = ? AND deleted_at IS NULL ORDER BY date ASC',
    weekId,
  );
  return rows.map(mapEnergyRow);
}

function mapEnergyRow(row: EnergyRow): LocalEnergyEntry {
  return {
    createdAt: row.created_at,
    date: row.date,
    deletedAt: row.deleted_at,
    hasViewedTodos: toBoolean(row.has_viewed_todos),
    id: row.id,
    remoteId: row.remote_id,
    score: row.score,
    syncStatus: row.sync_status,
    updatedAt: row.updated_at,
    version: row.version,
    weekId: row.week_id,
  };
}
