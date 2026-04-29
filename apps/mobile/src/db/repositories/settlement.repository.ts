import { SyncStatus } from '@newme/shared';

import { getDatabase } from '../database';
import { createLocalId, LocalRecord, nowIso, parseJson, stringifyJson } from './repository-utils';
import { enqueueSyncOperation } from './sync-queue.repository';

export interface LocalSettlement extends LocalRecord {
  confirmedAt: string;
  finalScore: number;
  reflection: string | null;
  snapshotJson: Record<string, unknown>;
  suggestedScore: number;
  weekId: string;
}

interface SettlementRow {
  confirmed_at: string;
  created_at: string;
  deleted_at: string | null;
  final_score: number;
  id: string;
  reflection: string | null;
  remote_id: string | null;
  snapshot_json: string;
  suggested_score: number;
  sync_status: SyncStatus;
  updated_at: string;
  version: number;
  week_id: string;
}

interface CreateSettlementInput {
  confirmedAt?: string;
  finalScore: number;
  id?: string;
  reflection?: string | null;
  snapshotJson?: Record<string, unknown>;
  suggestedScore: number;
  weekId: string;
}

export async function createLocalSettlement(input: CreateSettlementInput): Promise<LocalSettlement> {
  const db = await getDatabase();
  const id = input.id ?? createLocalId('settlement');
  const now = nowIso();
  const payload = {
    confirmedAt: input.confirmedAt ?? now,
    finalScore: input.finalScore,
    id,
    reflection: input.reflection ?? null,
    snapshotJson: input.snapshotJson ?? {},
    suggestedScore: input.suggestedScore,
    weekId: input.weekId,
  };

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO local_settlements (
        id, week_id, suggested_score, final_score, reflection, snapshot_json,
        confirmed_at, created_at, updated_at, sync_status, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      id,
      payload.weekId,
      payload.suggestedScore,
      payload.finalScore,
      payload.reflection,
      stringifyJson(payload.snapshotJson),
      payload.confirmedAt,
      now,
      now,
      SyncStatus.PENDING,
    );
    await enqueueSyncOperation({ localId: id, operation: 'create', payload, tableName: 'local_settlements' }, db);
  });

  return getLocalSettlementByWeek(input.weekId) as Promise<LocalSettlement>;
}

export async function getLocalSettlementByWeek(weekId: string): Promise<LocalSettlement | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<SettlementRow>(
    'SELECT * FROM local_settlements WHERE week_id = ? AND deleted_at IS NULL',
    weekId,
  );
  return row ? mapSettlementRow(row) : null;
}

function mapSettlementRow(row: SettlementRow): LocalSettlement {
  return {
    confirmedAt: row.confirmed_at,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
    finalScore: row.final_score,
    id: row.id,
    reflection: row.reflection,
    remoteId: row.remote_id,
    snapshotJson: parseJson<Record<string, unknown>>(row.snapshot_json, {}),
    suggestedScore: row.suggested_score,
    syncStatus: row.sync_status,
    updatedAt: row.updated_at,
    version: row.version,
    weekId: row.week_id,
  };
}
