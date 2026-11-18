import type { LoginRequest, RegisterRequest } from '@/types/api';
import { assertAllowedFields, bearerToken, institutionalEmail, registrationName, requirePassword } from '@/utils/apiValidation';

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
        displayName: registrationName(input.displayName),
      },
      // Current OpenAPI documents200; retain the previously agreed202 without inferring a session.
      expectedStatuses: [200, 202],
    });
  },
  getMe(token: string) {
    return httpClient.request('/api/v1/auth/me', { token: bearerToken(token), expectedStatuses: [200] });
  },
};
