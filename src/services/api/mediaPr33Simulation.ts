import { ApiError } from './errors';
import type { LocalProductPhoto } from '@/services/productPhoto';
import type { JsonValue } from '@/types/api';
import { readProductImage } from '@/services/productImageFile';

export type Pr33MediaStatus = 'PendingUpload' | 'PendingModeration' | 'Approved' | 'Rejected' | 'ProcessingFailed';
type ResponseValue = unknown;
/** Test-only transport: no default implementation and no access to the AWS session. */
export interface Pr33SimulationTransport {
  request(path: string, method: 'GET' | 'POST' | 'PATCH', body?: { [key: string]: JsonValue }): Promise<ResponseValue>;
  put(url: string, mimeType: LocalProductPhoto['mimeType'], photo: LocalProductPhoto): Promise<void>;
}
const states: readonly string[] = ['PendingUpload', 'PendingModeration', 'Approved', 'Rejected', 'ProcessingFailed'];
function invalid(): never { throw new ApiError('invalid_response', 'La respuesta de media no cumple el contrato PR33.'); }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  return value as Record<string, unknown>;
}
function id(value: unknown): value is string { return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value); }
function safeUrl(value: unknown, host: string): value is string {
  if (typeof value !== 'string' || value.length > 8192 || /[\u0000-\u0020\u007f]/.test(value)) return false;
  try { const u = new URL(value); return u.protocol === 'https:' && u.hostname === host && !u.port && !u.username && !u.password && !u.hash; }
  catch { return false; }
}
function status(value: unknown, expected: string): Pr33MediaStatus {
  const v = object(value);
  if (v.mediaAssetId !== expected || typeof v.status !== 'string' || !states.includes(v.status)) return invalid();
  return v.status as Pr33MediaStatus;
}
export class Pr33MediaSimulation {
  private asset?: string;
  private putComplete = false;
  private busy = false;
  private started = false;
  private current?: Pr33MediaStatus;
  constructor(private readonly transport: Pr33SimulationTransport, private readonly uploadHost: string, private readonly readHost: string) {
    if (!__DEV__ || uploadHost !== 'upload.example.test' || readHost !== 'images.example.test') throw new ApiError('configuration', 'Simulación Media disponible solo con fixtures de desarrollo.');
  }
  async upload(photo: LocalProductPhoto): Promise<Pr33MediaStatus> {
    if (this.busy || this.started) throw new ApiError('validation', 'Ya existe un intento de fotografía.');
    if (!photo) throw new ApiError('validation', 'Fotografía inválida.');
    this.busy = true; this.started = true;
    try {
      const checked = await readProductImage(photo.uri, photo.mimeType);
      if (checked.size !== photo.size) throw new ApiError('validation', 'La fotografía cambió. Selecciónala nuevamente.');
      const extension = photo.mimeType === 'image/jpeg' ? 'jpg' : photo.mimeType === 'image/png' ? 'png' : 'webp';
      const data = object(await this.transport.request('/api/v1/media/upload-url', 'POST', { fileName: `producto.${extension}`, mimeType: photo.mimeType, size: photo.size }));
      const headers = object(data.headers);
      if (!id(data.mediaAssetId) || !safeUrl(data.uploadUrl, this.uploadHost) || typeof data.expiresAt !== 'string' || !Number.isFinite(Date.parse(data.expiresAt)) || Date.parse(data.expiresAt) <= Date.now() || headers['Content-Type'] !== photo.mimeType || Object.keys(headers).length !== 1) return invalid();
      this.asset = data.mediaAssetId;
      await this.transport.put(data.uploadUrl, photo.mimeType, photo);
      this.putComplete = true;
      return await this.confirmInternal();
    } finally { this.busy = false; }
  }
  private async confirmInternal(): Promise<Pr33MediaStatus> {
    if (!this.asset || !this.putComplete) throw new ApiError('validation', 'No existe una subida confirmable.');
    this.current = status(await this.transport.request('/api/v1/media/confirm', 'POST', { mediaAssetId: this.asset }), this.asset);
    return this.current;
  }
  async retryConfirmation(): Promise<Pr33MediaStatus> {
    if (this.busy) throw new ApiError('validation', 'Operación de fotografía en curso.');
    this.busy = true; try { return await this.confirmInternal(); } finally { this.busy = false; }
  }
  async checkStatus(): Promise<Pr33MediaStatus> {
    if (this.busy || !this.asset || !this.putComplete) throw new ApiError('validation', 'No hay fotografía para consultar.');
    this.busy = true;
    try {
      const value = object(await this.transport.request(`/api/v1/media/${this.asset}`, 'GET'));
      const result = status(value, this.asset);
      if (result === 'Approved') {
        if (!safeUrl(value.imageUrl, this.readHost) || typeof value.imageUrlExpiresAt !== 'string' || !Number.isFinite(Date.parse(value.imageUrlExpiresAt))) return invalid();
      } else if (value.imageUrl !== null || value.imageUrlExpiresAt !== null) return invalid();
      this.current = result; return result;
    } finally { this.busy = false; }
  }
  approvedAssetId(): string | undefined { return this.current === 'Approved' ? this.asset : undefined; }
}
