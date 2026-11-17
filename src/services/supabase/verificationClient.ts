import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { institutionalEmail } from '@/utils/apiValidation';
import { getSupabaseConfig } from './config';
import { VerificationError, verificationError } from './verificationErrors';

export interface VerificationProvider {
  verify(email: string, token: string): Promise<void>;
  resend(email: string): Promise<void>;
}

export function retryAfterMilliseconds(value: string | null, now = Date.now()): number {
  if (!value) return 0;
  const seconds = /^\d+$/.test(value.trim()) ? Number(value) : NaN;
  const milliseconds = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - now;
  return Number.isFinite(milliseconds) ? Math.max(0, milliseconds) : 0;
}

/** Reusable restricted facade. A disposable SDK instance per operation avoids retaining its session. */
async function withClient(operation: (client: Pick<SupabaseClient, 'auth'>) => Promise<void>) {
  const config = getSupabaseConfig();
  let retryAfterMs = 0;
  const safeFetch: typeof fetch = async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    if (url.protocol !== 'https:' || url.origin !== config.url) throw new VerificationError('configuration');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(input, { ...init, signal: controller.signal, redirect: 'error', credentials: 'omit' });
      // Finish reading within the deadline, without logging or inspecting sensitive content.
      const body = await response.text();
      retryAfterMs = retryAfterMilliseconds(response.headers.get('retry-after'));
      return new Response(body || null, { status: response.status, statusText: response.statusText, headers: response.headers });
    } finally { clearTimeout(timer); }
  };
  const client = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, debug: false },
    global: { fetch: safeFetch },
  });
  try {
    // Finish SDK initialization before the operation/cleanup lifecycle (no persisted session to restore).
    const { error } = await client.auth.initialize();
    if (error) throw error;
    await operation(client);
  }
  catch (error) { throw verificationError(error, retryAfterMs); }
  finally {
    // dispose stops listeners/background work, NOT a remote logout or token revocation.
    // No SDK instance, User or Session escapes this function. Memory becomes collectible.
    await client.auth.dispose();
  }
}

export const verificationClient: VerificationProvider = {
  async verify(email, token) {
    const normalized = institutionalEmail(email);
    if (!/^[0-9]{6}$/.test(token)) throw new VerificationError('invalid_code');
    await withClient(async (client) => {
      const { data, error } = await client.auth.verifyOtp({ email: normalized, token, type: 'email' });
      if (error) throw error;
      const user = data?.user;
      if (typeof user?.id !== 'string' || !user.id || user.email?.toLowerCase() !== normalized || !user.email_confirmed_at ||
          !Number.isFinite(Date.parse(user.email_confirmed_at))) throw new VerificationError('invalid_response');
      // Discard data.session, including its access/refresh tokens. AWS remains the session authority.
    });
  },
  async resend(email) {
    const normalized = institutionalEmail(email);
    await withClient(async (client) => {
      const { error } = await client.auth.resend({ type: 'signup', email: normalized });
      if (error) throw error;
    });
  },
};
