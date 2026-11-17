import React, { StrictMode } from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';

import VerifyEmail from '@/app/(auth)/verify-email';
import Login from '@/app/(auth)/login';
import { LOGIN_HINT_MS, pendingRegistration, PendingRegistrationStore } from '../pendingRegistration';
import { verificationClient } from '../supabase/verificationClient';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
const mockPush = jest.fn();
const mockLogin = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }), useLocalSearchParams: () => ({ email: 'untrusted@uttt.edu.mx' }) }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));
jest.mock('@/hooks/useApiHealth', () => ({ useApiHealth: () => ({ loading: false, check: jest.fn() }) }));
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ login: mockLogin, status: 'anonymous' }) }));
jest.mock('../supabase/verificationClient', () => ({ verificationClient: { verify: jest.fn(), resend: jest.fn() } }));

describe('OTP→login existente sin contraseña persistida ni auto-login', () => {
  const previousUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const previousKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  beforeEach(() => {
    jest.clearAllMocks(); pendingRegistration.reset();
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://project.example.test';
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_fixture';
    jest.mocked(verificationClient.verify).mockResolvedValue(undefined);
    mockLogin.mockResolvedValue({ success: true });
  });
  afterEach(async () => {
    await cleanup(); pendingRegistration.reset();
    if (previousUrl === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_URL; else process.env.EXPO_PUBLIC_SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY; else process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = previousKey;
    jest.restoreAllMocks();
  });

  async function reachLogin() {
    pendingRegistration.begin('verified-fixture@uttt.edu.mx');
    const view = await render(<VerifyEmail />);
    await fireEvent.changeText(view.getByLabelText('Código OTP de seis dígitos'), '012345');
    await fireEvent.press(view.getByRole('button', { name: 'Verificar código' }));
    await waitFor(() => expect(view.getByRole('button', { name: 'Continuar al login' })).toBeTruthy());
    expect(mockLogin).not.toHaveBeenCalled();
    await fireEvent.press(view.getByRole('button', { name: 'Continuar al login' }));
    expect(mockPush).toHaveBeenCalledWith('/login');
    await view.rerender(<StrictMode><Login /></StrictMode>);
    return view;
  }

  test('correo prellenado sobrevive StrictMode, contraseña empieza vacía y no se llama login hasta enviarla', async () => {
    const view = await reachLogin();
    expect(view.getByPlaceholderText('matricula@uttt.edu.mx').props.value).toBe('verified-fixture@uttt.edu.mx');
    expect(view.getByPlaceholderText('········').props.value).toBe('');
    expect(pendingRegistration.getLoginEmailHint()).toBeUndefined();
    expect(pendingRegistration.read()).toBeNull();
    expect(mockLogin).not.toHaveBeenCalled();
    await fireEvent.changeText(view.getByPlaceholderText('········'), 'synthetic-password');
    await fireEvent.press(view.getByRole('button', { name: 'Iniciar sesión' }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/buyer'));
    expect(mockLogin).toHaveBeenCalledWith('verified-fixture@uttt.edu.mx', 'synthetic-password');
    expect(view.getByPlaceholderText('········').props.value).toBe('');
  });

  test('primer login fallido muestra el error recibido y no afirma activación ni navega al comprador', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'AWS rechazó el primer login (fixture).' });
    const view = await reachLogin();
    await fireEvent.changeText(view.getByPlaceholderText('········'), 'synthetic-password');
    await fireEvent.press(view.getByRole('button', { name: 'Iniciar sesión' }));
    await waitFor(() => expect(view.queryAllByText('AWS rechazó el primer login (fixture).').length).toBeGreaterThan(0));
    expect(mockPush).not.toHaveBeenCalledWith('/buyer');
    expect(view.getByPlaceholderText('········').props.value).toBe('');
  });

  test('solo confirmación válida prepara el hint; caduca localmente y logout/reset lo elimina', () => {
    let now = 0;
    const store = new PendingRegistrationStore(() => now);
    store.begin('verified-fixture@uttt.edu.mx');
    const id = store.read()!.id;
    expect(store.prepareLogin(id)).toBe(false);
    store.update(id, { verified: true });
    expect(store.prepareLogin(id)).toBe(true);
    expect(store.getLoginEmailHint()).toBe('verified-fixture@uttt.edu.mx');
    expect(store.getLoginEmailHint()).toBe('verified-fixture@uttt.edu.mx');
    now += LOGIN_HINT_MS;
    expect(store.getLoginEmailHint()).toBeUndefined();
    store.begin('second-fixture@uttt.edu.mx');
    store.update(store.read()!.id, { verified: true });
    store.prepareLogin(store.read()!.id); store.reset();
    expect(store.getLoginEmailHint()).toBeUndefined();
  });

  test('login directo no consume email arbitrario de URL ni recupera contraseña', async () => {
    const view = await render(<Login />);
    expect(view.getByPlaceholderText('matricula@uttt.edu.mx').props.value).toBe('');
    expect(view.getByPlaceholderText('········').props.value).toBe('');
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
