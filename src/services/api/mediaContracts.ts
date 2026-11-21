import { ApiError } from './errors';

export interface MediaPresigned { assetId: string; uploadUrl: string; expiresAt: string }
export interface MediaConfirmed { assetId: string; publicUrl: string; status: 'Ready' }

function invalid(): never { throw new ApiError('invalid_response', 'La respuesta de media no cumple el contrato autorizado.'); }
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  return value as Record<string, unknown>;
}
function assetId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 256 && /^[A-Za-z0-9_-]+$/.test(value);
}
/** Exact allowlisted hosts only; the returned string is never normalized or reconstructed. */
function allowedUrl(value: unknown, allowedHosts: readonly string[]): value is string {
  if (typeof value !== 'string' || value.length > 8192 || /[\u0000-\u0020\u007f]/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.hash &&
      allowedHosts.some((host) => host === url.hostname && host === host.toLowerCase());
  } catch { return false; }
}
export function mediaPresigned(value: unknown, allowedHosts: readonly string[], now = Date.now()): MediaPresigned {
  const data = record(value);
  if (!assetId(data.assetId) || !allowedUrl(data.uploadUrl, allowedHosts) || typeof data.expiresAt !== 'string' ||
      !Number.isFinite(Date.parse(data.expiresAt)) || Date.parse(data.expiresAt) <= now) return invalid();
  return { assetId: data.assetId, uploadUrl: data.uploadUrl, expiresAt: data.expiresAt };
}
export function mediaConfirmed(value: unknown, expectedAssetId: string, allowedHosts: readonly string[]): MediaConfirmed {
  const data = record(value);
  if (!assetId(expectedAssetId) || data.assetId !== expectedAssetId || data.status !== 'Ready' || !allowedUrl(data.publicUrl, allowedHosts)) return invalid();
  return { assetId: expectedAssetId, publicUrl: data.publicUrl, status: 'Ready' };
}
