const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');

const runtime = require(path.join(__dirname, '../src/db/sync/runtime.ts'));

test('F5 sync runtime opens SQLite before offline repository writes and reports queued records', async () => {
  const calls = [];
  const pendingItems = [{ id: 'queue_todo' }, { id: 'queue_energy' }];

  const todoResult = await runtime.createOfflineTodoForSync(
    { date: '2026-04-30', title: 'Offline task' },
    {
      createLocalTodo: async (input) => {
        calls.push(`todo:${input.title}`);
        return { id: 'todo_local_1', title: input.title };
      },
      getDatabase: async () => {
        calls.push('open-db');
        return {};
      },
      listPendingSyncItems: async () => pendingItems,
    },
  );

  const energyResult = await runtime.createOfflineEnergyForSync(
    { date: '2026-04-30', hasViewedTodos: true, score: 82, weekId: '2026-W18' },
    {
      getDatabase: async () => {
        calls.push('open-db');
        return {};
      },
      listPendingSyncItems: async () => pendingItems,
      upsertLocalEnergyEntry: async (input) => {
        calls.push(`energy:${input.score}`);
        return { id: 'energy_local_1', score: input.score };
      },
    },
  );

  assert.deepEqual(calls, ['open-db', 'todo:Offline task', 'open-db', 'energy:82']);
  assert.equal(todoResult.pendingCount, 2);
  assert.equal(todoResult.todo.id, 'todo_local_1');
  assert.equal(energyResult.pendingCount, 2);
  assert.equal(energyResult.energyEntry.id, 'energy_local_1');
});

test('F5 sync runtime pushes and pulls after network recovery and surfaces conflicts', async () => {
  const calls = [];

  const result = await runtime.syncOfflineChanges(
    { deviceId: 'device_runtime_1', lastPulledAt: '2026-04-30T00:00:00.000Z' },
    {
      getDatabase: async () => {
        calls.push('open-db');
        return {};
      },
      syncNow: async (input) => {
        calls.push(`sync:${input.deviceId}:${input.lastPulledAt}`);
        return {
          conflicts: 1,
          errors: 0,
          pulled: 1,
          pulledAt: '2026-04-30T08:00:00.000Z',
          pushed: 1,
        };
      },
    },
  );

  assert.deepEqual(calls, ['open-db', 'sync:device_runtime_1:2026-04-30T00:00:00.000Z']);
  assert.deepEqual(
    { conflicts: result.conflicts, pulled: result.pulled, pushed: result.pushed },
    { conflicts: 1, pulled: 1, pushed: 1 },
  );
});

test('F5 sync runtime smoke exposes SQLite open and repository queue count', async () => {
  const result = await runtime.runSyncRuntimeSmoke({
    getDatabase: async () => ({ opened: true }),
    listPendingSyncItems: async () => [{ id: 'queue_1' }],
  });

  assert.deepEqual(result, { databaseOpened: true, pendingCount: 1 });
});
