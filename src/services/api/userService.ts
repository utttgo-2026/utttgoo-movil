import type { UserPatch } from '@/types/api';
import { bearerToken, userPatchBody } from '@/utils/apiValidation';

import { httpClient } from './httpClient';

export const userService = {
  getMe(token: string) {
    return httpClient.request('/api/v1/users/me', { token: bearerToken(token), expectedStatuses: [200] });
  },
  updateMe(token: string, patch: UserPatch) {
    return httpClient.request('/api/v1/users/me', {
      method: 'PATCH', token: bearerToken(token), body: userPatchBody(patch), expectedStatuses: [200],
    });
  },
};
