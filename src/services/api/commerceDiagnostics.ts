interface ImageDiagnostic {
  event: 'image_not_available'; method: 'POST'; path: '/api/v1/products';
  status: 422; code: 'IMAGE_NOT_AVAILABLE'; timestamp: string;
}
let latest: ImageDiagnostic | undefined;

/** Fixed projection only: never accepts bodies, URLs, credentials, notes, IDs or raw errors. */
export function productImageUnavailableDiagnostic(): void {
  latest = { event: 'image_not_available', method: 'POST', path: '/api/v1/products',
    status: 422, code: 'IMAGE_NOT_AVAILABLE', timestamp: new Date().toISOString() };
  if (__DEV__) console.info('[aws-commerce]', { ...latest });
}
export function getLatestCommerceDiagnostic(): Readonly<ImageDiagnostic> | undefined {
  return latest ? { ...latest } : undefined;
}
