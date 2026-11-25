/** Correlation identifiers supported by observed .NET responses, UUID/W3C and hex traces. */
export function safeCorrelationId(value: unknown): string | undefined {
  return typeof value === 'string' && (/^[a-f\d-]{8,100}$/i.test(value) || /^[A-Z0-9]{8,32}:[A-F0-9]{8,16}$/.test(value)) ? value : undefined;
}
export type CatalogSource = 'catalog-service' | 'seller-products' | 'buyer-home' | 'buyer-search' | 'buyer-category' | 'buyer-available' | 'buyer-product-detail' | 'product-image-renewal' | 'seller-editor' | 'seller-create';
export interface SafeCatalogRequest { version: 'catalog-v2'; source: CatalogSource; startedAt: string; method: string; path: string; url?: string; urlRedacted: boolean; query: Record<string, unknown>; body?: Record<string, unknown> }
const fields = ['name', 'description', 'ingredients', 'categoryId', 'price', 'stock', 'imageUrl', 'mediaAssetId'];
function shape(value: unknown): Record<string, unknown> {
  if (value === null) return { type: 'null' };
  if (typeof value === 'string') return { type: 'string', length: value.length, trimmedLength: value.trim().length, hasControl: /[\p{Cc}\p{Cf}]/u.test(value), hasMarkup: /<[^>]+>/.test(value) };
  if (Array.isArray(value)) return { type: 'array', count: value.length, elements: value.slice(0, 50).map(shape) };
  if (typeof value === 'number') return { type: 'number', ...(Number.isFinite(value) ? { value } : {}) };
  return { type: typeof value };
}
export function catalogRequestSummary(method: string, path: string, body: unknown, query: Readonly<Record<string, string | number | undefined>> | undefined, origin?: string, source: CatalogSource = 'catalog-service'): SafeCatalogRequest | undefined {
  if (!/^\/api\/v1\/products(?:\/[A-Za-z0-9%_-]+(?:\/availability)?)?$/.test(path)) return undefined;
  const params: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined) continue; // Exactly as the URL serializer.
    if (['page', 'pageSize', 'minPrice', 'maxPrice'].includes(key) && /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(String(value))) params[key] = String(value);
    else if (key === 'sortBy' && ['createdAtDesc', 'priceAsc', 'priceDesc', 'nameAsc', 'created_desc', 'price_asc', 'price_desc', 'name_asc'].includes(String(value))) params[key] = value;
    else if (key === 'categoryId' && typeof value === 'string' && /^[a-f\d]{24}$/i.test(value)) params[key] = value;
    else if (['search', 'categoryId', 'page', 'pageSize', 'sortBy', 'minPrice', 'maxPrice'].includes(key)) params[key] = ['', 'null', 'undefined'].includes(String(value)) ? String(value) : shape(value);
  }
  let safeBody: Record<string, unknown> | undefined;
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    safeBody = {};
    for (const [key, value] of Object.entries(body)) {
      if (!fields.includes(key)) continue;
      if (key === 'categoryId' && typeof value === 'string' && /^[a-f\d]{24}$/i.test(value)) safeBody[key] = value; // Public category identifier.
      else safeBody[key] = { ...shape(value), ...(key === 'mediaAssetId' ? { objectIdFormat: typeof value === 'string' && /^[a-f\d]{24}$/i.test(value) } : {}) };
    }
    safeBody.unrecognizedFieldCount = Object.keys(body).filter((key) => !fields.includes(key)).length;
  }
  const safePath = path === '/api/v1/products' ? path : '/api/v1/products/{productId}' + (path.endsWith('/availability') ? '/availability' : '');
  let url: string | undefined;
  let urlRedacted = safePath !== path || Object.keys(query ?? {}).some((key) => query?.[key] !== undefined && !(key in params));
  if (origin) {
    try {
      const base = new URL(origin);
      if (base.protocol === 'https:' && !base.username && !base.password && !base.search && !base.hash && base.pathname === '/') {
        const search = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
          if (typeof value === 'string' || typeof value === 'number') search.set(key, String(value));
          else { search.set(key, '[redacted]'); urlRedacted = true; }
        }
        const encoded = search.toString();
        url = `${base.origin}${safePath}${encoded ? '?' + encoded : ''}`;
      }
    } catch { /* Never log an unsafe origin. */ }
  }
  return { version: 'catalog-v2', source, startedAt: new Date().toISOString(), method, path: safePath, ...(url ? { url } : {}), urlRedacted, query: params, ...(safeBody ? { body: safeBody } : {}) };
}

const safeMessages = new Set(['Solicitud inválida.', 'Solicitud inválida', 'Datos de solicitud inválidos', 'Servicio temporalmente no disponible.', 'Servicio temporalmente no disponible', 'Intenta de nuevo más tarde.', 'Producto no disponible.', 'Categoría no disponible.', 'Las imágenes aún no están disponibles; publica el producto sin foto.', 'One or more validation errors occurred.']);
const safeDetailStrings = new Set(['string', 'number', 'integer', 'array', 'null', 'Approved', 'PendingUpload', 'PendingModeration', 'Rejected', 'ProcessingFailed', 'createdAtDesc', 'priceAsc', 'priceDesc', 'nameAsc', 'VALIDATION_ERROR', 'CATALOG_UNAVAILABLE', 'IMAGE_NOT_APPROVED']);
export function sanitizedBackendMessage(value: unknown): string | undefined { return typeof value === 'string' && safeMessages.has(value) ? value : undefined; }
export function sanitizedBackendDetails(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[redacted]';
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : '[redacted]';
  if (typeof value === 'string') return sanitizedBackendMessage(value) ?? (safeDetailStrings.has(value) || fields.includes(value) || ['page', 'pageSize', 'sortBy', 'search', 'minPrice', 'maxPrice'].includes(value) ? value : '[redacted]');
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitizedBackendDetails(item, depth + 1));
  if (!value || typeof value !== 'object') return '[redacted]';
  const allowed = new Set([...fields, ...fields.map((key) => key.charAt(0).toUpperCase() + key.slice(1)), 'page', 'pageSize', 'sortBy', 'search', 'minPrice', 'maxPrice', 'field', 'code', 'message', 'minimum', 'maximum', 'minLength', 'maxLength', 'min', 'max', 'expected', 'actual', 'type', 'allowed', 'allowedSorts', 'maxPageSize', 'minPageSize', 'maxPage', 'errors']);
  const result: Record<string, unknown> = {};
  let omitted = 0;
  for (const [key, item] of Object.entries(value)) {
    if (allowed.has(key)) result[key] = sanitizedBackendDetails(item, depth + 1); else omitted++;
  }
  if (omitted) result.redactedFieldCount = omitted;
  return result;
}
export function validationFields(data: unknown): string[] | undefined {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return undefined;
  const errors = (data as Record<string, unknown>).errors;
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return undefined;
  const names = Object.keys(errors).map((key) => key.replace(/^\$\./, '').split(/[.\[]/)[0]).map((key) => key.charAt(0).toLowerCase() + key.slice(1))
    .filter((key) => fields.includes(key) || ['page', 'pageSize', 'sortBy', 'search', 'minPrice', 'maxPrice'].includes(key));
  return names.length ? [...new Set(names)] : undefined;
}
