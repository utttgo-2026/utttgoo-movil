import { ApiError } from '../errors';
import { httpClient } from '../httpClient';
import { notificationService } from '../notificationService';

describe('notification device token service', () => {
  const request = jest.spyOn(httpClient, 'request');
  beforeEach(() => request.mockReset());

  test('registers the exact backend payload and decodes 201', async () => {
    request.mockResolvedValue({ status: 201, headers: {}, data: {
      deviceTokenId: 'device-1', installationId: 'install-1', platform: 'android', active: true, updatedAt: '2026-11-26T12:00:00Z',
    }});
    await expect(notificationService.register('jwt', {
      token: 'push-token', installationId: 'install-1', platform: 'android', appVersion: '1.2.0',
    })).resolves.toMatchObject({ deviceTokenId: 'device-1' });
    expect(request).toHaveBeenCalledWith('/api/v1/notifications/device-tokens', expect.objectContaining({ method: 'POST', token: 'jwt', body: {
      token: 'push-token', installationId: 'install-1', platform: 'android', appVersion: '1.2.0',
    }, expectedStatuses: [200, 201] }));
  });

  test('deletes the backend identifier with 204', async () => {
    request.mockResolvedValue({ status: 204, headers: {}, data: null });
    await expect(notificationService.unregister('jwt', 'device-1')).resolves.toBeUndefined();
    expect(request).toHaveBeenCalledWith('/api/v1/notifications/device-tokens/device-1', expect.objectContaining({ method: 'DELETE', token: 'jwt', expectedStatuses: [204] }));
  });

  test('rejects malformed response', async () => {
    request.mockResolvedValue({ status: 200, headers: {}, data: {} });
    await expect(notificationService.register('jwt', {
      token: 'push-token', installationId: null, platform: 'android', appVersion: '1.2.0',
    })).rejects.toBeInstanceOf(ApiError);
  });
});
