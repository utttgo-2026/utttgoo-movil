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
}

export function httpErrorMessage(status: number): string {
  switch (status) {
    case 400: return 'La solicitud no cumple las validaciones del servidor.';
    case 401: return 'Acceso no autorizado. Revisa tus credenciales o inicia sesión nuevamente.';
    case 403: return 'No tienes permisos para realizar esta acción.';
    case 404: return 'No se encontró el recurso solicitado.';
    case 422: return 'El servidor no pudo procesar los datos. Revisa el correo institucional y los campos.';
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
