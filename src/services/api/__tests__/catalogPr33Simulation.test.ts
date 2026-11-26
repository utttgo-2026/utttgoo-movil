import { Pr33CatalogSimulation } from '../catalogPr33Simulation';
import { Pr33MediaSimulation, type Pr33SimulationTransport } from '../mediaPr33Simulation';
import { productMetadata } from '../../__fixtures__/product';

const asset = '507f1f77bcf86cd799439011';
jest.mock('expo-file-system', () => ({ File: class { exists = true; size = 4; async bytes() { return new Uint8Array([255, 216, 255, 1]); } } }));
const productId = '507f1f77bcf86cd799439021';
const product = { ...productMetadata, id: productId, sellerId: 'seller-fixture', categoryId: 'category-fixture', name: 'Tacos', description: 'Del campus', ingredients: ['Maíz'], price: 25, stock: 2, status: 'Active', imageUrl: null, imageUrlExpiresAt: null };
const input = { name: product.name, description: product.description, ingredients: product.ingredients, categoryId: product.categoryId, price: product.price, stock: product.stock };
const photo = { uri: 'file:///fixture.jpg', mimeType: 'image/jpeg' as const, size: 4, width: 50, height: 50 };
describe('Catalog PR33 solo simulación', () => {
  test('sin foto omite mediaAssetId; doble POST bloqueado', async () => {
    const request = jest.fn().mockResolvedValue(product); const transport: Pr33SimulationTransport = { request, put: jest.fn() };
    const catalog = new Pr33CatalogSimulation(transport);
    expect((await catalog.create(input)).imageUrl).toBeNull();
    expect(request).toHaveBeenCalledWith('/api/v1/products', 'POST', input);
    await expect(catalog.create(input)).rejects.toThrow(); expect(request).toHaveBeenCalledTimes(1);
  });
  test('POST incierto no se repite automáticamente ni manualmente en el mismo intento', async () => {
    const request = jest.fn().mockRejectedValue(new Error('timeout'));
    const catalog = new Pr33CatalogSimulation({ request, put: jest.fn() });
    await expect(catalog.create(input)).rejects.toThrow();
    await expect(catalog.create(input)).rejects.toThrow();
    expect(request).toHaveBeenCalledTimes(1);
  });
  test('asocia solo Approved y PATCH null quita la imagen', async () => {
    const request = jest.fn().mockResolvedValueOnce({ mediaAssetId: asset, uploadUrl: 'https://upload.example.test/a', expiresAt: '2099-01-01T00:00:00Z', headers: { 'Content-Type': 'image/jpeg' } })
      .mockResolvedValueOnce({ mediaAssetId: asset, status: 'PendingModeration' })
      .mockResolvedValueOnce({ mediaAssetId: asset, status: 'Approved', imageUrl: 'https://images.example.test/a', imageUrlExpiresAt: '2099-01-01T00:00:00Z' })
      .mockResolvedValue(product);
    const transport: Pr33SimulationTransport = { request, put: jest.fn() };
    const media = new Pr33MediaSimulation(transport, 'upload.example.test', 'images.example.test');
    const catalog = new Pr33CatalogSimulation(transport);
    await media.upload(photo); await expect(catalog.create(input, media)).rejects.toThrow();
    await media.checkStatus(); await catalog.create(input, media);
    expect(request).toHaveBeenCalledWith('/api/v1/products', 'POST', { ...input, mediaAssetId: asset });
    await catalog.patchImage(productId, null);
    expect(request).toHaveBeenLastCalledWith(`/api/v1/products/${productId}`, 'PATCH', { mediaAssetId: null });
  });
  test('URL expirada se renueva por GET una vez; fallo posterior usa placeholder', async () => {
    const request = jest.fn().mockResolvedValueOnce({ ...product, imageUrl: 'https://images.example.test/a?new=1', imageUrlExpiresAt: '2030-01-01T00:00:00Z' });
    const catalog = new Pr33CatalogSimulation({ request, put: jest.fn() });
    const expired = { ...product, status: 'Active' as const, imageUrl: 'https://images.example.test/a?old=1', imageUrlExpiresAt: '2020-01-01T00:00:00Z' };
    expect((await catalog.refreshExpired(expired, Date.parse('2026-01-01'))).imageUrl).toContain('new=1');
    expect((await catalog.refreshExpired(expired, Date.parse('2026-01-01'))).imageUrl).toBeNull();
    expect(request).toHaveBeenCalledTimes(1);
  });
});
