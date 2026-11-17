import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import VerifyEmail from '@/app/(auth)/verify-email';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { pendingRegistration } from '../pendingRegistration';
import { sessionStorage } from '../sessionStorage';
import { verificationClient } from '../supabase/verificationClient';
import { VerificationError } from '../supabase/verificationErrors';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }), useLocalSearchParams: () => ({ email: 'untrusted@uttt.edu.mx' }) }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));
jest.mock('../supabase/verificationClient', () => ({ verificationClient: { verify: jest.fn(), resend: jest.fn() } }));
jest.mock('../sessionStorage', () => ({ sessionStorage: { save: jest.fn(), clear: jest.fn(), read: jest.fn() } }));
let mockHasAwsSession = false;
jest.mock('../authSession', () => ({ createAuthSession: () => ({
  restore: async () => mockHasAwsSession ? { id: 'aws-fixture', email: 'aws-existing@uttt.edu.mx', role: 'buyer', fullName: 'AWS fixture' } : null,
}) }));

function Probe() {
  const { user, isAuthenticated } = useAuth();
  return <Text testID="aws-session-fixture">{JSON.stringify({ id: user?.id ?? null, isAuthenticated })}</Text>;
}
function Harness() { return <AuthProvider><VerifyEmail /><Probe /></AuthProvider>; }

