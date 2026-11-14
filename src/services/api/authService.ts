import type { LoginRequest, RegisterRequest } from '@/types/api';
import { assertAllowedFields, bearerToken, institutionalEmail, requiredText, requirePassword } from '@/utils/apiValidation';

import { httpClient } from './httpClient';

export const authService = {
  login(input: LoginRequest) {
    assertAllowedFields(input, ['email', 'password']);
    return httpClient.request('/api/v1/auth/login', {
      method: 'POST',
      body: { email: institutionalEmail(input.email), password: requirePassword(input.password) },
      expectedStatuses: [200],
    });
  },
  register(input: RegisterRequest) {
    assertAllowedFields(input, ['email', 'password', 'displayName']);
    return httpClient.request('/api/v1/auth/register', {
      method: 'POST',
      body: {
        email: institutionalEmail(input.email),
        password: requirePassword(input.password),
        displayName: requiredText(input.displayName),
      },
      // OpenAPI publica 200; 202 fue el contrato previo del equipo. Ambos se aceptan explícitamente.
      expectedStatuses: [200, 202],
    });
  },
  getMe(token: string) {
    return httpClient.request('/api/v1/auth/me', { token: bearerToken(token), expectedStatuses: [200] });
  },
};
