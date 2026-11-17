import type { SellerActivationRequest, SellerPatch, SellerActiveResponse } from '@/types/api';
import { bearerToken, requiredText, sellerBody } from '@/utils/apiValidation';

import { httpClient } from './httpClient';
import { sellerActiveResponse } from './catalogContracts';
import { ApiError } from './errors';

export type SellerLookup = { kind: 'missing'; status: 404 } | { kind: 'active'; status: number; seller: SellerActiveResponse };

export const sellerService = {
  async requestActivation(token: string, input: SellerActivationRequest) {
    const response = await httpClient.request('/api/v1/sellers/activation-requests', {
      method: 'POST', token: bearerToken(token), body: sellerBody(input, true), expectedStatuses: [200, 201],
    });
    return { ...response, data: sellerActiveResponse(response.data) };
  },
  async getMe(token: string) {
    const response = await httpClient.request('/api/v1/sellers/me', { token: bearerToken(token), expectedStatuses: [200] });
    return { ...response, data: sellerActiveResponse(response.data) };
  },
  async lookupMe(token: string): Promise<SellerLookup> {
    try {
      const response = await sellerService.getMe(token);
      return { kind: 'active', status: response.status, seller: response.data };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404 && error.code === 'SELLER_PROFILE_NOT_FOUND') return { kind: 'missing', status: 404 };
      throw error;
    }
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
