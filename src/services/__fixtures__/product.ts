import type { ProductResponse } from '@/types/api';

/** Synthetic schema fixture imported by tests only; never used as a runtime catalog fallback. */
export const productMetadata: Pick<ProductResponse, 'sellerDisplayName' | 'categoryName' | 'isAvailable' | 'ratingAverage' | 'ratingCount' | 'createdAt' | 'updatedAt'> = {
  sellerDisplayName: null, categoryName: null, isAvailable: true, ratingAverage: null, ratingCount: null,
  createdAt: '2026-11-16T12:00:00Z', updatedAt: '2026-11-16T12:00:00Z',
};
