const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');

const context = require(path.join(__dirname, '../src/shared/time/planning-context.ts'));

test('planning context prefers server user week and quarter ids', () => {
  const result = context.getPlanningContext(
    {
      currentQuarterId: '2026-Q2',
      currentWeekId: '2026-W18',
    },
    new Date('2026-04-30T12:00:00.000Z'),
  );

  assert.deepEqual(result, {
    currentQuarterId: '2026-Q2',
    currentWeekId: '2026-W18',
    todayDate: '2026-04-30',
    year: 2026,
  });
});

test('planning context falls back to local ISO week and quarter', () => {
  const result = context.getPlanningContext(null, new Date('2026-04-30T12:00:00.000Z'));

  assert.equal(result.currentQuarterId, '2026-Q2');
  assert.equal(result.currentWeekId, '2026-W18');
  assert.equal(result.todayDate, '2026-04-30');
  assert.equal(result.year, 2026);
});
