import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import Activation from '@/app/seller/activation';
import Business from '@/app/seller/index';
import Products from '@/app/seller/products';
import Draft from '@/app/seller/product-draft';
import SellerLayout from '@/app/seller/_layout';
import { Alert } from 'react-native';

const mockRequest = jest.fn(); const mockConsult = jest.fn(); const mockPush = jest.fn();
const mockCreateProduct = jest.fn();
const mockConsultProduct = jest.fn();
const mockUpdateStatus = jest.fn();
const mockVisibleProducts = jest.fn();
const mockChoosePhoto = jest.fn();
const mockProducts = [{ id: 'aws-product', name: 'Producto fixture', price: 30, stock: 4, status: 'Active' }];
const seller = { sellerId: 'seller-fixture', storeName: 'Cocina fixture', description: 'Comida del campus fixture', phone: '5551234567' };
let mockAuthenticated = true;
let mockRole: 'buyer' | 'seller' = 'seller';
jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, navigate: mockPush, dismissTo: mockPush }), Stack: () => null,
  useFocusEffect: (callback: () => void | (() => void)) => jest.requireActual<typeof import('react')>('react').useEffect(callback, [callback]) }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));
jest.mock('@/services/api/categoryService', () => ({ categoryService: { getAll: async () => [{ id: 'category-fixture', name: 'Categoría fixture', sortOrder: 1 }] } }));
jest.mock('@/services/productPhoto', () => ({ selectProductPhoto: (source: string) => mockChoosePhoto(source) }));
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: mockAuthenticated, status: mockAuthenticated ? 'authenticated' : 'anonymous',
  role: mockRole, sessionProducts: mockProducts, visibleSellerProducts: mockVisibleProducts, updateProductStatus: mockUpdateStatus, createProduct: mockCreateProduct, consultProduct: mockConsultProduct, requestSellerActivation: mockRequest, consultSeller: mockConsult }) }));

