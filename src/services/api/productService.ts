import type { CreateProductRequest, ProductPatch, ProductSort, ProductAvailabilityRequest } from '@/types/api';
import { httpClient } from './httpClient';
import { ApiError } from './errors';
import { invalidContract, productPageResponse, productResponse } from './catalogContracts';
import { assertAllowedFields } from '@/utils/apiValidation';
import { priceInCents, sellerText } from '@/utils/sellerValidation';
import { productImageUnavailableDiagnostic } from './commerceDiagnostics';

export function createProductBody(input: CreateProductRequest, categoryIds: readonly string[]): CreateProductRequest {
  assertAllowedFields(input, ['name', 'description', 'ingredients', 'categoryId', 'price', 'stock', 'imageUrl']);
  if (input.imageUrl != null) throw new ApiError('validation', 'Las fotografías no están disponibles. Publica sin imagen hasta la Fase 05.');
  if (!Array.isArray(input.ingredients) || input.ingredients.length > 50) throw new ApiError('validation', 'Ingredientes inválidos (máximo 50).');
  if (typeof input.categoryId !== 'string' || !categoryIds.includes(input.categoryId)) throw new ApiError('validation', 'Selecciona una categoría AWS válida.');
  if (typeof input.price !== 'number' || !Number.isFinite(input.price) || priceInCents(String(input.price)) / 100 !== input.price) throw new ApiError('validation', 'Precio MXN inválido.');
  if (!Number.isSafeInteger(input.stock) || input.stock < 0 || input.stock > 2147483647) throw new ApiError('validation', 'Stock debe ser entero no negativo.');
  return { name: sellerText(input.name, 2, 100), description: sellerText(input.description, 2, 1000),
    ingredients: input.ingredients.map((value) => sellerText(value, 1, 100)), categoryId: input.categoryId, price: input.price, stock: input.stock };
}

export interface ProductSelection { search?: string; categoryId?: string; minPrice?: number; maxPrice?: number; page?: number; pageSize?: number; sortBy?: ProductSort }
export const productSorts: readonly ProductSort[] = ['price_asc', 'price_desc', 'name_asc', 'created_desc'];
export function productPatchBody(input: ProductPatch) {
  assertAllowedFields(input, ['price', 'stock']);
  if (input.price === undefined && input.stock === undefined) throw new ApiError('validation', 'Indica precio o stock.');
  if (input.price !== undefined && (typeof input.price !== 'number' || !Number.isFinite(input.price) || priceInCents(String(input.price)) / 100 !== input.price)) throw new ApiError('validation', 'Precio inválido.');
  if (input.stock !== undefined && (!Number.isSafeInteger(input.stock) || input.stock < 0 || input.stock > 2147483647)) throw new ApiError('validation', 'Stock inválido.');
  return { ...(input.price !== undefined ? { price: input.price } : {}), ...(input.stock !== undefined ? { stock: input.stock } : {}) };
}
export function productAvailabilityBody(input: ProductAvailabilityRequest): ProductAvailabilityRequest {
  assertAllowedFields(input, ['status']);
  if (input.status !== 'Active' && input.status !== 'Paused') throw new ApiError('validation', 'Estado de producto inválido. Usa Active o Paused.');
  return { status: input.status };
}
export const productService = {
  async getPage(selection: ProductSelection = {}) {
    assertAllowedFields(selection, ['search', 'categoryId', 'minPrice', 'maxPrice', 'page', 'pageSize', 'sortBy']);
    if (selection.sortBy === 'created_desc') throw new ApiError('contract_unavailable', 'El orden Más recientes no está disponible en el despliegue AWS. Usa el orden predeterminado.');
    if (selection.sortBy !== undefined && !productSorts.includes(selection.sortBy)) throw new ApiError('validation', 'Orden de productos inválido.');
    const page = selection.page ?? 1; const pageSize = selection.pageSize ?? 20;
    if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new ApiError('validation', 'Página inválida.');
    for (const price of [selection.minPrice, selection.maxPrice]) if (price !== undefined && (!Number.isFinite(price) || price < 0)) throw new ApiError('validation', 'Filtro de precio inválido.');
    if (selection.minPrice !== undefined && selection.maxPrice !== undefined && selection.minPrice > selection.maxPrice) throw new ApiError('validation', 'Rango de precios inválido.');
    for (const value of [selection.search, selection.categoryId]) if (value !== undefined && (typeof value !== 'string' || value.length > 254 || /[\u0000-\u001f\u007f]/.test(value))) throw new ApiError('validation', 'Filtro inválido.');
    const response = await httpClient.request('/api/v1/products', { query: { ...selection, page, pageSize }, expectedStatuses: [200] });
    const data = productPageResponse(response.data);
    if (data.page !== page || data.pageSize !== pageSize) throw new ApiError('invalid_response', 'Página de productos inesperada.');
    return data;
  },
  async getById(id: string) {
    const productId = sellerText(id, 1, 256);
    const response = await httpClient.request(`/api/v1/products/${encodeURIComponent(productId)}`, { expectedStatuses: [200] });
    const data = productResponse(response.data);
    if (data.id !== productId) return invalidContract();
    return data;
  },
  async create(token: string, input: CreateProductRequest, categoryIds: readonly string[]) {
    const body = createProductBody(input, categoryIds);
    const response = await httpClient.request('/api/v1/products', { method: 'POST', token, body: { ...body }, expectedStatuses: [201] }).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 422 && error.code === 'IMAGE_NOT_AVAILABLE') productImageUnavailableDiagnostic();
      throw error;
    });
    const data = productResponse(response.data);
    if (data.categoryId !== body.categoryId || data.price !== body.price || data.stock !== body.stock) return invalidContract();
    return data;
  },
  async update(token: string, id: string, patch: ProductPatch) {
    const body = productPatchBody(patch);
    const productId = sellerText(id, 1, 256);
    const response = await httpClient.request(`/api/v1/products/${encodeURIComponent(productId)}`, { method: 'PATCH', token, body, expectedStatuses: [200] });
    const data = productResponse(response.data);
    if (data.id !== productId || (body.price !== undefined && data.price !== body.price) || (body.stock !== undefined && data.stock !== body.stock)) return invalidContract();
    return data;
  },
  async updateStatus(token: string, id: string, input: ProductAvailabilityRequest) {
    const body = productAvailabilityBody(input);
    const productId = sellerText(id, 1, 256);
    const response = await httpClient.request(`/api/v1/products/${encodeURIComponent(productId)}/availability`, {
      method: 'PATCH', token, body: { ...body }, expectedStatuses: [200],
    });
    const data = productResponse(response.data);
    if (data.id !== productId || data.status !== body.status) return invalidContract();
    return data;
  },
};
