import { createApiClient } from '@/services/apiClient';
import { getAppEnvironment } from '@/config/api';
import { isApiError, parseApiError } from '@/types/api';

describe('ApiError contract', () => {
  it('uses development as the default environment', () => {
    expect(getAppEnvironment()).toBe('development');
  });

  it('parses the backend error shape', () => {
    const error = parseApiError({
      correlationId: 'corr-1',
      status: 422,
      code: 'INSTITUTIONAL_EMAIL_REQUIRED',
      message: 'Institutional email required',
    });

    expect(isApiError(error)).toBe(true);
    expect(error.status).toBe(422);
  });

  it('uses a stable fallback for malformed errors', () => {
    expect(parseApiError({ status: 403 }, 403)).toEqual({
      correlationId: '',
      status: 403,
      code: 'UNKNOWN_ERROR',
      message: 'Ocurrió un error inesperado.',
    });
  });
});

describe('apiClient', () => {
  const originalUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const originalEnvironment = process.env.EXPO_PUBLIC_APP_ENV;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.test';
    process.env.EXPO_PUBLIC_APP_ENV = 'development';
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = originalUrl;
    process.env.EXPO_PUBLIC_APP_ENV = originalEnvironment;
  });

  it('sends bearer authentication and returns successful JSON', async () => {
    const fetchImplementation = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    const client = createApiClient({
      fetchImplementation,
      getToken: async () => 'token-not-logged',
    });

    await expect(client<{ ok: boolean }>('/health')).resolves.toEqual({ ok: true });
    expect(fetchImplementation).toHaveBeenCalledWith(
      'https://api.example.test/health',
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
  });

  it.each([401, 403, 422])('throws the contract error for HTTP %s', async (status) => {
    const fetchImplementation = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          correlationId: `corr-${status}`,
          status,
          code: `ERROR_${status}`,
          message: 'Request failed',
        }),
        { status }
      )
    );
    const client = createApiClient({ fetchImplementation });

    await expect(client('/protected')).rejects.toMatchObject({
      details: { status, code: `ERROR_${status}` },
    });
  });

  it('accepts a 202 register response without inventing a response body', async () => {
    const fetchImplementation = jest.fn().mockResolvedValue(new Response(null, { status: 202 }));
    const client = createApiClient({ fetchImplementation });

    await expect(client('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'alumno@utt.edu.mx', password: 'password', displayName: 'Alumno' }),
    })).resolves.toBeUndefined();
  });
});
