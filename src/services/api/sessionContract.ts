import type { AuthMeResponse, BackendRole, UserProfileResponse } from '@/types/api';
import type { User, UserRole } from '@/types/models';
import { institutionalEmail } from '@/utils/apiValidation';

import { ApiError } from './errors';

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
  user: { id: string; roles: BackendRole[]; accountStatus: 'Active' };
}

const roleMap: Record<BackendRole, UserRole> = { Buyer: 'buyer', Seller: 'seller', Admin: 'admin' };

function invalid(message: string): never { throw new ApiError('invalid_response', message); }
function record(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid(message);
  return value as Record<string, unknown>;
}
function validText(value: unknown): value is string { return typeof value === 'string' && !/[\u0000-\u001f\u007f]/.test(value); }
function validId(value: unknown): value is string { return validText(value) && Boolean(value.trim()) && value === value.trim(); }
function validRoles(value: unknown): value is BackendRole[] {
  return Array.isArray(value) && value.length > 0 && value.every((role) => typeof role === 'string' && role in roleMap);
}
function mapRole(roles: BackendRole[]): UserRole {
  const mapped = roles.map((role) => roleMap[role]);
  if (mapped.length === 0) return invalid('La respuesta no contiene roles válidos.');
  return mapped[0];
}
function validatedEmail(value: unknown): string {
  if (!validText(value)) return invalid('La respuesta no contiene un correo válido.');
  try { return institutionalEmail(value); } catch { return invalid('La respuesta no contiene un correo institucional válido.'); }
}

export function decodeAwsLoginResponse(data: unknown): AwsLoginResponse {
  const response = record(data, 'La respuesta de inicio de sesión no cumple el contrato Backend.');
  const user = record(response.user, 'La respuesta de inicio de sesión no contiene un usuario válido.');
  if (typeof response.accessToken !== 'string' || !response.accessToken || /\s|[\u0000-\u001f\u007f]/.test(response.accessToken) ||
      typeof response.expiresIn !== 'number' || !Number.isSafeInteger(response.expiresIn) || response.expiresIn <= 0 ||
      response.tokenType !== 'Bearer' || !validId(user.id) || !validRoles(user.roles) || user.accountStatus !== 'Active') {
    return invalid('La respuesta de inicio de sesión no cumple el contrato Backend.');
  }
  return { accessToken: response.accessToken, expiresIn: response.expiresIn, tokenType: 'Bearer',
    user: { id: user.id, roles: user.roles, accountStatus: 'Active' } };
}

export function decodeAuthMeResponse(data: unknown): AuthMeResponse {
  const value = record(data, 'La respuesta de auth/me no cumple el contrato Backend.');
  if (!validId(value.id) || !validText(value.displayName) || !validRoles(value.roles) || value.accountStatus !== 'Active') {
    return invalid('La respuesta de auth/me no cumple el contrato Backend.');
  }
  return { id: value.id, email: validatedEmail(value.email), displayName: value.displayName, roles: value.roles, accountStatus: 'Active' };
}

export function decodeUserProfileResponse(data: unknown): UserProfileResponse {
  const value = record(data, 'La respuesta de users/me no cumple el contrato Backend.');
  if (!validId(value.id) || !validText(value.displayName) || !validRoles(value.roles) ||
      (value.phone !== null && !validText(value.phone)) || (value.avatarUrl !== null && !validText(value.avatarUrl))) {
    return invalid('La respuesta de users/me no cumple el contrato Backend.');
  }
  return { id: value.id, email: validatedEmail(value.email), displayName: value.displayName,
    phone: value.phone as string | null, avatarUrl: value.avatarUrl as string | null, roles: value.roles };
}

export const sessionContract: SessionContract = {
  decodeLogin: (data) => decodeAwsLoginResponse(data).accessToken,
  decodeLoginUser: (data, submittedEmail) => {
    const { user } = decodeAwsLoginResponse(data);
    return { id: user.id, role: mapRole(user.roles), fullName: '', email: institutionalEmail(submittedEmail), accountStatus: 'Active' };
  },
  decodeIdentity: (data) => {
    const identity = decodeAuthMeResponse(data);
    return { id: identity.id, email: identity.email, fullName: identity.displayName, role: mapRole(identity.roles), accountStatus: 'Active' };
  },
  decodeProfile: (data, identity) => {
    const profile = decodeUserProfileResponse(data);
    if (profile.id !== identity.id || profile.email !== identity.email || mapRole(profile.roles) !== identity.role) {
      return invalid('El perfil Backend no corresponde con la identidad validada.');
    }
    return { ...identity, fullName: profile.displayName, phone: profile.phone, avatar: profile.avatarUrl };
  },
};

export function requireSessionContract(contract: SessionContract | null): SessionContract {
  if (!contract) throw new ApiError('contract_unavailable', 'Falta confirmar el contrato de sesión e identidad del Backend.');
  return contract;
}

export function requireProfileContract(contract: SessionContract) {
  if (!contract.decodeIdentity || !contract.decodeProfile) {
    throw new ApiError('contract_unavailable', 'Falta confirmar el contrato de perfil Backend.');
  }
  return { decodeIdentity: contract.decodeIdentity, decodeProfile: contract.decodeProfile };
}
