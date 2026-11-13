import type { Href } from 'expo-router';
import type { FoodAvailability, FoodItem } from '@/types/models';

export type CatalogParams = Record<string, string | string[] | undefined>;
export interface CatalogSelection {
  categoryId?: string;
  query: string;
  availability: FoodAvailability | 'all';
  maxPrice?: number;
  sort: 'price' | 'rating';
}

export function singleParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function readCatalogSelection(params: CatalogParams): CatalogSelection {
  const availability = singleParam(params.availability);
  const price = singleParam(params.maxPrice);
  const parsedPrice = price?.trim() ? Number(price) : NaN;
  return {
    categoryId: Array.isArray(params.categoryId) ? '[invalid]' : singleParam(params.categoryId),
    query: singleParam(params.query) ?? '',
    availability: availability === 'available' || availability === 'sold-out' || availability === 'scheduled' ? availability : 'all',
    maxPrice: Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : undefined,
    sort: params.sort === 'price' ? 'price' : 'rating',
  };
}

function normalized(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function selectFoods(foods: readonly FoodItem[], selection: CatalogSelection): FoodItem[] {
  const query = normalized(selection.query);
  return foods.filter((food) =>
    (!selection.categoryId || food.categoryId === selection.categoryId) &&
    (selection.availability === 'all' || food.availability === selection.availability) &&
    (selection.maxPrice === undefined || food.price <= selection.maxPrice) &&
    (!query || normalized(food.name).includes(query))
  ).sort((a, b) => selection.sort === 'price' ? a.price - b.price : b.rating - a.rating);
}

export function selectionParams(selection: CatalogSelection): Record<string, string> {
  return {
    ...(selection.categoryId ? { categoryId: selection.categoryId } : {}),
    query: selection.query,
    availability: selection.availability,
    maxPrice: selection.maxPrice === undefined ? '' : String(selection.maxPrice),
    sort: selection.sort,
  };
}

export type CatalogDestination = '/buyer/search' | '/buyer/category' | '/buyer/available-now';

export function catalogRoute(pathname: CatalogDestination, selection: CatalogSelection): Href {
  return { pathname, params: selectionParams(selection) };
}

export function filtersRoute(origin: CatalogDestination, selection: CatalogSelection): Href {
  return { pathname: '/buyer/filters', params: { ...selectionParams(selection), origin } };
}
