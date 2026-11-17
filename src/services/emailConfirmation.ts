import { pendingRegistration, PendingRegistrationStore, RESEND_WAIT_MS } from './pendingRegistration';
import { verificationClient, type VerificationProvider } from './supabase/verificationClient';
import { VerificationError, verificationError } from './supabase/verificationErrors';

export function createEmailConfirmation(provider: VerificationProvider, store: PendingRegistrationStore, now = () => Date.now()) {
  async function perform(id: number, token?: string) {
    const current = store.read();
    if (current?.id !== id) throw new VerificationError('registration_required');
    if (token !== undefined && !/^[0-9]{6}$/.test(token)) throw new VerificationError('invalid_code');
    if (current.verified) return;
    if (current.busy) throw new VerificationError('busy');
    if (current.blockedUntil > now()) throw new VerificationError('rate_limit', current.blockedUntil - now());
    if (token === undefined && current.resendAt > now()) throw new VerificationError('rate_limit', current.resendAt - now());
    if (!store.acquire(id)) throw new VerificationError('busy');
    try {
      if (token === undefined) {
        // Also reserve a deadline for a lost response; never automatically repeat a mutation.
        store.update(id, { resendAt: now() + RESEND_WAIT_MS });
        await provider.resend(current.email);
      } else {
        await provider.verify(current.email, token);
      }
      if (store.read()?.id !== id) throw new VerificationError('registration_required');
      if (token !== undefined) store.update(id, { verified: true });
    } catch (error) {
      const safe = verificationError(error);
      if (safe.kind === 'rate_limit') {
        const deadline = now() + Math.max(RESEND_WAIT_MS, safe.retryAfterMs);
        store.update(id, { resendAt: Math.max(store.read()?.resendAt ?? 0, deadline), blockedUntil: deadline });
      }
      throw safe;
    } finally { store.update(id, { busy: false }); }
  }
  return { verify: (id: number, token: string) => perform(id, token), resend: (id: number) => perform(id) };
}

export const emailConfirmation = createEmailConfirmation(verificationClient, pendingRegistration);
