export type AppEnvironment = 'development' | 'preview' | 'production';

const environment = (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as AppEnvironment;

export function getApiBaseUrl(): string {
  const value = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (!value) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is required.');
  }

  const url = new URL(value);
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL must be an API origin without a path.');
  }
  if (environment === 'production' && url.protocol !== 'https:') {
    throw new Error('BLOCKED_BY_BACKEND_HTTPS');
  }

  return url.toString().replace(/\/$/, '');
}

export function getAppEnvironment(): AppEnvironment {
  return environment;
}
