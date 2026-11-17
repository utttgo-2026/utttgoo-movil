import type { ConfigContext, ExpoConfig } from 'expo/config';

/** Explicit internal native variant. Merely setting the public feature flag cannot mark production Beta. */
export default function appConfig({ config }: ConfigContext): ExpoConfig {
  const beta = process.env.EAS_BUILD_PROFILE === 'beta-registration';
  const production = process.env.EAS_BUILD_PROFILE === 'production';
  return {
    ...config,
    name: beta ? 'UTTT-Go Beta Registro' : (config.name ?? 'UTTT-Go'),
    slug: config.slug ?? 'uttt-go',
    extra: { ...config.extra, internalBetaRegistration: beta },
    android: beta ? { ...config.android, package: 'mx.edu.utt.uttgo.beta' } : production ? {
      ...config.android,
      blockedPermissions: [...new Set([...(config.android?.blockedPermissions ?? []),
        'android.permission.SYSTEM_ALERT_WINDOW', 'android.permission.READ_EXTERNAL_STORAGE', 'android.permission.WRITE_EXTERNAL_STORAGE'])],
    } : config.android,
    ios: beta ? { ...config.ios, bundleIdentifier: 'mx.edu.utt.uttgo.beta' } : config.ios,
  };
}
