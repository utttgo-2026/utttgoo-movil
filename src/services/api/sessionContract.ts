import type { AuthMeResponse, UserMeResponse } from '@/types/api';
import type { User, UserRole } from '@/types/models';

import { ApiError } from './errors';

const supportedStatuses = new Set(['PendingEmailVerification', 'Active', 'Suspended', 'Disabled']);

function record(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError('invalid_response', `Respuesta inválida de ${name}.`);
  }
  return value as Record<string, unknown>;
}

function roles(value: unknown): UserRole {
  if (!Array.isArray(value) || value.length === 0 || value.some((role) => typeof role !== 'string')) {
    throw new ApiError('invalid_response', 'La respuesta no contiene roles válidos.');
  }
  const roleMap: Record<string, UserRole> = { Buyer: 'buyer', Seller: 'seller', Admin: 'admin' };
  const mapped = value.map((role) => roleMap[role as string]);
  if (mapped.some((role) => role === undefined)) {
    throw new ApiError('invalid_response', 'La respuesta contiene un rol no soportado.');
  }
  return mapped[0] as UserRole;
}

function identity(data: unknown): AuthMeResponse {
  const value = record(data, 'auth/me');
  if (typeof value.id !== 'string' || typeof value.email !== 'string' || typeof value.displayName !== 'string' ||
      !Array.isArray(value.roles) || value.roles.some((role) => typeof role !== 'string') ||
      typeof value.accountStatus !== 'string' || !supportedStatuses.has(value.accountStatus)) {
    throw new ApiError('invalid_response', 'La respuesta de auth/me no cumple el contrato.');
  }
  return value as unknown as AuthMeResponse;
}

function profile(data: unknown): UserMeResponse {
  const value = record(data, 'users/me');
  if (typeof value.id !== 'string' || typeof value.displayName !== 'string' || typeof value.email !== 'string' ||
      (value.phone !== null && typeof value.phone !== 'string') ||
      (value.avatarUrl !== null && typeof value.avatarUrl !== 'string') || !Array.isArray(value.roles) ||
      value.roles.some((role) => typeof role !== 'string')) {
    throw new ApiError('invalid_response', 'La respuesta de users/me no cumple el contrato.');
  }
  return value as unknown as UserMeResponse;
}

export interface SessionContract {
  decodeLogin: (data: unknown) => string;
  decodeIdentity: (data: unknown) => User;
  decodeProfile: (data: unknown, identity: User) => User;
}

export const sessionContract: SessionContract = {
  decodeLogin: () => {
    throw new ApiError('contract_unavailable', 'BLOCKED_BY_BACKEND_LOGIN_RESPONSE_CONTRACT');
  },
  decodeIdentity: (data) => {
    const value = identity(data);
    return { id: value.id, email: value.email, fullName: value.displayName, role: roles(value.roles) };
  },
  decodeProfile: (data, sessionIdentity) => {
    const value = profile(data);
    return {
      id: value.id,
      email: value.email,
      fullName: value.displayName,
      role: roles(value.roles),
      phone: value.phone ?? undefined,
      avatar: value.avatarUrl ?? undefined,
    };
  },
};

export function requireSessionContract(contract: SessionContract | null): SessionContract {
  if (!contract) throw new ApiError('contract_unavailable', 'Falta confirmar el contrato de sesión e identidad del backend.');
  return contract;
}
