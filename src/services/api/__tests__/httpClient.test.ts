import { HttpClient } from '../httpClient';
import { errorMessage, ApiError } from '../errors';

describe('Cliente HTTP (fetch simulado; no AWS)', () => {
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
  const client = new HttpClient({ baseUrl: () => 'https://api.example.test', fetch: fetchMock });
  const cleartext = new HttpClient({ baseUrl: () => 'http://api.example.test', fetch: fetchMock });

  beforeEach(() => { fetchMock.mockReset(); });
  afterEach(() => { jest.useRealTimers(); });

  test.each([200, 201, 202])('preserva status %s y JSON/headers', async (status) => {
    fetchMock.mockResolvedValue(new Response('{"fixture":true}', { status, headers: { 'Content-Type': 'application/json' } }));
    expect(await client.request('/health')).toEqual({
      status, headers: { 'content-type': 'application/json' }, data: { fixture: true },
    });
  });

  test('GET público health HTTP no incluye credenciales ni cuerpo', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
    await cleartext.request('/health');
    expect(fetchMock).toHaveBeenCalledWith('http://api.example.test/health', expect.objectContaining({
      method: 'GET', body: undefined, headers: { Accept: 'application/json' }, redirect: 'error',
    }));
  });

  test.each([
    ['/api/v1/auth/login', { method: 'POST' as const, body: { email: 'a@uttt.edu.mx', password: 'synthetic' } }],
    ['/api/v1/auth/register', { method: 'POST' as const, body: { password: 'synthetic' } }],
    ['/health', { token: 'synthetic.jwt' }],
    ['/health', { query: { token: 'synthetic' } }],
    ['/health', { method: 'POST' as const, body: {} }],
    ['/api/v1/sellers/public-fixture', {}],
  ])('bloquea HTTP ANTES de fetch: %s', async (path, options) => {
    await expect(cleartext.request(path, options)).rejects.toMatchObject({ kind: 'insecure_transport' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test.each(['POST', 'PATCH'] as const)('%s serializa JSON y Bearer únicamente sobre HTTPS', async (method) => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
    await client.request('/api/v1/users/me', { method, body: { displayName: 'Fixture' }, token: 'synthetic.jwt' });
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.test/api/v1/users/me', expect.objectContaining({
      method, body: '{"displayName":"Fixture"}', headers: {
        Accept: 'application/json', 'Content-Type': 'application/json', Authorization: 'Bearer synthetic.jwt',
      },
    }));
  });

  test('construye parámetros, sin undefined', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
    await client.request('/api/v1/admin/users', { query: { page: 2, pageSize: 10, absent: undefined } });
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.test/api/v1/admin/users?page=2&pageSize=10');
  });

  test.each([400, 401, 403, 404, 422, 500])('centraliza HTTP %s sin suponer envelope', async (status) => {
    fetchMock.mockResolvedValue(new Response('{"unknownEnvelope":"fixture"}', { status }));
    await expect(client.request('/api/v1/auth/me')).rejects.toMatchObject({ kind: 'http', status });
  });

  test('401 no implica correo sin verificar', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 401 }));
    await expect(client.request('/health')).rejects.not.toThrow(/correo.*verific/i);
  });

  test('error HTTP HTML conserva clasificación HTTP', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Error</html>', { status: 500 }));
    await expect(client.request('/health')).rejects.toMatchObject({ kind: 'http', status: 500 });
  });

  test('rechaza JSON inválido y status exitoso inesperado', async () => {
    fetchMock.mockResolvedValueOnce(new Response('not JSON', { status: 200 }));
    await expect(client.request('/health')).rejects.toMatchObject({ kind: 'invalid_response' });
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 202 }));
    await expect(client.request('/health', { expectedStatuses: [200] })).rejects.toMatchObject({ kind: 'invalid_response' });
  });

  test('acepta 202 sin cuerpo sin inventar un DTO', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 202 }));
    expect((await client.request('/api/v1/auth/register', { method: 'POST', body: {} })).data).toBeNull();
  });

  test('fallo de red no expone el error original', async () => {
    fetchMock.mockRejectedValue(new Error('URL con datos sensibles'));
    await expect(client.request('/health')).rejects.toMatchObject({ kind: 'network' });
    expect(errorMessage(new Error('sensitive'))).not.toContain('sensitive');
  });

  test('timeout aborta la petición', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new Error('AbortError')));
    }));
    const request = client.request('/health', { timeoutMs: 20 });
    const assertion = expect(request).rejects.toMatchObject({ kind: 'timeout' });
    jest.advanceTimersByTime(21);
    await assertion;
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(jest.getTimerCount()).toBe(0);
  });

  test.each(['https://evil.example.test', '//evil.example.test', '/health?token=x', '/../auth'])
  ('rechaza escape de ruta %s', async (path) => {
    await expect(client.request(path)).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('rechaza token inválido, cuerpo GET y timeout inválido', async () => {
    await expect(client.request('/health', { token: 'bad\nheader' })).rejects.toMatchObject({ kind: 'unauthenticated' });
    await expect(client.request('/health', { body: {} })).rejects.toMatchObject({ kind: 'validation' });
    await expect(client.request('/health', { timeoutMs: 0 })).rejects.toMatchObject({ kind: 'configuration' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('preflight de auth requiere HTTPS aun antes de construir una solicitud', () => {
    expect(() => cleartext.assertSecureTransport()).toThrow(expect.objectContaining({ kind: 'insecure_transport' }));
    expect(() => client.assertSecureTransport()).not.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
