import type { CreateProductRequest } from '@/types/api';
import { httpClient } from './httpClient';
import { ApiError } from './errors';
import { pageResponse } from './catalogContracts';
import { assertAllowedFields } from '@/utils/apiValidation';
import { priceInCents, sellerText } from '@/utils/sellerValidation';

export function productContractMissing(): never { throw new ApiError('contract_unavailable', 'AWS ya ofrece productos, pero falta el DTO completo de respuesta para mostrarlos o confirmar mutaciones sin inventar datos.'); }
export function createProductBody(input: CreateProductRequest, categoryIds: readonly string[]): CreateProductRequest {
  assertAllowedFields(input, ['name', 'description', 'ingredients', 'categoryId', 'price', 'stock']);
  if (!Array.isArray(input.ingredients) || input.ingredients.length > 50) throw new ApiError('validation', 'Ingredientes inválidos (máximo 50).');
  if (typeof input.categoryId !== 'string' || !categoryIds.includes(input.categoryId)) throw new ApiError('validation', 'Selecciona una categoría AWS válida.');
  if (typeof input.price !== 'number' || !Number.isFinite(input.price) || priceInCents(String(input.price)) / 100 !== input.price) throw new ApiError('validation', 'Precio MXN inválido.');
  if (!Number.isSafeInteger(input.stock) || input.stock < 0 || input.stock > 2147483647) throw new ApiError('validation', 'Stock debe ser entero no negativo.');
  return { name: sellerText(input.name, 2, 100), description: sellerText(input.description, 2, 1000),
    ingredients: input.ingredients.map((value) => sellerText(value, 1, 100)), categoryId: input.categoryId, price: input.price, stock: input.stock };
}

export interface ProductSelection { search?: string; categoryId?: string; minPrice?: number; maxPrice?: number; page?: number; pageSize?: number }
export function productPatchBody(input: { price?: number; stock?: number }) {
  assertAllowedFields(input, ['price', 'stock']);
  if (input.price === undefined && input.stock === undefined) throw new ApiError('validation', 'Indica precio o stock.');
  if (input.price !== undefined && (typeof input.price !== 'number' || !Number.isFinite(input.price) || priceInCents(String(input.price)) / 100 !== input.price)) throw new ApiError('validation', 'Precio inválido.');
  if (input.stock !== undefined && (!Number.isSafeInteger(input.stock) || input.stock < 0 || input.stock > 2147483647)) throw new ApiError('validation', 'Stock inválido.');
  return { ...(input.price !== undefined ? { price: input.price } : {}), ...(input.stock !== undefined ? { stock: input.stock } : {}) };
}
export function pausedAvailabilityBody() { return { availability: 'Paused' as const }; }
export const productService = {
  async getPage(selection: ProductSelection = {}) {
    assertAllowedFields(selection, ['search', 'categoryId', 'minPrice', 'maxPrice', 'page', 'pageSize']);
    const page = selection.page ?? 1; const pageSize = selection.pageSize ?? 20;
    if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new ApiError('validation', 'Página inválida.');
    for (const price of [selection.minPrice, selection.maxPrice]) if (price !== undefined && (!Number.isFinite(price) || price < 0)) throw new ApiError('validation', 'Filtro de precio inválido.');
    if (selection.minPrice !== undefined && selection.maxPrice !== undefined && selection.minPrice > selection.maxPrice) throw new ApiError('validation', 'Rango de precios inválido.');
    for (const value of [selection.search, selection.categoryId]) if (value !== undefined && (typeof value !== 'string' || value.length > 254 || /[\u0000-\u001f\u007f]/.test(value))) throw new ApiError('validation', 'Filtro inválido.');
    const response = await httpClient.request('/api/v1/products', { query: { ...selection, page, pageSize }, expectedStatuses: [200] });
    const data = pageResponse(response.data, productContractMissing);
    if (data.page !== page || data.pageSize !== pageSize) throw new ApiError('invalid_response', 'Página de productos inesperada.');
    return data;
  },
  async getById(id: string) {
    const productId = sellerText(id, 1, 256);
    await httpClient.request(`/api/v1/products/${encodeURIComponent(productId)}`, { expectedStatuses: [200] });
    return productContractMissing();
  },
  async create(input: CreateProductRequest, categoryIds: readonly string[]) {
    createProductBody(input, categoryIds);
    // POST /api/v1/products confirmed, intentionally blocked until its 201 DTO can be decoded.
    return productContractMissing();
  },
  async update(_id: string, patch: { price?: number; stock?: number }) {
    productPatchBody(patch);
    // PATCH /api/v1/products/{id}: no request until complete whitelist/response is confirmed.
    return productContractMissing();
  },
  async pause(_id: string) { pausedAvailabilityBody(); return productContractMissing(); },
};
