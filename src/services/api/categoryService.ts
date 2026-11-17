import { httpClient } from './httpClient';
import { categoryResponse, pageResponse } from './catalogContracts';
import { ApiError } from './errors';
import type { ApiCategory } from '@/types/api';

export const categoryService = {
  async getPage(page = 1, pageSize = 20) {
    if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new ApiError('validation', 'Paginación inválida.');
    const response = await httpClient.request('/api/v1/categories', { query: { page, pageSize }, expectedStatuses: [200] });
    const data = pageResponse(response.data, categoryResponse);
    if (data.page !== page || data.pageSize !== pageSize) throw new ApiError('invalid_response', 'AWS devolvió una página inesperada.');
    return data;
  },
  async getAll() {
    const items: ApiCategory[] = [];
    for (let page = 1; page <= 100; page++) {
      const response = await categoryService.getPage(page);
      items.push(...response.items);
      if (items.length >= response.total) {
        if (new Set(items.map((item) => item.id)).size !== items.length) throw new ApiError('invalid_response', 'AWS devolvió categorías duplicadas.');
        return items.sort((a, b) => a.sortOrder - b.sortOrder);
      }
      if (!response.items.length) break;
    }
    throw new ApiError('invalid_response', 'No se pudo completar el catálogo de categorías.');
  },
};
