import type { AdminUsersQuery } from '@/types/api';
import { adminUsersQuery, bearerToken } from '@/utils/apiValidation';

import { httpClient } from './httpClient';

export const adminService = {
  getUsers(token: string, query: AdminUsersQuery = {}) {
    return httpClient.request('/api/v1/admin/users', {
      token: bearerToken(token), query: adminUsersQuery(query), expectedStatuses: [200],
    });
  },
};
