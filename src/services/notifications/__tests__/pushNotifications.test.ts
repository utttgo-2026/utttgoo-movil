import { createPushNotificationClient, type DeviceTokenRegistrationPort, type NotificationTapPayload } from '../pushNotifications';

function dependencies(overrides: Partial<Parameters<typeof createPushNotificationClient>[0]> = {}) {
  const removeReceived = jest.fn();
  const removeResponse = jest.fn();
  const addReceivedListener = jest.fn(() => ({ remove: removeReceived }));
  const addResponseListener = jest.fn(() => ({ remove: removeResponse }));
  return {
    isDevice: true,
    platform: 'android',
    projectId: '52014672-c800-4cf6-af6a-330cb13986e8',
    getPermissions: jest.fn(async () => ({ granted: true } as never)),
    requestPermissions: jest.fn(async () => ({ granted: true } as never)),
    setAndroidChannel: jest.fn(async () => undefined),
    getToken: jest.fn(async () => ({ data: 'push-token-fixture' })),
    addReceivedListener,
    addResponseListener,
    removeReceived,
    removeResponse,
    ...overrides,
  };
}

describe('push notification client', () => {
  test('starts on a physical device and retrieves a token without registering it', async () => {
    const deps = dependencies();
    const client = createPushNotificationClient(deps);
    await expect(client.start()).resolves.toEqual({ status: 'started', token: 'push-token-fixture', registration: 'not-configured' });
    expect(deps.getToken).toHaveBeenCalledWith(deps.projectId);
    expect(deps.addResponseListener).toHaveBeenCalledTimes(1);
  });

  test('handles denied permission', async () => {
    const deps = dependencies({
      getPermissions: jest.fn(async () => ({ granted: false } as never)),
      requestPermissions: jest.fn(async () => ({ granted: false } as never)),
    });
    await expect(createPushNotificationClient(deps).start()).resolves.toEqual({ status: 'permission-denied' });
  });

  test('handles unsupported devices and missing project id', async () => {
    await expect(createPushNotificationClient(dependencies({ isDevice: false })).start()).resolves.toEqual({ status: 'unsupported-device' });
    await expect(createPushNotificationClient(dependencies({ projectId: undefined })).start()).resolves.toEqual({ status: 'missing-project-id' });
  });

  test('creates the Android channel and prevents duplicate listeners', async () => {
    const deps = dependencies();
    const client = createPushNotificationClient(deps);
    await Promise.all([client.start(), client.start()]);
    expect(deps.setAndroidChannel).toHaveBeenCalledTimes(1);
    expect(deps.addReceivedListener).toHaveBeenCalledTimes(1);
    expect(deps.addResponseListener).toHaveBeenCalledTimes(1);
  });

  test('cleans listeners on stop', async () => {
    const deps = dependencies();
    const client = createPushNotificationClient(deps);
    await client.start();
    client.stop();
    expect(deps.removeReceived).toHaveBeenCalledTimes(1);
    expect(deps.removeResponse).toHaveBeenCalledTimes(1);
  });

  test('forwards valid tap payloads and ignores invalid payloads', async () => {
    const deps = dependencies();
    const taps: NotificationTapPayload[] = [];
    const client = createPushNotificationClient(deps, (payload) => taps.push(payload));
    await client.start();
    const responseListenerMock = deps.addResponseListener as jest.Mock;
    const listener = responseListenerMock.mock.calls[0]?.[0] as (response: unknown) => void;
    listener({ notification: { request: { content: { data: { route: '/buyer/orders', params: { orderId: 'order-1' } } } } } });
    listener({ notification: { request: { content: { data: { route: 'javascript:alert(1)' } } } } });
    expect(taps).toEqual([{ route: '/buyer/orders', params: { orderId: 'order-1' } }]);
  });

  test('does not log or register the push token without a backend port', async () => {
    const deps = dependencies();
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    await createPushNotificationClient(deps).start();
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });

  test('registers once after obtaining the token and unregisters on stop', async () => {
    const deps = dependencies();
    const registration: DeviceTokenRegistrationPort = {
      register: jest.fn(async () => ({ deviceTokenId: 'device-1', installationId: 'install-1', platform: 'android', active: true, updatedAt: '2026-11-26T12:00:00Z' })),
      unregister: jest.fn(async () => undefined),
    };
    const client = createPushNotificationClient(deps);
    await expect(client.start({ registration })).resolves.toMatchObject({ status: 'started', registration: 'registered', deviceTokenId: 'device-1' });
    expect(registration.register).toHaveBeenCalledWith(expect.objectContaining({ token: 'push-token-fixture', platform: 'android' }));
    await client.stop({ unregister: true });
    expect(registration.unregister).toHaveBeenCalledWith('device-1');
  });

  test('keeps notification listeners running when backend registration fails', async () => {
    const deps = dependencies();
    const registration: DeviceTokenRegistrationPort = {
      register: jest.fn(async () => { throw new Error('offline'); }),
      unregister: jest.fn(async () => undefined),
    };
    const client = createPushNotificationClient(deps);
    await expect(client.start({ registration })).resolves.toMatchObject({ status: 'started', registration: 'failed' });
    expect(deps.addReceivedListener).toHaveBeenCalledTimes(1);
    expect(deps.addResponseListener).toHaveBeenCalledTimes(1);
  });

  test('does not register the same token twice during one lifecycle', async () => {
    const deps = dependencies();
    const registration: DeviceTokenRegistrationPort = {
      register: jest.fn(async () => ({ deviceTokenId: 'device-1', installationId: 'install-1', platform: 'android', active: true, updatedAt: '2026-11-26T12:00:00Z' })),
      unregister: jest.fn(async () => undefined),
    };
    const client = createPushNotificationClient(deps);
    await client.start({ registration });
    await client.start({ registration });
    expect(registration.register).toHaveBeenCalledTimes(1);
  });

  test('replaces the backend registration after a token change', async () => {
    const deps = dependencies({ getToken: jest.fn()
      .mockResolvedValueOnce({ data: 'push-token-1' })
      .mockResolvedValueOnce({ data: 'push-token-2' }) });
    const registration: DeviceTokenRegistrationPort = {
      register: jest.fn()
        .mockResolvedValueOnce({ deviceTokenId: 'device-1', installationId: 'install-1', platform: 'android', active: true, updatedAt: '2026-11-26T12:00:00Z' })
        .mockResolvedValueOnce({ deviceTokenId: 'device-2', installationId: 'install-1', platform: 'android', active: true, updatedAt: '2026-11-26T12:00:00Z' }),
      unregister: jest.fn(async () => undefined),
    };
    const client = createPushNotificationClient(deps);
    await client.start({ registration });
    await client.stop({ unregister: true });
    await client.start({ registration });
    expect(registration.unregister).toHaveBeenCalledWith('device-1');
    expect(registration.register).toHaveBeenCalledTimes(2);
  });
});
