import { ApiError } from './errors';
import { PRODUCT_IMAGE_READ_HOSTS } from '@/config/productMedia';

export interface ProductImageFields { imageUrl: string | null; imageUrlExpiresAt: string | null }
export function productImageFields(value: Record<string, unknown>): Partial<ProductImageFields> {
  if (!('imageUrl' in value) && !('imageUrlExpiresAt' in value)) return {}; // Deployed PR27 compatibility.
  if (value.imageUrl === null && value.imageUrlExpiresAt === null) return { imageUrl: null, imageUrlExpiresAt: null };
  if (typeof value.imageUrl === 'string' && typeof value.imageUrlExpiresAt === 'string' && Number.isFinite(Date.parse(value.imageUrlExpiresAt)) && !/[\u0000-\u0020\u007f]/.test(value.imageUrl)) {
    try {
      const u = new URL(value.imageUrl);
      if (u.protocol === 'https:' && PRODUCT_IMAGE_READ_HOSTS.includes(u.hostname) && !u.username && !u.password && !u.port && !u.hash) {
        return { imageUrl: value.imageUrl, imageUrlExpiresAt: value.imageUrlExpiresAt };
      }
    } catch { /* Reject invalid pair; never expose URL in errors. */ }
  }
  throw new ApiError('invalid_response', 'AWS devolvió una referencia de imagen inválida.');
}
