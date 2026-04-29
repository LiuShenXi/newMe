import { Source, SyncStatus } from '@newme/shared';

import { getDatabase } from '../database';
import { createLocalId, LocalRecord, nowIso, parseJson, stringifyJson, toBoolean, toSqlBoolean } from './repository-utils';
import { enqueueSyncOperation } from './sync-queue.repository';

export interface LocalTodo extends LocalRecord {
  completed: boolean;
  date: string;
  estimatedMinutes: number | null;
  metadata: Record<string, unknown>;
  source: Source;
  sourceFocusId: string | null;
  title: string;
  userEdited: boolean;
}

interface TodoRow {
  completed: number;
  created_at: string;
  date: string;
  deleted_at: string | null;
  estimated_minutes: number | null;
  id: string;
  metadata_json: string;
  remote_id: string | null;
  source: Source;
  source_focus_id: string | null;
  sync_status: SyncStatus;
  title: string;
  updated_at: string;
  user_edited: number;
  version: number;
}

interface CreateTodoInput {
  date: string;
  estimatedMinutes?: number | null;
  id?: string;
  metadata?: Record<string, unknown>;
  source?: Source;
  sourceFocusId?: string | null;
  title: string;
}

interface UpdateTodoInput {
  completed?: boolean;
  estimatedMinutes?: number | null;
  metadata?: Record<string, unknown>;
  title?: string;
}

export async function createLocalTodo(input: CreateTodoInput): Promise<LocalTodo> {
  const db = await getDatabase();
  const id = input.id ?? createLocalId('todo');
  const now = nowIso();
  const todo = {
    completed: false,
    date: input.date,
    estimatedMinutes: input.estimatedMinutes ?? null,
    id,
    metadata: input.metadata ?? {},
    source: input.source ?? Source.MANUAL,
    sourceFocusId: input.sourceFocusId ?? null,
    title: input.title,
    userEdited: false,
  };

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO local_todos (
        id, title, date, completed, estimated_minutes, source_focus_id, source, user_edited,
        metadata_json, created_at, updated_at, sync_status, version
      ) VALUES (?, ?, ?, 0, ?, ?, ?, 0, ?, ?, ?, ?, 1)`,
      id,
      todo.title,
      todo.date,
      todo.estimatedMinutes,
      todo.sourceFocusId,
      todo.source,
      stringifyJson(todo.metadata),
      now,
      now,
      SyncStatus.PENDING,
    );
    await enqueueSyncOperation({ localId: id, operation: 'create', payload: todo, tableName: 'local_todos' }, db);
  });

  return getLocalTodo(id) as Promise<LocalTodo>;
}

export async function getLocalTodosByDate(date: string): Promise<LocalTodo[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TodoRow>(
    'SELECT * FROM local_todos WHERE date = ? AND deleted_at IS NULL ORDER BY created_at ASC',
    date,
  );
  return rows.map(mapTodoRow);
}

export async function getLocalTodo(id: string): Promise<LocalTodo | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TodoRow>('SELECT * FROM local_todos WHERE id = ? AND deleted_at IS NULL', id);
  return row ? mapTodoRow(row) : null;
}

export async function updateLocalTodo(id: string, input: UpdateTodoInput): Promise<LocalTodo | null> {
  const existing = await getLocalTodo(id);
  if (!existing) {
    return null;
  }

  const db = await getDatabase();
  const now = nowIso();
  const next = { ...existing, ...input, userEdited: true, updatedAt: now, version: existing.version + 1 };

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE local_todos
       SET title = ?, completed = ?, estimated_minutes = ?, metadata_json = ?,
           user_edited = 1, updated_at = ?, sync_status = ?, version = version + 1
       WHERE id = ?`,
      next.title,
      toSqlBoolean(next.completed),
      next.estimatedMinutes,
      stringifyJson(next.metadata),
      now,
      SyncStatus.PENDING,
      id,
    );
    await enqueueSyncOperation({ localId: id, operation: 'update', payload: next, tableName: 'local_todos' }, db);
  });

  return getLocalTodo(id);
}

export async function softDeleteLocalTodo(id: string): Promise<void> {
  const db = await getDatabase();
  const now = nowIso();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'UPDATE local_todos SET deleted_at = ?, updated_at = ?, sync_status = ?, version = version + 1 WHERE id = ?',
      now,
      now,
      SyncStatus.PENDING,
      id,
    );
    await enqueueSyncOperation({ localId: id, operation: 'delete', payload: { id, deletedAt: now }, tableName: 'local_todos' }, db);
  });
}

function mapTodoRow(row: TodoRow): LocalTodo {
  return {
    completed: toBoolean(row.completed),
    createdAt: row.created_at,
    date: row.date,
    deletedAt: row.deleted_at,
    estimatedMinutes: row.estimated_minutes,
    id: row.id,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
    remoteId: row.remote_id,
    source: row.source,
    sourceFocusId: row.source_focus_id,
    syncStatus: row.sync_status,
    title: row.title,
    updatedAt: row.updated_at,
    userEdited: toBoolean(row.user_edited),
    version: row.version,
  };
}
