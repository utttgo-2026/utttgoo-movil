import { institutionalEmail } from '@/utils/apiValidation';

export const RESEND_WAIT_MS = 60000;
export const REGISTRATION_CONTEXT_MS = 30 * 60 * 1000;
export const LOGIN_HINT_MS = 5 * 60 * 1000;
export interface PendingRegistration {
  readonly id: number;
  readonly email: string;
  readonly expiresAt: number;
  readonly resendAt: number;
  readonly verified: boolean;
  readonly busy: boolean;
  readonly blockedUntil: number;
}

/** Ephemeral confirmation context, never an authentication session or persistent store. */
export class PendingRegistrationStore {
  private current: PendingRegistration | null = null;
  private password: string | null = null;
  private revision = 0;
  private loginHint: { email: string; expiresAt: number; registrationReceived: boolean } | null = null;
  private listeners = new Set<() => void>();
  constructor(private readonly now = () => Date.now()) {}
  getSnapshot = () => this.current;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private publish(value: PendingRegistration | null) { this.current = value; this.listeners.forEach((listener) => listener()); }
  begin(email: string, password?: string) {
    this.loginHint = null;
    this.password = password ?? null;
    const now = this.now();
    this.publish({ id: ++this.revision, email: institutionalEmail(email), expiresAt: now + REGISTRATION_CONTEXT_MS,
      resendAt: now + RESEND_WAIT_MS, verified: false, busy: false, blockedUntil: 0 });
  }
  read() {
    if (this.current && this.current.expiresAt <= this.now()) this.clear(this.current.id);
    return this.current;
  }
  clear(id: number) { if (this.current?.id === id) this.publish(null); }
  prepareLogin(id: number) {
    const pending = this.read();
    if (pending?.id !== id || !pending.verified || pending.busy) return false;
    this.loginHint = { email: pending.email, expiresAt: this.now() + LOGIN_HINT_MS, registrationReceived: false };
    this.clear(id);
    return true;
  }
  prepareLoginHint(id: number) {
    const pending = this.read();
    if (pending?.id !== id || !pending.verified || pending.busy) return false;
    this.loginHint = { email: pending.email, expiresAt: this.now() + LOGIN_HINT_MS, registrationReceived: false };
    return true;
  }
  takeVerifiedCredentials(id: number) {
    const pending = this.read();
    if (pending?.id !== id || !pending.verified || pending.busy || !this.password) return null;
    const credentials = { email: pending.email, password: this.password };
    this.password = null;
    this.clear(id);
    return credentials;
  }
  getVerifiedCredentials(id: number) {
    const pending = this.read();
    if (pending?.id !== id || !pending.verified || pending.busy || !this.password) return null;
    return { email: pending.email, password: this.password };
  }
  preparePendingLogin() {
    const pending = this.read();
    if (!pending || pending.busy) return false;
    this.loginHint = { email: pending.email, expiresAt: this.now() + LOGIN_HINT_MS, registrationReceived: true };
    return true;
  }
  hasRegistrationReceipt() { this.getLoginEmailHint(); return this.loginHint?.registrationReceived === true; }
  getLoginEmailHint() {
    if (this.loginHint && this.loginHint.expiresAt <= this.now()) this.loginHint = null;
    return this.loginHint?.email;
  }
  clearLoginEmailHint(expectedEmail: string) {
    if (this.loginHint?.email === expectedEmail) this.loginHint = null;
  }
  clearPassword() { this.password = null; }
  reset() { this.loginHint = null; this.password = null; this.publish(null); }
  update(id: number, patch: Partial<Pick<PendingRegistration, 'resendAt' | 'verified' | 'busy' | 'blockedUntil'>>) {
    const current = this.read();
    if (current?.id !== id) return false;
    this.publish({ ...current, ...patch });
    return true;
  }
  acquire(id: number) {
    const current = this.read();
    if (current?.id !== id || current.busy || current.verified) return false;
    return this.update(id, { busy: true });
  }
}

export const pendingRegistration = new PendingRegistrationStore();
