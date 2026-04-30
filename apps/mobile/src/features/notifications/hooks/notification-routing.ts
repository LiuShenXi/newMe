import type { NotificationScenario } from '@newme/shared';

const scenarioRoutes: Record<NotificationScenario, string> = {
  daily_energy: '/(tabs)/energy',
  reengagement: '/(tabs)/energy',
  weekly_settlement: '/settlement/current-week',
};

export function getNotificationRoute(data: unknown) {
  if (!isRecord(data)) {
    return null;
  }

  if (typeof data.route === 'string' && data.route.startsWith('/')) {
    return data.route;
  }

  if (isNotificationScenario(data.scenario)) {
    return scenarioRoutes[data.scenario];
  }

  return null;
}

function isNotificationScenario(value: unknown): value is NotificationScenario {
  return (
    value === 'daily_energy' ||
    value === 'weekly_settlement' ||
    value === 'reengagement'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
