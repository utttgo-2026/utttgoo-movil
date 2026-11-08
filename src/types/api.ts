export interface ApiError {
  correlationId: string;
  status: number;
  code: string;
  message: string;
}

export function isApiError(value: unknown): value is ApiError {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.correlationId === 'string' &&
    typeof candidate.status === 'number' &&
    typeof candidate.code === 'string' &&
    typeof candidate.message === 'string'
  );
}

export function parseApiError(value: unknown, status = 500): ApiError {
  if (isApiError(value)) {
    return value;
  }

  return {
    correlationId: '',
    status,
    code: 'UNKNOWN_ERROR',
    message: 'Ocurrió un error inesperado.',
  };
}
