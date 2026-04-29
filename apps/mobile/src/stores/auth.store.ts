import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import type { RefreshRequest, TokenResponse, UserContext } from '@newme/shared';

import { apiFetch, configureApiClient } from '../shared/api/client';
import { queryClient } from '../shared/api/query-client';

const accessTokenKey = 'newme.accessToken';
const refreshTokenKey = 'newme.refreshToken';

interface AuthState {
  accessToken: string | null;
  hydrated: boolean;
  isLoading: boolean;
  refreshToken: string | null;
  user: UserContext | null;
  clearSession: () => Promise<void>;
  hydrate: () => Promise<void>;
  loadMe: () => Promise<UserContext>;
  refreshSession: () => Promise<boolean>;
  setSession: (tokens: TokenResponse, user?: UserContext | null) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  hydrated: false,
  isLoading: false,
  refreshToken: null,
  user: null,
  async clearSession() {
    await Promise.all([SecureStore.deleteItemAsync(accessTokenKey), SecureStore.deleteItemAsync(refreshTokenKey)]);
    queryClient.clear();
    set({ accessToken: null, hydrated: true, isLoading: false, refreshToken: null, user: null });
  },
  async hydrate() {
    set({ isLoading: true });
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(accessTokenKey),
      SecureStore.getItemAsync(refreshTokenKey),
    ]);

    set({ accessToken, hydrated: true, isLoading: false, refreshToken });
  },
  async loadMe() {
    const user = await apiFetch<UserContext>('/me');
    set({ user });
    return user;
  },
  async refreshSession() {
    const refreshToken = get().refreshToken;

    if (!refreshToken) {
      await get().clearSession();
      return false;
    }

    try {
      const tokens = await apiFetch<TokenResponse>('/auth/refresh', {
        body: { refreshToken } satisfies RefreshRequest,
        skipAuth: true,
      });
      await get().setSession(tokens, get().user);
      return true;
    } catch {
      await get().clearSession();
      return false;
    }
  },
  async setSession(tokens, user = null) {
    await Promise.all([
      SecureStore.setItemAsync(accessTokenKey, tokens.accessToken),
      SecureStore.setItemAsync(refreshTokenKey, tokens.refreshToken),
    ]);
    set({ accessToken: tokens.accessToken, hydrated: true, refreshToken: tokens.refreshToken, user });
  },
}));

configureApiClient({
  getAccessToken: () => useAuthStore.getState().accessToken,
  onRefreshToken: () => useAuthStore.getState().refreshSession(),
  onUnauthorized: () => useAuthStore.getState().clearSession(),
});
