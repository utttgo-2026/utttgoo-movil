import { createProductBody } from '@/services/api/productService';
import { priceInCents } from './sellerValidation';
import type { CreateProductRequest } from '@/types/api';

export interface ProductForm { name: string; description: string; ingredients: string; price: string; stock: string; categoryId: string }
export type ProductFormErrors = Partial<Record<keyof ProductForm, string>>;
export const emptyProductForm: ProductForm = { name: '', description: '', ingredients: '', price: '', stock: '0', categoryId: '' };

/** The existing service remains the final request boundary; this adds field-level feedback. */
export function validateProductForm(form: ProductForm, categoryIds: readonly string[]): { errors: ProductFormErrors; body?: CreateProductRequest } {
  const errors: ProductFormErrors = {};
  const markup = /<\s*\/?\s*[a-zA-Z!][^>]*>|\bon[a-z]+\s*=/i;
  const textError = (value: string, min: number, max: number) => {
    if (/[\p{Cc}\p{Cf}]/u.test(value) || markup.test(value)) return 'Usa texto sin etiquetas HTML ni caracteres de control.';
    const normalized = value.normalize('NFC').replace(/\s+/gu, ' ').trim();
    if ([...normalized].length < min || [...normalized].length > max) return `Usa entre ${min} y ${max} caracteres.`;
    return undefined;
  };
  errors.name = textError(form.name, 2, 100);
  errors.description = textError(form.description, 2, 500);
  const ingredients = form.ingredients.trim() ? form.ingredients.split(',') : [];
  if (ingredients.length > 20 || ingredients.some((item) => textError(item, 1, 60))) errors.ingredients = 'Usa hasta 20 ingredientes válidos, de 1 a 60 caracteres, sin elementos vacíos ni HTML.';
  const normalized = ingredients.map((item) => item.normalize('NFC').replace(/\s+/gu, ' ').trim());
  if (new Set(normalized.map((item) => item.toLocaleLowerCase('es-MX'))).size !== normalized.length) errors.ingredients = 'Evita ingredientes duplicados.';
  let price = 0;
  try { price = priceInCents(form.price) / 100; } catch { errors.price = 'Ingresa un precio positivo con hasta dos decimales.'; }
  if (!/^\d+$/.test(form.stock) || !Number.isSafeInteger(Number(form.stock)) || Number(form.stock) > 1000000) errors.stock = 'Ingresa un entero de 0 a 1,000,000.';
  if (!categoryIds.includes(form.categoryId)) errors.categoryId = 'Selecciona una categoría disponible de AWS.';
  if (Object.values(errors).some(Boolean)) return { errors };
  try { return { errors, body: createProductBody({ name: form.name, description: form.description, price, stock: Number(form.stock), categoryId: form.categoryId, ingredients: normalized }, categoryIds) }; }
  catch { return { errors: { name: 'Revisa los datos del alimento antes de publicar.' } }; }
}
