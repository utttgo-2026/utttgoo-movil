import React from 'react';
import { Stack } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';
import { cleanup, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import Login from '@/app/(auth)/login';
import Register from '@/app/(auth)/register';
import VerifyEmail from '@/app/(auth)/verify-email';
import { pendingRegistration } from '../pendingRegistration';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));
jest.mock('@/hooks/useApiHealth', () => ({ useApiHealth: () => ({ loading: false, check: jest.fn() }) }));
const mockLogin = jest.fn();
const mockRegister = jest.fn();
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ login: mockLogin, register: mockRegister, status: 'anonymous' }) }));
jest.mock('../supabase/verificationClient', () => ({ verificationClient: { verify: async () => {}, resend: jest.fn() } }));

describe('Router real en memoria: handoff OTP a un nuevo login', () => {
  test.each([false, true])('registro→login Beta=%s mantiene contraseña vacía y nunca autentica por navegación', async (beta) => {
    mockRegister.mockClear(); mockLogin.mockClear();
    const previousUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const previousKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const previousBeta = process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY;
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://project.example.test';
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_fixture';
    process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY = beta ? 'true' : 'false';
    pendingRegistration.reset();
    const transport = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('No live network in router fixture'));
    const diagnostic = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    mockRegister.mockImplementation(async (_name: string, email: string) => {
      pendingRegistration.begin(email);
      return { success: true };
    });
    try {
      const view = await renderRouter({
        _layout: () => <Stack screenOptions={{ headerShown: false }} />,
        login: Login, register: Register, 'verify-email': VerifyEmail,
        buyer: () => <Text>Buyer route fixture</Text>,
      }, { initialUrl: '/login' });
      await fireEvent.changeText(view.getByPlaceholderText('matricula@uttt.edu.mx'), 'old-fixture@uttt.edu.mx');
      await fireEvent.changeText(view.getByPlaceholderText('········'), 'synthetic-old-password');
      await fireEvent.press(view.getByRole('button', { name: 'Crear cuenta' }));
      expect(view.getPathname()).toBe('/register');
      await fireEvent.changeText(view.getByPlaceholderText('Mariana López Cruz'), 'Synthetic router fixture');
      await fireEvent.changeText(view.getByPlaceholderText('matricula@uttt.edu.mx'), 'verified-fixture@uttt.edu.mx');
      await fireEvent.changeText(view.getByPlaceholderText('········'), 'synthetic-new-password');
      await fireEvent.changeText(view.getByPlaceholderText('Repite tu contraseña'), 'synthetic-new-password');
      await fireEvent.press(view.getByRole('button', { name: 'Crear mi cuenta' }));
      if (!beta) {
        await waitFor(() => expect(view.getPathname()).toBe('/verify-email'));
        await fireEvent.changeText(view.getByLabelText('Código OTP de seis dígitos'), '012345');
        await fireEvent.press(view.getByRole('button', { name: 'Verificar código' }));
        await waitFor(() => expect(view.getByRole('button', { name: 'Continuar al login' })).toBeTruthy());
        await fireEvent.press(view.getByRole('button', { name: 'Continuar al login' }));
      }
      await waitFor(() => expect(view.getPathname()).toBe('/login'));
      expect(view.getByPlaceholderText('matricula@uttt.edu.mx').props.value).toBe('verified-fixture@uttt.edu.mx');
      expect(view.getByPlaceholderText('········').props.value).toBe('');
      expect(view.getSearchParams()).toEqual({});
      expect(mockRegister).toHaveBeenCalledTimes(1);
      expect(mockLogin).not.toHaveBeenCalled();
      expect(transport).not.toHaveBeenCalled();
      if (beta) {
        expect(view.getByText(/Registro recibido por AWS/)).toBeTruthy();
        await fireEvent.press(view.getByRole('button', { name: 'Verificar correo (opcional)' }));
        expect(view.getPathname()).toBe('/verify-email');
      }
    } finally {
      await cleanup(); pendingRegistration.reset(); transport.mockRestore(); diagnostic.mockRestore();
      if (previousUrl === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_URL; else process.env.EXPO_PUBLIC_SUPABASE_URL = previousUrl;
      if (previousKey === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY; else process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = previousKey;
      if (previousBeta === undefined) delete process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY; else process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY = previousBeta;
    }
  });
});
