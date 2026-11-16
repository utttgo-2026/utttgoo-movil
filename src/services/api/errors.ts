export type ApiErrorKind =
  | 'configuration'
  | 'insecure_transport'
  | 'validation'
  | 'unauthenticated'
  | 'http'
  | 'timeout'
  | 'network'
  | 'invalid_response'
  | 'contract_unavailable'
  | 'storage'
  | 'cancelled';

export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    message: string,
    public readonly status?: number,
    /** Diagnóstico interno sin suponer un envelope; no mostrar/loguear respuestas sensibles. */
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
  public code?: string;
}

export function backendHttpError(status: number, data: unknown): ApiError {
  const messages: Record<string, string> = {
    UNAUTHORIZED: httpErrorMessage(401), SELLER_ROLE_REQUIRED: 'AWS requiere permiso Seller para esta operación.',
    CATEGORY_NOT_FOUND: 'AWS no encontró la categoría seleccionada.', PRODUCT_NOT_FOUND: 'AWS no encontró el producto.',
    PRODUCT_CONFLICT: 'El producto cambió o está en conflicto. Consulta su estado antes de repetir.',
    VALIDATION_ERROR: httpErrorMessage(400), RATE_LIMITED: httpErrorMessage(429),
    CATALOG_UNAVAILABLE: 'El catálogo AWS no está disponible temporalmente.', SELLER_UNAVAILABLE: 'El servicio de vendedores no está disponible temporalmente.',
  };
  let code: string | undefined;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const value = data as Record<string, unknown>;
    if (value.status === status && typeof value.correlationId === 'string' && typeof value.message === 'string' &&
        typeof value.code === 'string' && Object.prototype.hasOwnProperty.call(messages, value.code)) code = value.code;
  }
  const error = new ApiError('http', code ? messages[code] : httpErrorMessage(status), status, data);
  error.code = code;
  return error;
}

export function httpErrorMessage(status: number): string {
  switch (status) {
    case 400: return 'La solicitud no cumple las validaciones del servidor.';
    case 401: return 'Acceso no autorizado. Revisa tus credenciales o inicia sesión nuevamente.';
    case 403: return 'No tienes permisos para realizar esta acción.';
    case 404: return 'No se encontró el recurso solicitado.';
    case 422: return 'El servidor no pudo procesar los datos. Revisa el correo institucional y los campos.';
    case 429: return 'Se alcanzó el límite de intentos. Espera antes de intentarlo de nuevo.';
    default: return status >= 500
      ? 'El servidor presentó un error. Intenta más tarde.'
      : 'No se pudo completar la solicitud.';
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : 'No se pudo completar la operación. Intenta nuevamente.';
}
