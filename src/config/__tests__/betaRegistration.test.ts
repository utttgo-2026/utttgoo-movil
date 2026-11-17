import { betaRegistrationOnlyEnabled, isBetaRegistrationOnly } from '../betaRegistration';
import appConfig from '../../../app.config';
import eas from '../../../eas.json';

const production = {
  requested: 'true', development: false, platform: 'android', executionEnvironment: 'standalone',
  internalBeta: false, applicationId: 'mx.edu.utt.uttgo',
};

describe('Beta de registro fail-closed', () => {
  const previousFlag = process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY;
  const previousProfile = process.env.EAS_BUILD_PROFILE;
  afterEach(() => {
    if (previousFlag === undefined) delete process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY; else process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY = previousFlag;
    if (previousProfile === undefined) delete process.env.EAS_BUILD_PROFILE; else process.env.EAS_BUILD_PROFILE = previousProfile;
    jest.restoreAllMocks();
  });

  test.each([undefined, '', 'false', 'TRUE', '1'])('bandera ausente/inexacta %s nunca habilita Beta', (requested) => {
    expect(betaRegistrationOnlyEnabled({ ...production, requested, development: true })).toBe(false);
  });
  test('desarrollo requiere true exacto y permite Expo Go', () => {
    expect(betaRegistrationOnlyEnabled({ ...production, development: true, executionEnvironment: 'storeClient' })).toBe(true);
  });
  test('solo la bandera true no habilita producción', () => {
    expect(betaRegistrationOnlyEnabled(production)).toBe(false);
    process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY = 'true';
    jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', false);
    expect(isBetaRegistrationOnly()).toBe(false);
  });
  test.each(['android', 'ios'])('build interna %s requiere marcador y application id Beta', (platform) => {
    expect(betaRegistrationOnlyEnabled({ ...production, platform, internalBeta: true, applicationId: 'mx.edu.utt.uttgo.beta' })).toBe(true);
  });
  test.each([
    { internalBeta: true }, { internalBeta: 'true', applicationId: 'mx.edu.utt.uttgo.beta' },
    { internalBeta: false, applicationId: 'mx.edu.utt.uttgo.beta' },
    { internalBeta: true, applicationId: 'mx.edu.utt.uttgo.beta', platform: 'web' },
    { internalBeta: true, applicationId: 'mx.edu.utt.uttgo.beta', executionEnvironment: 'storeClient' },
    { internalBeta: true, applicationId: 'mx.edu.utt.uttgo.beta', executionEnvironment: 'unknown' },
  ])('identificación incompleta/no nativa se rechaza: %j', (override) => {
    expect(betaRegistrationOnlyEnabled({ ...production, ...override })).toBe(false);
  });

  test.each([undefined, 'preview', 'production'])('app config %s conserva identidad normal y nunca marca Beta', (profile) => {
    if (profile === undefined) delete process.env.EAS_BUILD_PROFILE; else process.env.EAS_BUILD_PROFILE = profile;
    const config = appConfig({ config: { name: 'UTTT-Go', slug: 'uttt-go', android: { package: 'mx.edu.utt.uttgo' } }, projectRoot: 'fixture', staticConfigPath: null, packageJsonPath: null });
    expect(config.name).toBe('UTTT-Go'); expect(config.android?.package).toBe('mx.edu.utt.uttgo');
    expect(config.extra?.internalBetaRegistration).toBe(false);
  });
  test('perfil EAS específico es interno, conserva flag true y genera aplicación Beta distinta', () => {
    process.env.EAS_BUILD_PROFILE = 'beta-registration';
    const config = appConfig({ config: { name: 'UTTT-Go', slug: 'uttt-go', scheme: 'uttgo' }, projectRoot: 'fixture', staticConfigPath: null, packageJsonPath: null });
    expect(config.name).toBe('UTTT-Go Beta Registro');
    expect(config.android?.package).toBe('mx.edu.utt.uttgo.beta');
    expect(config.ios?.bundleIdentifier).toBe('mx.edu.utt.uttgo.beta');
    expect(config.extra?.internalBetaRegistration).toBe(true);
    expect(config.scheme).toBe('uttgo');
    expect(eas.build['beta-registration'].distribution).toBe('internal');
    expect(eas.build['beta-registration'].env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY).toBe('true');
    expect(eas.build.production.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY).toBe('false');
  });
  test('producción bloquea permisos de overlay/almacenamiento que no necesita el flujo', () => {
    process.env.EAS_BUILD_PROFILE = 'production';
    const config = appConfig({ config: { name: 'UTTT-Go', slug: 'uttt-go' }, projectRoot: 'fixture', staticConfigPath: null, packageJsonPath: null });
    expect(config.android?.blockedPermissions).toEqual(expect.arrayContaining([
      'android.permission.SYSTEM_ALERT_WINDOW', 'android.permission.READ_EXTERNAL_STORAGE', 'android.permission.WRITE_EXTERNAL_STORAGE',
    ]));
    expect(config.extra?.internalBetaRegistration).toBe(false);
  });
});
