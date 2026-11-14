import type { User } from '@/types/models';
import type { UserPatch } from '@/types/api';
import { institutionalEmail, requirePassword } from '@/utils/apiValidation';

import { authService } from './api/authService';
import { ApiError } from './api/errors';
import { httpClient } from './api/httpClient';
import { registrationDiagnostic } from './api/registrationDiagnostics';
import { requireProfileContract, requireSessionContract, sessionContract, type SessionContract } from './api/sessionContract';
import { userService } from './api/userService';
import { sessionStorage, type SessionStorage } from './sessionStorage';
import { pendingRegistration } from './pendingRegistration';

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
  private profileRevision = 0;

  constructor(private readonly deps: AuthSessionDependencies) {}

  private checkCurrent(generation: number, profileRevision?: number): void {
    if (generation !== this.generation || (profileRevision !== undefined && profileRevision !== this.profileRevision)) {
      throw new ApiError('cancelled', 'La operación de sesión fue cancelada.');
    }
  }

  private async validatedUser(token: string, contract: SessionContract, generation: number, expected?: User, profileRevision?: number): Promise<User> {
    const profileContract = requireProfileContract(contract);
    const authResponse = await this.deps.auth.getMe(token);
    this.checkCurrent(generation, profileRevision);
    const identity = profileContract.decodeIdentity(authResponse.data);
    if (expected && (expected.id !== identity.id || expected.email !== identity.email || expected.role !== identity.role)) {
      throw new ApiError('invalid_response', 'La identidad autenticada no coincide con la respuesta de login.');
    }
    const profileResponse = await this.deps.users.getMe(token);
    this.checkCurrent(generation, profileRevision);
    return profileContract.decodeProfile(profileResponse.data, identity);
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
    const expected = contract.decodeLoginUser?.(response.data, normalized);
    const user = await this.validatedUser(token, contract, generation, expected);
    this.checkCurrent(generation);
    await this.deps.storage.save(token);
    this.checkCurrent(generation);
    this.token = token;
    return user;
  }

  async register(displayName: string, email: string, password: string): Promise<void> {
    try {
      this.deps.assertSecureTransport();
      await this.deps.auth.register({ displayName, email: institutionalEmail(email), password: requirePassword(password) });
      pendingRegistration.begin(email);
      // Neither200 nor202 proves MongoDB persistence, email verification or a session.
      // No token, setUser, local OTP or assumed Supabase flow.
    } catch (error) {
      registrationDiagnostic({ event: 'failure', kind: error instanceof ApiError ? error.kind : 'unexpected' });
      throw error;
    }
  }

  async refreshProfile(patch?: UserPatch): Promise<User> {
    this.deps.assertSecureTransport();
    const contract = requireSessionContract(this.deps.contract);
    if (!this.token) throw new ApiError('unauthenticated', 'Inicia sesión para consultar tu perfil.');
    requireProfileContract(contract);
    const generation = this.generation;
    const profileRevision = ++this.profileRevision;
    const token = this.token;
    try {
      if (patch) {
        await this.deps.users.updateMe(token, patch);
        this.checkCurrent(generation, profileRevision);
      }
      return await this.validatedUser(token, contract, generation, undefined, profileRevision);
    } catch (error) {
      this.checkCurrent(generation, profileRevision);
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
    pendingRegistration.reset();
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
