import type { ApiErrorKind } from './errors';
import { isBetaRegistrationOnly } from '@/config/betaRegistration';

type FailureKind = ApiErrorKind | 'unexpected';
type RegistrationEvent =
  | { event: 'form_submit' | 'form_dispatch' | 'form_validation_failed' }
  | { event: 'form_result'; accepted: boolean }
  | { event: 'request_start'; origin: string }
  | { event: 'response'; status: number }
  | { event: 'failure'; kind: FailureKind };

const failureKinds: readonly FailureKind[] = [
  'configuration', 'insecure_transport', 'validation', 'unauthenticated', 'http',
  'timeout', 'network', 'invalid_response', 'contract_unavailable', 'storage', 'cancelled', 'unexpected',
];

/** Development/explicit internal Beta projection; no form data, headers, bodies or raw errors. */
export function registrationDiagnostic(input: RegistrationEvent): void {
  if (!__DEV__ && !isBetaRegistrationOnly()) return;
  const fields: Record<string, string | number | boolean> = {
    event: input.event, method: 'POST', path: '/api/v1/auth/register', timestamp: new Date().toISOString(),
  };
  switch (input.event) {
    case 'form_submit':
    case 'form_dispatch':
      break;
    case 'form_validation_failed':
      fields.kind = 'validation';
      break;
    case 'form_result':
      fields.accepted = input.accepted === true;
      break;
    case 'request_start': {
      try {
        const url = new URL(input.origin);
        if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') return;
        fields.origin = url.origin;
        fields.scheme = url.protocol;
      } catch { return; }
      break;
    }
    case 'response':
      if (!Number.isInteger(input.status) || input.status < 100 || input.status > 599) return;
      fields.status = input.status;
      break;
    case 'failure':
      fields.kind = failureKinds.includes(input.kind) ? input.kind : 'unexpected';
      break;
    default:
      return;
  }
  console.info('[aws-register]', fields);
}
