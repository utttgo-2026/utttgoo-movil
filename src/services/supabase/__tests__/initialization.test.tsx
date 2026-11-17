import React from 'react';
import { act, cleanup, render } from '@testing-library/react-native';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import VerifyEmail from '@/app/(auth)/verify-email';
import { pendingRegistration } from '@/services/pendingRegistration';
import { getSupabaseConfig, supabaseConfigurationMessage } from '../config';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));

// Normal CI uses fixtures. An opt-in local invocation inherits @expo/env's effective values
// from its parent process. Never assert/dump a config object, key, SDK object or raw SDK error.
const localConfiguration = process.env.UTTGO_VERIFY_LOCAL_CONFIG === '1';

describe(`Inicialización sin red (${localConfiguration ? 'entorno Expo local' : 'configuración sintética'})`, () => {
  const previous = { url: process.env.EXPO_PUBLIC_SUPABASE_URL, key: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY };
  let transport: jest.SpyInstance;
  let consoles: jest.SpyInstance[];

  beforeEach(() => {
    if (!localConfiguration) {
      process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://project.example.test';
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_fixture';
    }
    consoles = (['log', 'info', 'warn', 'error'] as const).map((method) =>
      jest.spyOn(console, method).mockImplementation(() => undefined));
    // Even an unexpected SDK request is blocked before it could reach any server.
    transport = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network disabled for initialization check'));
    const pending = pendingRegistration.getSnapshot();
    if (pending) pendingRegistration.clear(pending.id);
  });

  afterEach(async () => {
    await cleanup();
    const pending = pendingRegistration.getSnapshot();
    if (pending) pendingRegistration.clear(pending.id);
    if (previous.url === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_URL; else process.env.EXPO_PUBLIC_SUPABASE_URL = previous.url;
    if (previous.key === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY; else process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = previous.key;
    const attemptedNetwork = transport.mock.calls.length > 0;
    const attemptedLogging = consoles.some((spy) => spy.mock.calls.length > 0);
    jest.useRealTimers();
    jest.restoreAllMocks();
    // Boolean-only failure output cannot disclose request headers or actual configuration.
    expect(attemptedNetwork).toBe(false);
    expect(attemptedLogging).toBe(false);
  });

  test('el parser de la app y el SDK real inicializan/disponen sin peticiones ni logging', async () => {
    let initialized = false;
    let disposed = false;
    let correctOrigin = false;
    let client: SupabaseClient | undefined;
    try {
      const configuration = getSupabaseConfig();
      correctOrigin = configuration.url === (localConfiguration
        ? 'https://tabhbylbhewtehvirexn.supabase.co' : 'https://project.example.test');
      client = createClient(configuration.url, configuration.key, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, debug: false },
        global: { fetch },
      });
      initialized = (await client.auth.initialize()).error === null;
    } catch {
      // Deliberately omit raw SDK exceptions and their potential configuration details.
      initialized = false;
    } finally {
      if (client) {
        try { await client.auth.dispose(); disposed = true; } catch { disposed = false; }
      }
    }
    expect(correctOrigin).toBe(true);
    expect(initialized).toBe(true);
    expect(disposed).toBe(true);
    expect(supabaseConfigurationMessage() === undefined).toBe(true);
  });

  test('contexto de registro sintético habilita OTP sin pulsar verificar/reenviar', async () => {
    jest.useFakeTimers();
    // Test memory only: no registration, account, email or auth session is created.
    pendingRegistration.begin('initialization-fixture@uttt.edu.mx');
    const view = await render(<VerifyEmail />);
    expect(view.queryByText(/Falta configurar la URL HTTPS/) === null).toBe(true);
    expect(view.getByLabelText('Código OTP de seis dígitos').props.editable === true).toBe(true);
    expect(view.getByRole('button', { name: 'Verificar código' }).props.accessibilityState.disabled === false).toBe(true);
    // Initial resend wait is a normal guard, not an incomplete configuration.
    expect(view.getByRole('button', { name: 'Reenviar token (60 s)' }).props.accessibilityState.disabled === true).toBe(true);
    await act(async () => { jest.advanceTimersByTime(60000); });
    expect(view.getByRole('button', { name: 'Reenviar token' }).props.accessibilityState.disabled === false).toBe(true);
  });

  test('entrada directa conserva bloqueo por falta de registro, no por configuración', async () => {
    const view = await render(<VerifyEmail />);
    expect(view.queryByText(/Falta configurar la URL HTTPS/) === null).toBe(true);
    expect(view.queryByText(/No hay un registro reciente disponible/) !== null).toBe(true);
    expect(view.getByRole('button', { name: 'Verificar código' }).props.accessibilityState.disabled === true).toBe(true);
  });
});
