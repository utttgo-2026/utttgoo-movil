import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';
import type { DeviceTokenResponse, RegisterDeviceTokenRequest } from '@/services/api/notificationService';

export const BACKEND_DEVICE_TOKEN_REGISTRATION = 'AVAILABLE' as const;

export interface DeviceTokenRegistrationPort {
  register: (input: RegisterDeviceTokenRequest) => Promise<DeviceTokenResponse>;
  unregister: (deviceTokenId: string) => Promise<void>;
}

export interface NotificationTapPayload {
  route: string;
  params?: Record<string, string>;
}

export type PushNotificationResult =
  | { status: 'started'; token: string; registration: 'registered' | 'failed' | 'not-configured'; deviceTokenId?: string }
  | { status: 'permission-denied' }
  | { status: 'unsupported-device' }
  | { status: 'missing-project-id' }
  | { status: 'error'; error: unknown };

interface NotificationSubscription {
  remove: () => void;
}

export interface PushNotificationStartOptions {
  registration?: DeviceTokenRegistrationPort;
}

interface PushNotificationDependencies {
  isDevice: boolean;
  platform: string;
  projectId?: string;
  getPermissions: () => Promise<Notifications.NotificationPermissionsStatus>;
  requestPermissions: () => Promise<Notifications.NotificationPermissionsStatus>;
  setAndroidChannel: () => Promise<void>;
  getToken: (projectId: string) => Promise<{ data: string }>;
  addReceivedListener: (listener: (notification: Notifications.Notification) => void) => NotificationSubscription;
  addResponseListener: (listener: (response: Notifications.NotificationResponse) => void) => NotificationSubscription;
}

function defaultDependencies(): PushNotificationDependencies {
  return {
    isDevice: Device.isDevice,
    platform: Platform.OS,
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
    getPermissions: () => Notifications.getPermissionsAsync(),
    requestPermissions: () => Notifications.requestPermissionsAsync(),
    setAndroidChannel: () => Notifications.setNotificationChannelAsync('default', {
      name: 'UTTT-Go',
      importance: AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D2030F',
    }).then(() => undefined),
    getToken: (projectId) => Notifications.getExpoPushTokenAsync({ projectId }),
    addReceivedListener: (listener) => Notifications.addNotificationReceivedListener(listener),
    addResponseListener: (listener) => Notifications.addNotificationResponseReceivedListener(listener),
  };
}

function readTapPayload(data: unknown): NotificationTapPayload | null {
  if (typeof data !== 'object' || data === null) return null;
  const candidate = data as { route?: unknown; params?: unknown };
  if (typeof candidate.route !== 'string' || !candidate.route.startsWith('/')) return null;
  if (candidate.params === undefined) return { route: candidate.route };
  if (typeof candidate.params !== 'object' || candidate.params === null) return null;
  const params = Object.entries(candidate.params).reduce<Record<string, string>>((result, [key, value]) => {
    if (typeof value === 'string') result[key] = value;
    return result;
  }, {});
  if (Object.keys(params).length !== Object.keys(candidate.params).length) return null;
  return { route: candidate.route, params };
}

export function createPushNotificationClient(
  dependencies: PushNotificationDependencies = defaultDependencies(),
  onTap?: (payload: NotificationTapPayload) => void,
) {
  let receivedSubscription: NotificationSubscription | undefined;
  let responseSubscription: NotificationSubscription | undefined;
  let startPromise: Promise<PushNotificationResult> | undefined;
  let tapHandler = onTap;
  let registrationPort: DeviceTokenRegistrationPort | undefined;
  let registeredDeviceToken: { token: string; deviceTokenId: string } | undefined;

  const stop = async (options: { unregister?: boolean } = {}) => {
    if (options.unregister && registrationPort && registeredDeviceToken) {
      const registered = registeredDeviceToken;
      registeredDeviceToken = undefined;
      try { await registrationPort.unregister(registered.deviceTokenId); } catch { /* logout remains local-safe */ }
    }
    receivedSubscription?.remove();
    responseSubscription?.remove();
    receivedSubscription = undefined;
    responseSubscription = undefined;
    startPromise = undefined;
    registrationPort = undefined;
    registeredDeviceToken = undefined;
  };

  const start = (options: PushNotificationStartOptions = {}): Promise<PushNotificationResult> => {
    if (startPromise) return startPromise;
    registrationPort = options.registration;
    startPromise = (async () => {
      if (!dependencies.isDevice) return { status: 'unsupported-device' };
      if (!dependencies.projectId) return { status: 'missing-project-id' };

      try {
        let permission = await dependencies.getPermissions();
        if (!permission.granted) permission = await dependencies.requestPermissions();
        if (!permission.granted) return { status: 'permission-denied' };
        if (dependencies.platform === 'android') await dependencies.setAndroidChannel();

        const token = (await dependencies.getToken(dependencies.projectId)).data;
        if (typeof token !== 'string' || !token.trim()) return { status: 'error', error: new Error('Invalid push token') };
        let registration: 'registered' | 'failed' | 'not-configured' = 'not-configured';
        let deviceTokenId: string | undefined;
        if (registrationPort) {
          try {
            const response = await registrationPort.register({
              token,
              installationId: Constants.installationId ?? null,
              platform: dependencies.platform || null,
              appVersion: Constants.expoConfig?.version ?? null,
            });
            registeredDeviceToken = { token, deviceTokenId: response.deviceTokenId };
            deviceTokenId = response.deviceTokenId;
            registration = 'registered';
          } catch {
            registration = 'failed';
          }
        }
        receivedSubscription = dependencies.addReceivedListener(() => undefined);
        responseSubscription = dependencies.addResponseListener((response) => {
          const payload = readTapPayload(response.notification.request.content.data);
          if (payload) tapHandler?.(payload);
        });
        return { status: 'started', token, registration, ...(deviceTokenId ? { deviceTokenId } : {}) };
      } catch (error) {
        void stop();
        return { status: 'error', error };
      }
    })();
    return startPromise;
  };

  const setOnTap = (handler: ((payload: NotificationTapPayload) => void) | undefined) => {
    tapHandler = handler;
  };

  return { start, stop, setOnTap };
}

export const pushNotificationClient = createPushNotificationClient();