describe('Vendedor UI sin operaciones reales', () => {
  beforeEach(() => {
    jest.clearAllMocks(); mockAuthenticated = true; mockRole = 'seller'; mockProducts[0].status = 'Active';
    mockVisibleProducts.mockResolvedValue({ success: true, data: [] });
    mockConsult.mockResolvedValue({ success: true, kind: 'missing', status: 404, roleSynced: false, received: false, uncertain: false });
  });
  test('alta HTTP no se presenta como aprobación automática y bloquea segundo envío', async () => {
    mockRequest.mockResolvedValue({ success: true, kind: 'active', status: 201, seller, roleSynced: false });
    const view = await render(<Activation />);
    await waitFor(() => expect(view.getByLabelText('Nombre del negocio')).toBeTruthy());
    await fireEvent.changeText(view.getByLabelText('Nombre del negocio'), 'Cocina fixture');
    await fireEvent.changeText(view.getByLabelText('Descripción del negocio'), 'Comida del campus fixture');
    await fireEvent.changeText(view.getByLabelText('Teléfono de contacto'), '5551234567');
    await fireEvent.press(view.getByRole('button', { name: 'Registrar negocio' }));
    expect(view.getByText('Tu negocio está registrado. Vuelve a iniciar sesión para actualizar tus permisos.')).toBeTruthy();
    expect(view.queryByRole('button', { name: 'Registrar negocio' })).toBeNull();
    expect(view.getByRole('button', { name: 'Mis productos' })).toBeDisabled();
    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledWith({ storeName: 'Cocina fixture', description: 'Comida del campus fixture', phone: '5551234567' });
  });
  test('campos inválidos no envían nada', async () => {
    const view = await render(<Activation />);
    await waitFor(() => expect(view.getByRole('button', { name: 'Registrar negocio' })).toBeTruthy());
    await fireEvent.press(view.getByRole('button', { name: 'Registrar negocio' }));
    expect(mockRequest).not.toHaveBeenCalled();
  });
  test('consulta HTTP real informada sin fabricar estado de autorización ni perfil', async () => {
    mockConsult.mockResolvedValue({ success: true, kind: 'active', status: 200, seller, roleSynced: true });
    const view = await render(<Business />);
    await waitFor(() => expect(view.getByText('Tu negocio está activo.')).toBeTruthy());
    expect(mockConsult).toHaveBeenCalledTimes(1);
    expect(view.getByText('Tu negocio está activo.')).toBeTruthy();
    expect(view.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  });
  test('403 no se convierte en rechazo administrativo', async () => {
    mockConsult.mockResolvedValue({ success: false, status: 403, error: 'No autorizado (fixture)' });
    const view = await render(<Business />);
    await waitFor(() => expect(view.getByText('No autorizado (fixture)')).toBeTruthy());
    expect(view.queryByLabelText('Nombre del negocio')).toBeNull();
  });
  test('invitado bloqueado por guarda del grupo', async () => {
    mockAuthenticated = false;
    const view = await render(<SellerLayout />);
    expect(view.getByText('Exploras como invitado')).toBeTruthy(); expect(mockRequest).not.toHaveBeenCalled();
  });
  test('preview local no publica, envío explícito usa DTO y bloquea repetición tras201', async () => {
    mockConsult.mockResolvedValue({ success: true, kind: 'active', status: 200, seller, roleSynced: true });
    const list = await render(<Products />);
    await waitFor(() => expect(list.getByText('Algunas publicaciones pausadas pueden no aparecer en esta lista.')).toBeTruthy());
    await list.unmount();
    const view = await render(<Draft />);
    await waitFor(() => expect(view.getByLabelText('Nombre del alimento')).toBeTruthy());
    await fireEvent.changeText(view.getByLabelText('Nombre del alimento'), 'Alimento fixture');
    await fireEvent.changeText(view.getByLabelText('Descripción del alimento'), 'Descripción de alimento fixture');
    await fireEvent.changeText(view.getByLabelText('Precio MXN'), '35.25');
    await waitFor(() => expect(view.getByText('Categoría fixture')).toBeTruthy());
    await fireEvent.press(view.getByText('Categoría fixture'));
    await fireEvent.press(view.getByRole('button', { name: 'Vista previa' }));
    expect(view.getByText('Así se verá tu alimento')).toBeTruthy();
    expect(mockCreateProduct).not.toHaveBeenCalled();
    expect(view.queryByText(/AWS|media-gate|Approved|EXPO_PUBLIC/)).toBeNull();
    expect(mockRequest).not.toHaveBeenCalled(); expect(mockConsult).toHaveBeenCalledTimes(2);
    mockCreateProduct.mockResolvedValue({ success: true, data: { id: 'aws-product-fixture', status: 'Active' } });
    await fireEvent.press(view.getByRole('button', { name: 'Publicar alimento' }));
    expect(mockCreateProduct).toHaveBeenCalledWith({ name: 'Alimento fixture', description: 'Descripción de alimento fixture', price: 35.25,
      stock: 0, ingredients: [], categoryId: 'category-fixture' });
    expect(view.queryByRole('button', { name: 'Publicar alimento' })).toBeNull();
    expect(view.getByText('¡Alimento publicado!')).toBeTruthy();
    expect(view.queryByText(/aws-product-fixture|Active/)).toBeNull();
    await fireEvent.press(view.getByRole('button', { name: 'Crear otro alimento' }));
    expect(view.getByLabelText('Nombre del alimento').props.value).toBe('');
    expect(view.getByLabelText('Precio MXN').props.value).toBe('');
    expect(view.getByLabelText('Stock').props.value).toBe('0');
    await fireEvent.changeText(view.getByLabelText('Nombre del alimento'), 'Segunda comida');
    await fireEvent.changeText(view.getByLabelText('Descripción del alimento'), 'Comida de prueba');
    await fireEvent.changeText(view.getByLabelText('Precio MXN'), '20');
    await fireEvent.press(view.getByText('Categoría fixture'));
    mockCreateProduct.mockResolvedValueOnce({ success: true, data: { id: 'aws-product-second', status: 'Active' } });
    await fireEvent.press(view.getByRole('button', { name: 'Publicar alimento' }));
    expect(mockCreateProduct).toHaveBeenCalledTimes(2);
    expect(view.getByText('¡Alimento publicado!')).toBeTruthy();
    await fireEvent.press(view.getByRole('button', { name: 'Ver mis alimentos' }));
    expect(mockPush).toHaveBeenCalledWith('/seller/products');
  });
  test('fallo conserva campos y ofrece revisión sin enviar nuevamente', async () => {
    mockConsult.mockResolvedValue({ success: true, kind: 'active', status: 200, seller, roleSynced: true });
    mockCreateProduct.mockResolvedValue({ success: false, error: 'Resultado incierto' });
    const view = await render(<Draft />);
    await waitFor(() => expect(view.getByText('Categoría fixture')).toBeTruthy());
    await fireEvent.changeText(view.getByLabelText('Nombre del alimento'), 'Tacos de piña');
    await fireEvent.changeText(view.getByLabelText('Descripción del alimento'), 'Comida recién hecha');
    await fireEvent.changeText(view.getByLabelText('Precio MXN'), '25');
    await fireEvent.press(view.getByText('Categoría fixture'));
    await fireEvent.press(view.getByRole('button', { name: 'Publicar alimento' }));
    expect(view.getByLabelText('Nombre del alimento').props.value).toBe('Tacos de piña');
    expect(view.getByText('Resultado incierto')).toBeTruthy();
    expect(view.getByRole('button', { name: 'Revisar mis alimentos' })).toBeTruthy();
    expect(mockCreateProduct).toHaveBeenCalledTimes(1);
  });
  test('vista previa local bloquea publicación hasta quitar fotografía', async () => {
    mockConsult.mockResolvedValue({ success: true, kind: 'active', status: 200, seller, roleSynced: true });
    mockChoosePhoto.mockResolvedValue({ uri: 'file:///fixture.jpg', mimeType: 'image/jpeg', size: 42, width: 100, height: 100 });
    const view = await render(<Draft />);
    await waitFor(() => expect(view.getByRole('button', { name: 'Elegir de galería' })).toBeTruthy());
    await fireEvent.press(view.getByRole('button', { name: 'Elegir de galería' }));
    expect(mockChoosePhoto).toHaveBeenCalledWith('gallery');
    expect(view.getByLabelText('Vista previa de fotografía')).toBeTruthy();
    expect(view.getByRole('button', { name: 'Publicar alimento' })).toBeDisabled();
    await fireEvent.changeText(view.getByLabelText('Nombre del alimento'), 'Tacos fixture');
    await fireEvent.changeText(view.getByLabelText('Descripción del alimento'), 'Preparados al momento');
    await fireEvent.changeText(view.getByLabelText('Precio MXN'), '25');
    await fireEvent.press(view.getByText('Categoría fixture'));
    await fireEvent.press(view.getByRole('button', { name: 'Vista previa' }));
    expect(view.getByLabelText('Fotografía del alimento en vista previa')).toBeTruthy();
    expect(view.getByText('Vista previa · Todavía no publicado')).toBeTruthy();
    await fireEvent.press(view.getByRole('button', { name: 'Quitar fotografía' }));
    expect(view.queryByLabelText('Vista previa de fotografía')).toBeNull();
    expect(mockCreateProduct).not.toHaveBeenCalled();
  });
  test('cámara informa permiso denegado y cancelación conserva foto previa', async () => {
    mockConsult.mockResolvedValue({ success: true, kind: 'active', status: 200, seller, roleSynced: true });
    mockChoosePhoto.mockRejectedValueOnce(new Error('Permite el acceso a la cámara.'))
      .mockResolvedValueOnce({ uri: 'file:///fixture.jpg', mimeType: 'image/jpeg', size: 42, width: 100, height: 100 })
      .mockResolvedValueOnce(null);
    const view = await render(<Draft />);
    await waitFor(() => expect(view.getByRole('button', { name: 'Tomar fotografía' })).toBeTruthy());
    await fireEvent.press(view.getByRole('button', { name: 'Tomar fotografía' }));
    expect(view.getByText('Permite el acceso a la cámara.')).toBeTruthy();
    await fireEvent.press(view.getByRole('button', { name: 'Elegir de galería' }));
    await fireEvent.press(view.getByRole('button', { name: 'Cambiar desde galería' }));
    expect(view.getByLabelText('Vista previa de fotografía')).toBeTruthy();
  });
  test('foto nueva demasiado grande conserva selección anterior y datos comerciales', async () => {
    mockConsult.mockResolvedValue({ success: true, kind: 'active', status: 200, seller, roleSynced: true });
    mockChoosePhoto.mockResolvedValueOnce({ uri: 'file:///anterior.jpg', mimeType: 'image/jpeg', size: 42, width: 100, height: 100 })
      .mockRejectedValueOnce(new Error('La fotografía supera el límite de 4 MB. Selecciona una imagen más pequeña.'));
    const view = await render(<Draft />);
    await waitFor(() => expect(view.getByLabelText('Nombre del alimento')).toBeTruthy());
    await fireEvent.changeText(view.getByLabelText('Nombre del alimento'), 'Piña con chile');
    await fireEvent.press(view.getByRole('button', { name: 'Elegir de galería' }));
    await fireEvent.press(view.getByRole('button', { name: 'Cambiar desde galería' }));
    expect(view.getByLabelText('Vista previa de fotografía').props.source.uri).toBe('file:///anterior.jpg');
    expect(view.getByLabelText('Nombre del alimento').props.value).toBe('Piña con chile');
    expect(view.getByText('La fotografía supera el límite de 4 MB. Selecciona una imagen más pequeña.')).toBeTruthy();
    await fireEvent.press(view.getByRole('button', { name: 'Quitar fotografía' }));
    expect(view.queryByLabelText('Vista previa de fotografía')).toBeNull();
    expect(mockCreateProduct).not.toHaveBeenCalled();
  });
  test('publicación en curso excluye pulsaciones rápidas', async () => {
    mockConsult.mockResolvedValue({ success: true, kind: 'active', status: 200, seller, roleSynced: true });
    let finish!: (result: object) => void;
    mockCreateProduct.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const view = await render(<Draft />);
    await waitFor(() => expect(view.getByText('Categoría fixture')).toBeTruthy());
    await fireEvent.changeText(view.getByLabelText('Nombre del alimento'), 'Tacos fixture');
    await fireEvent.changeText(view.getByLabelText('Descripción del alimento'), 'Comida fixture');
    await fireEvent.changeText(view.getByLabelText('Precio MXN'), '25');
    await fireEvent.press(view.getByText('Categoría fixture'));
    await fireEvent.press(view.getByRole('button', { name: 'Publicar alimento' }));
    expect(view.getByText('Publicando alimento…')).toBeTruthy();
    expect(view.queryByText('¡Alimento publicado!')).toBeNull();
    await fireEvent.press(view.getByRole('button', { name: 'Publicar alimento' }));
    expect(mockCreateProduct).toHaveBeenCalledTimes(1);
    await act(async () => { finish({ success: true, data: { id: 'aws-1', status: 'Active' } }); });
    expect(view.getByText('¡Alimento publicado!')).toBeTruthy();
  });
  test('pulsaciones simultáneas en alta quedan excluidas', async () => {
    let finish!: (response: object) => void;
    mockRequest.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const view = await render(<Activation />);
    await waitFor(() => expect(view.getByLabelText('Nombre del negocio')).toBeTruthy());
    await fireEvent.changeText(view.getByLabelText('Nombre del negocio'), 'Cocina fixture');
    await fireEvent.changeText(view.getByLabelText('Descripción del negocio'), 'Comida del campus fixture');
    await fireEvent.changeText(view.getByLabelText('Teléfono de contacto'), '5551234567');
    await fireEvent.press(view.getByRole('button', { name: 'Registrar negocio' }));
    await fireEvent.press(view.getByRole('button', { name: 'Registrar negocio' }));
    expect(mockRequest).toHaveBeenCalledTimes(1);
    await act(async () => { finish({ success: true, kind: 'active', status: 201, seller, roleSynced: false }); });
    await waitFor(() => expect(view.getByText('Tu negocio está registrado. Vuelve a iniciar sesión para actualizar tus permisos.')).toBeTruthy());
  });
  test('selecciona alimento propio sin exponer ID antes de editar solo precio y stock', async () => {
    mockConsult.mockResolvedValue({ success: true, kind: 'active', status: 200, seller, roleSynced: true });
    mockConsultProduct.mockResolvedValue({ success: true, data: { id: 'aws-product', name: 'Producto fixture', price: 30, stock: 4 } });
    const view = await render(<Products />);
    await waitFor(() => expect(view.getByRole('button', { name: 'Editar Producto fixture' })).toBeTruthy());
    expect(view.queryByLabelText('ID de producto AWS')).toBeNull();
    expect(view.queryByText(/aws-product|AWS|contrato/)).toBeNull();
    await fireEvent.press(view.getByRole('button', { name: 'Editar Producto fixture' }));
    expect(mockConsultProduct).toHaveBeenCalledWith('aws-product', undefined);
    await fireEvent.changeText(view.getByLabelText('Precio MXN'), '32.50');
    await fireEvent.changeText(view.getByLabelText('Stock'), '0');
    await fireEvent.press(view.getByRole('button', { name: 'Guardar precio y stock' }));
    expect(mockConsultProduct).toHaveBeenLastCalledWith('aws-product', { price: 32.5, stock: 0 });
    expect(view.getByText('Precio y stock actualizados.')).toBeTruthy();
    mockConsultProduct.mockResolvedValueOnce({ success: false, error: 'No se pudo consultar el alimento.' });
    await fireEvent.press(view.getByRole('button', { name: 'Editar Producto fixture' }));
    expect(view.queryByRole('button', { name: 'Guardar precio y stock' })).toBeNull();
  });
  test('PATCH fallido conserva precio y stock para corregir o reintentar', async () => {
    mockConsult.mockResolvedValue({ success: true, kind: 'active', status: 200, seller, roleSynced: true });
    mockConsultProduct.mockResolvedValueOnce({ success: true, data: { id: 'aws-product', name: 'Producto fixture', price: 30, stock: 4 } })
      .mockResolvedValueOnce({ success: false, error: 'AWS no disponible' });
    const view = await render(<Products />);
    await waitFor(() => expect(view.getByRole('button', { name: 'Editar Producto fixture' })).toBeTruthy());
    await fireEvent.press(view.getByRole('button', { name: 'Editar Producto fixture' }));
    await fireEvent.changeText(view.getByLabelText('Precio MXN'), '32.50');
    await fireEvent.changeText(view.getByLabelText('Stock'), '2');
    await fireEvent.press(view.getByRole('button', { name: 'Guardar precio y stock' }));
    expect(view.getByText('No pudimos cargar tus alimentos. Intenta más tarde.')).toBeTruthy();
    expect(view.getByLabelText('Precio MXN').props.value).toBe('32.50');
    expect(view.getByLabelText('Stock').props.value).toBe('2');
    expect(view.getByRole('button', { name: 'Guardar precio y stock' })).toBeTruthy();
  });
  test('Mis alimentos muestra la imagen real y abre el editor sin mostrar IDs ni infraestructura', async () => {
    mockConsult.mockResolvedValue({ success: true, kind: 'active', status: 200, seller, roleSynced: true });
    const product = { id: '507f1f77bcf86cd799439099', name: 'Tacos de piña', price: 25, stock: 2, status: 'Active',
      imageUrl: 'https://utttgo.s3.amazonaws.com/fixture?signature=private', imageUrlExpiresAt: '2099-01-01T00:00:00Z' };
    mockVisibleProducts.mockResolvedValue({ success: true, data: [product] });
    mockConsultProduct.mockResolvedValue({ success: true, data: product });
    const view = await render(<Products />);
    await waitFor(() => expect(view.getByLabelText('Fotografía de Tacos de piña')).toBeTruthy());
    expect(view.getByLabelText('Fotografía de Tacos de piña').props.source.uri).toBe(product.imageUrl);
    await fireEvent.press(view.getByRole('button', { name: 'Editar Tacos de piña' }));
    expect(mockConsultProduct).toHaveBeenCalledWith(product.id, undefined);
    expect(view.getByText('Editar alimento')).toBeTruthy();
    expect(view.getByRole('button', { name: 'Guardar precio y stock' })).toBeTruthy();
    expect(view.queryByText(/507f1f77|AWS|PR33|HTTP|contrato|media-gate|signature/)).toBeNull();
  });
  test('acciones explícitas pausan y reactivan usando solo status sin cambiar antes de respuesta', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => { buttons?.find((item) => item.text === 'Pausar')?.onPress?.(); });
    mockConsult.mockResolvedValue({ success: true, kind: 'active', status: 200, seller, roleSynced: true });
    mockUpdateStatus.mockResolvedValue({ success: true, data: { ...mockProducts[0], status: 'Paused' } });
    const view = await render(<Products />);
    await waitFor(() => expect(view.getByRole('button', { name: 'Pausar Producto fixture' })).toBeTruthy());
    await fireEvent.press(view.getByRole('button', { name: 'Pausar Producto fixture' }));
    expect(mockUpdateStatus).toHaveBeenCalledWith('aws-product', { status: 'Paused' });
    expect(view.getByText('Publicación pausada.')).toBeTruthy();
    mockProducts[0].status = 'Paused'; await view.rerender(<Products />);
    mockUpdateStatus.mockResolvedValue({ success: true, data: { ...mockProducts[0], status: 'Active' } });
    await fireEvent.press(view.getByRole('button', { name: 'Reactivar Producto fixture' }));
    expect(mockUpdateStatus).toHaveBeenLastCalledWith('aws-product', { status: 'Active' });
    alert.mockRestore();
    expect(view.getByText('Publicación reactivada.')).toBeTruthy();
  });
  test('entrada al módulo muestra alta directamente solo tras missing confirmado', async () => {
    const view = await render(<Business />);
    await waitFor(() => expect(view.getByRole('button', { name: 'Registrar negocio' })).toBeTruthy());
    expect(mockConsult).toHaveBeenCalledTimes(1);
    expect(view.queryByText(/HTTP 404/)).toBeNull(); expect(mockRequest).not.toHaveBeenCalled();
  });
  test.each([401, 403, 404, 503])('lookupHTTP%s genérico no ofrece formulario ni productos', async (status) => {
    mockConsult.mockResolvedValue({ success: false, status, error: 'Error de consulta fixture' });
    const view = await render(<Business />);
    await waitFor(() => expect(view.getByText('Error de consulta fixture')).toBeTruthy());
    expect(view.queryByRole('button', { name: 'Registrar negocio' })).toBeNull();
    expect(view.queryByRole('button', { name: 'Mis productos' })).toBeNull();
  });
  test('editores directos no se montan con negocio activo pero JWT Buyer', async () => {
    mockConsult.mockResolvedValue({ success: true, kind: 'active', seller, status: 200, roleSynced: false });
    const view = await render(<Draft />);
    await waitFor(() => expect(view.getByRole('button', { name: 'Volver a iniciar sesión' })).toBeTruthy());
    expect(view.queryByLabelText('Nombre del alimento')).toBeNull();
    expect(mockCreateProduct).not.toHaveBeenCalled();
  });
  test('cambio de rol del Context invalida editor aunque la consulta anterior confirmara Seller', async () => {
    mockConsult.mockResolvedValue({ success: true, kind: 'active', seller, status: 200, roleSynced: true });
    const view = await render(<Draft />);
    await waitFor(() => expect(view.getByLabelText('Nombre del alimento')).toBeTruthy());
    mockRole = 'buyer'; await view.rerender(<Draft />);
    expect(view.queryByLabelText('Nombre del alimento')).toBeNull();
    expect(view.getByRole('button', { name: 'Mis productos' })).toBeDisabled();
  });
  test('rechazo inesperado al entrar se maneja y reintento seguro permite abrir Mis alimentos', async () => {
    mockConsult.mockRejectedValueOnce(new TypeError('private-callback-detail')).mockResolvedValueOnce({ success: true, kind: 'active', seller, status: 200, roleSynced: true });
    const view = await render(<Business />);
    await waitFor(() => expect(view.getByText('No se pudo completar la operación. Intenta nuevamente.')).toBeTruthy());
    expect(view.queryByRole('button', { name: 'Mis productos' })).toBeNull(); expect(mockRequest).not.toHaveBeenCalled();
    await fireEvent.press(view.getByRole('button', { name: 'Reconsultar mi negocio' }));
    await waitFor(() => expect(view.getByRole('button', { name: 'Mis productos' })).not.toBeDisabled());
    await fireEvent.press(view.getByRole('button', { name: 'Mis productos' }));
    expect(mockPush).toHaveBeenLastCalledWith('/seller/products');
  });
});
