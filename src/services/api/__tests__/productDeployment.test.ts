import { productMetadata } from '../../__fixtures__/product';
import { productResponse, productPageResponse } from '../catalogContracts';
import { productService } from '../productService';
import { httpClient } from '../httpClient';

const product = { ...productMetadata, id: 'persistent-product-fixture', sellerId: 'persistent-seller-fixture', categoryId: 'persistent-category-fixture',
  name: 'Alimento fixture', description: 'Descripción fixture', ingredients: ['Maíz'], price: 35.25, stock: 4, status: 'Active' };
describe('DTO producto completo del OpenAPI desplegado', () => {
  afterEach(() => jest.restoreAllMocks());
  test('conserva metadata real/nulabilidad sin exigir ni fabricar imageUrl', () => {
    expect(productResponse(product)).toEqual(product);
    expect(productResponse({ ...product, sellerDisplayName: 'Negocio fixture', categoryName: 'Categoría fixture', ratingAverage: 4.2, ratingCount: 3 }))
      .toMatchObject({ sellerDisplayName: 'Negocio fixture', categoryName: 'Categoría fixture', ratingAverage: 4.2, ratingCount: 3 });
    expect(productResponse(product)).not.toHaveProperty('imageUrl');
  });
  test.each(['sellerDisplayName', 'categoryName', 'ratingAverage', 'ratingCount', 'createdAt', 'updatedAt', 'isAvailable'])('propiedad obligatoria%s no se sustituye por un default', (key) => {
    const value: Record<string, unknown> = { ...product }; delete value[key];
    expect(() => productResponse(value)).toThrow();
  });
  test('solo las cadenas numéricas documentadas se normalizan', () => {
    expect(productResponse({ ...product, price: '35.25', stock: '4', ratingAverage: '4.25', ratingCount: '3' }))
      .toMatchObject({ price: 35.25, stock: 4, ratingAverage: 4.25, ratingCount: 3 });
    for (const stock of [true, ' 4 ', '04', '4e1', '4.0', { $gt: 0 }, '9007199254740993']) expect(() => productResponse({ ...product, stock })).toThrow();
    for (const extra of [{ ratingCount: -1 }, { ratingAverage: {} }, { createdAt: 'bad-date' }, { isAvailable: null }]) expect(() => productResponse({ ...product, ...extra })).toThrow();
  });
  test('página exige totalCount y metadata comprobada', () => {
    expect(productPageResponse({ items: [product], page: '1', pageSize: '20', totalCount: '1' })).toEqual({ items: [product], page: 1, pageSize: 20, totalCount: 1 });
    for (const extra of [{ total: 1 }, { totalCount: '9007199254740993' }, { totalCount: -1 }])
      expect(() => productPageResponse({ items: [product], page: 1, pageSize: 20, ...extra })).toThrow();
  });
  test('created_desc se bloquea sin petición; no inventa un sort sustituto', async () => {
    const request = jest.spyOn(httpClient, 'request');
    await expect(productService.getPage({ sortBy: 'created_desc' })).rejects.toMatchObject({ kind: 'contract_unavailable' });
    expect(request).not.toHaveBeenCalled();
  });
});
