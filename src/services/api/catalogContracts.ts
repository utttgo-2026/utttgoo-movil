import type { ApiCategory, ApiPage, SellerActiveResponse, ProductResponse, ProductPage, OrderResponse } from '@/types/api';
import { ApiError } from './errors';
import { validRoles } from './sessionContract';

export function invalidContract(): never { throw new ApiError('invalid_response', 'AWS devolvió datos que no cumplen el contrato confirmado.'); }
export function object(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || !value || Array.isArray(value)) return invalidContract();
  return value as Record<string, unknown>;
}
export function text(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0 && !/[\u0000-\u001f\u007f]/.test(value); }
export function pageResponse<T>(data: unknown, decode: (item: unknown) => T): ApiPage<T> {
  const value = object(data);
  if (!Array.isArray(value.items) || !Number.isSafeInteger(value.page) || Number(value.page) < 1 ||
      !Number.isSafeInteger(value.pageSize) || Number(value.pageSize) < 1 || Number(value.pageSize) > 100 ||
      !Number.isSafeInteger(value.total) || Number(value.total) < value.items.length || value.items.length > Number(value.pageSize)) return invalidContract();
  return { items: value.items.map(decode), page: Number(value.page), pageSize: Number(value.pageSize), total: Number(value.total) };
}
export function categoryResponse(data: unknown): ApiCategory {
  const value = object(data);
  if (!text(value.id) || !text(value.name) || !Number.isSafeInteger(value.sortOrder)) return invalidContract();
  return { id: value.id, name: value.name, sortOrder: Number(value.sortOrder) };
}
export function sellerActiveResponse(data: unknown): SellerActiveResponse {
  const v = object(data);
  if (!text(v.sellerId) || !text(v.businessName) || typeof v.description !== 'string' || !text(v.pickupPoint) ||
      v.status !== 'Active' || v.isActive !== true || !validRoles(v.roles) || v.roles.length !== 2 ||
      !text(v.createdAt) || !Number.isFinite(Date.parse(v.createdAt)) || !text(v.updatedAt) || !Number.isFinite(Date.parse(v.updatedAt))) return invalidContract();
  return { sellerId: v.sellerId, businessName: v.businessName, description: v.description, pickupPoint: v.pickupPoint,
    status: 'Active', isActive: true, roles: ['Buyer', 'Seller'], createdAt: v.createdAt, updatedAt: v.updatedAt };
}

/** Monetary DTOs use MXN with at most two decimals, compared in integer cents. */
export function money(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 &&
    Number.isSafeInteger(Math.round(value * 100)) && Math.abs(value * 100 - Math.round(value * 100)) < 1e-7;
}
/** Only the JSON numeric/string formats explicitly published in OpenAPI, without general coercion. */
export function schemaNumber(value: unknown, integer = false): number {
  if (typeof value === 'string') {
    const pattern = integer ? /^-?(?:0|[1-9]\d*)$/ : /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;
    if (!pattern.test(value)) return invalidContract();
    value = Number(value);
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || (integer && !Number.isSafeInteger(value))) return invalidContract();
  return value;
}
export function productResponse(data: unknown): ProductResponse {
  const v = object(data);
  const price = schemaNumber(v.price);
  const stock = schemaNumber(v.stock, true);
  const ratingAverage = v.ratingAverage === null ? null : schemaNumber(v.ratingAverage);
  const ratingCount = v.ratingCount === null ? null : schemaNumber(v.ratingCount, true);
  if (!text(v.id) || !text(v.sellerId) || !text(v.categoryId) || !text(v.name) || typeof v.description !== 'string' ||
      !money(price) || stock < 0 || stock > 2147483647 || !Array.isArray(v.ingredients) || !v.ingredients.every(text) ||
      !(v.sellerDisplayName === null || typeof v.sellerDisplayName === 'string') ||
      !(v.categoryName === null || typeof v.categoryName === 'string') || typeof v.isAvailable !== 'boolean' ||
      (ratingAverage !== null && ratingAverage < 0) || (ratingCount !== null && ratingCount < 0) ||
      !text(v.createdAt) || !Number.isFinite(Date.parse(v.createdAt)) || !text(v.updatedAt) || !Number.isFinite(Date.parse(v.updatedAt)) ||
      (v.status !== 'Active' && v.status !== 'Paused')) return invalidContract();
  return { id: v.id, sellerId: v.sellerId, categoryId: v.categoryId, name: v.name, description: v.description,
    price, stock, ingredients: [...v.ingredients], status: v.status, sellerDisplayName: v.sellerDisplayName, categoryName: v.categoryName,
    isAvailable: v.isAvailable, ratingAverage, ratingCount, createdAt: v.createdAt, updatedAt: v.updatedAt };
}
export function productPageResponse(data: unknown): ProductPage {
  const v = object(data);
  if ('totalCount' in v) return invalidContract();
  const page = pageResponse({ ...v, page: schemaNumber(v.page, true), pageSize: schemaNumber(v.pageSize, true), total: schemaNumber(v.total, true) }, productResponse);
  if (new Set(page.items.map((item) => item.id)).size !== page.items.length) return invalidContract();
  return page;
}
export function orderResponse(data: unknown): OrderResponse {
  const raw = object(data);
  let v = raw;
  if ('orderId' in raw || 'buyerUserId' in raw) {
    // Deployed OpenAPI schema, explicitly adapted to the established internal receipt model.
    if ('id' in raw || 'buyerId' in raw || 'totalAmount' in raw || !text(raw.orderId) || !text(raw.buyerUserId) ||
        !text(raw.productName) || raw.currency !== 'MXN' || !text(raw.paymentMethod) || typeof raw.pickupPoint !== 'string' ||
        !nullableDate(raw.deliveredAt) || !nullableDate(raw.completedAt) || !text(raw.updatedAt) || !Number.isFinite(Date.parse(raw.updatedAt)) ||
        !Number.isSafeInteger(raw.version) || Number(raw.version) < 0) return invalidContract();
    v = { ...raw, id: raw.orderId, buyerId: raw.buyerUserId, totalAmount: raw.total };
  }
  if (!text(v.id) || !text(v.buyerId) || !text(v.sellerId) || !text(v.productId) ||
      !Number.isSafeInteger(v.quantity) || Number(v.quantity) < 1 || !money(v.unitPrice) || !money(v.totalAmount) ||
      Math.round(v.unitPrice * 100) * Number(v.quantity) !== Math.round(v.totalAmount * 100) ||
      v.status !== 'Pending' || !text(v.createdAt) || !Number.isFinite(Date.parse(v.createdAt)) ||
      (v.notes != null && (typeof v.notes !== 'string' || v.notes.length > 250 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v.notes)))) return invalidContract();
  return { id: v.id, buyerId: v.buyerId, sellerId: v.sellerId, productId: v.productId, quantity: Number(v.quantity),
    unitPrice: v.unitPrice, totalAmount: v.totalAmount, status: 'Pending', createdAt: v.createdAt,
    ...(typeof v.notes === 'string' ? { notes: v.notes } : {}) };
}
function nullableDate(value: unknown): boolean {
  return value === null || (text(value) && Number.isFinite(Date.parse(value)));
}
