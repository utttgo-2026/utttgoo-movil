import type { ApiCategory, ApiPage, SellerActiveResponse } from '@/types/api';
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
