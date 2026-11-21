import { httpClient } from '../httpClient';
import { ApiError } from '../errors';
import { MediaUploadAttempt, putMediaUpload, requestMediaUpload } from '../mediaService';

const mockPut = jest.fn();
const bytes = new Uint8Array([255, 216, 255, 1]);
jest.mock('expo/fetch', () => ({ fetch: (...args: unknown[]) => mockPut(...args) }));
jest.mock('expo-file-system', () => ({ File: class { exists = true; size = 4; async bytes() { return new Uint8Array([255, 216, 255, 1]); } } }));
const photo = { uri: 'file:///photo.jpg', mimeType: 'image/jpeg' as const, size: 4, width: 100, height: 100 };
const signed = { assetId: 'asset-fixture', uploadUrl: 'https://utttgo.s3.us-east-2.amazonaws.com/object?signature=fixture', expiresAt: '2099-01-01T00:00:00Z' };
const ready = { assetId: signed.assetId, status: 'Ready', publicUrl: 'https://utttgo.s3.amazonaws.com/object' };

describe('Media S3 aislado con transportes simulados', () => {
  beforeEach(() => { jest.clearAllMocks(); mockPut.mockResolvedValue({ ok: true, status: 200 }); });
  afterEach(() => jest.restoreAllMocks());
  test('presigned usa campos confirmados y PUT solo Content-Type, sin Bearer ni multipart', async () => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 201, headers: {}, data: signed });
    expect(await requestMediaUpload('jwt-fixture', photo)).toEqual(signed);
    expect(request).toHaveBeenCalledWith('/api/v1/media/presigned-url', expect.objectContaining({ body: { fileName: 'producto.jpg', mimeType: 'image/jpeg', size: 4 } }));
    await putMediaUpload(signed, photo);
    const [url, options] = mockPut.mock.calls[0];
    expect(url).toBe(signed.uploadUrl); expect(options.headers).toEqual({ 'Content-Type': 'image/jpeg' });
    expect(options.redirect).toBe('error'); expect(options.body).toBeInstanceOf(Blob); expect(options.body.size).toBe(bytes.length);
  });
  test('rechaza host extraño, caducidad y PUT no exitoso', async () => {
    await expect(putMediaUpload({ ...signed, uploadUrl: 'https://other.s3.amazonaws.com/a' }, photo)).rejects.toMatchObject({ kind: 'invalid_response' });
    await expect(putMediaUpload({ ...signed, expiresAt: '2000-01-01T00:00:00Z' }, photo)).rejects.toMatchObject({ kind: 'invalid_response' });
    mockPut.mockResolvedValue({ ok: false, status: 403 });
    await expect(putMediaUpload(signed, photo)).rejects.toMatchObject({ status: 403 });
  });
  test('fallo temporal de confirmación conserva asset para reintento explícito sin otro PUT', async () => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValueOnce({ status: 201, headers: {}, data: signed })
      .mockRejectedValueOnce(new ApiError('timeout', 'fixture')).mockResolvedValueOnce({ status: 200, headers: {}, data: ready });
    const attempt = new MediaUploadAttempt(); await attempt.upload('jwt-fixture', photo);
    await expect(attempt.confirm('jwt-fixture')).rejects.toMatchObject({ kind: 'timeout' });
    await expect(attempt.confirm('jwt-fixture')).resolves.toEqual(ready);
    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenLastCalledWith('/api/v1/media/confirm', expect.objectContaining({ body: { assetId: signed.assetId } }));
    await expect(attempt.upload('jwt-fixture', photo)).rejects.toMatchObject({ kind: 'validation' });
  });
  test('rechazo de moderación o URL pública ajena no devuelve Ready', async () => {
    jest.spyOn(httpClient, 'request').mockResolvedValueOnce({ status: 201, headers: {}, data: signed })
      .mockResolvedValueOnce({ status: 200, headers: {}, data: { ...ready, status: 'Rejected' } })
      .mockResolvedValueOnce({ status: 200, headers: {}, data: { ...ready, publicUrl: 'https://evil.test/x' } });
    const attempt = new MediaUploadAttempt(); await attempt.upload('jwt-fixture', photo);
    await expect(attempt.confirm('jwt-fixture')).rejects.toMatchObject({ kind: 'invalid_response' });
    await expect(attempt.confirm('jwt-fixture')).rejects.toMatchObject({ kind: 'invalid_response' });
    expect(mockPut).toHaveBeenCalledTimes(1);
  });
});
