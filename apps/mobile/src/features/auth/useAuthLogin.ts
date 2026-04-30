import { router } from 'expo-router';
import { useState } from 'react';

import type { LoginRequest, TokenResponse } from '@newme/shared';

import { apiFetch, ApiError } from '../../shared/api/client';
import { useAuthStore } from '../../stores/auth.store';

export function useAuthLogin() {
  const loadMe = useAuthStore((state) => state.loadMe);
  const setSession = useAuthStore((state) => state.setSession);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function requestCode(phone: string) {
    const normalizedPhone = phone.trim();

    if (!normalizedPhone) {
      setError('请输入手机号');
      return;
    }

    setError(null);
    setIsRequestingCode(true);

    try {
      await apiFetch('/auth/code', {
        body: { phone: normalizedPhone },
        skipAuth: true,
      });
      setCodeSent(true);
    } catch (nextError) {
      setError(toUserMessage(nextError, '验证码发送失败，请稍后再试'));
    } finally {
      setIsRequestingCode(false);
    }
  }

  async function signIn(phone: string, code: string) {
    const payload: LoginRequest = {
      code: code.trim(),
      phone: phone.trim(),
    };

    if (!payload.phone) {
      setError('请输入手机号');
      return;
    }

    if (!payload.code) {
      setError('请输入验证码');
      return;
    }

    setError(null);
    setIsSigningIn(true);

    try {
      const tokens = await apiFetch<TokenResponse>('/auth/login', {
        body: payload,
        skipAuth: true,
      });
      await setSession(tokens);
      const user = await loadMe();
      router.replace(user.hasCompletedOnboarding ? '/(tabs)/energy' : '/onboarding/choose');
    } catch (nextError) {
      setError(toUserMessage(nextError, '登录失败，请检查手机号或验证码'));
    } finally {
      setIsSigningIn(false);
    }
  }

  return {
    codeSent,
    error,
    isRequestingCode,
    isSigningIn,
    requestCode,
    signIn,
  };
}

function toUserMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}
