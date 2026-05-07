import 'expo-dev-client';

import { QueryClientProvider } from '@tanstack/react-query';
import { Redirect, Stack, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '../src/shared/api/query-client';
import { useNotifications } from '../src/features/notifications/hooks/useNotifications';
import { useAuthStore } from '../src/stores/auth.store';

function NotificationBridge() {
  useNotifications();
  return null;
}

function AuthGuard() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrate = useAuthStore((s) => s.hydrate);
  const isLoading = useAuthStore((s) => s.isLoading);
  const loadMe = useAuthStore((s) => s.loadMe);
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && accessToken && !user && !isLoading) {
      void loadMe().catch(() => {
        // Stale tokens are cleared by the API client; avoid surfacing bootstrap noise.
      });
    }
  }, [accessToken, hydrated, isLoading, loadMe, user]);

  if (!hydrated) return null;

  const isAuthRoute = pathname.startsWith('/auth');
  if (!accessToken && !isAuthRoute) {
    return <Redirect href="/auth/login" />;
  }

  if (accessToken && !isAuthRoute && !user) {
    return null;
  }

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NotificationBridge />
          <AuthGuard />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
