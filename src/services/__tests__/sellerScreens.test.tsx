import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import Activation from '@/app/seller/activation';
import Business from '@/app/seller/index';
import Products from '@/app/seller/products';
import Draft from '@/app/seller/product-draft';
import SellerLayout from '@/app/seller/_layout';

const mockRequest = jest.fn(); const mockConsult = jest.fn(); const mockPush = jest.fn();
let mockAuthenticated = true;
jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, navigate: mockPush }), Stack: () => null }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: mockAuthenticated, status: mockAuthenticated ? 'authenticated' : 'anonymous',
  requestSellerActivation: mockRequest, consultSeller: mockConsult }) }));

describe('Vendedor UI sin operaciones reales', () => {
  beforeEach(() => { jest.clearAllMocks(); mockAuthenticated = true; });
  test('alta HTTP no se presenta como aprobación automática y bloquea segundo envío', async () => {
    mockRequest.mockResolvedValue({ success: true, status: 200, contractPending: true });
    const view = await render(<Activation />);
    await fireEvent.changeText(view.getByLabelText('Nombre del negocio'), 'Cocina fixture');
    await fireEvent.changeText(view.getByLabelText('Descripción del negocio'), 'Comida del campus fixture');
    await fireEvent.changeText(view.getByLabelText('Punto de entrega'), 'Edificio fixture');
    await fireEvent.press(view.getByRole('button', { name: 'Solicitar activación' }));
    expect(view.getByText(/Solicitud recibida por AWS/)).toBeTruthy();
    expect(view.getByRole('button', { name: 'Solicitar activación' })).toBeDisabled();
    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledWith({ businessName: 'Cocina fixture', description: 'Comida del campus fixture', pickupPoint: 'Edificio fixture' });
  });
  test('campos inválidos no envían nada', async () => {
    const view = await render(<Activation />); await fireEvent.press(view.getByRole('button', { name: 'Solicitar activación' }));
    expect(mockRequest).not.toHaveBeenCalled();
  });
  test('consulta HTTP real informada sin fabricar estado de autorización ni perfil', async () => {
    mockConsult.mockResolvedValue({ success: true, status: 200, contractPending: true });
    const view = await render(<Business />);
    expect(mockConsult).not.toHaveBeenCalled();
    await fireEvent.press(view.getByRole('button', { name: 'Consultar mi solicitud' }));
    expect(view.getByText(/Falta confirmar el contrato/)).toBeTruthy();
    expect(view.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  });
  test('403 no se convierte en rechazo administrativo', async () => {
    mockConsult.mockResolvedValue({ success: false, status: 403, error: 'No autorizado (fixture)' });
    const view = await render(<Business />); await fireEvent.press(view.getByRole('button', { name: 'Consultar mi solicitud' }));
    expect(view.getByText(/No se deduce un estado administrativo/)).toBeTruthy();
  });
  test('invitado bloqueado por guarda del grupo', async () => {
    mockAuthenticated = false;
    const view = await render(<SellerLayout />);
    expect(view.getByText('Exploras como invitado')).toBeTruthy(); expect(mockRequest).not.toHaveBeenCalled();
  });
  test('productos no afirman catálogo real vacío ni publican; preview es solo memoria', async () => {
    const list = await render(<Products />);
    expect(list.getByText(/No es una lista vacía obtenida de AWS/)).toBeTruthy();
    expect(list.getByRole('button', { name: 'Publicar productos' })).toBeDisabled();
    await list.unmount();
    const view = await render(<Draft />);
    await fireEvent.changeText(view.getByLabelText('Nombre del alimento'), 'Alimento fixture');
    await fireEvent.changeText(view.getByLabelText('Descripción del alimento'), 'Descripción de alimento fixture');
    await fireEvent.changeText(view.getByLabelText('Precio MXN'), '35.25');
    await fireEvent.press(view.getByRole('button', { name: 'Vista previa local' }));
    expect(view.getByText('Vista previa — no publicado')).toBeTruthy();
    expect(view.getByRole('button', { name: 'Publicar alimento' })).toBeDisabled();
    expect(view.getByRole('button', { name: 'Agregar foto' })).toBeDisabled();
    expect(mockRequest).not.toHaveBeenCalled(); expect(mockConsult).not.toHaveBeenCalled();
  });
  test('pulsaciones simultáneas en alta quedan excluidas', async () => {
    let finish!: (response: object) => void;
    mockRequest.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const view = await render(<Activation />);
    await fireEvent.changeText(view.getByLabelText('Nombre del negocio'), 'Cocina fixture');
    await fireEvent.changeText(view.getByLabelText('Descripción del negocio'), 'Comida del campus fixture');
    await fireEvent.changeText(view.getByLabelText('Punto de entrega'), 'Edificio fixture');
    await fireEvent.press(view.getByRole('button', { name: 'Solicitar activación' }));
    await fireEvent.press(view.getByRole('button', { name: 'Solicitar activación' }));
    expect(mockRequest).toHaveBeenCalledTimes(1);
    await act(async () => { finish({ success: true, status: 201 }); });
    await waitFor(() => expect(view.getByText(/Solicitud recibida/)).toBeTruthy());
  });
});
