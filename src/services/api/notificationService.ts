import { ApiError } from './errors';
import { httpClient } from './httpClient';

export interface RegisterDeviceTokenRequest {
  token: string;
  installationId: string | null;
  platform: string | null;
  appVersion: string | null;
}

export interface DeviceTokenResponse {
  deviceTokenId: string;
  installationId: string;
  platform: string;
  active: boolean;
  updatedAt: string;
}

function decodeDeviceTokenResponse(value: unknown): DeviceTokenResponse {
  if (typeof value !== 'object' || value === null) throw new ApiError('invalid_response', 'La API devolvió un registro de notificaciones inválido.');
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.deviceTokenId !== 'string' || !candidate.deviceTokenId ||
      typeof candidate.installationId !== 'string' || typeof candidate.platform !== 'string' ||
      typeof candidate.active !== 'boolean' || typeof candidate.updatedAt !== 'string' ||
      !Number.isFinite(Date.parse(candidate.updatedAt))) {
    throw new ApiError('invalid_response', 'La API devolvió un registro de notificaciones inválido.');
  }
  return {
    deviceTokenId: candidate.deviceTokenId,
    installationId: candidate.installationId,
    platform: candidate.platform,
    active: candidate.active,
    updatedAt: candidate.updatedAt,
  };
}

export const notificationService = {
  async register(token: string, input: RegisterDeviceTokenRequest): Promise<DeviceTokenResponse> {
    const response = await httpClient.request('/api/v1/notifications/device-tokens', {
      method: 'POST', token,
      body: { token: input.token, installationId: input.installationId, platform: input.platform, appVersion: input.appVersion },
      expectedStatuses: [200, 201],
    });
    return decodeDeviceTokenResponse(response.data);
  },

  async unregister(token: string, deviceTokenId: string): Promise<void> {
    if (!deviceTokenId.trim()) throw new ApiError('validation', 'El identificador de notificaciones es inválido.');
    await httpClient.request(`/api/v1/notifications/device-tokens/${encodeURIComponent(deviceTokenId)}`, {
      method: 'DELETE', token, expectedStatuses: [204],
    });
  },
};
