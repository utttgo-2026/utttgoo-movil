import { fetch as expoFetch } from 'expo/fetch';
import { isRealProductMediaEnabled, productMediaBlockReason, PRODUCT_IMAGE_UPLOAD_HOSTS } from '@/config/productMedia';
import type { LocalProductPhoto } from '@/services/productPhoto';
import { readProductImage } from '@/services/productImageFile';
import { httpClient } from './httpClient';
import { ApiError } from './errors';
import { productImageFields } from './productImageContract';
import { object, invalidContract } from './catalogContracts';
import type { Pr33MediaStatus } from './mediaPr33Simulation';
import { getApiBaseUrl } from './config';
import { recordMediaFailure } from './mediaDiagnostics';

export function requireRealProductMedia(): void {
  if (!isRealProductMediaEnabled()) throw new ApiError('contract_unavailable', productMediaBlockReason() ?? 'Las subidas reales no están habilitadas en esta ejecución.');
  if (getApiBaseUrl() !== 'https://3.129.142.54.nip.io') throw new ApiError('configuration', 'Media real solo está autorizada para el origen HTTPS verificado.');
}
/** Old /presigned-url + assetId + Ready/publicUrl is never an activation path. */
export function requireLegacyMediaUnavailable(): never {
  throw new ApiError('contract_unavailable', 'El adaptador Media anterior está retirado; utiliza upload-url y mediaAssetId.');
}
export interface Pr33Asset { mediaAssetId: string; status: Pr33MediaStatus; imageUrl: string | null; imageUrlExpiresAt: string | null }
function mediaId(id: string): string { if (!/^[a-f\d]{24}$/i.test(id)) throw new ApiError('validation', 'Identificador de media inválido.'); return id; }
function decodeStatus(data: unknown, expected: string): { mediaAssetId: string; status: Pr33MediaStatus } {
  const value = object(data);
  if (value.mediaAssetId !== expected || typeof value.status !== 'string' || !['PendingUpload', 'PendingModeration', 'Approved', 'Rejected', 'ProcessingFailed'].includes(value.status)) return invalidContract();
  return { mediaAssetId: expected, status: value.status as Pr33MediaStatus };
}
export const mediaPr33Client = {
  async upload(token: string, photo: LocalProductPhoto, check: () => void) {
    requireRealProductMedia();
    let stage: 'upload-url' | 'put-s3' = 'upload-url';
    let receivedStatus: number | undefined;
    try {
    const prepared = await readProductImage(photo.uri, photo.mimeType); check();
    const extension = photo.mimeType === 'image/jpeg' ? 'jpg' : photo.mimeType === 'image/png' ? 'png' : 'webp';
    const response = await httpClient.request('/api/v1/media/upload-url', { method: 'POST', token, expectedStatuses: [201],
      body: { fileName: `producto.${extension}`, mimeType: prepared.mimeType, size: prepared.size } }); check();
    receivedStatus = response.status;
    const value = object(response.data); const headers = object(value.headers);
    const contentType = headers['Content-Type'];
    if (typeof value.mediaAssetId !== 'string' || typeof value.uploadUrl !== 'string' || typeof value.expiresAt !== 'string' ||
        !Number.isFinite(Date.parse(value.expiresAt)) || Date.parse(value.expiresAt) <= Date.now() || typeof contentType !== 'string' || contentType !== prepared.mimeType || Object.keys(headers).length !== 1) return invalidContract();
    mediaId(value.mediaAssetId);
    try {
      const url = new URL(value.uploadUrl);
      if (url.protocol !== 'https:' || !PRODUCT_IMAGE_UPLOAD_HOSTS.includes(url.hostname) || url.username || url.password || url.port || url.hash || /[\u0000-\u0020\u007f]/.test(value.uploadUrl)) return invalidContract();
    } catch { return invalidContract(); }
    const controller = new AbortController();
    stage = 'put-s3';
    receivedStatus = undefined;
    const timeout = setTimeout(() => controller.abort(), Math.min(30000, Date.parse(value.expiresAt) - Date.now()));
    try {
      check();
      if (Date.parse(value.expiresAt) <= Date.now()) throw new ApiError('timeout', 'La URL de subida expiró. No se envió el archivo.');
      const put = await expoFetch(value.uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: prepared.bytes, redirect: 'error', credentials: 'omit', signal: controller.signal });
      check(); if (put.status !== 200) {
        const failure = new ApiError('http', 'S3 no confirmó la subida con HTTP 200. No se confirmó el asset.', put.status);
        failure.code = 'S3_UPLOAD_FAILED'; throw failure;
      }
    } catch (cause) {
      if (cause instanceof ApiError) throw cause;
      throw new ApiError(controller.signal.aborted ? 'timeout' : 'network', 'La subida no pudo confirmarse; no se reintentó automáticamente.');
    } finally { clearTimeout(timeout); }
    return value.mediaAssetId;
    } catch (cause) { recordMediaFailure(stage, stage === 'put-s3' ? 'PUT' : 'POST', stage === 'put-s3' ? 'S3 PutObject' : '/api/v1/media/upload-url', cause, receivedStatus); throw cause; }
  },
  async confirm(token: string, id: string) {
    requireRealProductMedia(); mediaId(id);
    let receivedStatus: number | undefined;
    try {
    const response = await httpClient.request('/api/v1/media/confirm', { method: 'POST', token, body: { mediaAssetId: id }, expectedStatuses: [200] });
    receivedStatus = response.status;
    return decodeStatus(response.data, id);
    } catch (cause) { recordMediaFailure('confirm', 'POST', '/api/v1/media/confirm', cause, receivedStatus); throw cause; }
  },
  async status(token: string, id: string): Promise<Pr33Asset> {
    requireRealProductMedia(); mediaId(id);
    let receivedStatus: number | undefined;
    try {
    const response = await httpClient.request(`/api/v1/media/${id}`, { token, expectedStatuses: [200] });
    receivedStatus = response.status;
    const decoded = decodeStatus(response.data, id);
    const image = productImageFields(object(response.data));
    if (image.imageUrl === undefined || image.imageUrlExpiresAt === undefined || (decoded.status !== 'Approved' && (image.imageUrl !== null || image.imageUrlExpiresAt !== null))) return invalidContract();
    return { ...decoded, imageUrl: image.imageUrl, imageUrlExpiresAt: image.imageUrlExpiresAt };
    } catch (cause) { recordMediaFailure('moderation', 'GET', '/api/v1/media/{mediaAssetId}', cause, receivedStatus); throw cause; }
  },
};
