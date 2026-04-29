type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type TokenProvider = () => string | null | Promise<string | null>;
type RefreshHandler = () => Promise<boolean>;
type UnauthorizedHandler = () => void | Promise<void>;

interface ApiClientConfig {
  baseUrl?: string;
  getAccessToken?: TokenProvider;
  onRefreshToken?: RefreshHandler;
  onUnauthorized?: UnauthorizedHandler;
  timeoutMs?: number;
}

interface ApiRequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  method?: HttpMethod;
  signal?: AbortSignal;
  skipAuth?: boolean;
  timeoutMs?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const env = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process
  ?.env;
const defaultBaseUrl = env?.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:3300/api/v1';

const config: Required<Pick<ApiClientConfig, 'baseUrl' | 'timeoutMs'>> &
  Omit<ApiClientConfig, 'baseUrl' | 'timeoutMs'> = {
  baseUrl: defaultBaseUrl,
  timeoutMs: 30_000,
};

export function configureApiClient(nextConfig: ApiClientConfig) {
  Object.assign(config, nextConfig);
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return request<T>(path, options, true);
}

async function request<T>(path: string, options: ApiRequestOptions, allowRefresh: boolean): Promise<T> {
  const response = await fetchWithTimeout(path, options);

  if (response.status === 401 && allowRefresh && config.onRefreshToken) {
    const refreshed = await config.onRefreshToken();

    if (refreshed) {
      return request<T>(path, options, false);
    }

    await config.onUnauthorized?.();
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function fetchWithTimeout(path: string, options: ApiRequestOptions): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? config.timeoutMs);
  const token = options.skipAuth ? null : await config.getAccessToken?.();
  const url = path.startsWith('http') ? path : `${config.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    return await fetch(url, {
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      headers: {
        Accept: 'application/json',
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      method: options.method ?? (options.body === undefined ? 'GET' : 'POST'),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  let details: unknown;

  try {
    details = await response.json();
  } catch {
    details = await response.text();
  }

  const message =
    typeof details === 'object' && details && 'message' in details
      ? String((details as { message: unknown }).message)
      : `Request failed with status ${response.status}`;

  return new ApiError(message, response.status, details);
}
