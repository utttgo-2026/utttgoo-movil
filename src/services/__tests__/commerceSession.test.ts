import { AuthSession } from '../authSession';
import { sessionContract } from '../api/sessionContract';
import { sellerService } from '../api/sellerService';
import { categoryService } from '../api/categoryService';
import { productService } from '../api/productService';
import { orderService } from '../api/orderService';
import { ApiError } from '../api/errors';
import type { ProductResponse, SellerActiveResponse } from '@/types/api';
import { productMetadata } from '../__fixtures__/product';

jest.mock('../sessionStorage', () => ({ sessionStorage: {} }));
const input = { name: 'Alimento fixture', description: 'Descripción fixture', ingredients: ['Maíz'], categoryId: 'aws-category', price: 30.25, stock: 4 };
const product: ProductResponse = { ...input, ...productMetadata, id: 'aws-product', sellerId: 'aws-seller', status: 'Active' };
const seller: SellerActiveResponse = { sellerId: product.sellerId, storeName: 'Cocina fixture', description: 'Comida fixture', phone: '5551234567',
  status: 'Active', isActive: true, roles: ['Buyer', 'Seller'], createdAt: '2026-11-16T12:00:00Z', updatedAt: '2026-11-16T12:00:00Z' };
const order = { orderId: 'aws-order', buyerId: 'aws-user', sellerId: product.sellerId, productId: product.id, productName: product.name, quantity: 2, unitPrice: 30.25, totalAmount: 60.50,
  status: 'Pending' as const, currency: 'MXN' as const, paymentMethod: 'Cash' as const, pickupPoint: '', deliveredAt: null, completedAt: null, version: 1, updatedAt: '2026-11-16T12:00:00Z', createdAt: '2026-11-16T12:00:00Z' };
