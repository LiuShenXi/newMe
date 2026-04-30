type TodoRepository = typeof import('../repositories/todo.repository');
type EnergyRepository = typeof import('../repositories/energy.repository');
type SyncQueueRepository = typeof import('../repositories/sync-queue.repository');
type SyncEngine = typeof import('./sync-engine');

export type OfflineTodoInput = Parameters<TodoRepository['createLocalTodo']>[0];
export type OfflineEnergyInput = Parameters<EnergyRepository['upsertLocalEnergyEntry']>[0];
export type RuntimeSyncInput = Parameters<SyncEngine['syncNow']>[0];
export type RuntimeSyncSummary = Awaited<ReturnType<SyncEngine['syncNow']>>;

type LocalTodo = Awaited<ReturnType<TodoRepository['createLocalTodo']>>;
type LocalEnergyEntry = Awaited<ReturnType<EnergyRepository['upsertLocalEnergyEntry']>>;
type SyncQueueItem = Awaited<ReturnType<SyncQueueRepository['listPendingSyncItems']>>[number];

interface SqliteRuntimeDependencies {
  getDatabase?: () => Promise<unknown>;
  listPendingSyncItems?: () => Promise<SyncQueueItem[] | unknown[]>;
}

interface OfflineTodoDependencies extends SqliteRuntimeDependencies {
  createLocalTodo?: (input: OfflineTodoInput) => Promise<LocalTodo | Record<string, unknown>>;
}

interface OfflineEnergyDependencies extends SqliteRuntimeDependencies {
  upsertLocalEnergyEntry?: (input: OfflineEnergyInput) => Promise<LocalEnergyEntry | Record<string, unknown>>;
}

interface SyncRuntimeDependencies extends SqliteRuntimeDependencies {
  syncNow?: (input: RuntimeSyncInput) => Promise<RuntimeSyncSummary>;
}

export interface RuntimeSmokeResult {
  databaseOpened: boolean;
  pendingCount: number;
}

export interface OfflineTodoResult {
  pendingCount: number;
  todo: LocalTodo | Record<string, unknown>;
}

export interface OfflineEnergyResult {
  energyEntry: LocalEnergyEntry | Record<string, unknown>;
  pendingCount: number;
}

export async function runSyncRuntimeSmoke(dependencies: SqliteRuntimeDependencies = {}): Promise<RuntimeSmokeResult> {
  const db = await openRuntimeDatabase(dependencies);
  const pendingItems = await listPendingItems(dependencies);

  return {
    databaseOpened: Boolean(db),
    pendingCount: pendingItems.length,
  };
}

export async function createOfflineTodoForSync(
  input: OfflineTodoInput,
  dependencies: OfflineTodoDependencies = {},
): Promise<OfflineTodoResult> {
  await openRuntimeDatabase(dependencies);

  const createTodo = dependencies.createLocalTodo ?? (await loadTodoRepository()).createLocalTodo;
  const todo = await createTodo(input);
  const pendingItems = await listPendingItems(dependencies);

  return {
    pendingCount: pendingItems.length,
    todo,
  };
}

export async function createOfflineEnergyForSync(
  input: OfflineEnergyInput,
  dependencies: OfflineEnergyDependencies = {},
): Promise<OfflineEnergyResult> {
  await openRuntimeDatabase(dependencies);

  const upsertEnergy = dependencies.upsertLocalEnergyEntry ?? (await loadEnergyRepository()).upsertLocalEnergyEntry;
  const energyEntry = await upsertEnergy(input);
  const pendingItems = await listPendingItems(dependencies);

  return {
    energyEntry,
    pendingCount: pendingItems.length,
  };
}

export async function syncOfflineChanges(
  input: RuntimeSyncInput,
  dependencies: SyncRuntimeDependencies = {},
): Promise<RuntimeSyncSummary> {
  await openRuntimeDatabase(dependencies);

  const runSync = dependencies.syncNow ?? (await loadSyncEngine()).syncNow;
  return runSync(input);
}

async function openRuntimeDatabase(dependencies: SqliteRuntimeDependencies): Promise<unknown> {
  const getRuntimeDatabase = dependencies.getDatabase ?? (await loadDatabase()).getDatabase;
  return getRuntimeDatabase();
}

async function listPendingItems(dependencies: SqliteRuntimeDependencies): Promise<unknown[]> {
  const listPending = dependencies.listPendingSyncItems ?? (await loadSyncQueueRepository()).listPendingSyncItems;
  return listPending();
}

async function loadDatabase() {
  return import('../database');
}

async function loadTodoRepository() {
  return import('../repositories/todo.repository');
}

async function loadEnergyRepository() {
  return import('../repositories/energy.repository');
}

async function loadSyncQueueRepository() {
  return import('../repositories/sync-queue.repository');
}

async function loadSyncEngine() {
  return import('./sync-engine');
}
