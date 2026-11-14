export type VerificationErrorKind = 'configuration' | 'invalid_code' | 'expired_code' | 'rate_limit'
  | 'network' | 'invalid_response' | 'registration_required' | 'busy' | 'provider';

const messages: Record<VerificationErrorKind, string> = {
  configuration: 'Falta configurar la URL HTTPS y la clave pública publishable del proyecto Supabase utilizado por AWS.',
  invalid_code: 'El código no es correcto. Introduce los seis dígitos del correo más reciente.',
  expired_code: 'El código expiró o ya no es válido. Solicita uno nuevo.',
  rate_limit: 'Debes esperar antes de solicitar otro código. Respeta el tiempo indicado.',
  network: 'No fue posible conectar con Supabase. Revisa tu conexión e intenta nuevamente.',
  invalid_response: 'No se pudo confirmar el correo con la respuesta recibida de Supabase.',
  registration_required: 'No hay un registro reciente disponible. Vuelve al formulario de registro.',
  busy: 'Ya hay una operación de verificación en curso.',
  provider: 'Supabase no pudo completar la operación. Intenta más tarde o consulta con el equipo de soporte.',
};

export class VerificationError extends Error {
  constructor(public readonly kind: VerificationErrorKind, public readonly retryAfterMs = 0) {
    super(messages[kind]);
    this.name = 'VerificationError';
  }
}

/** Never expose provider messages, OTPs, tokens or response bodies. */
export function verificationError(error: unknown, retryAfterMs = 0): VerificationError {
  if (error instanceof VerificationError) return error;
  if (typeof error === 'object' && error !== null) {
    const { code, status, name } = error as { code?: unknown; status?: unknown; name?: unknown };
    if (status === 429 || code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') {
      return new VerificationError('rate_limit', Math.max(60000, retryAfterMs));
    }
    if (code === 'otp_expired') return new VerificationError('expired_code');
    if (code === 'validation_failed' || code === 'invalid_credentials') return new VerificationError('invalid_code');
    if (name === 'AuthRetryableFetchError' || status === 0) return new VerificationError('network');
  }
  return new VerificationError('provider');
}
