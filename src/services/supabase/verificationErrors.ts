export type VerificationErrorKind = 'configuration' | 'invalid_code' | 'expired_code' | 'rate_limit'
  | 'network' | 'invalid_response' | 'registration_required' | 'busy' | 'provider';

const messages: Record<VerificationErrorKind, string> = {
  configuration: 'La verificación no está disponible en este momento. Consulta a soporte.',
  invalid_code: 'El código no es correcto. Introduce los seis dígitos del correo más reciente.',
  expired_code: 'El código expiró o ya no es válido. Si ya confirmaste tu correo, intenta iniciar sesión; si no, solicita otro código.',
  rate_limit: 'Debes esperar antes de solicitar otro código. Respeta el tiempo indicado.',
  network: 'No pudimos confirmar el resultado. Revisa tu conexión antes de intentarlo de nuevo.',
  invalid_response: 'No pudimos confirmar el resultado. Si ya confirmaste tu correo, intenta iniciar sesión.',
  registration_required: 'No hay un registro reciente disponible. Vuelve al formulario de registro.',
  busy: 'Ya hay una operación de verificación en curso.',
  provider: 'No pudimos completar la operación. Intenta más tarde o consulta a soporte.',
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
    if (code === 'otp_disabled') return new VerificationError('configuration');
    if (code === 'validation_failed' || code === 'invalid_credentials') return new VerificationError('invalid_code');
    if (name === 'AuthRetryableFetchError' || status === 0) return new VerificationError('network');
  }
  return new VerificationError('provider');
}
