import { ApiError } from './api/errors';
import { getSupabaseClient } from './supabaseClient';

export function validateOtp(value: string): string {
  if (!/^\d{6}$/.test(value)) {
    throw new ApiError('validation', 'El código debe contener seis dígitos.');
  }
  return value;
}

export async function verifySignupOtp(email: string, otp: string): Promise<void> {
  const { error } = await getSupabaseClient().auth.verifyOtp({ email, token: validateOtp(otp), type: 'signup' });
  if (error) throw new ApiError('invalid_response', 'El código no es válido o ya expiró.');
}

export async function resendSignupOtp(email: string): Promise<void> {
  const { error } = await getSupabaseClient().auth.resend({ type: 'signup', email });
  if (error) throw new ApiError('invalid_response', 'No se pudo reenviar el código. Intenta nuevamente.');
}
