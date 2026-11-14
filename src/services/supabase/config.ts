import { VerificationError } from './verificationErrors';

export function parseSupabaseConfig(urlValue: string | undefined, keyValue: string | undefined) {
  try {
    const url = new URL(urlValue?.trim() ?? '');
    const key = keyValue?.trim() ?? '';
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
        !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) throw new Error('Invalid configuration');
    return { url: url.origin, key };
  } catch { throw new VerificationError('configuration'); }
}

export function getSupabaseConfig() {
  return parseSupabaseConfig(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export function supabaseConfigurationMessage(): string | undefined {
  try { getSupabaseConfig(); return undefined; }
  catch { return new VerificationError('configuration').message; }
}
