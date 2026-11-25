import { ApiError } from './errors';
import { safeCorrelationId, validationFields, sanitizedBackendMessage, sanitizedBackendDetails, type SafeCatalogRequest } from './requestDiagnostics';

export type MediaStage = 'upload-url' | 'put-s3' | 'confirm' | 'moderation' | 'create-product' | 'patch-product' | 'get-product' | 'read-image';
export interface MediaDiagnostic { stage: MediaStage; method: 'GET' | 'POST' | 'PATCH' | 'PUT'; operation: string; recordedAt: string; failureType: 'validation' | 'client-validation' | 'service' | 'transport' | 'contract' | 'other'; request?: SafeCatalogRequest; validationFields?: string[]; status?: number; code?: string; correlationId?: string; message?: string; messageRedacted?: true; details?: unknown; detail: string }
const last = new Map<MediaStage, MediaDiagnostic>();
/** Whitelisted envelope only, never raw response.message, URL, IDs, file names or headers. */
export function recordMediaFailure(stage: MediaStage, method: MediaDiagnostic['method'], operation: string, error: unknown, receivedStatus?: number): MediaDiagnostic {
  const api = error instanceof ApiError ? error : undefined;
  const body = api?.data && typeof api.data === 'object' && !Array.isArray(api.data) ? api.data as Record<string, unknown> : undefined;
  const code = body && typeof body.code === 'string' && /^(INVALID_OBJECT|ASSET_NOT_FOUND|IMAGE_NOT_APPROVED|IMAGE_NOT_AVAILABLE|UNAUTHORIZED|SELLER_ROLE_REQUIRED|VALIDATION_ERROR|RATE_LIMITED|PRODUCT_NOT_FOUND|PRODUCT_CONFLICT|CATALOG_UNAVAILABLE|MEDIA_UNAVAILABLE|UNAVAILABLE)$/.test(body.code) ? body.code : undefined;
  const correlationId = safeCorrelationId(body?.correlationId) ?? safeCorrelationId(api?.responseCorrelationId);
  const rejected = validationFields(api?.data);
  const status = api?.status ?? receivedStatus;
  const message = sanitizedBackendMessage(body?.message);
  const failureType: MediaDiagnostic['failureType'] = api?.kind === 'network' || api?.kind === 'timeout' ? 'transport' : api?.kind === 'invalid_response' ? 'contract' : api?.kind === 'validation' ? 'client-validation' : status === 400 ? 'validation' : status !== undefined && status >= 500 ? 'service' : 'other';
  const value: MediaDiagnostic = { stage, method, operation, recordedAt: new Date().toISOString(), failureType, ...(api?.diagnosticRequest ? { request: api.diagnosticRequest } : {}), ...(rejected ? { validationFields: rejected } : {}), ...(status !== undefined ? { status } : {}), ...(code ? { code } : {}), ...(correlationId ? { correlationId } : {}),
    ...(message ? { message } : body?.message !== undefined ? { messageRedacted: true as const } : {}),
    ...(body?.details !== undefined ? { details: sanitizedBackendDetails(body.details) } : body?.errors !== undefined ? { details: { errors: sanitizedBackendDetails(body.errors) } } : {}),
    detail: api?.kind === 'invalid_response' ? 'Respuesta incompatible con el contrato.' : api?.kind === 'timeout' ? 'Tiempo de espera agotado; no se reenvió automáticamente.' : api?.kind === 'network' ? 'Error de transporte; no se confirmó el resultado.' : status === 400 ? 'Validación rechazada por el servidor.' : status !== undefined && status >= 500 ? 'Fallo del servicio; no implica ausencia de persistencia.' : 'No se completó esta operación. El cuerpo original se omitió por seguridad.' };
  last.set(stage, value);
  if (__DEV__) console.info('[media-http]', value);
  return value;
}
export function getMediaDiagnostic(stage: MediaStage) { return last.get(stage); }
export async function mediaOperation<T>(stage: MediaStage, method: MediaDiagnostic['method'], operation: string, run: () => Promise<T>): Promise<T> {
  try { return await run(); }
  catch (cause) { recordMediaFailure(stage, method, operation, cause); throw cause; }
}
