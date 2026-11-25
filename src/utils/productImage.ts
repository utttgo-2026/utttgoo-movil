/** Decimal bytes, not MiB. Approved Media limit for the first PR33 release. */
export const MAX_PRODUCT_IMAGE_BYTES = 4_000_000;
export const PRODUCT_IMAGE_TOO_LARGE = 'La fotografía supera el límite de 4 MB. Selecciona una imagen más pequeña.';

export function assertProductImageSize(size: unknown): asserts size is number {
  if (typeof size === 'number' && size > MAX_PRODUCT_IMAGE_BYTES) throw new Error(PRODUCT_IMAGE_TOO_LARGE);
  if (typeof size !== 'number' || !Number.isSafeInteger(size) || size <= 0) throw new Error('No se pudo verificar el tamaño de la fotografía o el archivo está vacío.');
}

export function productImageMime(bytes: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | undefined {
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)) return 'image/png';
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  return undefined;
}
