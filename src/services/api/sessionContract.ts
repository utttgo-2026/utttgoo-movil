import type { User } from '@/types/models';
import type { AuthMeResponse, UserProfileResponse } from '@/types/api';
import { institutionalEmail } from '@/utils/apiValidation';

import { ApiError } from './errors';

/** Only response shapes explicitly confirmed by the backend may have decoders. */
export interface SessionContract {
  decodeLogin: (data: unknown) => string;
  decodeLoginUser?: (data: unknown, submittedEmail: string) => User;
  decodeIdentity: ((data: unknown) => User) | null;
  decodeProfile: ((data: unknown, identity: User) => User) | null;
}

export interface AwsLoginResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: { id: string; roles: ['Buyer']; accountStatus: 'Active' };
}

function invalidLogin(): never {
  throw new ApiError('invalid_response', 'La respuesta de inicio de sesión no cumple el contrato confirmado de una cuenta Buyer activa.');
}

function record(value: unknown, invalid: () => never = invalidLogin): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return invalid();
  return value as Record<string, unknown>;
}

function invalidMe(): never {
  throw new ApiError('invalid_response', 'La identidad o el perfil devueltos por AWS no cumplen el contrato de una cuenta Buyer activa.');
}

function validText(value: unknown): value is string {
  return typeof value === 'string' && !/[\u0000-\u001f\u007f]/.test(value);
}

function validId(value: unknown): value is string {
  return validText(value) && Boolean(value.trim()) && value === value.trim();
}

function validatedEmail(value: unknown): string {
  if (!validText(value)) return invalidMe();
  try { return institutionalEmail(value); } catch { return invalidMe(); }
}

function validRoles(value: unknown): boolean {
  return Array.isArray(value) && value.length === 1 && value[0] === 'Buyer';
}

export function decodeAuthMeResponse(data: unknown): AuthMeResponse {
  const value = record(data, invalidMe);
  if (!validId(value.id) || !validText(value.displayName) || !validRoles(value.roles) || value.accountStatus !== 'Active') return invalidMe();
  return { id: value.id, email: validatedEmail(value.email), displayName: value.displayName, roles: ['Buyer'], accountStatus: 'Active' };
}

export function decodeUserProfileResponse(data: unknown): UserProfileResponse {
  const value = record(data, invalidMe);
  if (!validId(value.id) || !validText(value.displayName) || !validRoles(value.roles) ||
      (value.phone !== null && !validText(value.phone)) || (value.avatarUrl !== null && !validText(value.avatarUrl))) return invalidMe();
  return { id: value.id, email: validatedEmail(value.email), displayName: value.displayName,
    phone: value.phone, avatarUrl: value.avatarUrl, roles: ['Buyer'] };
}

/** Validate transport data, not unverified JWT claims. No signing secrets or token logs. */
export function decodeAwsLoginResponse(data: unknown): AwsLoginResponse {
  const response = record(data);
  const user = record(response.user);
  if (typeof response.accessToken !== 'string' || !response.accessToken || /\s|[\u0000-\u001f\u007f]/.test(response.accessToken) ||
      typeof response.expiresIn !== 'number' || !Number.isSafeInteger(response.expiresIn) || response.expiresIn <= 0 ||
      response.tokenType !== 'Bearer' || typeof user.id !== 'string' || !user.id.trim() || user.id !== user.id.trim() ||
      /[\u0000-\u001f\u007f]/.test(user.id) || !Array.isArray(user.roles) || user.roles.length !== 1 ||
      user.roles[0] !== 'Buyer' || user.accountStatus !== 'Active') return invalidLogin();
  // Project known properties only. Extra server fields are not copied into app/session storage.
  return {
    accessToken: response.accessToken, expiresIn: response.expiresIn, tokenType: 'Bearer',
    user: { id: user.id, roles: ['Buyer'], accountStatus: 'Active' },
  };
}

export const sessionContract: SessionContract = {
  decodeLogin: (data) => decodeAwsLoginResponse(data).accessToken,
  decodeLoginUser: (data, submittedEmail) => {
    const { user } = decodeAwsLoginResponse(data);
    // Login supplies no displayName/email. Keep name absent and use the submitted email for presentation only.
    return { id: user.id, role: 'buyer', fullName: '', email: institutionalEmail(submittedEmail) };
  },
  decodeIdentity: (data) => {
    const identity = decodeAuthMeResponse(data);
    return { id: identity.id, email: identity.email, fullName: identity.displayName, role: 'buyer', accountStatus: 'Active' };
  },
  decodeProfile: (data, identity) => {
    const profile = decodeUserProfileResponse(data);
    if (profile.id !== identity.id || profile.email !== identity.email || identity.role !== 'buyer') return invalidMe();
    // Identity controls authorization; the editable profile only supplies presentation fields.
    return { ...identity, fullName: profile.displayName, phone: profile.phone, avatar: profile.avatarUrl };
  },
};

export function requireSessionContract(contract: SessionContract | null): SessionContract {
  if (!contract) {
    throw new ApiError('contract_unavailable', 'Falta confirmar el contrato de sesión e identidad del backend. El inicio de sesión real aún no está habilitado.');
  }
  return contract;
}

export function requireProfileContract(contract: SessionContract) {
  const { decodeIdentity, decodeProfile } = contract;
  if (!decodeIdentity || !decodeProfile) {
    throw new ApiError('contract_unavailable', 'Falta confirmar las respuestas de /auth/me y /users/me para restaurar la sesión o consultar el perfil. Puedes iniciar sesión nuevamente.');
  }
  return { decodeIdentity, decodeProfile };
}
