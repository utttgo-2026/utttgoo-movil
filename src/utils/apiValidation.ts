import { ApiError } from '@/services/api/errors';
import type { AdminUsersQuery, SellerActivationRequest, SellerPatch, UserPatch } from '@/types/api';

export function institutionalEmail(value: unknown): string {
  if (typeof value !== 'string' || value.length > 254 || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new ApiError('validation', 'Utiliza un correo institucional válido @uttt.edu.mx (máximo 254 caracteres).');
  }
  const email = value.trim().toLowerCase();
  if (!/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@uttt\.edu\.mx$/.test(email) ||
      email.split('@')[0].length > 64 || email.startsWith('.') || email.includes('..') || email.includes('.@')) {
    throw new ApiError('validation', 'Utiliza un correo institucional válido @uttt.edu.mx.');
  }
  return email;
}

export function registrationName(value: unknown): string {
  if (typeof value !== 'string' || value.length > 400 || /[\p{Cc}\p{Cf}]/u.test(value)) {
    throw new ApiError('validation', 'Ingresa un nombre de 2 a 100 caracteres sin caracteres de control.');
  }
  const name = value.normalize('NFC').replace(/\s+/gu, ' ').trim();
  if ([...name].length < 2 || [...name].length > 100 || !/^[\p{L}\p{M} .’'\p{Pd}]+$/u.test(name) || !/\p{L}/u.test(name)) {
    throw new ApiError('validation', 'Ingresa un nombre de 2 a 100 caracteres: letras, espacios, apóstrofos, puntos o guiones.');
  }
  return name;
}

export function requiredText(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new ApiError('validation', 'Completa los campos con texto válido.');
  }
  return value.trim();
}

export function requirePassword(value: unknown): string {
  // Longitudes/política pendientes del backend. No modificar una contraseña mediante trim.
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError('validation', 'Ingresa tu contraseña.');
  }
  if (value.length > 4096) throw new ApiError('validation', 'La contraseña supera el límite de 4096 caracteres de la solicitud.');
  return value;
}

export function assertAllowedFields(value: object, allowed: readonly string[]): void {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).some((key) => !allowed.includes(key))) {
    throw new ApiError('validation', 'La solicitud contiene campos no permitidos.');
  }
}

export function userPatchBody(patch: UserPatch): { [key: string]: string } {
  assertAllowedFields(patch, ['displayName', 'phone']);
  const body: { [key: string]: string } = {};
  if (patch.displayName !== undefined) body.displayName = requiredText(patch.displayName);
  if (patch.phone !== undefined) body.phone = requiredText(patch.phone);
  if (!Object.keys(body).length) throw new ApiError('validation', 'Indica al menos un campo para actualizar.');
  return body;
}

export function sellerBody(patch: SellerPatch, required = false): { [key: string]: string } {
  const fields: (keyof SellerActivationRequest)[] = ['businessName', 'description', 'pickupPoint'];
  assertAllowedFields(patch, fields);
  const body: { [key: string]: string } = {};
  for (const field of fields) {
    if (required || patch[field] !== undefined) body[field] = requiredText(patch[field]);
  }
  if (!Object.keys(body).length) throw new ApiError('validation', 'Indica al menos un campo para actualizar.');
  return body;
}

export function adminUsersQuery(query: AdminUsersQuery): Record<string, number> {
  assertAllowedFields(query, ['page', 'pageSize']);
  const result: Record<string, number> = {};
  for (const key of ['page', 'pageSize'] as const) {
    const value = query[key];
    if (value === undefined) continue;
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new ApiError('validation', 'La página y su tamaño deben ser enteros positivos.');
    }
    result[key] = value;
  }
  return result;
}

export function bearerToken(token: string): string {
  if (typeof token !== 'string' || !token || /\s/.test(token)) {
    throw new ApiError('unauthenticated', 'Se requiere una sesión válida.');
  }
  return token;
}
