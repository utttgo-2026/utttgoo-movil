import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { RequireSession } from '../RequireSession';
import { NavigationErrorBoundary } from '../NavigationErrorBoundary';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/buyer/food/private-fixture?token=private-fixture',
}));
jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

function PrivateContent({ onMount }: { onMount: () => void }) {
  onMount();
  return <Text>Información privada fixture</Text>;
}

describe('Límite de acceso006', () => {
  test.each(['anonymous', 'blocked', 'restoring'] as const)('estado %s no monta información privada', async (status) => {
    jest.mocked(useAuth).mockReturnValue({ status, isAuthenticated: false } as ReturnType<typeof useAuth>);
    const mount = jest.fn();
    const view = await render(<RequireSession><PrivateContent onMount={mount} /></RequireSession>);
    expect(view.queryByText('Información privada fixture')).toBeNull();
    expect(mount).not.toHaveBeenCalled();
    if (status !== 'restoring') expect(view.getByText('Exploras como invitado')).toBeTruthy();
    else expect(view.getByText('Cargando…')).toBeTruthy();
  });

  test('solo el estado autenticado del Context existente permite montar hijos', async () => {
    jest.mocked(useAuth).mockReturnValue({ status: 'authenticated', isAuthenticated: true } as ReturnType<typeof useAuth>);
    const mount = jest.fn();
    const view = await render(<RequireSession><PrivateContent onMount={mount} /></RequireSession>);
    expect(view.getByText('Información privada fixture')).toBeTruthy();
    expect(mount).toHaveBeenCalled();
  });

  test('error de ejecución tiene recuperación y diagnóstico sin mensaje/id/query sensibles', async () => {
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    const retry = jest.fn();
    const view = await render(<NavigationErrorBoundary error={new Error('sensitive-message')} retry={retry} />);
    expect(view.getByText('No se pudo mostrar esta pantalla')).toBeTruthy();
    await fireEvent.press(view.getByText('Reintentar'));
    expect(retry).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('[navigation]', { event: 'execution_error', route: '/buyer/food/[id]' });
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/private-fixture|sensitive-message/);
    log.mockRestore();
  });
});
