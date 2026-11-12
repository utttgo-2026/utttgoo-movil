import type { User } from '@/types/models';
import type { UserPatch } from '@/types/api';
import { institutionalEmail, requirePassword } from '@/utils/apiValidation';

import { authService } from './api/authService';
import { ApiError } from './api/errors';
import { httpClient } from './api/httpClient';
import { requireSessionContract, sessionContract, type SessionContract } from './api/sessionContract';
import { userService } from './api/userService';
import { sessionStorage, type SessionStorage } from './sessionStorage';

interface AuthSessionDependencies {
  storage: SessionStorage;
  auth: typeof authService;
  users: typeof userService;
  contract: SessionContract | null;
  assertSecureTransport: () => void;
}

/** Coordinador del único AuthContext. No mantiene una segunda copia de User ni sesión demo. */
export class AuthSession {
  private generation = 0;
  private token: string | null = null;

  constructor(private readonly deps: AuthSessionDependencies) {}

  private checkCurrent(generation: number): void {
    if (generation !== this.generation) {
      throw new ApiError('cancelled', 'La operación de sesión fue cancelada.');
    }
  }

  private async validatedUser(token: string, contract: SessionContract, generation: number): Promise<User> {
    const authResponse = await this.deps.auth.getMe(token);
    this.checkCurrent(generation);
    const identity = contract.decodeIdentity(authResponse.data);
    const profileResponse = await this.deps.users.getMe(token);
    this.checkCurrent(generation);
    return contract.decodeProfile(profileResponse.data, identity);
  }

  async restore(): Promise<User | null> {
    const generation = ++this.generation;
    this.token = null;
    const token = await this.deps.storage.read();
    this.checkCurrent(generation);
    if (!token) return null;
    this.deps.assertSecureTransport();
    const contract = requireSessionContract(this.deps.contract);
    try {
      const user = await this.validatedUser(token, contract, generation);
      this.checkCurrent(generation);
      this.token = token;
      return user;
    } catch (error) {
      this.checkCurrent(generation);
      // Timeout, 403 y errores de servidor no equivalen a token revocado.
      if (error instanceof ApiError && error.status === 401) await this.deps.storage.clear();
      throw error;
    }
  }

  async login(email: string, password: string): Promise<User> {
    const generation = ++this.generation;
    this.token = null;
    const normalized = institutionalEmail(email);
    const validatedPassword = requirePassword(password);
    this.deps.assertSecureTransport();
    // No enviar un login que todavía no sabemos interpretar de forma segura.
    const contract = requireSessionContract(this.deps.contract);
    const response = await this.deps.auth.login({ email: normalized, password: validatedPassword });
    const token = contract.decodeLogin(response.data);
    this.checkCurrent(generation);
    const user = await this.validatedUser(token, contract, generation);
    this.checkCurrent(generation);
    await this.deps.storage.save(token);
    this.checkCurrent(generation);
    this.token = token;
    return user;
  }

  async register(displayName: string, email: string, password: string): Promise<void> {
    this.deps.assertSecureTransport();
    await this.deps.auth.register({ displayName, email: institutionalEmail(email), password: requirePassword(password) });
    // 202 es aceptación; no token, no setUser, no OTP generado por el cliente.
  }

  async refreshProfile(patch?: UserPatch): Promise<User> {
    this.deps.assertSecureTransport();
    const contract = requireSessionContract(this.deps.contract);
    if (!this.token) throw new ApiError('unauthenticated', 'Inicia sesión para consultar tu perfil.');
    const generation = this.generation;
    const token = this.token;
    try {
      if (patch) {
        await this.deps.users.updateMe(token, patch);
        this.checkCurrent(generation);
      }
      return await this.validatedUser(token, contract, generation);
    } catch (error) {
      this.checkCurrent(generation);
      if (error instanceof ApiError && error.status === 401) {
        this.token = null;
        await this.deps.storage.clear();
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    ++this.generation;
    this.token = null;
    await this.deps.storage.clear();
  }
}

export function createAuthSession(): AuthSession {
  return new AuthSession({
    storage: sessionStorage,
    auth: authService,
    users: userService,
    contract: sessionContract,
    assertSecureTransport: () => httpClient.assertSecureTransport(),
  });
}
