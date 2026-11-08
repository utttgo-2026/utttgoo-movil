import { getApiBaseUrl } from '@/config/api';
import { parseApiError, type ApiError } from '@/types/api';

export class ApiRequestError extends Error {
  readonly details: ApiError;

  constructor(details: ApiError) {
    super(details.message);
    this.name = 'ApiRequestError';
    this.details = details;
  }
}

export interface ApiClientOptions {
  fetchImplementation?: typeof fetch;
  getToken?: () => Promise<string | null>;
}

export function createApiClient(options: ApiClientOptions = {}) {
  const request = options.fetchImplementation ?? fetch;

  return async function apiClient<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await options.getToken?.();
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    if (init.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await request(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers,
    });
    const body = await response.json().catch(() => undefined);

    if (!response.ok) {
      throw new ApiRequestError(parseApiError(body, response.status));
    }

    return body as T;
  };
}
