export interface LoginRequest {
  phone: string;
  code: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface UpdateUserProfileRequest {
  displayName?: string | null;
  email?: string | null;
}

export interface UserContext {
  id: string;
  displayName?: string | null;
  email?: string | null;
  phone: string;
  timezone: string;
  currentWeekId: string;
  currentQuarterId: string;
  hasCompletedOnboarding: boolean;
}
