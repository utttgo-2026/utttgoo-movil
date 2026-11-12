import type { User } from '@/types/models';

import { ApiError } from './errors';

/** Punto de integración pendiente: no suponer nombres de token, IDs, envelopes o roles. */
export interface SessionContract {
  decodeLogin: (data: unknown) => string;
  decodeIdentity: (data: unknown) => User;
  decodeProfile: (data: unknown, identity: User) => User;
}

// Reemplazar solo con decodificadores runtime respaldados por OpenAPI/JSON verificado.
export const sessionContract: SessionContract | null = null;

export function requireSessionContract(contract: SessionContract | null): SessionContract {
  if (!contract) {
    throw new ApiError('contract_unavailable', 'Falta confirmar el contrato de sesión e identidad del backend. El inicio de sesión real aún no está habilitado.');
  }
  return contract;
}
