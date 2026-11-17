import { ApiError } from './errors';

export function parseApiBaseUrl(value: string | undefined): string {
  if (!value?.trim()) {
    throw new ApiError('configuration', 'Configura EXPO_PUBLIC_API_BASE_URL en .env.');
  }
  try {
    const url = new URL(value.trim());
    if (
      !['http:', 'https:'].includes(url.protocol) || !url.hostname ||
      url.username || url.password || url.search || url.hash || url.pathname !== '/'
    ) {
      throw new Error('Invalid origin');
    }
    return url.origin;
  } catch {
    throw new ApiError('configuration', 'La URL de la API debe ser un origen HTTP/HTTPS sin credenciales ni rutas.');
  }
}

export function getApiBaseUrl(): string {
  // Expo necesita acceso estático para incluir la variable en el bundle.
  return parseApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);
}
