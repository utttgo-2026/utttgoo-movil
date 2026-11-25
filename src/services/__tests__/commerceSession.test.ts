import { AuthSession } from '../authSession';
import { sessionContract } from '../api/sessionContract';
import { sellerService } from '../api/sellerService';
import { categoryService } from '../api/categoryService';
import { productService } from '../api/productService';
import { orderService } from '../api/orderService';
import { ApiError } from '../api/errors';
import type { ProductResponse, SellerActiveResponse } from '@/types/api';
import { productMetadata } from '../__fixtures__/product';
import * as mediaModule from '../api/mediaPr33Client';

jest.mock('../sessionStorage', () => ({ sessionStorage: {} }));
jest.mock('expo-crypto', () => ({ randomUUID: () => '12345678-1234-4123-8123-123456789012', CryptoDigestAlgorithm: { SHA256: 'SHA-256' }, digestStringAsync: async (_algorithm: string, value: string) => jest.requireActual<typeof import('node:crypto')>('node:crypto').createHash('sha256').update(value).digest('hex') }));
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
  test('POST503 sigue siendo HTTP503 y queda incierto; consultar no permite otro POST', async () => {
    const failure = new ApiError('http', 'Catalog unavailable fixture', 503); failure.code = 'CATALOG_UNAVAILABLE';
    jest.mocked(productService.create).mockRejectedValue(failure);
    const { session } = fixture(); await session.restore();
    await expect(session.createProduct(input)).rejects.toBe(failure);
    expect(failure).toMatchObject({ kind: 'http', status: 503, code: 'CATALOG_UNAVAILABLE', outcomeUncertain: true });
    await session.ownProduct(product.id);
    await expect(session.createProduct({ ...input, name: 'Otro producto' })).rejects.toMatchObject({ code: 'PRODUCT_OUTCOME_UNCERTAIN' });
    expect(productService.create).toHaveBeenCalledTimes(1);
  });
  test('Media real cerrado no autoriza ni transmite peticiones', async () => {
    const { session, deps } = fixture(); await session.restore(); deps.auth.getMe.mockClear();
    await expect(session.productPhotoOperation('upload', { uri: 'file:///fixture.jpg', mimeType: 'image/jpeg', size: 4, width: 100, height: 100 })).rejects.toMatchObject({ kind: 'contract_unavailable' });
    expect(deps.auth.getMe).not.toHaveBeenCalled();
  });
  test('capa preparada revalida Seller y reintenta solo confirm con mismo asset', async () => {
    jest.spyOn(mediaModule, 'requireRealProductMedia').mockImplementation(() => undefined);
    const upload = jest.spyOn(mediaModule.mediaPr33Client, 'upload').mockResolvedValue('507f1f77bcf86cd799439011');
    const confirm = jest.spyOn(mediaModule.mediaPr33Client, 'confirm').mockRejectedValueOnce(new ApiError('timeout', 'Fixture'))
      .mockResolvedValueOnce({ mediaAssetId: '507f1f77bcf86cd799439011', status: 'PendingModeration' });
    const { session } = fixture(); await session.restore();
    await session.productPhotoOperation('upload', { uri: 'file:///fixture.jpg', mimeType: 'image/jpeg', size: 4, width: 100, height: 100 });
    await expect(session.productPhotoOperation('confirm')).rejects.toMatchObject({ kind: 'timeout' });
    expect(await session.productPhotoOperation('confirm')).toMatchObject({ status: 'PendingModeration' });
    expect(upload).toHaveBeenCalledTimes(1); expect(confirm).toHaveBeenCalledTimes(2);
    expect(confirm).toHaveBeenLastCalledWith('synthetic.aws.jwt', '507f1f77bcf86cd799439011');
    const buyer = fixture(false).session; await buyer.restore();
    await expect(buyer.productPhotoOperation('upload', { uri: 'file:///fixture.jpg', mimeType: 'image/jpeg', size: 4, width: 100, height: 100 })).rejects.toMatchObject({ status: 403 });
    expect(upload).toHaveBeenCalledTimes(1);
  });
  test('capa preparada impide POST con asset PendingModeration', async () => {
    jest.spyOn(mediaModule, 'requireRealProductMedia').mockImplementation(() => undefined);
    jest.spyOn(mediaModule.mediaPr33Client, 'status').mockResolvedValue({ mediaAssetId: '507f1f77bcf86cd799439011', status: 'PendingModeration', imageUrl: null, imageUrlExpiresAt: null });
    const { session } = fixture(); await session.restore();
    await expect(session.createProduct({ ...input, mediaAssetId: '507f1f77bcf86cd799439011' })).rejects.toMatchObject({ kind: 'validation' });
    expect(productService.create).not.toHaveBeenCalled();
  });
  test('un rechazo de autorización del PUT S3 no borra el JWT de API', async () => {
    jest.spyOn(mediaModule, 'requireRealProductMedia').mockImplementation(() => undefined);
    const failure = new ApiError('http', 'S3 no confirmó la subida.', 401); failure.code = 'S3_UPLOAD_FAILED';
    jest.spyOn(mediaModule.mediaPr33Client, 'upload').mockRejectedValue(failure);
    const { session, deps } = fixture(); await session.restore();
    await expect(session.productPhotoOperation('upload', { uri: 'file:///fixture.jpg', mimeType: 'image/jpeg', size: 4, width: 100, height: 100 })).rejects.toBe(failure);
    expect(deps.storage.clear).not.toHaveBeenCalled();
  });
  test('lista todas las páginas públicas y filtra por sellerId real, sin mezclar vendedores', async () => {
    const { session } = fixture(); await session.restore();
    const list = jest.spyOn(productService, 'getPage')
      .mockResolvedValueOnce({ items: [{ ...product, id: 'one' }, { ...product, id: 'foreign', sellerId: 'other' }], page: 1, pageSize: 50, totalCount: 3 })
      .mockResolvedValueOnce({ items: [{ ...product, id: 'two' }], page: 2, pageSize: 50, totalCount: 3 });
    expect((await session.visibleSellerProducts()).map((item) => item.id)).toEqual(['one', 'two']);
    expect(sellerService.getMe).toHaveBeenCalledWith('synthetic.aws.jwt');
    expect(list).toHaveBeenLastCalledWith({ page: 2, pageSize: 50 }, 'seller-products');
  });
  test('catálogo inconsistente no se presenta como listado completo; Buyer no consulta', async () => {
    const list = jest.spyOn(productService, 'getPage').mockResolvedValueOnce({ items: [product], page: 1, pageSize: 50, totalCount: 2 })
      .mockResolvedValueOnce({ items: [product], page: 2, pageSize: 50, totalCount: 2 });
    const sellerSession = fixture().session; await sellerSession.restore();
    await expect(sellerSession.visibleSellerProducts()).rejects.toMatchObject({ kind: 'invalid_response' });
    list.mockClear(); const buyer = fixture(false).session; await buyer.restore();
    await expect(buyer.visibleSellerProducts()).rejects.toMatchObject({ status: 403 });
    expect(list).not.toHaveBeenCalled();
  });
  test('historial y detalle exigen comprador de la sesión y rechazan Seller sin ocultar pedidos', async () => {
    const { session } = fixture(false); await session.restore();
    const summary = { ...order, role: 'buyer' as const };
    jest.spyOn(orderService, 'mine').mockResolvedValue({ items: [summary, { ...summary, orderId: 'seller-order', role: 'seller' }], page: 2, pageSize: 20, totalCount: 21 });
    jest.spyOn(orderService, 'detail').mockResolvedValue(order);
    await expect(session.listBuyerOrders(2)).rejects.toMatchObject({ kind: 'invalid_response' });
    jest.mocked(orderService.mine).mockResolvedValue({ items: [summary], page: 2, pageSize: 20, totalCount: 21 });
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
    expect(orderService.create).toHaveBeenCalledWith('synthetic.aws.jwt', { productId: product.id, quantity: 2 }, '12345678-1234-4123-8123-123456789012');
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
    expect(orderService.create).toHaveBeenCalledWith('synthetic.aws.jwt', { productId: product.id, quantity: 2, notes: 'x'.repeat(250) }, '12345678-1234-4123-8123-123456789012');
  });
  test('lectura comprador no choca con POST en curso, ni libera su protección', async () => {
    let finish!: (value: typeof order) => void;
    jest.mocked(orderService.create).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    jest.spyOn(orderService, 'detail').mockResolvedValue(order);
    const { session } = fixture(false); await session.restore();
    const pending = session.createOrder({ productId: product.id, quantity: 2 }, 'p-new');
    for (let i = 0; i < 20 && !finish; i++) await Promise.resolve();
    expect(await session.buyerOrder(order.orderId)).toEqual(order);
    await expect(session.createOrder({ productId: product.id, quantity: 2 }, 'p-duplicate')).rejects.toMatchObject({ kind: 'validation' });
    finish(order); expect(await pending).toEqual(order); expect(orderService.create).toHaveBeenCalledTimes(1);
  });
  test('confirmado no encontrado en página reciente produce diagnóstico sin datos personales', async () => {
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    jest.spyOn(orderService, 'mine').mockResolvedValue({ items: [], page: 1, pageSize: 20, totalCount: 0 });
    const { session } = fixture(false); await session.restore();
    await session.createOrder({ productId: product.id, quantity: 2 }, 'new');
    expect((await session.listBuyerOrders(1)).items).toEqual([]);
    expect(log).toHaveBeenCalledWith('[orders-http]', expect.objectContaining({ stage: 'buyer-list', missingConfirmed: 1, scope: 'requested-page-only' }));
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/synthetic.aws.jwt|aws-user|aws-order|Alimento fixture/);
    expect(orderService.create).toHaveBeenCalledTimes(1);
  });
  test('listado real deduplica IDs sin filtrar compras por estado', async () => {
    const summary = { ...order, role: 'buyer' as const };
    jest.spyOn(orderService, 'mine').mockResolvedValue({ items: [summary, summary, { ...summary, orderId: 'closed', status: 'Delivered' }], page: 1, pageSize: 20, totalCount: 3 });
    const { session } = fixture(false); await session.restore();
    expect((await session.listBuyerOrders(1)).items.map((item) => item.orderId)).toEqual([order.orderId, 'closed']);
  });
  test('bandeja vendedor valida rol y sellerId, no userId ni parámetros de propietario', async () => {
    const spy = jest.spyOn(orderService, 'sellerMine').mockResolvedValue({ items: [{ ...order, role: 'seller' }], page: 1, pageSize: 20, totalCount: 1 });
    const { session } = fixture(); await session.restore(); expect((await session.listSellerOrders(1)).items).toHaveLength(1);
    expect(spy).toHaveBeenCalledWith('synthetic.aws.jwt', 1);
    spy.mockResolvedValueOnce({ items: [{ ...order, role: 'seller', sellerId: 'another-seller' }], page: 1, pageSize: 20, totalCount: 1 });
    await expect(session.listSellerOrders(1)).rejects.toMatchObject({ kind: 'invalid_response' });
    const buyer = fixture(false).session; await buyer.restore(); const calls = spy.mock.calls.length;
    await expect(buyer.listSellerOrders(1)).rejects.toMatchObject({ status: 403 }); expect(spy).toHaveBeenCalledTimes(calls);
  });
  test('detalle vendedor ajeno no permite exposición ni mutación', async () => {
    jest.spyOn(orderService, 'detail').mockResolvedValue({ ...order, sellerId: 'another' });
    const spy = jest.spyOn(orderService, 'updateStatus');
    const { session } = fixture(); await session.restore();
    await expect(session.sellerOrder(order.orderId)).rejects.toMatchObject({ status: 403 });
    await expect(session.changeSellerOrder(order.orderId, 'Accepted')).rejects.toMatchObject({ status: 403 }); expect(spy).not.toHaveBeenCalled();
  });
  test.each([['Pending', 'Accepted'], ['Pending', 'Rejected'], ['Accepted', 'InPreparation'], ['InPreparation', 'Ready']] as const)('%s→%s usa versión leída y confirma GET posterior', async (from, to) => {
    jest.spyOn(orderService, 'detail').mockResolvedValueOnce({ ...order, status: from, version: 7 }).mockResolvedValueOnce({ ...order, status: to, version: 8 });
    const spy = jest.spyOn(orderService, 'updateStatus').mockResolvedValue({ orderId: order.orderId, status: to, version: 8 });
    const { session } = fixture(); await session.restore(); expect((await session.changeSellerOrder(order.orderId, to)).status).toBe(to);
    expect(spy).toHaveBeenCalledWith('synthetic.aws.jwt', order.orderId, to, 7); expect(orderService.detail).toHaveBeenCalledTimes(2);
  });
  test('409 conserva el rechazo y una nueva intención usa la versión reconfirmada', async () => {
    const conflict = new ApiError('http', 'Fixture conflict', 409); conflict.code = 'ORDER_VERSION_CONFLICT';
    const detail = jest.spyOn(orderService, 'detail').mockResolvedValueOnce({ ...order, version: 4 }).mockResolvedValue({ ...order, version: 5 });
    const patch = jest.spyOn(orderService, 'updateStatus').mockRejectedValueOnce(conflict).mockImplementationOnce(async () => {
      detail.mockResolvedValue({ ...order, version: 6, status: 'Accepted' }); return { orderId: order.orderId, status: 'Accepted', version: 6 };
    });
    const { session } = fixture(); await session.restore();
    await expect(session.changeSellerOrder(order.orderId, 'Accepted')).rejects.toBe(conflict);
    expect(patch).toHaveBeenCalledTimes(1);
    expect((await session.sellerOrder(order.orderId)).version).toBe(5);
    await expect(session.changeSellerOrder(order.orderId, 'Accepted')).resolves.toMatchObject({ status: 'Accepted', version: 6 });
    expect(patch.mock.calls.map((args) => args[3])).toEqual([4, 5]);
  });
  test('PATCH aceptado pero GET devuelve una versión anterior: no presenta éxito ni reenvía', async () => {
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    jest.spyOn(orderService, 'detail').mockResolvedValue({ ...order, version: 5 });
    const patch = jest.spyOn(orderService, 'updateStatus').mockResolvedValue({ orderId: order.orderId, status: 'Accepted', version: 6 });
    const { session } = fixture(); await session.restore();
    await expect(session.changeSellerOrder(order.orderId, 'Accepted')).rejects.toMatchObject({ outcomeUncertain: true });
    expect(patch).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('[orders-http]', expect.objectContaining({ phase: 'readback-mismatch', transition: 'Accepted', orderVersion: 5 }));
  });
  test('transición Ready→Accepted se bloquea antes de PATCH', async () => {
    jest.spyOn(orderService, 'detail').mockResolvedValue({ ...order, status: 'Ready' }); const spy = jest.spyOn(orderService, 'updateStatus');
    const { session } = fixture(); await session.restore(); await expect(session.changeSellerOrder(order.orderId, 'Accepted')).rejects.toMatchObject({ kind: 'validation' }); expect(spy).not.toHaveBeenCalled();
  });
  test('cancelación solo comprador Pending; GET confirma cancelación', async () => {
    const detail = jest.spyOn(orderService, 'detail').mockResolvedValueOnce(order).mockResolvedValueOnce({ ...order, status: 'CancelledByBuyer', version: 2 });
    const cancel = jest.spyOn(orderService, 'cancel').mockResolvedValue({ orderId: order.orderId, status: 'CancelledByBuyer', version: 2 });
    const { session } = fixture(false); await session.restore(); expect((await session.cancelBuyerOrder(order.orderId)).status).toBe('CancelledByBuyer');
    detail.mockResolvedValue({ ...order, status: 'Accepted' }); await expect(session.cancelBuyerOrder(order.orderId)).rejects.toMatchObject({ kind: 'validation' }); expect(cancel).toHaveBeenCalledTimes(1);
  });
  test.each(['Pending', 'Accepted', 'InPreparation', 'Delivered', 'Rejected', 'CancelledByBuyer'] as const)('QR no se emite en %s', async (status) => {
    jest.spyOn(orderService, 'detail').mockResolvedValue({ ...order, status }); const issue = jest.spyOn(orderService, 'deliveryToken');
    const { session } = fixture(false); await session.restore(); await expect(session.issueDeliveryToken(order.orderId)).rejects.toMatchObject({ kind: 'validation' }); expect(issue).not.toHaveBeenCalled();
  });
  test('QR Ready solo comprador propio y solicitud acotada, sin guardar token', async () => {
    const detail = jest.spyOn(orderService, 'detail').mockResolvedValue({ ...order, status: 'Ready' });
    const issue = jest.spyOn(orderService, 'deliveryToken').mockResolvedValue({ orderId: order.orderId, token: 'A'.repeat(43), expiresAt: '2099-01-01T00:00:00Z' });
    const { session } = fixture(false); await session.restore(); expect((await session.issueDeliveryToken(order.orderId)).token).toBe('A'.repeat(43));
    await expect(session.issueDeliveryToken(order.orderId)).rejects.toMatchObject({ kind: 'validation' }); expect(issue).toHaveBeenCalledTimes(1);
    detail.mockResolvedValueOnce({ ...order, status: 'Ready', buyerId: 'another-user' });
    await expect(session.issueDeliveryToken(order.orderId)).rejects.toMatchObject({ status: 403 }); expect(issue).toHaveBeenCalledTimes(1);
  });
  test('entrega se confirma con QR real y GET Delivered; el mismo escaneo no se reutiliza', async () => {
    const qr = 'A'.repeat(43);
    jest.spyOn(orderService, 'detail').mockResolvedValueOnce({ ...order, status: 'Ready' }).mockResolvedValueOnce({ ...order, status: 'Delivered', version: 2 });
    const confirm = jest.spyOn(orderService, 'confirmDelivery').mockResolvedValue({ orderId: order.orderId, status: 'Delivered', version: 2 });
    const { session } = fixture(); await session.restore(); expect((await session.confirmOrderDelivery(order.orderId, qr)).status).toBe('Delivered');
    expect(confirm).toHaveBeenCalledWith('synthetic.aws.jwt', order.orderId, qr);
    await expect(session.confirmOrderDelivery(order.orderId, qr)).rejects.toMatchObject({ kind: 'validation' }); expect(confirm).toHaveBeenCalledTimes(1);
  });
  test('emisión QR limitada a tres intentos por ventana, aun tras remontar la UI', async () => {
    let now = 1000000; jest.spyOn(Date, 'now').mockImplementation(() => now);
    jest.spyOn(orderService, 'detail').mockResolvedValue({ ...order, status: 'Ready' });
    const issue = jest.spyOn(orderService, 'deliveryToken').mockResolvedValue({ orderId: order.orderId, token: 'A'.repeat(43), expiresAt: '2099-01-01T00:00:00Z' });
    const { session } = fixture(false); await session.restore();
    for (let i = 0; i < 3; i++) { await session.issueDeliveryToken(order.orderId); now += 31000; }
    await expect(session.issueDeliveryToken(order.orderId)).rejects.toMatchObject({ kind: 'validation' }); expect(issue).toHaveBeenCalledTimes(3);
    now += 300000; await session.issueDeliveryToken(order.orderId); expect(issue).toHaveBeenCalledTimes(4);
  });
  test('confirmación incierta no reenvía scan; solo consulta hasta nueva intención', async () => {
    jest.spyOn(orderService, 'detail').mockResolvedValue({ ...order, status: 'Ready' });
    const confirm = jest.spyOn(orderService, 'confirmDelivery').mockRejectedValue(new ApiError('timeout', 'fixture'));
    const { session } = fixture(); await session.restore(); const qr = 'A'.repeat(43);
    await expect(session.confirmOrderDelivery(order.orderId, qr)).rejects.toMatchObject({ outcomeUncertain: true });
    await expect(session.confirmOrderDelivery(order.orderId, qr)).rejects.toMatchObject({ kind: 'validation' });
    await session.sellerOrder(order.orderId);
    await expect(session.confirmOrderDelivery(order.orderId, qr)).rejects.toMatchObject({ kind: 'validation' }); expect(confirm).toHaveBeenCalledTimes(1);
  });
  test('tras GET Ready y una credencial diferente se permite nueva intención, nunca el escaneo anterior', async () => {
    const detail = jest.spyOn(orderService, 'detail').mockResolvedValue({ ...order, status: 'Ready' });
    const confirm = jest.spyOn(orderService, 'confirmDelivery').mockRejectedValueOnce(new ApiError('timeout', 'fixture'))
      .mockImplementationOnce(async () => { detail.mockResolvedValue({ ...order, status: 'Delivered', version: 2 }); return { orderId: order.orderId, status: 'Delivered', version: 2 }; });
    const { session } = fixture(); await session.restore();
    await expect(session.confirmOrderDelivery(order.orderId, 'A'.repeat(43))).rejects.toMatchObject({ outcomeUncertain: true });
    await session.sellerOrder(order.orderId);
    expect((await session.confirmOrderDelivery(order.orderId, 'B'.repeat(43))).status).toBe('Delivered');
    expect(confirm).toHaveBeenCalledTimes(2); expect(confirm).toHaveBeenLastCalledWith('synthetic.aws.jwt', order.orderId, 'B'.repeat(43));
  });
});
