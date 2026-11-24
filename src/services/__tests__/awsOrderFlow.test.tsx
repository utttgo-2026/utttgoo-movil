import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { AwsOrderReceipt, AwsOrderReview, AwsOrdersPending } from '@/components/catalog/AwsOrderFlow';
import { AwsProductImage } from '@/components/catalog/AwsProductImage';

const mockPush = jest.fn();
const mockSubmit = jest.fn();
const mockUpdateNotes = jest.fn();
const mockParams = { id: 'aws-order' };
const mockProduct = { id: 'aws-product', name: 'Producto AWS', price: 35.25, imageUrl: null };
const mockAuth = { orderPreparation: { product: mockProduct, quantity: 2, notes: '' }, submitOrder: mockSubmit, updateOrderNotes: mockUpdateNotes,
  lastOrder: { orderId: 'aws-order', productId: 'aws-product', productName: 'Producto AWS', status: 'Pending', quantity: 2, unitPrice: 35.25, totalAmount: 70.5, createdAt: '2026-11-16T12:00:00Z' } };
jest.mock('@/context/AuthContext', () => ({ useAuth: () => mockAuth }));
jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }), useLocalSearchParams: () => mockParams }));

describe('UI pedido AWS y medios reales', () => {
  beforeEach(() => { jest.clearAllMocks(); mockParams.id = 'aws-order'; mockAuth.orderPreparation.notes = ''; mockUpdateNotes.mockReturnValue({ success: true }); });
  test('revisión muestra un producto y estimado sin fee, notas opcionales, no ejecutaPOST', async () => {
    const view = await render(<AwsOrderReview />);
    expect(view.getByText('Producto AWS')).toBeTruthy(); expect(view.queryByText('Costo de servicio')).toBeNull();
    expect(view.getByText('Efectivo')).toBeTruthy();
    await fireEvent.press(view.getByRole('button', { name: 'Continuar' }));
    expect(mockPush).toHaveBeenCalledWith('/buyer/confirm-order'); expect(mockSubmit).not.toHaveBeenCalled();
  });
  test('notas del formulario se validan y no permiten continuar con más de250', async () => {
    const view = await render(<AwsOrderReview />);
    await fireEvent.changeText(view.getByLabelText('Notas para el vendedor'), 'Sin cebolla');
    expect(mockUpdateNotes).toHaveBeenCalledWith('Sin cebolla');
    mockUpdateNotes.mockReturnValue({ success: false, error: 'Máximo 250 caracteres fixture' });
    await fireEvent.changeText(view.getByLabelText('Notas para el vendedor'), 'x'.repeat(251));
    expect(view.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    expect(view.getByText('Máximo 250 caracteres fixture')).toBeTruthy(); expect(mockSubmit).not.toHaveBeenCalled();
  });
  test('confirmación muestra notas conservadas en preparación', async () => {
    mockAuth.orderPreparation.notes = 'Sin cebolla';
    const view = await render(<AwsOrderReview confirm />);
    expect(view.getByText('Notas: Sin cebolla')).toBeTruthy(); expect(mockSubmit).not.toHaveBeenCalled();
    expect(view.getByText('Efectivo')).toBeTruthy();
  });
  test('confirmación no navega ante error; doble pulsación durantePOST no duplica envío', async () => {
    let finish!: (result: object) => void;
    mockSubmit.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const view = await render(<AwsOrderReview confirm />);
    await fireEvent.press(view.getByRole('button', { name: 'Confirmar pedido' }));
    await fireEvent.press(view.getByRole('button', { name: 'Confirmar pedido' }));
    expect(mockSubmit).toHaveBeenCalledTimes(1); expect(mockPush).not.toHaveBeenCalled();
    await act(async () => { finish({ success: false, error: 'Resultado incierto fixture' }); });
    expect(view.getByText('Resultado incierto fixture')).toBeTruthy(); expect(mockPush).not.toHaveBeenCalled();
    mockSubmit.mockResolvedValue({ success: true, data: { orderId: 'aws-order' } });
    await fireEvent.press(view.getByRole('button', { name: 'Confirmar pedido' }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/buyer/order-created', params: { id: 'aws-order' } });
  });
  test('recibo exige ID validado, jamás toma primer pedido mock', async () => {
    const view = await render(<AwsOrderReceipt />);
    expect(view.getByText('Número de pedido: aws-order')).toBeTruthy();
    expect(view.getByText('Código QR de entrega')).toBeTruthy();
    expect(view.getByLabelText('Credencial QR pendiente del backend')).toBeTruthy();
    mockParams.id = 'forged-order'; await view.rerender(<AwsOrderReceipt />);
    expect(view.queryByText('¡Pedido generado!')).toBeNull();
    expect(view.queryByText('Código QR de entrega')).toBeNull();
    expect(view.getByText(/No hay un recibo AWS validado/)).toBeTruthy();
  });
  test('resultado incierto ofrece historial y bloquea repetición en pantalla', async () => {
    mockSubmit.mockResolvedValue({ success: false, reason: 'uncertain', error: 'No se pudo confirmar el pedido.' });
    const view = await render(<AwsOrderReview confirm />);
    await fireEvent.press(view.getByRole('button', { name: 'Confirmar pedido' }));
    expect(view.getByText('No se pudo confirmar el pedido.')).toBeTruthy();
    expect(view.getByRole('button', { name: 'Confirmar pedido' })).toBeDisabled();
    await fireEvent.press(view.getByRole('button', { name: 'Revisar mis pedidos' }));
    expect(mockPush).toHaveBeenCalledWith('/buyer/orders');
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });
  test('historial no simula colección vacía ni seguimiento', async () => {
    const view = await render(<AwsOrdersPending />);
    expect(view.getByText(/pendientes de integración y verificación/)).toBeTruthy(); expect(mockSubmit).not.toHaveBeenCalled();
  });
  test('HTTP/credenciales/media ausente no cargan imagen; HTTPS fallida vuelve a neutro', async () => {
    const view = await render(<AwsProductImage uri="http://images.example.test/photo.jpg" name="Producto" />);
    expect(view.getByLabelText('Imagen de producto no disponible')).toBeTruthy();
    await view.rerender(<AwsProductImage uri="https://user:password@images.example.test/photo.jpg" name="Producto" />);
    expect(view.getByLabelText('Imagen de producto no disponible')).toBeTruthy();
    await view.rerender(<AwsProductImage uri="https://images.example.test/photo.jpg" name="Producto" />);
    await fireEvent(view.getByLabelText('Fotografía de Producto'), 'error');
    expect(view.getByLabelText('Imagen de producto no disponible')).toBeTruthy();
  });
});
