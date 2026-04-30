const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');

const notifications = require(path.join(
  __dirname,
  '../src/features/notifications/hooks/notification-routing.ts',
));

test('notification route mapper prefers explicit route from payload', () => {
  assert.equal(
    notifications.getNotificationRoute({ route: '/settlement/current-week' }),
    '/settlement/current-week',
  );
});

test('notification route mapper falls back by scenario', () => {
  assert.equal(
    notifications.getNotificationRoute({ scenario: 'weekly_settlement' }),
    '/settlement/current-week',
  );
  assert.equal(
    notifications.getNotificationRoute({ scenario: 'daily_energy' }),
    '/(tabs)/energy',
  );
  assert.equal(
    notifications.getNotificationRoute({ scenario: 'reengagement' }),
    '/(tabs)/energy',
  );
});
