import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { AwsBuyerCancel, AwsBuyerOrders, AwsBuyerTracking, AwsOrderReceipt, AwsSellerOrderDetail, AwsSellerOrders } from '@/components/catalog/AwsOrderFlow';
import { DeliveryQrCard } from '@/components/catalog/DeliveryQrCard';
import { DeliveryScanner } from '@/components/seller/DeliveryScanner';
import { orderFixture as order } from '../__fixtures__/order';
import { orderReference } from '@/utils/orderPresentation';
import type { OrderPr27 } from '../api/orderContractsPr27';
import OrderCreatedScreen from '@/app/buyer/(private)/order-created';
import ProfileScreen from '@/app/buyer/(tabs)/profile';

const mockParams: { orderId?: string; id?: string } = {};
const mockPush = jest.fn(), mockBuyer = jest.fn(), mockSeller = jest.fn(), mockBuyerList = jest.fn(), mockSellerList = jest.fn();
const mockIssue = jest.fn(), mockConfirm = jest.fn(), mockCancel = jest.fn(), mockChange = jest.fn();
const mockPermission = { granted: true, status: 'granted', canAskAgain: true };
const mockRequestPermission = jest.fn();
const mockAuth = { user: { id: order.buyerId, fullName: 'Cuenta de prueba' }, role: 'buyer', isAuthenticated: true, status: 'authenticated', orderRevision: 0, buyerOrder: mockBuyer, sellerOrder: mockSeller, listBuyerOrders: mockBuyerList, listSellerOrders: mockSellerList,
  issueDeliveryToken: mockIssue, confirmOrderDelivery: mockConfirm, cancelBuyerOrder: mockCancel, changeSellerOrder: mockChange, lastOrder: null as OrderPr27 | null };
jest.mock('@/context/AuthContext', () => ({ useAuth: () => mockAuth }));
jest.mock('expo-router', () => ({ useRouter: () => ({ navigate: mockPush, dismissTo: mockPush }), useLocalSearchParams: () => mockParams,
  useFocusEffect: (fn: () => void) => jest.requireActual<typeof import('react')>('react').useEffect(fn, [fn]) }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));
jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
// Native pull gesture is represented by its public onRefresh boundary in Jest.
jest.mock('react-native/Libraries/Components/RefreshControl/RefreshControl', () => ({ __esModule: true, default: (props: Record<string, unknown>) => {
  const React = jest.requireActual<typeof import('react')>('react'), { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return React.createElement(View, { ...props });
} }));
jest.mock('react-native-qrcode-svg', () => ({ __esModule: true, default: ({ value }: { value: string }) => {
  const React = jest.requireActual<typeof import('react')>('react'), { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return React.createElement(View, { testID: 'issued-delivery-qr', nativeID: value });
} }));
jest.mock('expo-camera', () => ({ useCameraPermissions: () => [mockPermission, mockRequestPermission], CameraView: (props: Record<string, unknown>) => {
  const React = jest.requireActual<typeof import('react')>('react'), { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return React.createElement(View, { ...props, testID: 'delivery-camera' });
} }));

const qr = 'A'.repeat(43);
const success = (data: unknown) => ({ success: true, data });
jest.setTimeout(15000); // Cold native/navigation mocks can take longer than Jest's 5 s default on Windows.
describe('Recorrido real de pedidos con servicios simulados', () => {
  beforeEach(() => {
    [mockPush, mockBuyer, mockSeller, mockBuyerList, mockSellerList, mockIssue, mockConfirm, mockCancel, mockChange, mockRequestPermission].forEach((mock) => mock.mockReset());
    jest.spyOn(console, 'info').mockImplementation(() => undefined); mockAuth.role = 'buyer'; mockAuth.orderRevision = 0; mockAuth.lastOrder = null;
    mockParams.orderId = order.orderId; mockParams.id = order.orderId;
    mockPermission.granted = true; mockPermission.canAskAgain = true; mockPermission.status = 'granted';
    mockBuyer.mockResolvedValue(success(order)); mockSeller.mockResolvedValue(success(order));
    mockBuyerList.mockResolvedValue(success({ items: [{ ...order, role: 'buyer' }], page: 1, pageSize: 20, totalCount: 1 }));
    mockSellerList.mockResolvedValue(success({ items: [{ ...order, role: 'seller' }], page: 1, pageSize: 20, totalCount: 1 }));
    mockIssue.mockImplementation(async () => success({ orderId: order.orderId, token: qr, expiresAt: new Date(Date.now() + 60000).toISOString() }));
  });
  afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });
  test('pedido nuevo se consulta tras revisión de compra, desde página1 sin mezclar caché', async () => {
    mockBuyerList.mockImplementation(async (page: number) => success({ items: [{ ...order, productName: page === 1 && mockAuth.orderRevision ? 'Pedido recién creado' : 'Pedido anterior' }], page, pageSize: 20, totalCount: 21 }));
    const view = await render(<AwsBuyerOrders />);
    await waitFor(() => expect(view.getByText('Pedido anterior × 2')).toBeTruthy());
    await fireEvent.press(view.getByRole('button', { name: 'Página siguiente' }));
    await waitFor(() => expect(view.getByText('Página 2 · 21 pedidos')).toBeTruthy());
    mockAuth.orderRevision++; await view.rerender(<AwsBuyerOrders />);
    await waitFor(() => expect(view.getByText('Pedido recién creado × 2')).toBeTruthy());
    expect(mockBuyerList).toHaveBeenLastCalledWith(1);
    expect(view.queryByText('Pedido anterior × 2')).toBeNull();
    await fireEvent.press(view.getByRole('button', { name: 'Ver seguimiento' }));
    expect(mockPush).toHaveBeenLastCalledWith({ pathname: '/buyer/order-tracking', params: { orderId: order.orderId } });
  });
  test('pull-to-refresh consulta página1 y no crea ningún pedido', async () => {
    const view = await render(<AwsBuyerOrders />); await waitFor(() => expect(mockBuyerList).toHaveBeenCalledTimes(1));
    await fireEvent(view.getByTestId('orders-refresh'), 'refresh');
    expect(mockBuyerList).toHaveBeenCalledTimes(2); expect(mockBuyerList).toHaveBeenLastCalledWith(1); expect(mockConfirm).not.toHaveBeenCalled();
  });
  test('refrescos consecutivos de la misma página comparten la consulta en curso', async () => {
    let finish!: (value: unknown) => void;
    mockBuyerList.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const view = await render(<AwsBuyerOrders />);
    await fireEvent(view.getByTestId('orders-refresh'), 'refresh');
    await fireEvent(view.getByTestId('orders-refresh'), 'refresh');
    expect(mockBuyerList).toHaveBeenCalledTimes(1);
    await act(async () => { finish(success({ items: [], page: 1, pageSize: 20, totalCount: 0 })); });
    expect(view.getByText('No tienes pedidos.')).toBeTruthy();
  });
  test('lectura periódica mantiene el detalle visible sin activar indicador de carga', async () => {
    jest.useFakeTimers();
    const view = await render(<AwsBuyerTracking />);
    let finish!: (value: unknown) => void;
    mockBuyer.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    await act(async () => { await jest.advanceTimersByTimeAsync(15000); });
    expect(mockBuyer).toHaveBeenCalledTimes(2);
    expect(view.queryByText('Consultando pedido…')).toBeNull();
    expect(view.getByText('ESTADO ACTUAL')).toBeTruthy();
    await act(async () => { finish(success(order)); });
  });
  test('duplicados visuales se eliminan y pedido confirmado ausente no se inventa en la página', async () => {
    mockAuth.lastOrder = { ...order, orderId: 'confirmed-new-order' };
    mockBuyerList.mockResolvedValue(success({ items: [order, order], page: 1, pageSize: 20, totalCount: 2 }));
    const view = await render(<AwsBuyerOrders />);
    await waitFor(() => expect(view.getByText(`Pedido ${orderReference(order.orderId)}`)).toBeTruthy());
    expect(view.getAllByText('Tacos de piña × 2')).toHaveLength(1);
    expect(view.getByRole('button', { name: 'Ver mi pedido reciente' })).toBeTruthy();
    expect(view.queryByText('confirmed-new-order')).toBeNull();
  });
  test.each(['No pudimos cargar tus pedidos.', 'Inicia sesión nuevamente.'])('error %s visible y recuperable', async (error) => {
    mockBuyerList.mockResolvedValueOnce({ success: false, error });
    const view = await render(<AwsBuyerOrders />); await waitFor(() => expect(view.getByText(error)).toBeTruthy());
    expect(view.queryByText('No tienes pedidos.')).toBeNull(); await fireEvent.press(view.getByRole('button', { name: 'Actualizar' }));
    await waitFor(() => expect(view.getByText('Tacos de piña × 2')).toBeTruthy());
  });
  test('recibo se recupera por GET aun sin lastOrder, no dibuja QR inicial', async () => {
    const view = await render(<AwsOrderReceipt />);
    await waitFor(() => expect(view.getByText('¡Pedido generado!')).toBeTruthy());
    expect(mockBuyer).toHaveBeenCalledWith(order.orderId); expect(mockIssue).not.toHaveBeenCalled();
    expect(view.queryByTestId('issued-delivery-qr')).toBeNull();
    expect(view.getByText('Consulta el código de entrega en el seguimiento cuando el pedido esté listo.')).toBeTruthy();
    expect(view.queryByText(new RegExp(order.orderId))).toBeNull();
    await fireEvent.press(view.getByRole('button', { name: 'Mis pedidos' })); expect(mockPush).toHaveBeenLastCalledWith('/buyer/orders');
  });
  test('maqueta explícita queda identificada y tampoco genera QR con JSON local', async () => {
    const previous = process.env.EXPO_PUBLIC_CATALOG_SOURCE;
    try {
      process.env.EXPO_PUBLIC_CATALOG_SOURCE = 'mock';
      const view = await render(<OrderCreatedScreen />);
      expect(view.getByText('Demostración · Este pedido no es una compra real.')).toBeTruthy();
      expect(view.queryByTestId('issued-delivery-qr')).toBeNull(); expect(mockIssue).not.toHaveBeenCalled(); expect(mockBuyer).not.toHaveBeenCalled();
    } finally { if (previous === undefined) delete process.env.EXPO_PUBLIC_CATALOG_SOURCE; else process.env.EXPO_PUBLIC_CATALOG_SOURCE = previous; }
  });
  test('seguimiento conserva enum interno pero muestra timeline en español y cancelación solo Pending', async () => {
    const view = await render(<AwsBuyerTracking />);
    await waitFor(() => expect(view.getByRole('button', { name: 'Cancelar pedido' })).toBeTruthy());
    expect(view.getByLabelText('Progreso del pedido')).toBeTruthy(); expect(view.queryByText(/Pending|Accepted|InPreparation|CancelledByBuyer|JWT|AWS/)).toBeNull();
    mockBuyer.mockResolvedValueOnce(success({ ...order, status: 'InPreparation' })); await fireEvent.press(view.getByRole('button', { name: 'Actualizar' }));
    await waitFor(() => expect(view.queryByRole('button', { name: 'Cancelar pedido' })).toBeNull());
    expect(view.getByText('La cancelación solo está disponible mientras el pedido está pendiente.')).toBeTruthy();
  });
  test('cancelación confirmada no se anuncia antes de respuesta; rechazo sigue visible', async () => {
    mockCancel.mockResolvedValueOnce({ success: false, error: 'El estado del pedido cambió. Actualízalo antes de continuar.' });
    const view = await render(<AwsBuyerCancel />);
    await waitFor(() => expect(view.getByRole('button', { name: 'Sí, cancelar pedido' })).not.toBeDisabled());
    await fireEvent.press(view.getByRole('button', { name: 'Sí, cancelar pedido' }));
    expect(view.queryByText('Pedido cancelado')).toBeNull(); expect(view.getByText(/El estado del pedido cambió/)).toBeTruthy();
    mockCancel.mockResolvedValueOnce(success({ ...order, status: 'CancelledByBuyer' }));
    await fireEvent.press(view.getByRole('button', { name: 'Sí, cancelar pedido' }));
    expect(view.getByText('Pedido cancelado')).toBeTruthy(); expect(mockCancel).toHaveBeenCalledWith(order.orderId);
  });
  test('bandeja vendedor consulta su endpoint privado y navega al pedido recibido', async () => {
    const view = await render(<AwsSellerOrders />);
    await waitFor(() => expect(view.getByText('Tacos de piña × 2')).toBeTruthy()); expect(mockSellerList).toHaveBeenCalledWith(1); expect(mockBuyerList).not.toHaveBeenCalled();
    await fireEvent.press(view.getByRole('button', { name: 'Revisar pedido' })); expect(mockPush).toHaveBeenLastCalledWith({ pathname: '/seller/order-detail', params: { orderId: order.orderId } });
  });
  test('Perfil ofrece entrada directa solo a Seller, sin iniciar ninguna mutación', async () => {
    const view = await render(<ProfileScreen />);
    expect(view.queryByRole('button', { name: 'Pedidos recibidos' })).toBeNull();
    mockAuth.role = 'seller'; await view.rerender(<ProfileScreen />);
    await fireEvent.press(view.getByRole('button', { name: 'Pedidos recibidos' }));
    expect(mockPush).toHaveBeenCalledWith('/seller/orders'); expect(mockChange).not.toHaveBeenCalled();
  });
  test('filtros de vendedor consultan servidor por estado y reinician página; Todos incluye los avanzados', async () => {
    mockSellerList.mockImplementation(async (page: number, filter?: OrderPr27['status']) => success({
      items: [{ ...order, status: filter ?? 'Ready' }], page, pageSize: 20, totalCount: 21,
    }));
    const view = await render(<AwsSellerOrders />);
    expect(view.getByText('Listo para recoger')).toBeTruthy();
    await fireEvent.press(view.getByText('Pendientes'));
    expect(mockSellerList).toHaveBeenLastCalledWith(1, 'Pending');
    await fireEvent.press(view.getByRole('button', { name: 'Página siguiente' }));
    expect(mockSellerList).toHaveBeenLastCalledWith(2, 'Pending');
    await fireEvent.press(view.getByText('En preparación'));
    expect(mockSellerList).toHaveBeenLastCalledWith(1, 'InPreparation');
    await fireEvent(view.getByTestId('orders-refresh'), 'refresh');
    expect(mockSellerList).toHaveBeenLastCalledWith(1, 'InPreparation');
    await fireEvent.press(view.getByText('Todos'));
    expect(mockSellerList).toHaveBeenLastCalledWith(1); expect(view.getByText('Listo para recoger')).toBeTruthy();
  });
  test('vendedor aplica el detalle verificado de la mutación y solo ofrece la siguiente transición', async () => {
    mockChange.mockResolvedValue(success({ ...order, status: 'Accepted', version: 1 }));
    const view = await render(<AwsSellerOrderDetail />); await waitFor(() => expect(view.getByRole('button', { name: 'Aceptar pedido' })).not.toBeDisabled());
    await fireEvent.press(view.getByRole('button', { name: 'Aceptar pedido' }));
    expect(mockChange).toHaveBeenCalledWith(order.orderId, 'Accepted');
    await waitFor(() => expect(view.getByRole('button', { name: 'Comenzar preparación' })).toBeTruthy());
    expect(view.queryByRole('button', { name: 'Aceptar pedido' })).toBeNull(); expect(view.queryByRole('button', { name: 'Confirmar entrega' })).toBeNull();
  });
  test('409 vuelve a consultar el pedido sin segundo PATCH y sustituye las acciones obsoletas', async () => {
    mockSeller.mockResolvedValueOnce(success(order)).mockResolvedValue(success({ ...order, status: 'Accepted', version: 6 }));
    mockChange.mockResolvedValue({ success: false, reason: 'conflict', error: 'El pedido cambió. Consulta su estado de nuevo.' });
    const view = await render(<AwsSellerOrderDetail />);
    await fireEvent.press(view.getByRole('button', { name: 'Aceptar pedido' }));
    await waitFor(() => expect(view.getByRole('button', { name: 'Comenzar preparación' })).toBeTruthy());
    expect(mockSeller).toHaveBeenCalledTimes(2); expect(mockChange).toHaveBeenCalledTimes(1);
    expect(view.queryByRole('button', { name: 'Aceptar pedido' })).toBeNull();
  });
  test('una lectura con versión menor no devuelve una transición confirmada a Pendiente', async () => {
    mockSeller.mockResolvedValue(success({ ...order, version: 5 }));
    mockChange.mockResolvedValue(success({ ...order, status: 'Accepted', version: 6 }));
    const view = await render(<AwsSellerOrderDetail />);
    await fireEvent.press(view.getByRole('button', { name: 'Aceptar pedido' }));
    await fireEvent.press(view.getByRole('button', { name: 'Actualizar estado del pedido' }));
    expect(mockSeller).toHaveBeenCalledTimes(2);
    expect(view.getByRole('button', { name: 'Comenzar preparación' })).toBeTruthy();
    expect(view.queryByRole('button', { name: 'Aceptar pedido' })).toBeNull();
  });
  test.each(['Pending', 'Accepted', 'InPreparation', 'Delivered', 'Rejected', 'CancelledByBuyer'] as const)('no emite QR en %s aunque vista esté activa', async (status) => {
    const view = await render(<DeliveryQrCard order={{ ...order, status }} active />);
    expect(view.queryByRole('button', { name: 'Mostrar código de entrega' })).toBeNull(); expect(mockIssue).not.toHaveBeenCalled(); expect(view.queryByTestId('issued-delivery-qr')).toBeNull();
  });
  test('QR contiene exclusivamente token recibido, vence y no se renueva automáticamente', async () => {
    jest.useFakeTimers(); const ready = { ...order, status: 'Ready' as const };
    const view = await render(<DeliveryQrCard order={ready} active />);
    expect(mockIssue).not.toHaveBeenCalled(); await fireEvent.press(view.getByRole('button', { name: 'Mostrar código de entrega' }));
    expect(view.getByTestId('issued-delivery-qr').props.nativeID).toBe(qr);
    expect(view.queryByText(qr)).toBeNull(); expect(view.queryByText(order.orderId)).toBeNull();
    await act(async () => { await jest.advanceTimersByTimeAsync(61000); });
    expect(view.queryByTestId('issued-delivery-qr')).toBeNull(); expect(view.getByText('Código vencido')).toBeTruthy(); expect(mockIssue).toHaveBeenCalledTimes(1);
    await fireEvent.press(view.getByRole('button', { name: 'Mostrar código de entrega' })); expect(mockIssue).toHaveBeenCalledTimes(2);
  });
  test('QR se elimina al cerrar pedido o perder vigencia de la consulta', async () => {
    const ready = { ...order, status: 'Ready' as const }; const view = await render(<DeliveryQrCard order={ready} active />);
    await fireEvent.press(view.getByRole('button', { name: 'Mostrar código de entrega' })); expect(view.getByTestId('issued-delivery-qr')).toBeTruthy();
    await view.rerender(<DeliveryQrCard order={ready} active={false} />); expect(view.queryByTestId('issued-delivery-qr')).toBeNull();
    await view.rerender(<DeliveryQrCard order={{ ...ready, status: 'Delivered' }} active />); expect(view.queryByRole('button', { name: 'Mostrar código de entrega' })).toBeNull();
  });
  test('respuesta incompatible nunca permite que la librería dibuje su QR de ejemplo', async () => {
    mockIssue.mockResolvedValueOnce(success({ orderId: order.orderId, token: undefined, expiresAt: new Date(Date.now() + 60000).toISOString() }));
    const view = await render(<DeliveryQrCard order={{ ...order, status: 'Ready' }} active />);
    await fireEvent.press(view.getByRole('button', { name: 'Mostrar código de entrega' }));
    expect(view.queryByTestId('issued-delivery-qr')).toBeNull(); expect(view.getByText('No pudimos obtener un código de entrega válido. Actualiza el pedido.')).toBeTruthy();
  });
  test('escáner rechaza URL/QR inventado y confirma una sola vez el token válido', async () => {
    const done = jest.fn(); mockConfirm.mockResolvedValue(success({ ...order, status: 'Delivered' }));
    const view = await render(<DeliveryScanner orderId={order.orderId} active onConfirmed={done} onRefresh={jest.fn()} />);
    await fireEvent.press(view.getByRole('button', { name: 'Escanear QR de entrega' }));
    await fireEvent(view.getByTestId('delivery-camera'), 'barcodeScanned', { data: 'https://private.invalid' });
    expect(view.getByText(/Este código QR no es válido/)).toBeTruthy(); expect(mockConfirm).not.toHaveBeenCalled();
    await fireEvent(view.getByTestId('delivery-camera'), 'barcodeScanned', { data: qr });
    expect(view.queryByText(qr)).toBeNull(); expect(done).not.toHaveBeenCalled();
    await fireEvent.press(view.getByRole('button', { name: 'Confirmar entrega' }));
    expect(mockConfirm).toHaveBeenCalledWith(order.orderId, qr); expect(mockConfirm).toHaveBeenCalledTimes(1); expect(done).toHaveBeenCalledTimes(1);
    expect(view.queryByRole('button', { name: 'Confirmar entrega' })).toBeNull();
  });
  test('confirmación incierta conserva error y refresco, nunca anuncia entrega ni reenvía lectura', async () => {
    mockConfirm.mockResolvedValue({ success: false, reason: 'uncertain', error: 'No pudimos confirmar la entrega. Actualiza el pedido.' }); const done = jest.fn(), refresh = jest.fn();
    const view = await render(<DeliveryScanner orderId={order.orderId} active onConfirmed={done} onRefresh={refresh} />);
    await fireEvent.press(view.getByRole('button', { name: 'Escanear QR de entrega' })); await fireEvent(view.getByTestId('delivery-camera'), 'barcodeScanned', { data: qr });
    await fireEvent.press(view.getByRole('button', { name: 'Confirmar entrega' })); expect(done).not.toHaveBeenCalled();
    expect(view.getByText('No pudimos confirmar la entrega. Actualiza el pedido.')).toBeTruthy();
    expect(view.getByRole('button', { name: 'Escanear QR de entrega' })).toBeDisabled();
    await fireEvent.press(view.getByRole('button', { name: 'Actualizar pedido' })); expect(refresh).toHaveBeenCalledTimes(1); expect(mockConfirm).toHaveBeenCalledTimes(1);
  });
  test.each(['El código QR venció. Pide al comprador que genere uno nuevo.', 'El código QR no corresponde a este pedido.', 'Este código QR ya se utilizó. Actualiza el pedido para comprobar la entrega.'])('rechazo backend visible: %s', async (error) => {
    const done = jest.fn(); mockConfirm.mockResolvedValue({ success: false, error });
    const view = await render(<DeliveryScanner orderId={order.orderId} active onConfirmed={done} onRefresh={jest.fn()} />);
    await fireEvent.press(view.getByRole('button', { name: 'Escanear QR de entrega' })); await fireEvent(view.getByTestId('delivery-camera'), 'barcodeScanned', { data: qr });
    await fireEvent.press(view.getByRole('button', { name: 'Confirmar entrega' }));
    expect(view.getByText(error)).toBeTruthy(); expect(done).not.toHaveBeenCalled(); expect(view.getByRole('button', { name: 'Actualizar pedido' })).toBeTruthy();
    expect(view.queryByText(qr)).toBeNull();
  });
  test('entrega validada se reconsulta en vendedor y después en comprador', async () => {
    let status: OrderPr27['status'] = 'Ready';
    mockSeller.mockImplementation(async () => success({ ...order, status })); mockBuyer.mockImplementation(async () => success({ ...order, status }));
    mockConfirm.mockImplementation(async () => { status = 'Delivered'; return success({ ...order, status, version: 2 }); });
    const seller = await render(<AwsSellerOrderDetail />);
    await waitFor(() => expect(seller.getByRole('button', { name: 'Escanear QR de entrega' })).toBeTruthy());
    await fireEvent.press(seller.getByRole('button', { name: 'Escanear QR de entrega' })); await fireEvent(seller.getByTestId('delivery-camera'), 'barcodeScanned', { data: qr });
    expect(seller.queryByText('¡Pedido entregado con éxito!')).toBeNull();
    await fireEvent.press(seller.getByRole('button', { name: 'Confirmar entrega' }));
    await waitFor(() => expect(seller.getByText('¡Pedido entregado con éxito!')).toBeTruthy());
    expect(mockConfirm).toHaveBeenCalledTimes(1); expect(seller.queryByRole('button', { name: 'Escanear QR de entrega' })).toBeNull();
    await seller.unmount(); const buyer = await render(<AwsBuyerTracking />);
    await waitFor(() => expect(buyer.getAllByText('Entregado').length).toBeGreaterThan(0));
    expect(mockBuyer).toHaveBeenCalledWith(order.orderId); expect(buyer.queryByRole('button', { name: 'Mostrar código de entrega' })).toBeNull();
  });
  test('permiso de cámara solicitado solo al abrir y denegación no confirma entrega', async () => {
    mockPermission.granted = false; mockPermission.status = 'denied'; mockRequestPermission.mockResolvedValueOnce({ granted: false });
    const view = await render(<DeliveryScanner orderId={order.orderId} active onConfirmed={jest.fn()} onRefresh={jest.fn()} />);
    expect(mockRequestPermission).not.toHaveBeenCalled(); await fireEvent.press(view.getByRole('button', { name: 'Escanear QR de entrega' }));
    expect(mockRequestPermission).toHaveBeenCalledTimes(1); expect(view.queryByTestId('delivery-camera')).toBeNull(); expect(mockConfirm).not.toHaveBeenCalled();
  });
  test('background elimina credencial y cámara; vuelve por GET antes de ofrecer entrega', async () => {
    const listeners = new Set<(state: AppStateStatus) => void>();
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, callback) => { listeners.add(callback); return { remove: () => { listeners.delete(callback); } }; });
    mockBuyer.mockResolvedValue(success({ ...order, status: 'Ready' }));
    const view = await render(<AwsBuyerTracking />);
    await waitFor(() => expect(view.getByRole('button', { name: 'Mostrar código de entrega' })).toBeTruthy());
    await fireEvent.press(view.getByRole('button', { name: 'Mostrar código de entrega' })); expect(view.getByTestId('issued-delivery-qr')).toBeTruthy();
    await act(async () => { listeners.forEach((callback) => callback('background')); }); expect(view.queryByTestId('issued-delivery-qr')).toBeNull();
    const calls = mockBuyer.mock.calls.length; await act(async () => { listeners.forEach((callback) => callback('active')); });
    expect(mockBuyer.mock.calls.length).toBeGreaterThan(calls); expect(view.queryByTestId('issued-delivery-qr')).toBeNull();
  });
  test('consulta acotada observa Delivered y elimina QR en la vista compradora', async () => {
    jest.useFakeTimers(); mockBuyer.mockResolvedValueOnce(success({ ...order, status: 'Ready' })).mockResolvedValue(success({ ...order, status: 'Delivered' }));
    const view = await render(<AwsBuyerTracking />); await fireEvent.press(view.getByRole('button', { name: 'Mostrar código de entrega' }));
    expect(view.getByTestId('issued-delivery-qr')).toBeTruthy();
    await act(async () => { await jest.advanceTimersByTimeAsync(15000); }); expect(view.queryByTestId('issued-delivery-qr')).toBeNull();
    await act(async () => { await jest.advanceTimersByTimeAsync(300000); }); expect(mockBuyer).toHaveBeenCalledTimes(2); expect(mockIssue).toHaveBeenCalledTimes(1);
  });
});
