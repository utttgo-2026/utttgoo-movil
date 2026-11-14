import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';

import VerifyEmail from '@/app/(auth)/verify-email';
import { LOGIN_HINT_MS, pendingRegistration, PendingRegistrationStore } from '../pendingRegistration';
import { verificationClient } from '../supabase/verificationClient';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
const mockPush = jest.fn();
const mockLogin = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }), useLocalSearchParams: () => ({ email: 'untrusted@uttt.edu.mx' }) }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ login: mockLogin, status: 'anonymous' }), useAuthOptional: () => ({ login: mockLogin, status: 'anonymous' }) }));
jest.mock('../supabase/verificationClient', () => ({ verificationClient: { verify: jest.fn(), resend: jest.fn() } }));

describe('OTP to Backend login automático', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pendingRegistration.reset();
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://project.example.test';
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_fixture';
    jest.mocked(verificationClient.verify).mockResolvedValue(undefined);
    mockLogin.mockResolvedValue({ success: true });
  });
  afterEach(async () => { await cleanup(); pendingRegistration.reset(); });

  async function verifyRegistration(password = 'synthetic-password') {
    pendingRegistration.begin('verified-fixture@uttt.edu.mx', password);
    const view = await render(<VerifyEmail />);
    await fireEvent.changeText(view.getByLabelText('Código OTP de seis dígitos'), '012345');
    await fireEvent.press(view.getByRole('button', { name: 'Verificar código' }));
    return { view, wait: waitFor(() => expect(mockLogin).toHaveBeenCalledWith('verified-fixture@uttt.edu.mx', password)) };
  }

  test('verifyOtp inicia login Backend con password solo en memoria', async () => {
    const { view, wait } = await verifyRegistration();
    await wait;
    expect(mockPush).toHaveBeenCalledWith('/buyer');
    expect(pendingRegistration.read()).toBeNull();
    expect(pendingRegistration.getLoginEmailHint()).toBeUndefined();
    expect(view.getByLabelText('Código OTP de seis dígitos').props.value).toBe('');
  });

  test('login Backend fallido no navega al comprador y limpia el password', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'AWS rechazó el primer login (fixture).' });
    const { view } = await verifyRegistration();
    await waitFor(() => expect(view.queryAllByText(/Supabase no pudo completar/).length).toBeGreaterThan(0));
    expect(mockPush).not.toHaveBeenCalledWith('/buyer');
    expect(pendingRegistration.getLoginEmailHint()).toBeUndefined();
  });

  test('solo confirmación válida prepara hint efímero cuando no se usa login automático', () => {
    let now = 0;
    const store = new PendingRegistrationStore(() => now);
    store.begin('verified-fixture@uttt.edu.mx');
    const id = store.read()!.id;
    expect(store.prepareLogin(id)).toBe(false);
    store.update(id, { verified: true });
    expect(store.prepareLogin(id)).toBe(true);
    expect(store.getLoginEmailHint()).toBe('verified-fixture@uttt.edu.mx');
    now += LOGIN_HINT_MS;
    expect(store.getLoginEmailHint()).toBeUndefined();
    store.reset();
    expect(store.read()).toBeNull();
  });
});
