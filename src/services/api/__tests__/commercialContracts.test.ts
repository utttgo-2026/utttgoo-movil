import { httpClient } from '../httpClient';
import { categoryService } from '../categoryService';
import { categoryResponse, pageResponse, sellerActiveResponse } from '../catalogContracts';
import { createProductBody, productPatchBody, pausedAvailabilityBody, productService } from '../productService';
import { sellerService } from '../sellerService';
import { backendHttpError } from '../errors';
import { sessionContract, decodeAuthMeResponse } from '../sessionContract';
import { usesMockCatalog } from '@/config/catalogSource';

const seller = { sellerId: 'server-seller-fixture', businessName: 'Cocina fixture', description: 'Comida del campus', pickupPoint: 'Edificio fixture',
  status: 'Active', isActive: true, roles: ['Buyer', 'Seller'], createdAt: '2026-11-16T12:00:00Z', updatedAt: '2026-11-16T12:00:00Z' };
const category = { id: 'server-category-fixture', name: 'Categoría AWS fixture', sortOrder: 10 };
const product = { name: 'Alimento fixture', description: 'Descripción fixture', ingredients: ['Piña', 'Carne'], categoryId: category.id, price: 55.50, stock: 10 };

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
  test('activación201 interpreta DTO y200 anterior ya no es éxito admitido', async () => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 201, headers: {}, data: seller });
    expect((await sellerService.requestActivation('synthetic.aws.jwt', { businessName: seller.businessName, description: seller.description, pickupPoint: seller.pickupPoint })).data.sellerId).toBe(seller.sellerId);
    expect(request).toHaveBeenCalledWith('/api/v1/sellers/activation-requests', expect.objectContaining({ expectedStatuses: [201], token: 'synthetic.aws.jwt' }));
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
    expect(pausedAvailabilityBody()).toEqual({ availability: 'Paused' });
  });
  test.each([{ ...product, price: -1 }, { ...product, price: 1.001 }, { ...product, stock: -1 }, { ...product, stock: 1.5 },
    { ...product, categoryId: 'invented' }, { ...product, ingredients: { $ne: null } }, { ...product, sellerId: seller.sellerId }, { ...product, image: 'fake' }])
  ('create inválido no produce DTO enviado: %j', (value) => expect(() => createProductBody(value as typeof product, [category.id])).toThrow());
  test('mutaciones siempre bloqueadas antes de fetch por respuesta/whitelist incompleta', async () => {
    const request = jest.spyOn(httpClient, 'request');
    await expect(productService.create(product, [category.id])).rejects.toMatchObject({ kind: 'contract_unavailable' });
    await expect(productService.update('persistent-id', { price: 50 })).rejects.toMatchObject({ kind: 'contract_unavailable' });
    await expect(productService.pause('persistent-id')).rejects.toMatchObject({ kind: 'contract_unavailable' });
    expect(() => productPatchBody(Object.assign({ price: 50 }, { availability: 'Paused' }))).toThrow();
    expect(request).not.toHaveBeenCalled();
  });
  test('GET productos respeta página/filtros confirmados sin inventar sortBy', async () => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 200, headers: {}, data: { items: [], page: 2, pageSize: 10, total: 0 } });
    expect((await productService.getPage({ search: 'tacos', categoryId: category.id, minPrice: 10, maxPrice: 60, page: 2, pageSize: 10 })).items).toEqual([]);
    expect(request).toHaveBeenCalledWith('/api/v1/products', expect.objectContaining({ query: { search: 'tacos', categoryId: category.id, minPrice: 10, maxPrice: 60, page: 2, pageSize: 10 } }));
  });
  test('producto no vacío y detalle no se decodifican con campos supuestos', async () => {
    jest.spyOn(httpClient, 'request').mockResolvedValueOnce({ status: 200, headers: {}, data: { items: [{ ...product, id: 'server-product' }], page: 1, pageSize: 20, total: 1 } })
      .mockResolvedValueOnce({ status: 200, headers: {}, data: { ...product, id: 'server-product' } });
    await expect(productService.getPage()).rejects.toMatchObject({ kind: 'contract_unavailable' });
    await expect(productService.getById('server-product')).rejects.toMatchObject({ kind: 'contract_unavailable' });
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
