import type { ApiResponse, HealthResponse } from '@/types/api';

import { ApiError } from './errors';
import { httpClient } from './httpClient';

function isHealthResponse(value: unknown): value is HealthResponse {
  if (!value || typeof value !== 'object' || !('status' in value) || typeof value.status !== 'string' ||
      !('checks' in value) || !value.checks || typeof value.checks !== 'object') return false;
  return 'mongodb' in value.checks && typeof value.checks.mongodb === 'string' &&
    'redis' in value.checks && typeof value.checks.redis === 'string';
}

export const healthService = {
  async getHealth(): Promise<ApiResponse<HealthResponse>> {
    const response = await httpClient.request('/health', { expectedStatuses: [200] });
    if (!isHealthResponse(response.data)) {
      throw new ApiError('invalid_response', 'La respuesta de salud no contiene los campos observados del servidor.', response.status);
    }
    return { ...response, data: response.data };
  },
};
