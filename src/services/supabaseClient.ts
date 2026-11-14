import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { ApiError } from './api/errors';

function requiredPublicEnv(value: string | undefined, name: string): string {
  if (!value?.trim()) {
    throw new ApiError('configuration', `Configura ${name} en .env.`);
  }
  return value.trim();
}

export function getSupabaseConfig(): { url: string; publishableKey: string } {
  const url = requiredPublicEnv(process.env.EXPO_PUBLIC_SUPABASE_URL, 'EXPO_PUBLIC_SUPABASE_URL');
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.pathname !== '/') {
      throw new Error('Invalid Supabase URL');
    }
  } catch {
    throw new ApiError('configuration', 'EXPO_PUBLIC_SUPABASE_URL debe ser una URL HTTPS válida.');
  }
  return {
    url: url.replace(/\/$/, ''),
    publishableKey: requiredPublicEnv(process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY, 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  };
}

let client: SupabaseClient | undefined;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const config = getSupabaseConfig();
    client = createClient(config.url, config.publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
