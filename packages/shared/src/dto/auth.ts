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

export interface UserContext {
  id: string;
  phone: string;
  timezone: string;
  currentWeekId: string;
  currentQuarterId: string;
  hasCompletedOnboarding: boolean;
}