function fixture(isSeller = true) {
  const roles = isSeller ? ['Buyer', 'Seller'] : ['Buyer'];
  const identity = { id: 'aws-user', email: 'fixture@uttt.edu.mx', displayName: 'Fixture', roles, accountStatus: 'Active' };
  const deps = {
    storage: { read: jest.fn().mockResolvedValue('synthetic.aws.jwt'), save: jest.fn(), clear: jest.fn() },
    assertSecureTransport: jest.fn(), contract: sessionContract,
    auth: { login: jest.fn(), register: jest.fn(), getMe: jest.fn().mockResolvedValue({ status: 200, headers: {}, data: identity }) },
    users: { getMe: jest.fn().mockResolvedValue({ status: 200, headers: {}, data: { ...identity, phone: null, avatarUrl: null } }), updateMe: jest.fn() },
  };
  return { deps, session: new AuthSession(deps) };
}
describe('Comercio privado: permisos, ownership y resultados tardíos', () => {
  beforeEach(() => {
    jest.spyOn(sellerService, 'getMe').mockResolvedValue({ status: 200, headers: {}, data: seller });
    jest.spyOn(categoryService, 'getAll').mockResolvedValue([{ id: input.categoryId, name: 'Categoría fixture', sortOrder: 1 }]);
    jest.spyOn(productService, 'create').mockResolvedValue(product);
    jest.spyOn(productService, 'getById').mockResolvedValue(product);
    jest.spyOn(productService, 'update').mockResolvedValue(product);
    jest.spyOn(productService, 'updateStatus').mockImplementation(async (_token, _id, body) => ({ ...product, status: body.status }));
    jest.spyOn(orderService, 'create').mockResolvedValue(order);
  });
  afterEach(() => jest.restoreAllMocks());
  test('lista todas las páginas públicas y filtra por sellerId real, sin mezclar vendedores', async () => {
    const { session } = fixture(); await session.restore();
    const list = jest.spyOn(productService, 'getPage')
      .mockResolvedValueOnce({ items: [{ ...product, id: 'one' }, { ...product, id: 'foreign', sellerId: 'other' }], page: 1, pageSize: 100, totalCount: 3 })
      .mockResolvedValueOnce({ items: [{ ...product, id: 'two' }], page: 2, pageSize: 100, totalCount: 3 });
    expect((await session.visibleSellerProducts()).map((item) => item.id)).toEqual(['one', 'two']);
    expect(sellerService.getMe).toHaveBeenCalledWith('synthetic.aws.jwt');
    expect(list).toHaveBeenLastCalledWith({ page: 2, pageSize: 100 });
  });
  test('catálogo inconsistente no se presenta como listado completo; Buyer no consulta', async () => {
    const list = jest.spyOn(productService, 'getPage').mockResolvedValueOnce({ items: [product], page: 1, pageSize: 100, totalCount: 2 })
      .mockResolvedValueOnce({ items: [product], page: 2, pageSize: 100, totalCount: 2 });
    const sellerSession = fixture().session; await sellerSession.restore();
    await expect(sellerSession.visibleSellerProducts()).rejects.toMatchObject({ kind: 'invalid_response' });
    list.mockClear(); const buyer = fixture(false).session; await buyer.restore();
    await expect(buyer.visibleSellerProducts()).rejects.toMatchObject({ status: 403 });
    expect(list).not.toHaveBeenCalled();
  });
  test('historial y detalle exigen comprador de la sesión y filtran Seller sin mezclar páginas', async () => {
    const { session } = fixture(false); await session.restore();
    const summary = { ...order, role: 'buyer' as const };
    jest.spyOn(orderService, 'mine').mockResolvedValue({ items: [summary, { ...summary, orderId: 'seller-order', role: 'seller' }], page: 2, pageSize: 20, totalCount: 21 });
    jest.spyOn(orderService, 'detail').mockResolvedValue(order);
    expect(await session.listBuyerOrders(2)).toMatchObject({ items: [summary], page: 2, totalCount: 21 });
    expect(await session.buyerOrder(order.orderId)).toEqual(order);
    jest.mocked(orderService.detail).mockResolvedValue({ ...order, buyerId: 'different-user' });
    await expect(session.buyerOrder(order.orderId)).rejects.toMatchObject({ kind: 'invalid_response' });
    jest.mocked(orderService.mine).mockResolvedValue({ items: [{ ...summary, buyerId: 'different-user' }], page: 1, pageSize: 20, totalCount: 1 });
    await expect(session.listBuyerOrders(1)).rejects.toMatchObject({ kind: 'invalid_response' });
  });
  test('anónimo y Buyer no publican aunque el DTO del negocio diga Active', async () => {
    const { session } = fixture(false);
    await expect(session.createProduct(input)).rejects.toMatchObject({ kind: 'unauthenticated' });
    await session.restore();
    await expect(session.createProduct(input)).rejects.toMatchObject({ status: 403 });
    expect(productService.create).not.toHaveBeenCalled(); expect(sellerService.getMe).not.toHaveBeenCalled();
  });
  test('Seller Active y categoría real crean con mismo JWT, impiden reenviar mismo cuerpo', async () => {
    const { session, deps } = fixture(); await session.restore();
    expect(await session.createProduct(input)).toEqual(product);
    expect(productService.create).toHaveBeenCalledWith('synthetic.aws.jwt', input, [input.categoryId]);
    expect(deps.storage.save).not.toHaveBeenCalled();
    await expect(session.createProduct(input)).rejects.toMatchObject({ kind: 'validation' });
    expect(productService.create).toHaveBeenCalledTimes(1);
  });
  test('categoría eliminada entre pantalla y envío no transmite POST', async () => {
    jest.mocked(categoryService.getAll).mockResolvedValue([]);
    const { session } = fixture(); await session.restore();
    await expect(session.createProduct(input)).rejects.toMatchObject({ kind: 'validation' });
    expect(productService.create).not.toHaveBeenCalled();
  });
  test('producto ajeno no admite PATCH; identidad seller no es user.id', async () => {
    jest.mocked(productService.getById).mockResolvedValue({ ...product, sellerId: 'another-seller' });
    const { session } = fixture(); await session.restore();
    await expect(session.ownProduct(product.id, { stock: 1 })).rejects.toMatchObject({ status: 403 });
    expect(productService.update).not.toHaveBeenCalled();
    jest.mocked(productService.getById).mockResolvedValue(product);
    await session.ownProduct(product.id, { stock: 0 });
    expect(productService.update).toHaveBeenCalledWith('synthetic.aws.jwt', product.id, { stock: 0 });
  });
  test('timeout POST bloquea nuevo envío; consulta no prueba que la mutación falló', async () => {
    jest.mocked(productService.create).mockRejectedValue(new ApiError('timeout', 'Fixture timeout'));
    const { session } = fixture(); await session.restore();
    await expect(session.createProduct(input)).rejects.toMatchObject({ kind: 'timeout' });
    await session.ownProduct(product.id);
    await expect(session.createProduct({ ...input, name: 'Otro alimento' })).rejects.toMatchObject({ kind: 'validation' });
    expect(productService.create).toHaveBeenCalledTimes(1);
  });
  test('operación paralela excluida, respuesta tras logout cancelada', async () => {
    let finish!: (value: ProductResponse) => void;
    jest.mocked(productService.create).mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    const { session } = fixture(); await session.restore();
    const pending = session.createProduct(input);
    // Flush the authorization/category awaits before simulating the response.
    for (let step = 0; step < 20 && !finish; step++) await Promise.resolve();
    expect(finish).toBeDefined();
    await expect(session.ownProduct(product.id)).rejects.toMatchObject({ kind: 'validation' });
    await session.logout(); finish(product);
    await expect(pending).rejects.toMatchObject({ kind: 'cancelled' });
  });
  test('Buyer crea pedido simple; ID/cantidad provienen de preparación, no de carrito mock', async () => {
    const { session } = fixture(false); await session.restore();
    expect(await session.createOrder({ productId: product.id, quantity: 2 }, 'preparation-1')).toEqual(order);
    expect(orderService.create).toHaveBeenCalledWith('synthetic.aws.jwt', { productId: product.id, quantity: 2 });
    await expect(session.createOrder({ productId: product.id, quantity: 2 }, 'preparation-1')).rejects.toMatchObject({ kind: 'validation' });
    expect(orderService.create).toHaveBeenCalledTimes(1);
  });
  test('un pedido confirmado no impide otro intento nuevo', async () => {
    const { session } = fixture(false); await session.restore();
    await session.createOrder({ productId: product.id, quantity: 2 }, 'p1');
    await expect(session.createOrder({ productId: product.id, quantity: 2 }, 'p1')).rejects.toMatchObject({ code: 'ORDER_ALREADY_CONFIRMED' });
    await session.createOrder({ productId: product.id, quantity: 2 }, 'p2');
    expect(orderService.create).toHaveBeenCalledTimes(2);
  });
  test.each(['timeout', 'network', 'invalid_response'] as const)('resultado %s tras POST permanece incierto incluso tras consultar y restaurar', async (kind) => {
    jest.mocked(orderService.create).mockRejectedValue(new ApiError(kind, 'fixture'));
    jest.spyOn(orderService, 'mine').mockResolvedValue({ items: [], page: 1, pageSize: 20, totalCount: 0 });
    const { session } = fixture(false); await session.restore();
    await expect(session.createOrder({ productId: product.id, quantity: 2 }, 'p1')).rejects.toMatchObject({ code: 'ORDER_OUTCOME_UNCERTAIN' });
    await session.listBuyerOrders(1); await session.restore();
    await expect(session.createOrder({ productId: product.id, quantity: 1 }, 'p2')).rejects.toMatchObject({ code: 'ORDER_OUTCOME_UNCERTAIN' });
    expect(orderService.create).toHaveBeenCalledTimes(1);
  });
  test.each([{ ...product, stock: 1 }, { ...product, status: 'Paused' as const }])('revalida disponibilidad antes de crear pedido', async (value) => {
    jest.mocked(productService.getById).mockResolvedValue(value);
    const { session } = fixture(false); await session.restore();
    await expect(session.createOrder({ productId: product.id, quantity: 2 }, 'p1')).rejects.toMatchObject({ kind: 'validation' });
    expect(orderService.create).not.toHaveBeenCalled();
  });
  test('respuesta pedido de otra identidad se rechaza y bloquea reintento incierto', async () => {
    jest.mocked(orderService.create).mockResolvedValue({ ...order, buyerId: 'other-user' });
    const { session } = fixture(false); await session.restore();
    await expect(session.createOrder({ productId: product.id, quantity: 2 }, 'p1')).rejects.toMatchObject({ kind: 'invalid_response' });
    await expect(session.createOrder({ productId: product.id, quantity: 1 }, 'p2')).rejects.toMatchObject({ kind: 'validation' });
    expect(orderService.create).toHaveBeenCalledTimes(1);
  });
  test('401 limpia JWT; 403 no borra la sesión', async () => {
    const { session, deps } = fixture(false); await session.restore();
    jest.mocked(orderService.create).mockRejectedValueOnce(new ApiError('http', 'Fixture forbidden', 403));
    await expect(session.createOrder({ productId: product.id, quantity: 2 }, 'p1')).rejects.toMatchObject({ status: 403 });
    expect(deps.storage.clear).not.toHaveBeenCalled();
    jest.mocked(orderService.create).mockRejectedValueOnce(new ApiError('http', 'Fixture unauthorized', 401));
    await expect(session.createOrder({ productId: product.id, quantity: 2 }, 'p1')).rejects.toMatchObject({ status: 401 });
    expect(deps.storage.clear).toHaveBeenCalledTimes(1);
  });
  test('pausar/reactivar solo Seller propietario; reactivar ID conocido no depende del GETpúblico de Paused', async () => {
    const { session } = fixture(); await session.restore();
    expect((await session.updateProductStatus(product.id, { status: 'Paused' })).status).toBe('Paused');
    jest.mocked(productService.getById).mockClear().mockRejectedValue(new ApiError('http', 'Paused no público fixture', 404));
    expect((await session.updateProductStatus(product.id, { status: 'Active' })).status).toBe('Active');
    expect(productService.getById).not.toHaveBeenCalled();
    expect(productService.updateStatus).toHaveBeenLastCalledWith('synthetic.aws.jwt', product.id, { status: 'Active' });
    await session.logout(); await session.restore();
    await expect(session.updateProductStatus(product.id, { status: 'Active' })).rejects.toMatchObject({ status: 404 });
    expect(productService.updateStatus).toHaveBeenCalledTimes(2);
  });
  test('Buyer, anónimo y producto ajeno no transmiten cambiosstatus', async () => {
    const buyer = fixture(false).session;
    await expect(buyer.updateProductStatus(product.id, { status: 'Paused' })).rejects.toMatchObject({ kind: 'unauthenticated' });
    await buyer.restore();
    await expect(buyer.updateProductStatus(product.id, { status: 'Paused' })).rejects.toMatchObject({ status: 403 });
    const sellerSession = fixture().session; await sellerSession.restore();
    jest.mocked(productService.getById).mockResolvedValue({ ...product, sellerId: 'foreign-seller' });
    await expect(sellerSession.updateProductStatus(product.id, { status: 'Active' })).rejects.toMatchObject({ status: 403 });
    expect(productService.updateStatus).not.toHaveBeenCalled();
  });
  test('cambioestado duplicado excluido y respuesta despuéslogout cancelada', async () => {
    let finish!: (value: ProductResponse) => void;
    jest.mocked(productService.updateStatus).mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    const { session } = fixture(); await session.restore();
    const pending = session.updateProductStatus(product.id, { status: 'Paused' });
    for (let step = 0; step < 20 && !finish; step++) await Promise.resolve();
    expect(finish).toBeDefined();
    await expect(session.updateProductStatus(product.id, { status: 'Paused' })).rejects.toMatchObject({ kind: 'validation' });
    await session.logout(); finish({ ...product, status: 'Paused' });
    await expect(pending).rejects.toMatchObject({ kind: 'cancelled' });
    expect(productService.updateStatus).toHaveBeenCalledTimes(1);
  });
  test('notas de250 llegan sin importes,251 se rechazan antes de autorización/red', async () => {
    const { session, deps } = fixture(false); await session.restore();
    deps.auth.getMe.mockClear();
    await expect(session.createOrder({ productId: product.id, quantity: 2, notes: 'x'.repeat(251) }, 'bad')).rejects.toMatchObject({ kind: 'validation' });
    expect(deps.auth.getMe).not.toHaveBeenCalled(); expect(orderService.create).not.toHaveBeenCalled();
    await session.createOrder({ productId: product.id, quantity: 2, notes: 'x'.repeat(250) }, 'valid');
    expect(orderService.create).toHaveBeenCalledWith('synthetic.aws.jwt', { productId: product.id, quantity: 2, notes: 'x'.repeat(250) });
  });
});
