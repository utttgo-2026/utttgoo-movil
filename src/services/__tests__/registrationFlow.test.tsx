import React from 'react';
import { Text, View } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import RegisterScreen from '@/app/(auth)/register';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { sessionStorage } from '../sessionStorage';
import { pendingRegistration } from '../pendingRegistration';
import { emailConfirmation } from '../emailConfirmation';
import { verificationClient } from '../supabase/verificationClient';
import { RequireSession } from '@/components/navigation/RequireSession';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, navigate: mockPush }) }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));
jest.mock('../supabase/verificationClient', () => ({ verificationClient: { verify: jest.fn(), resend: jest.fn() } }));
jest.mock('../sessionStorage', () => ({ sessionStorage: {
  read: jest.fn().mockResolvedValue(null), save: jest.fn(), clear: jest.fn(),
} }));

function SessionProbe() {
  const { user, isAuthenticated } = useAuth();
  return <Text testID="session-fixture">{JSON.stringify({ user, isAuthenticated })}</Text>;
}
function Harness() {
  return <AuthProvider><View><RegisterScreen /><SessionProbe />
    <RequireSession><Text testID="private-fixture">Private data fixture</Text></RequireSession>
  </View></AuthProvider>;
}

// Full form -> real AuthContext/coordinator/service/HttpClient, with fetch/storage mocked.
// No AWS request or account creation; these are synthetic strings, not credentials.
describe('Registro HTTPS desde formulario, sin AWS real', () => {
  const previousUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const previousBeta = process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY;
  const secret = 'synthetic-private-password';
  let transport: jest.SpyInstance<ReturnType<typeof fetch>, Parameters<typeof fetch>>;
  let log: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    const pending = pendingRegistration.getSnapshot();
    if (pending) pendingRegistration.clear(pending.id);
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://registration.example.test';
    process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY = 'false';
    transport = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Unexpected fixture fetch'));
    log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
  });
  afterEach(() => {
    const output = JSON.stringify(log.mock.calls);
    expect(output).not.toMatch(/fixture-private|Synthetic Private Name|synthetic-private-password|private-response|private-error/);
    if (previousUrl === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL;
    else process.env.EXPO_PUBLIC_API_BASE_URL = previousUrl;
    if (previousBeta === undefined) delete process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY;
    else process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY = previousBeta;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  async function submit(email = ' Fixture-Private@UTTT.EDU.MX ', confirmation = secret, deferred = false) {
    const view = await render(<Harness />);
    await fireEvent.changeText(view.getByPlaceholderText('Mariana López Cruz'), ' Synthetic Private Name ');
    await fireEvent.changeText(view.getByPlaceholderText('matricula@uttt.edu.mx'), email);
    await fireEvent.changeText(view.getByPlaceholderText('········'), secret);
    await fireEvent.changeText(view.getByPlaceholderText('Repite tu contraseña'), confirmation);
    if (deferred) await act(async () => { void fireEvent.press(view.getByRole('button', { name: 'Crear mi cuenta' })); });
    else await fireEvent.press(view.getByRole('button', { name: 'Crear mi cuenta' }));
    return view;
  }

  test.each([200, 202])('HTTP%s envía solo el request acordado, limpia contraseñas y no inicia sesión', async (status) => {
    transport.mockResolvedValue(new Response('{"private-response":true}', { status }));
    const view = await submit();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/verify-email'));
    expect(pendingRegistration.read()?.email).toBe('fixture-private@uttt.edu.mx');
    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport).toHaveBeenCalledWith('https://registration.example.test/api/v1/auth/register', expect.objectContaining({
      method: 'POST', redirect: 'error', credentials: 'omit',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'fixture-private@uttt.edu.mx', password: secret, displayName: 'Synthetic Private Name' }),
    }));
    expect(view.getByPlaceholderText('········').props.value).toBe('');
    expect(view.getByPlaceholderText('Repite tu contraseña').props.value).toBe('');
    expect(view.getByTestId('session-fixture').props.children).toBe('{"user":null,"isAuthenticated":false}');
    expect(sessionStorage.save).not.toHaveBeenCalled();
    expect(log.mock.calls.map(([, fields]) => fields.event)).toEqual([
      'form_submit', 'form_dispatch', 'request_start', 'response', 'form_result',
    ]);
    expect(log).toHaveBeenCalledWith('[aws-register]', expect.objectContaining({
      event: 'request_start', origin: 'https://registration.example.test', scheme: 'https:',
    }));
    expect(log).toHaveBeenCalledWith('[aws-register]', expect.objectContaining({ event: 'response', status }));
  });

  test('HTTP conserva el bloqueo antes de fetch', async () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://registration.example.test';
    const view = await submit();
    await waitFor(() => expect(view.getByText(/La autenticación y los datos de cuenta requieren HTTPS/)).toBeTruthy());
    expect(transport).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('[aws-register]', expect.objectContaining({ event: 'failure', kind: 'insecure_transport' }));
    expect(log.mock.calls.some(([, fields]) => fields.event === 'request_start')).toBe(false);
  });

  test('dominio parecido se rechaza antes de fetch', async () => {
    const view = await submit('fixture-private@uttt.edu.mx.evil.test');
    await waitFor(() => expect(view.getAllByText('Utiliza un correo institucional válido @uttt.edu.mx.').length).toBeGreaterThan(0));
    expect(transport).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('[aws-register]', expect.objectContaining({ event: 'form_validation_failed', kind: 'validation' }));
  });

  test('confirmación diferente no despacha al contexto ni al transporte', async () => {
    const view = await submit('fixture-private@uttt.edu.mx', 'synthetic-other');
    expect(view.getByText('Las contraseñas no coinciden.')).toBeTruthy();
    expect(transport).not.toHaveBeenCalled();
    expect(log.mock.calls.map(([, fields]) => fields.event)).toEqual(['form_submit', 'form_validation_failed']);
  });

  test('422 registra código y clasificación, sin exponer el cuerpo del backend', async () => {
    transport.mockResolvedValue(new Response('{"private-response":"fixture-private"}', { status: 422 }));
    const view = await submit();
    await waitFor(() => expect(view.getByText('El servidor no pudo procesar los datos. Revisa el correo institucional y los campos.')).toBeTruthy());
    expect(log).toHaveBeenCalledWith('[aws-register]', expect.objectContaining({ event: 'response', status: 422 }));
    expect(log).toHaveBeenCalledWith('[aws-register]', expect.objectContaining({ event: 'failure', kind: 'http' }));
    expect(mockPush).not.toHaveBeenCalled();
    expect(sessionStorage.save).not.toHaveBeenCalled();
  });

  test('fallo de red no inventa un HTTP ni filtra el error original', async () => {
    transport.mockRejectedValue(new Error('private-error fixture-private synthetic-private-password'));
    const view = await submit();
    await waitFor(() => expect(view.getByText(/No fue posible conectar con la API/)).toBeTruthy());
    expect(log).toHaveBeenCalledWith('[aws-register]', expect.objectContaining({ event: 'failure', kind: 'network' }));
    expect(log.mock.calls.some(([, fields]) => fields.event === 'response')).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('registro AWS→reenvío→OTP nunca repite registro ni guarda sesión Supabase', async () => {
    transport.mockResolvedValue(new Response('{}', { status: 200 }));
    jest.mocked(verificationClient.verify).mockResolvedValue(undefined);
    jest.mocked(verificationClient.resend).mockResolvedValue(undefined);
    const view = await submit();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/verify-email'));
    const pending = pendingRegistration.read()!;
    // Simulate elapsed visual cooldown without sending any live email.
    pendingRegistration.update(pending.id, { resendAt: 0 });
    await emailConfirmation.resend(pending.id);
    await emailConfirmation.verify(pending.id, '123456');
    expect(verificationClient.resend).toHaveBeenCalledWith('fixture-private@uttt.edu.mx');
    expect(transport).toHaveBeenCalledTimes(1);
    expect(sessionStorage.save).not.toHaveBeenCalled();
    expect(view.getByTestId('session-fixture').props.children).toBe('{"user":null,"isAuthenticated":false}');
  });

  test.each([200, 202])('Beta HTTP%s prepara login pendiente sin obligar a OTP ni crear sesión', async (status) => {
    process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY = 'true';
    transport.mockResolvedValue(new Response('{}', { status }));
    const view = await submit();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'));
    expect(pendingRegistration.hasRegistrationReceipt()).toBe(true);
    expect(transport).toHaveBeenCalledTimes(1);
    expect(JSON.parse(transport.mock.calls[0][1]!.body as string)).toEqual({ email: 'fixture-private@uttt.edu.mx', password: secret, displayName: 'Synthetic Private Name' });
    expect(view.getByTestId('session-fixture').props.children).toBe('{"user":null,"isAuthenticated":false}');
    expect(view.queryByTestId('private-fixture')).toBeNull();
    expect(sessionStorage.save).not.toHaveBeenCalled();
    expect(verificationClient.verify).not.toHaveBeenCalled(); expect(verificationClient.resend).not.toHaveBeenCalled();
    await fireEvent.press(view.getByRole('button', { name: 'Seguir explorando' }));
    expect(view.queryByTestId('private-fixture')).toBeNull();
    expect(transport).toHaveBeenCalledTimes(1);
  });

  test('Beta conserva contexto OTP y hint de login sin reenviar ni volver a registrar', async () => {
    process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY = 'true';
    transport.mockResolvedValue(new Response('{}', { status: 202 }));
    await submit();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'));
    expect(pendingRegistration.getLoginEmailHint()).toBe('fixture-private@uttt.edu.mx');
    expect(pendingRegistration.read()?.email).toBe('fixture-private@uttt.edu.mx');
    expect(transport).toHaveBeenCalledTimes(1);
    expect(verificationClient.resend).not.toHaveBeenCalled();
  });

  test.each([201, 401, 403, 422, 429, 500])('Beta rechaza HTTP%s sin falso acuse', async (status) => {
    process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY = 'true';
    transport.mockResolvedValue(new Response('{}', { status }));
    const view = await submit();
    await waitFor(() => expect(view.getByRole('button', { name: 'Crear mi cuenta' })).not.toBeDisabled());
    expect(view.queryByText('Registro recibido')).toBeNull();
    expect(mockPush).not.toHaveBeenCalled(); expect(sessionStorage.save).not.toHaveBeenCalled();
  });

  test('Beta no reintenta después de timeout ni afirma persistencia', async () => {
    process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY = 'true';
    jest.useFakeTimers();
    transport.mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new Error('Synthetic abort')));
    }));
    const view = await submit(undefined, undefined, true);
    await act(async () => { await jest.advanceTimersByTimeAsync(10001); });
    expect(view.getByText('El servidor tardó demasiado en responder.')).toBeTruthy();
    await act(async () => { await jest.advanceTimersByTimeAsync(60000); });
    expect(transport).toHaveBeenCalledTimes(1);
    expect(view.queryByText('Registro recibido')).toBeNull(); expect(mockPush).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('[aws-register]', expect.objectContaining({ event: 'failure', kind: 'timeout' }));
  });

  test('Beta bloquea doble pulsación antes y después de la respuesta', async () => {
    process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY = 'true';
    let finish!: (response: Response) => void;
    transport.mockImplementationOnce(() => new Promise<Response>((resolve) => { finish = resolve; }));
    const view = await submit(undefined, undefined, true);
    await fireEvent.press(view.getByRole('button', { name: 'Crear mi cuenta' }));
    expect(transport).toHaveBeenCalledTimes(1);
    await act(async () => { finish(new Response('{}', { status: 200 })); });
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'));
    await fireEvent.press(view.getByRole('button', { name: 'Crear mi cuenta' }));
    expect(transport).toHaveBeenCalledTimes(1);
  });

  test('Beta conserva rechazo institucional y fallo de red sin éxito falso', async () => {
    process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY = 'true';
    const view = await submit('fixture-private@uttt.edu.mx.evil.test');
    await waitFor(() => expect(view.getAllByText('Utiliza un correo institucional válido @uttt.edu.mx.').length).toBeGreaterThan(0));
    expect(transport).not.toHaveBeenCalled(); expect(view.queryByText('Registro recibido')).toBeNull();
    await fireEvent.changeText(view.getByPlaceholderText('matricula@uttt.edu.mx'), 'fixture-private@uttt.edu.mx');
    await fireEvent.changeText(view.getByPlaceholderText('········'), secret);
    await fireEvent.changeText(view.getByPlaceholderText('Repite tu contraseña'), secret);
    await fireEvent.press(view.getByRole('button', { name: 'Crear mi cuenta' }));
    await waitFor(() => expect(view.getByText(/No fue posible conectar con la API/)).toBeTruthy());
    expect(view.queryByText('Registro recibido')).toBeNull(); expect(mockPush).not.toHaveBeenCalled();
  });
});
