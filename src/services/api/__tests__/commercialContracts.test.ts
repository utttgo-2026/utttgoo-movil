import { httpClient } from '../httpClient';
import { categoryService } from '../categoryService';
import { categoryResponse, pageResponse, sellerActiveResponse, productResponse, productPageResponse, orderResponse } from '../catalogContracts';
import { createProductBody, productPatchBody, productAvailabilityBody, productService } from '../productService';
import { sellerService } from '../sellerService';
import { backendHttpError } from '../errors';
import { sessionContract, decodeAuthMeResponse } from '../sessionContract';
import { usesMockCatalog } from '@/config/catalogSource';
import { createOrderBody, orderService } from '../orderService';
import { productMetadata } from '../../__fixtures__/product';

const seller = { sellerId: 'server-seller-fixture', businessName: 'Cocina fixture', description: 'Comida del campus', pickupPoint: 'Edificio fixture',
  status: 'Active', isActive: true, roles: ['Buyer', 'Seller'], createdAt: '2026-11-16T12:00:00Z', updatedAt: '2026-11-16T12:00:00Z' };
const category = { id: 'server-category-fixture', name: 'Categoría AWS fixture', sortOrder: 10 };
const product = { name: 'Alimento fixture', description: 'Descripción fixture', ingredients: ['Piña', 'Carne'], categoryId: category.id, price: 55.50, stock: 10 };
const persisted = { ...product, ...productMetadata, id: 'server-product', sellerId: seller.sellerId, status: 'Active' };
const order = { id: 'server-order', buyerId: 'server-buyer', sellerId: seller.sellerId, productId: persisted.id,
  quantity: 2, unitPrice: 55.50, totalAmount: 111, status: 'Pending', createdAt: '2026-11-16T12:00:00Z' };

