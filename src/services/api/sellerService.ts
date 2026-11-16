import type { SellerActivationRequest, SellerPatch } from '@/types/api';
import { bearerToken, requiredText, sellerBody } from '@/utils/apiValidation';

import { httpClient } from './httpClient';
import { sellerActiveResponse } from './catalogContracts';

export const sellerService = {
  async requestActivation(token: string, input: SellerActivationRequest) {
    const response = await httpClient.request('/api/v1/sellers/activation-requests', {
      method: 'POST', token: bearerToken(token), body: sellerBody(input, true), expectedStatuses: [201],
    });
    return { ...response, data: sellerActiveResponse(response.data) };
  },
  async getMe(token: string) {
    const response = await httpClient.request('/api/v1/sellers/me', { token: bearerToken(token), expectedStatuses: [200] });
    return { ...response, data: sellerActiveResponse(response.data) };
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