describe('Pantalla OTP; proveedor simulado, AuthContext real sin modificar', () => {
  const previousUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const previousKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  beforeEach(() => {
    jest.useFakeTimers(); jest.setSystemTime(new Date('2026-11-12T12:00:00Z'));
    jest.clearAllMocks(); mockHasAwsSession = false;
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://project.example.test';
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_fixture';
    pendingRegistration.begin('registered-fixture@uttt.edu.mx');
    jest.mocked(verificationClient.verify).mockResolvedValue(undefined);
    jest.mocked(verificationClient.resend).mockResolvedValue(undefined);
  });
  afterEach(() => {
    const pending = pendingRegistration.getSnapshot();
    if (pending) pendingRegistration.clear(pending.id);
    if (previousUrl === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_URL; else process.env.EXPO_PUBLIC_SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY; else process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = previousKey;
    jest.useRealTimers(); jest.restoreAllMocks();
  });

  test.each([false, true])('OTP confirmado conserva sesión AWS previa=%s y solo continúa a login por acción explícita', async (authenticated) => {
    mockHasAwsSession = authenticated;
    const view = await render(<Harness />);
    const original = view.getByTestId('aws-session-fixture').props.children;
    expect(view.getByLabelText('Correo del registro reciente').props.value).toBe('registered-fixture@uttt.edu.mx');
    await fireEvent.changeText(view.getByLabelText('Código OTP de seis dígitos'), '012345');
    await fireEvent.press(view.getByRole('button', { name: 'Verificar código' }));
    await waitFor(() => expect(view.getByText(/Correo confirmado en Supabase/)).toBeTruthy());
    expect(verificationClient.verify).toHaveBeenCalledWith('registered-fixture@uttt.edu.mx', '012345');
    expect(view.getByTestId('aws-session-fixture').props.children).toBe(original);
    expect(sessionStorage.save).not.toHaveBeenCalled(); expect(sessionStorage.clear).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(view.getByLabelText('Código OTP de seis dígitos').props.value).toBe('');
    await fireEvent.press(view.getByRole('button', { name: 'Continuar al login' }));
    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(pendingRegistration.read()).toBeNull();
  });

  test('formato de código inválido no llama a Supabase', async () => {
    const view = await render(<Harness />);
    await fireEvent.changeText(view.getByLabelText('Código OTP de seis dígitos'), '12a456');
    await fireEvent.press(view.getByRole('button', { name: 'Verificar código' }));
    expect(view.getByRole('alert').props.children).toMatch(/El código no es correcto/);
    expect(verificationClient.verify).not.toHaveBeenCalled();
  });

  test.each([
    ['invalid_code', /El código no es correcto/], ['expired_code', /El código expiró o ya no es válido/], ['network', /No fue posible conectar/],
  ] as const)('muestra %s sin confirmar, navegar ni almacenar token', async (kind, message) => {
    jest.mocked(verificationClient.verify).mockRejectedValueOnce(new VerificationError(kind));
    const view = await render(<Harness />);
    await fireEvent.changeText(view.getByLabelText('Código OTP de seis dígitos'), '123456');
    await fireEvent.press(view.getByRole('button', { name: 'Verificar código' }));
    await waitFor(() => expect(view.getByRole('alert').props.children).toMatch(message));
    expect(pendingRegistration.read()?.verified).toBe(false);
    expect(mockPush).not.toHaveBeenCalled(); expect(sessionStorage.save).not.toHaveBeenCalled();
  });

  test('reenvío respeta cooldown al remontar pantalla; no afirma entrega SMTP', async () => {
    const first = await render(<Harness />);
    expect(first.getByRole('button', { name: 'Reenviar token (60 s)' })).toBeDisabled();
    await act(async () => { jest.advanceTimersByTime(60000); });
    await fireEvent.press(first.getByRole('button', { name: 'Reenviar token' }));
    await waitFor(() => expect(first.getByText(/Solicitud de reenvío aceptada/)).toBeTruthy());
    expect(verificationClient.resend).toHaveBeenCalledTimes(1);
    await first.unmount();
    const second = await render(<Harness />);
    expect(second.getByRole('button', { name: 'Reenviar token (60 s)' })).toBeDisabled();
    expect(verificationClient.resend).toHaveBeenCalledTimes(1);
  });

  test('429 mantiene espera del proveedor y bloquea acciones', async () => {
    const view = await render(<Harness />);
    await act(async () => { jest.advanceTimersByTime(60000); });
    jest.mocked(verificationClient.resend).mockRejectedValueOnce(new VerificationError('rate_limit', 180000));
    await fireEvent.press(view.getByRole('button', { name: 'Reenviar token' }));
    await waitFor(() => expect(view.getByRole('button', { name: 'Reenviar token (180 s)' })).toBeDisabled());
    expect(view.getByRole('button', { name: 'Verificar código' })).toBeDisabled();
  });

  test('doble envío muestra busy y ejecuta una sola operación', async () => {
    let finish!: () => void;
    jest.mocked(verificationClient.verify).mockImplementationOnce(() => new Promise<void>((resolve) => { finish = resolve; }));
    const view = await render(<Harness />);
    await fireEvent.changeText(view.getByLabelText('Código OTP de seis dígitos'), '123456');
    await fireEvent.press(view.getByRole('button', { name: 'Verificar código' }));
    await fireEvent(view.getByLabelText('Código OTP de seis dígitos'), 'submitEditing');
    expect(view.getByRole('button', { name: 'Verificar código' }).props.accessibilityState.busy).toBe(true);
    expect(verificationClient.verify).toHaveBeenCalledTimes(1);
    await act(async () => { finish(); });
  });

  test('sin configuración pública acciones bloqueadas con explicación accesible', async () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const view = await render(<Harness />);
    expect(view.getByRole('alert').props.children).toMatch(/Falta configurar la URL HTTPS/);
    expect(view.getByRole('button', { name: 'Verificar código' })).toBeDisabled();
    expect(verificationClient.verify).not.toHaveBeenCalled();
  });

  test('entrada directa sin registro ignora el correo de parámetros', async () => {
    pendingRegistration.clear(pendingRegistration.read()!.id);
    const view = await render(<Harness />);
    expect(view.getByRole('alert').props.children).toMatch(/No hay un registro reciente/);
    expect(view.getByLabelText('Correo del registro reciente').props.value).toBe('');
    expect(view.getByRole('button', { name: 'Verificar código' })).toBeDisabled();
    expect(verificationClient.verify).not.toHaveBeenCalled(); expect(verificationClient.resend).not.toHaveBeenCalled();
  });
});
