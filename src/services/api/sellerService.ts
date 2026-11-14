import type { SellerActivationRequest, SellerPatch } from '@/types/api';
import { bearerToken, requiredText, sellerBody } from '@/utils/apiValidation';

import { httpClient } from './httpClient';

export const sellerService = {
  requestActivation(token: string, input: SellerActivationRequest) {
    return httpClient.request('/api/v1/sellers/activation-requests', {
      method: 'POST', token: bearerToken(token), body: sellerBody(input, true), expectedStatuses: [200, 201],
    });
  },
  getMe(token: string) {
    return httpClient.request('/api/v1/sellers/me', { token: bearerToken(token), expectedStatuses: [200] });
  },
  updateMe(token: string, patch: SellerPatch) {
    return httpClient.request('/api/v1/sellers/me', {
      method: 'PATCH', token: bearerToken(token), body: sellerBody(patch), expectedStatuses: [200],
    });
  },
  getById(sellerId: string) {
    return httpClient.request(`/api/v1/sellers/${encodeURIComponent(requiredText(sellerId))}`, { expectedStatuses: [200] });
  },
};
