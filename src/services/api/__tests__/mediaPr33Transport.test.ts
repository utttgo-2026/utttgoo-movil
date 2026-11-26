import { httpClient } from '../httpClient';
import { mediaPr33Client } from '../mediaPr33Client';
import { productPatchBody, productService } from '../productService';
import { productMetadata } from '../../__fixtures__/product';
import { backendHttpError } from '../errors';
import { getMediaDiagnostic } from '../mediaDiagnostics';

// Enable only within this isolated Jest module to exercise the prepared HTTP adapter.
jest.mock('@/config/productMedia', () => ({ ...jest.requireActual('@/config/productMedia'), isRealProductMediaEnabled: () => true }));
jest.mock('../config', () => ({ getApiBaseUrl: () => 'https://3.129.142.54.nip.io' }));
const mockPut = jest.fn();
const mockFileBytes = new Uint8Array([255, 216, 255, 1]);
jest.mock('expo/fetch', () => ({ fetch: (...args: unknown[]) => mockPut(...args) }));
jest.mock('expo-file-system', () => ({ File: class { exists = true; size = 4; async bytes() { return mockFileBytes; } } }));
const assetId = '507f1f77bcf86cd799439011';
const photo = { uri: 'file:///fixture.jpg', mimeType: 'image/jpeg' as const, size: 4, width: 100, height: 100 };
const signed = { mediaAssetId: assetId, uploadUrl: 'https://utttgo.s3.us-east-2.amazonaws.com/a?signature=fixture', expiresAt: '2099-01-01T00:00:00Z', headers: { 'Content-Type': 'image/jpeg' } };
describe('Adaptador tipado PR33 con HTTP y PUT simulados', () => {
  beforeEach(() => { mockPut.mockResolvedValue({ ok: true, status: 200 }); });
  afterEach(() => { jest.restoreAllMocks(); mockPut.mockReset(); });
  test('intención, PUT exacto sin Bearer, confirmación pendiente y estado aprobado', async () => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValueOnce({ status: 201, headers: {}, data: signed })
      .mockResolvedValueOnce({ status: 200, headers: {}, data: { mediaAssetId: assetId, status: 'PendingModeration' } })
      .mockResolvedValueOnce({ status: 200, headers: {}, data: { mediaAssetId: assetId, status: 'Approved', imageUrl: 'https://utttgo.s3.amazonaws.com/a?signature=fixture', imageUrlExpiresAt: '2099-01-01T00:00:00Z' } });
    const check = jest.fn();
    expect(await mediaPr33Client.upload('jwt-fixture', photo, check)).toBe(assetId);
    expect(request).toHaveBeenCalledWith('/api/v1/media/upload-url', expect.objectContaining({ body: { fileName: 'producto.jpg', mimeType: 'image/jpeg', size: 4 } }));
    expect(mockPut).toHaveBeenCalledWith(signed.uploadUrl, expect.objectContaining({ method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, redirect: 'error', credentials: 'omit', body: new Uint8Array([255, 216, 255, 1]) }));
    expect(await mediaPr33Client.confirm('jwt-fixture', assetId)).toEqual({ mediaAssetId: assetId, status: 'PendingModeration' });
    expect((await mediaPr33Client.status('jwt-fixture', assetId)).status).toBe('Approved');
    expect(request).toHaveBeenCalledWith('/api/v1/media/confirm', expect.objectContaining({ body: { mediaAssetId: assetId } }));
    expect(request.mock.calls.map(([path]) => path)).toEqual(['/api/v1/media/upload-url', '/api/v1/media/confirm', `/api/v1/media/${assetId}`]);
    expect(mockPut.mock.calls[0][1].headers).toEqual(signed.headers);
  });
  test('rechaza headers adicionales y destinos ajenos sin PUT', async () => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 201, headers: {}, data: { ...signed, headers: { ...signed.headers, Authorization: 'injected' } } });
    await expect(mediaPr33Client.upload('fixture', photo, () => undefined)).rejects.toMatchObject({ kind: 'invalid_response' });
    request.mockResolvedValue({ status: 201, headers: {}, data: { ...signed, uploadUrl: 'https://evil.test/x' } });
    await expect(mediaPr33Client.upload('fixture', photo, () => undefined)).rejects.toMatchObject({ kind: 'invalid_response' });
    expect(mockPut).not.toHaveBeenCalled();
  });
  test('PATCH distingue conservar, quitar y reemplazar', () => {
    expect(productPatchBody({ stock: 4 })).toEqual({ stock: 4 });
    expect(productPatchBody({ mediaAssetId: null })).toEqual({ mediaAssetId: null });
    expect(productPatchBody({ mediaAssetId: assetId })).toEqual({ mediaAssetId: assetId });
  });
  test.each([201, 204, 301, 400, 403])('PUT HTTP %i nunca permite confirmación', async (status) => {
    jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 201, headers: {}, data: signed });
    mockPut.mockResolvedValue({ status, ok: status < 300 });
    await expect(mediaPr33Client.upload('fixture', photo, () => undefined)).rejects.toMatchObject({ status, code: 'S3_UPLOAD_FAILED' });
  });
  test('size y binario son exactamente los mismos aunque el selector informe tamaño viejo', async () => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 201, headers: {}, data: signed });
    await mediaPr33Client.upload('fixture', { ...photo, size: 200 }, () => undefined);
    expect(request).toHaveBeenCalledWith('/api/v1/media/upload-url', expect.objectContaining({ body: expect.objectContaining({ size: 4 }) }));
    expect(mockPut.mock.calls[0][1].body).toEqual(new Uint8Array([255, 216, 255, 1]));
    expect(mockPut.mock.calls[0][1].body.byteLength).toBe(4);
    expect(mockPut.mock.calls[0][1].body).toBe(mockFileBytes);
  });
  test('422 IMAGE_NOT_APPROVED conserva error real, registra cuerpo sanitizado y no cambia a POST al editar', async () => {
    const correlationId = '01234567-89ab-cdef-0123-456789abcdef';
    const failure = backendHttpError(422, { status: 422, code: 'IMAGE_NOT_APPROVED', correlationId, message: 'private body' });
    const request = jest.spyOn(httpClient, 'request').mockRejectedValue(failure);
    await expect(productService.update('fixture', 'product-fixture', { mediaAssetId: assetId })).rejects.toBe(failure);
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith('/api/v1/products/product-fixture', expect.objectContaining({ method: 'PATCH', body: { mediaAssetId: assetId } }));
    expect(getMediaDiagnostic('patch-product')).toMatchObject({ stage: 'patch-product', status: 422, code: 'IMAGE_NOT_APPROVED', correlationId });
    expect(JSON.stringify(getMediaDiagnostic('patch-product'))).not.toContain('private body');
  });
  test('POST/PATCH asocian mediaAssetId y exigen la imagen en respuesta; PATCH null exige eliminación', async () => {
    const input = { name: 'Tacos', description: 'Fixture', ingredients: [], categoryId: 'category-fixture', price: 25, stock: 4 };
    const product = { ...input, ...productMetadata, id: 'product-fixture', sellerId: 'seller-fixture', status: 'Active', imageUrl: 'https://utttgo-images-2427dbc8.s3.us-east-2.amazonaws.com/a?signature=fixture', imageUrlExpiresAt: '2099-01-01T00:00:00Z' };
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 201, headers: {}, data: product });
    expect((await productService.create('jwt-fixture', { ...input, mediaAssetId: assetId }, [input.categoryId])).imageUrl).toBe(product.imageUrl);
    expect(request).toHaveBeenLastCalledWith('/api/v1/products', expect.objectContaining({ method: 'POST', body: { ...input, mediaAssetId: assetId, imageUrl: null } }));
    request.mockResolvedValue({ status: 200, headers: {}, data: product });
    await productService.update('jwt-fixture', product.id, { mediaAssetId: assetId });
    expect(request).toHaveBeenLastCalledWith(`/api/v1/products/${product.id}`, expect.objectContaining({ method: 'PATCH', body: { mediaAssetId: assetId } }));
    await expect(productService.update('jwt-fixture', product.id, { mediaAssetId: null })).rejects.toMatchObject({ kind: 'invalid_response' });
    request.mockResolvedValue({ status: 200, headers: {}, data: { ...product, imageUrl: null, imageUrlExpiresAt: null } });
    expect((await productService.update('jwt-fixture', product.id, { mediaAssetId: null })).imageUrl).toBeNull();
    await expect(productService.update('jwt-fixture', product.id, { mediaAssetId: assetId })).rejects.toMatchObject({ kind: 'invalid_response' });
  });
});
