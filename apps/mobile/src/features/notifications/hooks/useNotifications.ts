import Constants, { ExecutionEnvironment } from 'expo-constants';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import type { RegisterPushTokenRequest } from '@newme/shared';

import { apiFetch } from '../../../shared/api/client';
import { useAuthStore } from '../../../stores/auth.store';
import { getNotificationRoute } from './notification-routing';

type NotificationsModule = typeof import('expo-notifications');

export function useNotifications() {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let cancelled = false;

    async function registerToken() {
      try {
        const Notifications = await loadNotifications();
        if (!Notifications || cancelled) {
          return;
        }

        const permission = await Notifications.requestPermissionsAsync();
        if (!permission.granted || cancelled) {
          return;
        }

        const tokenResponse = await Notifications.getExpoPushTokenAsync();
        const token = tokenResponse.data;
        if (!token || cancelled) {
          return;
        }

        await apiFetch('/notifications/tokens', {
          body: {
            platform: getPlatform(),
            token,
          } satisfies RegisterPushTokenRequest,
        });
      } catch {
        // Push registration must never block the core MVP loop.
      }
    }

    void registerToken();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    let cancelled = false;

    async function subscribe() {
      const Notifications = await loadNotifications();
      if (!Notifications || cancelled) {
        return;
      }

      subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const route = getNotificationRoute(
          response.notification.request.content.data,
        );

        if (route) {
          router.push(route as never);
        }
      });
    }

    void subscribe();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);
}

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (isExpoGoAndroid()) {
    return null;
  }

  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

function isExpoGoAndroid() {
  return (
    Platform.OS === 'android' &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  );
}

function getPlatform(): RegisterPushTokenRequest['platform'] {
  if (Platform.OS === 'ios') {
    return 'ios';
  }

  if (Platform.OS === 'android') {
    return 'android';
  }

  return 'web';
}
