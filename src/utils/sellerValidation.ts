import { ApiError } from '@/services/api/errors';
import type { SellerActivationRequest } from '@/types/api';
import { assertAllowedFields } from './apiValidation';

export function sellerText(value: unknown, min: number, max: number): string {
  if (typeof value !== 'string' || value.length > max * 2 || /[\p{Cc}\p{Cf}]/u.test(value)) {
    throw new ApiError('validation', `Usa texto válido de ${min} a ${max} caracteres, sin caracteres de control.`);
  }
  const normalized = value.normalize('NFC').replace(/\s+/gu, ' ').trim();
  if ([...normalized].length < min || [...normalized].length > max) {
    throw new ApiError('validation', `Usa entre ${min} y ${max} caracteres.`);
  }
  return normalized;
}

export function activationBody(value: SellerActivationRequest): SellerActivationRequest {
  assertAllowedFields(value, ['businessName', 'description', 'pickupPoint']);
  return { businessName: sellerText(value.businessName, 2, 100), description: sellerText(value.description, 10, 1000),
    pickupPoint: sellerText(value.pickupPoint, 2, 200) };
}

export interface DraftImage { uri: string; mimeType: string; bytes: number; width: number; height: number }
export function validateDraftImage(image: DraftImage): DraftImage {
  assertAllowedFields(image, ['uri', 'mimeType', 'bytes', 'width', 'height']);
  if (typeof image.uri !== 'string' || !/^(file|content):\/\//.test(image.uri) || image.uri.length > 2048 ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(image.mimeType) ||
      !Number.isSafeInteger(image.bytes) || image.bytes <= 0 || image.bytes > 5 * 1024 * 1024 ||
      !Number.isSafeInteger(image.width) || !Number.isSafeInteger(image.height) || image.width < 1 || image.height < 1 ||
      image.width > 6000 || image.height > 6000) throw new ApiError('validation', 'Imagen inválida: JPEG/PNG/WebP, hasta 5 MB y 6000 px por lado.');
  return { ...image };
}

export function priceInCents(value: unknown): number {
  if (typeof value !== 'string' || !/^\d{1,6}(\.\d{1,2})?$/.test(value.trim())) throw new ApiError('validation', 'Ingresa un precio MXN positivo con máximo dos decimales.');
  const [units, fraction = ''] = value.trim().split('.');
  const cents = Number(units) * 100 + Number(fraction.padEnd(2, '0'));
  if (cents <= 0) throw new ApiError('validation', 'El precio debe ser mayor que cero.');
  return cents;
}

export interface ProductDraft { name: string; description: string; price: string; categoryId: string;
  availability: 'available' | 'sold-out'; image: DraftImage | null }
/** Local draft only, NOT an AWS request DTO; persistent category IDs must come from its future contract. */
export function validateProductDraft(draft: ProductDraft, categoryIds: readonly string[]) {
  assertAllowedFields(draft, ['name', 'description', 'price', 'categoryId', 'availability', 'image']);
  const name = sellerText(draft.name, 2, 100);
  const description = sellerText(draft.description, 10, 1000);
  const cents = priceInCents(draft.price);
  if (typeof draft.categoryId !== 'string' || !categoryIds.includes(draft.categoryId)) throw new ApiError('validation', 'Falta una categoría válida del catálogo AWS.');
  if (!['available', 'sold-out'].includes(draft.availability)) throw new ApiError('validation', 'Disponibilidad inválida.');
  if (!draft.image) throw new ApiError('validation', 'Falta una imagen validada.');
  return { name, description, cents, categoryId: draft.categoryId, availability: draft.availability, image: validateDraftImage(draft.image) };
}
