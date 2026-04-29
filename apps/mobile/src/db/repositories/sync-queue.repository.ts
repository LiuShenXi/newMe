import type * as SQLite from 'expo-sqlite';

import { SyncStatus } from '@newme/shared';

import { getDatabase } from '../database';
import { createLocalId, nowIso, parseJson, stringifyJson, SyncOperation, SyncTableName } from './repository-utils';

export interface SyncQueueItem {
  createdAt: string;
  id: string;
  lastError: string | null;
  localId: string;
  operation: SyncOperation;
  payloadJson: Record<string, unknown>;
  remoteId: string | null;
  retryCount: number;
  status: SyncStatus;
  tableName: SyncTableName;
  updatedAt: string;
}

interface SyncQueueRow {
  created_at: string;
  id: string;
  last_error: string | null;
  local_id: string;
  operation: SyncOperation;
  payload_json: string;
  remote_id: string | null;
  retry_count: number;
  status: SyncStatus;
  table_name: SyncTableName;
  updated_at: string;
}

interface EnqueueInput {
  localId: string;
  operation: SyncOperation;
  payload: Record<string, unknown>;
  remoteId?: string | null;
  tableName: SyncTableName;
}

export async function enqueueSyncOperation(input: EnqueueInput, db?: SQLite.SQLiteDatabase): Promise<string> {
  const database = db ?? (await getDatabase());
  const id = createLocalId('sync');
  const now = nowIso();

  await database.runAsync(
    `INSERT INTO sync_queue (
      id, table_name, local_id, remote_id, operation, payload_json, status, retry_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    id,
    input.tableName,
    input.localId,
    input.remoteId ?? null,
    input.operation,
    stringifyJson(input.payload),
    SyncStatus.PENDING,
    now,
    now,
  );

  return id;
}

export async function listPendingSyncItems(limit = 50): Promise<SyncQueueItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SyncQueueRow>(
    `SELECT * FROM sync_queue
     WHERE status = ?
     ORDER BY created_at ASC
     LIMIT ?`,
    SyncStatus.PENDING,
    limit,
  );

  return rows.map(mapSyncQueueRow);
}

export async function markSyncItemSynced(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE sync_queue SET status = ?, updated_at = ? WHERE id = ?', SyncStatus.SYNCED, nowIso(), id);
}

export async function markSyncItemFailed(id: string, error: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE sync_queue
     SET status = ?, retry_count = retry_count + 1, last_error = ?, updated_at = ?
     WHERE id = ?`,
    SyncStatus.FAILED,
    error,
    nowIso(),
    id,
  );
}

function mapSyncQueueRow(row: SyncQueueRow): SyncQueueItem {
  return {
    createdAt: row.created_at,
    id: row.id,
    lastError: row.last_error,
    localId: row.local_id,
    operation: row.operation,
    payloadJson: parseJson<Record<string, unknown>>(row.payload_json, {}),
    remoteId: row.remote_id,
    retryCount: row.retry_count,
    status: row.status,
    tableName: row.table_name,
    updatedAt: row.updated_at,
  };
}
