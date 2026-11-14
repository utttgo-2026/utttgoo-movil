import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

interface BetaRegistrationGate {
  requested: string | undefined;
  development: boolean;
  platform: string;
  executionEnvironment: string;
  internalBeta: unknown;
  applicationId: unknown;
}

export function betaRegistrationOnlyEnabled(input: BetaRegistrationGate): boolean {
  if (input.requested !== 'true') return false;
  if (input.development) return true;
  return (input.platform === 'android' || input.platform === 'ios') &&
    (input.executionEnvironment === ExecutionEnvironment.Standalone || input.executionEnvironment === ExecutionEnvironment.Bare) &&
    input.internalBeta === true && input.applicationId === 'mx.edu.utt.uttgo.beta';
}

export function isBetaRegistrationOnly(): boolean {
  return betaRegistrationOnlyEnabled({
    requested: process.env.EXPO_PUBLIC_BETA_REGISTRATION_ONLY,
    development: __DEV__,
    platform: Platform.OS,
    executionEnvironment: Constants.executionEnvironment,
    internalBeta: Constants.expoConfig?.extra?.internalBetaRegistration,
    applicationId: Platform.OS === 'ios' ? Constants.expoConfig?.ios?.bundleIdentifier : Constants.expoConfig?.android?.package,
  });
}
