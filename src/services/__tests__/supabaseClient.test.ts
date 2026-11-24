import { getSupabaseConfig } from '../supabaseClient';

describe('Configuración pública Supabase', () => {
  const previousUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const previousKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  afterEach(() => {
    if (previousUrl === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    else process.env.EXPO_PUBLIC_SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    else process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = previousKey;
  });

  test('rechaza configuración ausente', () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    expect(() => getSupabaseConfig()).toThrow(expect.objectContaining({ kind: 'configuration' }));
  });

  test('acepta URL HTTPS y publishable key', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://fixture.supabase.co/';
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'fixture-public-key';
    expect(getSupabaseConfig()).toEqual({ url: 'https://fixture.supabase.co', publishableKey: 'fixture-public-key' });
  });
});
