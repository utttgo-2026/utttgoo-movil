import { productService } from '../productService';
import { HttpClient, httpClient } from '../httpClient';
import { getMediaDiagnostic } from '../mediaDiagnostics';
import * as mediaClient from '../mediaPr33Client';

describe('Regresión del GET400 Catalog', () => {
  afterEach(() => jest.restoreAllMocks());
  test('pageSize100 se rechaza antes de red; pageSize50 se serializa correctamente', async () => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 200, headers: {}, data: { items: [], page: 1, pageSize: 50, totalCount: 0 } });
    await expect(productService.getPage({ pageSize: 100 })).rejects.toMatchObject({ kind: 'validation' });
    expect(request).not.toHaveBeenCalled();
    await productService.getPage({ pageSize: 50 });
    expect(request).toHaveBeenCalledWith('/api/v1/products', expect.objectContaining({ query: { page: 1, pageSize: 50 } }));
  });
  test('parámetros opcionales vacíos no llegan como empty/null/undefined; sort wire camelCase', async () => {
    const transport = jest.fn().mockResolvedValue(new Response(JSON.stringify({ items: [], page: 1, pageSize: 20, totalCount: 0 }), { status: 200 }));
    const client = new HttpClient({ baseUrl: () => 'https://fixture.example.test', fetch: transport });
    jest.spyOn(httpClient, 'request').mockImplementation((path, options) => client.request(path, options));
    await productService.getPage({ search: '  ', categoryId: '', sortBy: 'price_asc' });
    expect(transport.mock.calls[0][0]).toBe('https://fixture.example.test/api/v1/products?sortBy=priceAsc&page=1&pageSize=20');
  });
  test('400 real conserva query serializada y correlación .NET sin reenviar', async () => {
    const transport = jest.fn().mockResolvedValue(new Response(JSON.stringify({ status: 400, code: 'VALIDATION_ERROR', message: 'Solicitud inválida.', correlationId: '0HNQ90MLLHKR1:00000001' }), { status: 400 }));
    const client = new HttpClient({ baseUrl: () => 'https://fixture.example.test', fetch: transport });
    jest.spyOn(httpClient, 'request').mockImplementation((path, options) => client.request(path, options));
    await expect(productService.getPage({}, 'seller-products')).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    expect(getMediaDiagnostic('get-product')).toMatchObject({ status: 400, failureType: 'validation', message: 'Solicitud inválida.', correlationId: '0HNQ90MLLHKR1:00000001', request: { version: 'catalog-v2', source: 'seller-products', url: 'https://fixture.example.test/api/v1/products?page=1&pageSize=20', urlRedacted: false, query: { page: '1', pageSize: '20' } } });
    expect(transport).toHaveBeenCalledTimes(1);
  });
  test('POST503 con referencia de media válida se diagnostica como HTTP, nunca como fallo del DTO de respuesta', async () => {
    jest.spyOn(mediaClient, 'requireRealProductMedia').mockImplementation(() => undefined);
    const transport = jest.fn().mockResolvedValue(new Response(JSON.stringify({ status: 503, code: 'CATALOG_UNAVAILABLE', message: 'Servicio no disponible', correlationId: '0HNQ90MLLHKR1:00000001' }), { status: 503 }));
    const client = new HttpClient({ baseUrl: () => 'https://fixture.example.test', fetch: transport });
    jest.spyOn(httpClient, 'request').mockImplementation((path, options) => client.request(path, options));
    await expect(productService.create('jwt-fixture', { name: 'Tacos', description: 'Fixture description', ingredients: ['Maíz'], categoryId: '507f1f77bcf86cd799439031', price: 25, stock: 4, mediaAssetId: '507f1f77bcf86cd799439011' }, ['507f1f77bcf86cd799439031']))
      .rejects.toMatchObject({ kind: 'http', status: 503, code: 'CATALOG_UNAVAILABLE' });
    const diagnostic = getMediaDiagnostic('create-product');
    expect(diagnostic).toMatchObject({ status: 503, request: { method: 'POST', path: '/api/v1/products', body: { mediaAssetId: { type: 'string', length: 24, objectIdFormat: true } } } });
    expect(JSON.stringify(diagnostic)).not.toMatch(/jwt-fixture|507f1f77bcf86cd799439011|Fixture description/);
    expect(transport).toHaveBeenCalledTimes(1);
  });
});
