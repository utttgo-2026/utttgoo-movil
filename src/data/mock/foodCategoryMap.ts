/** Correspondencias verificables por descripción; no inferir dietas ni sustituir alimentos. */
export const UNCLASSIFIED_CATEGORY = 'unclassified';

const verifiedCategories: Readonly<Record<string, string>> = {
  'food-5': 'cat-1', // Torta de milanesa
  'food-5b': 'cat-2', 'food-5c': 'cat-2', 'food-5d': 'cat-2', // Comidas completas
  'food-9': 'cat-3', 'food-9b': 'cat-3', 'food-9c': 'cat-3', // Postres
  'food-8': 'cat-4', 'food-8b': 'cat-4', 'food-8c': 'cat-4', // Bebidas
  'food-10': 'cat-5', 'food-10b': 'cat-5', 'food-10c': 'cat-5', // Snacks
};

export function verifiedCategoryId(foodId: string): string {
  return verifiedCategories[foodId] ?? UNCLASSIFIED_CATEGORY;
}