describe('Contratos comerciales confirmados, sin requests reales', () => {
  afterEach(() => jest.restoreAllMocks());
  test('SellerActive DTO y roles Buyer+Seller se validan sin confundir SellerId con user.id', () => {
    expect(sellerActiveResponse(seller)).toEqual(seller);
    const identity = { id: 'mongo-user-fixture', email: 'fixture@uttt.edu.mx', displayName: 'Fixture', roles: ['Buyer', 'Seller'], accountStatus: 'Active' };
    expect(decodeAuthMeResponse(identity).roles).toEqual(['Buyer', 'Seller']);
    expect(sessionContract.decodeIdentity!(identity)).toMatchObject({ id: 'mongo-user-fixture', role: 'seller' });
  });
  test.each([{ ...seller, status: 'Pending' }, { ...seller, isActive: false }, { ...seller, roles: ['Seller'] }, { ...seller, sellerId: '' }, { ...seller, createdAt: 'invalid' }])
  ('rechaza vendedor no confirmado: %j', (value) => expect(() => sellerActiveResponse(value)).toThrow());
  test('activación201 confirmada y200 publicado requieren DTO Active', async () => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 201, headers: {}, data: seller });
    expect((await sellerService.requestActivation('synthetic.aws.jwt', { businessName: seller.businessName, description: seller.description, pickupPoint: seller.pickupPoint })).data.sellerId).toBe(seller.sellerId);
    expect(request).toHaveBeenCalledWith('/api/v1/sellers/activation-requests', expect.objectContaining({ expectedStatuses: [200, 201], token: 'synthetic.aws.jwt' }));
  });
  test('categorías paginadas se cargan sin IDs locales y ordenadas', async () => {
    const request = jest.spyOn(httpClient, 'request')
      .mockResolvedValueOnce({ status: 200, headers: {}, data: { items: [category], page: 1, pageSize: 20, total: 2 } })
      .mockResolvedValueOnce({ status: 200, headers: {}, data: { items: [{ ...category, id: 'second-server-id', sortOrder: 1 }], page: 2, pageSize: 20, total: 2 } });
    expect((await categoryService.getAll()).map((item) => item.id)).toEqual(['second-server-id', category.id]);
    expect(request).toHaveBeenLastCalledWith('/api/v1/categories', expect.objectContaining({ query: { page: 2, pageSize: 20 } }));
  });
  test('categorías items vacío es respuesta real sin fallback', async () => {
    jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 200, headers: {}, data: { items: [], page: 1, pageSize: 20, total: 0 } });
    expect(await categoryService.getAll()).toEqual([]);
  });
  test.each([null, { items: [], page: 0, pageSize: 20, total: 0 }, { items: [], page: 1, pageSize: 0, total: 0 }, { items: [{}], page: 1, pageSize: 20, total: 1 }])
  ('schema de categoría/página inválido no se convierte en vacío: %j', (value) => expect(() => pageResponse(value, categoryResponse)).toThrow());
  test('create body usa solo campos confirmados y no exige media', () => {
    expect(createProductBody(product, [category.id])).toEqual(product);
    expect(createProductBody({ ...product, stock: 0 }, [category.id]).stock).toBe(0);
    expect(productPatchBody({ price: 55.5, stock: 0 })).toEqual({ price: 55.5, stock: 0 });
    expect(productAvailabilityBody({ status: 'Paused' })).toEqual({ status: 'Paused' });
  });
  test.each([{ ...product, price: -1 }, { ...product, price: 1.001 }, { ...product, stock: -1 }, { ...product, stock: 1.5 },
    { ...product, categoryId: 'invented' }, { ...product, ingredients: { $ne: null } }, { ...product, sellerId: seller.sellerId }, { ...product, image: 'fake' }])
  ('create inválido no produce DTO enviado: %j', (value) => expect(() => createProductBody(value as typeof product, [category.id])).toThrow());
  test('availability como propiedad y estados no confirmados se rechazan antes de fetch', async () => {
    const request = jest.spyOn(httpClient, 'request');
    await expect(productService.updateStatus('synthetic.aws.jwt', 'persistent-id', { availability: 'Paused' } as unknown as { status: 'Paused' })).rejects.toMatchObject({ kind: 'validation' });
    expect(() => productPatchBody(Object.assign({ price: 50 }, { availability: 'Paused' }))).toThrow();
    expect(request).not.toHaveBeenCalled();
  });
  test('GET productos respeta página/filtros confirmados', async () => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 200, headers: {}, data: { items: [], page: 2, pageSize: 10, total: 0 } });
    expect((await productService.getPage({ search: 'tacos', categoryId: category.id, minPrice: 10, maxPrice: 60, page: 2, pageSize: 10 })).items).toEqual([]);
    expect(request).toHaveBeenCalledWith('/api/v1/products', expect.objectContaining({ query: { search: 'tacos', categoryId: category.id, minPrice: 10, maxPrice: 60, page: 2, pageSize: 10 } }));
  });
  test('producto incompleto se rechaza en lista y detalle', async () => {
    jest.spyOn(httpClient, 'request').mockResolvedValueOnce({ status: 200, headers: {}, data: { items: [{ ...product, id: 'server-product' }], page: 1, pageSize: 20, total: 1 } })
      .mockResolvedValueOnce({ status: 200, headers: {}, data: { ...product, id: 'server-product' } });
    await expect(productService.getPage()).rejects.toMatchObject({ kind: 'invalid_response' });
    await expect(productService.getById('server-product')).rejects.toMatchObject({ kind: 'invalid_response' });
  });
  test('create201 y PATCH200 usan Bearer y whitelist, devuelven IDs reales', async () => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 201, headers: {}, data: persisted });
    expect(await productService.create('synthetic.aws.jwt', product, [category.id])).toEqual(persisted);
    expect(request).toHaveBeenLastCalledWith('/api/v1/products', expect.objectContaining({ method: 'POST', token: 'synthetic.aws.jwt', body: product, expectedStatuses: [201] }));
    request.mockResolvedValue({ status: 200, headers: {}, data: { ...persisted, stock: 0 } });
    expect((await productService.update('synthetic.aws.jwt', persisted.id, { stock: 0 })).stock).toBe(0);
    expect(request).toHaveBeenLastCalledWith(`/api/v1/products/${persisted.id}`, expect.objectContaining({ body: { stock: 0 }, expectedStatuses: [200] }));
    await expect(productService.update('synthetic.aws.jwt', persisted.id, { stock: 4 })).rejects.toMatchObject({ kind: 'invalid_response' });
  });
  test.each(['price_asc', 'price_desc', 'name_asc'] as const)('sort confirmado %s y total', async (sortBy) => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 200, headers: {}, data: { items: [persisted], page: 1, pageSize: 20, total: 1 } });
    expect((await productService.getPage({ sortBy })).items).toEqual([persisted]);
    expect(request).toHaveBeenCalledWith('/api/v1/products', expect.objectContaining({ query: expect.objectContaining({ sortBy }) }));
  });
  test.each([{ ...persisted, status: 'Published' }, { ...persisted, price: 1.001 }, { ...persisted, stock: -1 }, { ...persisted, ingredients: [4] }, { ...persisted, sellerId: '' }, { ...persisted, isAvailable: 'true' }])
  ('producto inválido no se presenta como válido: %j', (value) => expect(() => productResponse(value)).toThrow());
  test('response no exige imagen; solo total se admite y Paused es válido', () => {
    expect(productResponse({ ...persisted, status: 'Paused' })).toMatchObject({ status: 'Paused' });
    expect(productPageResponse({ items: [], page: 1, pageSize: 20, total: 0 }).total).toBe(0);
    expect(() => productPageResponse({ items: [], page: 1, pageSize: 20, total: 0, totalCount: 3 })).toThrow();
    expect(() => productPageResponse({ items: [], page: 1, pageSize: 20, totalCount: 0 })).toThrow();
    expect(() => productPageResponse({ items: [persisted, persisted], page: 1, pageSize: 20, total: 2 })).toThrow();
  });
  test('pedido producto/cantidad/notas, 201 y total en centavos; sin fee', async () => {
    const body = { productId: persisted.id, quantity: 2 };
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 201, headers: {}, data: order });
    expect(await orderService.create('synthetic.aws.jwt', body)).toEqual(order);
    expect(request).toHaveBeenCalledWith('/api/v1/orders', expect.objectContaining({ method: 'POST', token: 'synthetic.aws.jwt', body, expectedStatuses: [201] }));
    expect(createOrderBody({ ...body, notes: 'Sin cebolla' })).toEqual({ ...body, notes: 'Sin cebolla' });
    expect(() => createOrderBody({ ...body, totalAmount: 1 } as typeof body)).toThrow();
    expect(() => createOrderBody({ ...body, quantity: 0 })).toThrow();
    expect(() => orderResponse({ ...order, totalAmount: 112 })).toThrow();
    expect(() => orderResponse({ ...order, status: 'Delivered' })).toThrow();
    request.mockResolvedValue({ status: 201, headers: {}, data: { ...order, productId: 'wrong-product' } });
    await expect(orderService.create('synthetic.aws.jwt', body)).rejects.toMatchObject({ kind: 'invalid_response' });
  });
  test.each([[401, 'UNAUTHORIZED'], [403, 'SELLER_ROLE_REQUIRED'], [404, 'PRODUCT_NOT_FOUND'], [404, 'CATEGORY_NOT_FOUND'],
    [409, 'PRODUCT_CONFLICT'], [400, 'VALIDATION_ERROR'], [429, 'RATE_LIMITED'], [503, 'CATALOG_UNAVAILABLE'], [503, 'SELLER_UNAVAILABLE']] as const)
  ('envelope HTTP%s/%s se clasifica sin mostrar message sensible', (status, code) => {
    const error = backendHttpError(status, { correlationId: 'fixture-correlation', status, code, message: 'private user/token text' });
    expect(error.code).toBe(code); expect(error.status).toBe(status); expect(error.message).not.toContain('private');
  });
  test('fuente mock requiere permiso explícito de desarrollo y nunca funciona en producción', () => {
    const previous = process.env.EXPO_PUBLIC_CATALOG_SOURCE;
    try {
      delete process.env.EXPO_PUBLIC_CATALOG_SOURCE; expect(usesMockCatalog()).toBe(false);
      process.env.EXPO_PUBLIC_CATALOG_SOURCE = 'mock'; expect(usesMockCatalog()).toBe(true);
      jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', false); expect(usesMockCatalog()).toBe(false);
    } finally { if (previous === undefined) delete process.env.EXPO_PUBLIC_CATALOG_SOURCE; else process.env.EXPO_PUBLIC_CATALOG_SOURCE = previous; }
  });
});
