import type {
  SyncPullResponse,
  SyncPushItem,
  SyncPushRequest,
  SyncPushResultItem,
  SyncTableName,
} from '@newme/shared';
import { SyncStatus } from '@newme/shared';

import { apiFetch } from '../../shared/api/client';
import { getDatabase } from '../database';
import {
  listPendingSyncItems,
  markSyncItemFailed,
  markSyncItemSynced,
  SyncQueueItem,
} from '../repositories/sync-queue.repository';
import { SyncTableName as LocalSyncTableName, nowIso } from '../repositories/repository-utils';
import { resolveVersionConflict } from './conflict-resolver';

interface SyncNowInput {
  deviceId: string;
  lastPulledAt: string;
  limit?: number;
}

export interface SyncSummary {
  conflicts: number;
  errors: number;
  pulled: number;
  pulledAt: string;
  pushed: number;
}

const LOCAL_TO_REMOTE_TABLE: Record<LocalSyncTableName, SyncTableName | null> = {
  local_ai_drafts: 'ai_generations',
  local_energy_entries: 'energy_entries',
  local_goals: null,
  local_settlements: 'weekly_settlements',
  local_todos: 'todos',
  local_tree_data: null,
  local_weekly_focuses: 'weekly_focuses',
};

export async function syncNow({ deviceId, lastPulledAt, limit = 50 }: SyncNowInput): Promise<SyncSummary> {
  const pendingItems = await listPendingSyncItems(limit);
  const pushResults = await pushPendingChanges(deviceId, pendingItems);
  const pullResponse = await pullRemoteChanges(deviceId, lastPulledAt);

  return {
    conflicts: pushResults.filter((result) => result.status === 'conflict').length,
    errors: pushResults.filter((result) => result.status === 'error').length,
    pulled: pullResponse.changes.length,
    pulledAt: pullResponse.pulledAt,
    pushed: pushResults.filter((result) => result.status === 'success').length,
  };
}

export async function pushPendingChanges(
  deviceId: string,
  pendingItems?: SyncQueueItem[],
): Promise<SyncPushResultItem[]> {
  const items = pendingItems ?? (await listPendingSyncItems());
  const pushItems: SyncPushItem[] = [];
  const skippedItems: SyncQueueItem[] = [];

  for (const item of items) {
    const pushItem = toSyncPushItem(item);

    if (pushItem) {
      pushItems.push(pushItem);
    } else {
      skippedItems.push(item);
    }
  }

  for (const item of skippedItems) {
    await markSyncItemFailed(item.id, `Unsupported sync table: ${item.tableName}`);
  }

  if (pushItems.length === 0) {
    return [];
  }

  const results = await apiFetch<SyncPushResultItem[]>('/sync/push', {
    body: { deviceId, items: pushItems } satisfies SyncPushRequest,
  });

  await applyPushResults(items, results);
  return results;
}

export async function pullRemoteChanges(deviceId: string, lastPulledAt: string): Promise<SyncPullResponse> {
  return apiFetch<SyncPullResponse>('/sync/pull', {
    body: { deviceId, lastPulledAt },
  });
}

async function applyPushResults(queueItems: SyncQueueItem[], results: SyncPushResultItem[]): Promise<void> {
  const byLocalId = new Map(queueItems.map((item) => [item.localId, item]));

  for (const result of results) {
    const queueItem = byLocalId.get(result.localId);

    if (!queueItem) {
      continue;
    }

    if (result.status === 'success') {
      await markLocalRecordSynced(queueItem.tableName, queueItem.localId, result.remoteId, result.newVersion);
      await markSyncItemSynced(queueItem.id);
      continue;
    }

    if (result.status === 'conflict') {
      const resolution = resolveVersionConflict({
        localVersion: getPayloadVersion(queueItem),
        remoteVersion: result.newVersion,
      });
      await markSyncItemFailed(queueItem.id, result.error ?? `Conflict: ${resolution}`);
      continue;
    }

    await markSyncItemFailed(queueItem.id, result.error ?? '同步失败');
  }
}

async function markLocalRecordSynced(
  tableName: LocalSyncTableName,
  localId: string,
  remoteId: string,
  newVersion: number,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE ${tableName}
     SET remote_id = ?, version = ?, sync_status = ?, updated_at = ?
     WHERE id = ?`,
    remoteId,
    newVersion,
    SyncStatus.SYNCED,
    nowIso(),
    localId,
  );
}

function toSyncPushItem(item: SyncQueueItem): SyncPushItem | null {
  const tableName = resolveRemoteTableName(item);

  if (!tableName) {
    return null;
  }

  return {
    data: sanitizePayload(item.payloadJson),
    localId: item.localId,
    operation: item.operation,
    remoteId: item.remoteId,
    tableName,
    version: getPayloadVersion(item),
  };
}

function resolveRemoteTableName(item: SyncQueueItem): SyncTableName | null {
  if (item.tableName === 'local_goals') {
    return goalLevelToTable(item.payloadJson.level);
  }

  if (item.tableName === 'local_tree_data') {
    return treeKindToTable(item.payloadJson.kind);
  }

  return LOCAL_TO_REMOTE_TABLE[item.tableName];
}

function goalLevelToTable(level: unknown): SyncTableName | null {
  switch (level) {
    case 'annual':
      return 'annual_objectives';
    case 'month':
      return 'month_goals';
    case 'quarter':
      return 'quarter_goals';
    case 'vision':
      return 'visions';
    case 'week':
      return 'weekly_focuses';
    default:
      return null;
  }
}

function treeKindToTable(kind: unknown): SyncTableName | null {
  switch (kind) {
    case 'fruit':
      return 'tree_fruits';
    case 'honor':
      return 'quarter_honors';
    default:
      return null;
  }
}

function getPayloadVersion(item: SyncQueueItem): number {
  const version = item.payloadJson.version;
  return typeof version === 'number' ? version : 1;
}

function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const { id, metadata, snapshotJson, ...rest } = payload;

  return {
    ...rest,
    ...(metadata ? { metadataJson: metadata } : {}),
    ...(snapshotJson ? { snapshotJson } : {}),
  };
}
