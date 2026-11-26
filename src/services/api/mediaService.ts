import { fetch as expoFetch } from 'expo/fetch';
import { readProductImage } from '@/services/productImageFile';
import { MAX_PRODUCT_IMAGE_BYTES } from '@/utils/productImage';
import type { LocalProductPhoto } from '@/services/productPhoto';
import { ApiError } from './errors';
import { httpClient } from './httpClient';
import { mediaConfirmed, mediaPresigned, type MediaConfirmed, type MediaPresigned } from './mediaContracts';
import { requireLegacyMediaUnavailable } from './mediaPr33Client';

const uploadHosts = ['utttgo.s3.us-east-2.amazonaws.com'] as const;
const publicHosts = ['utttgo.s3.amazonaws.com'] as const;
const extensions: Record<LocalProductPhoto['mimeType'], string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

function validBytes(bytes: Uint8Array, mime: LocalProductPhoto['mimeType']): boolean {
  if (mime === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (mime === 'image/png') return bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  return mime === 'image/webp' && bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
}
function validatePhoto(photo: LocalProductPhoto): void {
  if (!photo || !/^(file|content):\/\//i.test(photo.uri) || !Object.hasOwn(extensions, photo.mimeType) ||
      !Number.isSafeInteger(photo.size) || photo.size < 1 || photo.size > MAX_PRODUCT_IMAGE_BYTES) throw new ApiError('validation', 'Fotografía local inválida.');
}

export async function requestMediaUpload(token: string, photo: LocalProductPhoto): Promise<MediaPresigned> {
  requireLegacyMediaUnavailable();
  validatePhoto(photo);
  const checked = await readProductImage(photo.uri, photo.mimeType);
  if (checked.size !== photo.size) throw new ApiError('validation', 'La fotografía cambió. Selecciónala nuevamente.');
  const response = await httpClient.request('/api/v1/media/presigned-url', { method: 'POST', token,
    body: { fileName: `producto.${extensions[photo.mimeType]}`, mimeType: photo.mimeType, size: photo.size }, expectedStatuses: [201] });
  return mediaPresigned(response.data, uploadHosts);
}

/** Binary PUT isolated from API authentication. No signed URL is persisted or logged. */
export async function putMediaUpload(signed: MediaPresigned, photo: LocalProductPhoto): Promise<void> {
  requireLegacyMediaUnavailable();
  validatePhoto(photo);
  const validated = mediaPresigned(signed, uploadHosts);
  let bytes: Uint8Array<ArrayBuffer>;
  try {
    const checked = await readProductImage(photo.uri, photo.mimeType);
    bytes = checked.bytes;
  } catch { throw new ApiError('validation', 'No se pudo leer la fotografía seleccionada.'); }
  if (bytes.length !== photo.size || !validBytes(bytes, photo.mimeType)) throw new ApiError('validation', 'La fotografía cambió o su formato no es válido.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await expoFetch(validated.uploadUrl, { method: 'PUT', headers: { 'Content-Type': photo.mimeType },
      body: new Blob([bytes], { type: photo.mimeType }), redirect: 'error', credentials: 'omit', signal: controller.signal });
    if (!response.ok) throw new ApiError('http', 'No se pudo subir la fotografía.', response.status);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(controller.signal.aborted ? 'timeout' : 'network', 'No se pudo completar la subida de la fotografía.');
  } finally { clearTimeout(timer); }
}

export async function confirmMediaUpload(token: string, assetId: string): Promise<MediaConfirmed> {
  requireLegacyMediaUnavailable();
  const response = await httpClient.request('/api/v1/media/confirm', { method: 'POST', token, body: { assetId }, expectedStatuses: [200] });
  return mediaConfirmed(response.data, assetId, publicHosts);
}

/** Each instance permits one PUT; confirmation can be retried explicitly with the same asset. */
export class MediaUploadAttempt {
  private uploadedAssetId?: string;
  private busy = false;
  private started = false;
  async upload(token: string, photo: LocalProductPhoto): Promise<void> {
    if (this.busy || this.started) throw new ApiError('validation', 'Ya existe una subida en curso o completada.');
    this.busy = true; this.started = true;
    try {
      const signed = await requestMediaUpload(token, photo);
      await putMediaUpload(signed, photo);
      this.uploadedAssetId = signed.assetId;
    } finally { this.busy = false; }
  }
  async confirm(token: string): Promise<MediaConfirmed> {
    if (this.busy || !this.uploadedAssetId) throw new ApiError('validation', 'No hay una subida disponible para confirmar.');
    this.busy = true;
    try { return await confirmMediaUpload(token, this.uploadedAssetId); }
    finally { this.busy = false; }
  }
}
