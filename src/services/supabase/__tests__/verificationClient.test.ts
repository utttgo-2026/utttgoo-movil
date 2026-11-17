import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig, parseSupabaseConfig } from '../config';
import { retryAfterMilliseconds, verificationClient } from '../verificationClient';

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

const auth = { initialize: jest.fn(), verifyOtp: jest.fn(), resend: jest.fn(), dispose: jest.fn(), signOut: jest.fn(), signUp: jest.fn(), signInWithOtp: jest.fn() };
const user = { id: 'fixture-sub', email: 'fixture@uttt.edu.mx', email_confirmed_at: '2026-11-12T12:00:00Z' };
const previous = { url: process.env.EXPO_PUBLIC_SUPABASE_URL, key: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY };

describe('Cliente OTP aislado; Supabase simulado', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://project.example.test';
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_fixture';
    jest.mocked(createClient).mockReturnValue({ auth } as unknown as ReturnType<typeof createClient>);
    auth.verifyOtp.mockResolvedValue({ data: { user, session: { access_token: 'private-supabase-access', refresh_token: 'private-supabase-refresh' } }, error: null });
    auth.resend.mockResolvedValue({ data: {}, error: null });
    auth.dispose.mockResolvedValue(undefined);
    auth.initialize.mockResolvedValue({ error: null });
  });
  afterEach(() => {
    for (const [key, value] of [['EXPO_PUBLIC_SUPABASE_URL', previous.url], ['EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY', previous.key]] as const) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    jest.restoreAllMocks();
  });

  test('OTP confirmado no devuelve sesión/tokens; instancia efímera se desecha sin signOut', async () => {
    expect(await verificationClient.verify(' Fixture@UTTT.EDU.MX ', '012345')).toBeUndefined();
    expect(auth.verifyOtp).toHaveBeenCalledWith({ email: 'fixture@uttt.edu.mx', token: '012345', type: 'email' });
    expect(createClient).toHaveBeenCalledWith('https://project.example.test', 'sb_publishable_fixture', expect.objectContaining({
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, debug: false },
    }));
    expect(auth.dispose).toHaveBeenCalledTimes(1);
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(auth.signUp).not.toHaveBeenCalled();
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });

  test('reenviar solo usa signup y una nueva instancia, nunca registra usuarios', async () => {
    await verificationClient.resend('fixture@uttt.edu.mx');
    expect(auth.resend).toHaveBeenCalledWith({ type: 'signup', email: 'fixture@uttt.edu.mx' });
    expect(auth.verifyOtp).not.toHaveBeenCalled();
    expect(auth.signUp).not.toHaveBeenCalled();
    expect(auth.dispose).toHaveBeenCalledTimes(1);
  });

  test.each([
    [{ code: 'invalid_credentials' }, 'invalid_code'],
    [{ code: 'validation_failed' }, 'invalid_code'],
    [{ code: 'otp_expired' }, 'expired_code'],
    [{ status: 429 }, 'rate_limit'],
    [{ name: 'AuthRetryableFetchError', status: 0 }, 'network'],
    [{ code: 'unknown' }, 'provider'],
  ])('error proveedor se clasifica sin mensajes sensibles: %j', async (error, kind) => {
    auth.verifyOtp.mockResolvedValue({ data: { user: null, session: null }, error: { ...error, message: 'private-email private-token 012345' } });
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    await expect(verificationClient.verify('fixture@uttt.edu.mx', '012345')).rejects.toMatchObject({ kind });
    expect(auth.dispose).toHaveBeenCalledTimes(1);
    expect(log).not.toHaveBeenCalled();
  });

  test.each([
    { ...user, email_confirmed_at: undefined }, { ...user, email: 'other@uttt.edu.mx' }, null,
  ])('no declara verificación con usuario ausente/no confirmado/no coincidente: %j', async (responseUser) => {
    auth.verifyOtp.mockResolvedValue({ data: { user: responseUser, session: null }, error: null });
    await expect(verificationClient.verify('fixture@uttt.edu.mx', '012345')).rejects.toMatchObject({ kind: 'invalid_response' });
  });

  test('código local inválido no llama al SDK', async () => {
    await expect(verificationClient.verify('fixture@uttt.edu.mx', '12a456')).rejects.toMatchObject({ kind: 'invalid_code' });
    expect(createClient).not.toHaveBeenCalled();
  });

  test('sin configuración no crea cliente ni petición', async () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    await expect(verificationClient.resend('fixture@uttt.edu.mx')).rejects.toMatchObject({ kind: 'configuration' });
    expect(createClient).not.toHaveBeenCalled();
  });

  test.each([
    ['', 'sb_publishable_fixture'], ['http://project.example.test', 'sb_publishable_fixture'],
    ['https://private:secret@project.example.test', 'sb_publishable_fixture'],
    ['https://project.example.test/path', 'sb_publishable_fixture'],
    ['https://project.example.test?token=private', 'sb_publishable_fixture'],
    ['https://project.example.test', ''], ['https://project.example.test', 'sb_secret_fixture'],
    ['https://project.example.test', 'service_role'], ['https://project.example.test', 'eyJ.synthetic.legacy'],
  ])('rechaza configuración insegura/ausente sin incluir sus valores: %s', (url, key) => {
    expect(() => parseSupabaseConfig(url, key)).toThrow(expect.objectContaining({ kind: 'configuration' }));
  });

  test('lectura estática sin fallback y normalización del origen', () => {
    expect(getSupabaseConfig()).toEqual({ url: 'https://project.example.test', key: 'sb_publishable_fixture' });
    expect(parseSupabaseConfig(' https://project.example.test/ ', 'sb_publishable_fixture').url).toBe('https://project.example.test');
  });

  test('acepta URL pública confirmada sin inventar ni requerir una clave real para esta prueba', () => {
    expect(parseSupabaseConfig('https://tabhbylbhewtehvirexn.supabase.co', 'sb_publishable_fixture').url)
      .toBe('https://tabhbylbhewtehvirexn.supabase.co');
  });

  test('respeta Retry-After del transporte y fuerza HTTPS/sin redirects/cookies', async () => {
    const transport = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 429, headers: { 'retry-after': '180' } }));
    auth.resend.mockImplementationOnce(async () => {
      const customFetch = jest.mocked(createClient).mock.calls[0][2]?.global?.fetch;
      await customFetch!('https://project.example.test/auth/v1/resend', { method: 'POST', body: '{}' });
      return { data: {}, error: { status: 429, code: 'over_email_send_rate_limit' } };
    });
    await expect(verificationClient.resend('fixture@uttt.edu.mx')).rejects.toMatchObject({ kind: 'rate_limit', retryAfterMs: 180000 });
    expect(transport).toHaveBeenCalledWith('https://project.example.test/auth/v1/resend', expect.objectContaining({ redirect: 'error', credentials: 'omit' }));
  });

  test('parsea segundos/fecha Retry-After sin inventar un límite del proyecto', () => {
    expect(retryAfterMilliseconds('120')).toBe(120000);
    expect(retryAfterMilliseconds('Thu, 12 Nov 2026 12:02:00 GMT', Date.parse('2026-11-12T12:00:00Z'))).toBe(120000);
    expect(retryAfterMilliseconds('invalid')).toBe(0);
    expect(retryAfterMilliseconds(null)).toBe(0);
  });
});
