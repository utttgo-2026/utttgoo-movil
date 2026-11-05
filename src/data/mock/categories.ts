import type { FoodCategory } from '@/types/models';

export const mockCategories: FoodCategory[] = [
  { id: 'cat-1', name: 'Desayunos', icon: 'cafe-outline', color: '#FFF7E7', itemCount: 4 },
  { id: 'cat-2', name: 'Comida corrida', icon: 'restaurant-outline', color: '#FFF0F0', itemCount: 4 },
  { id: 'cat-3', name: 'Antojitos', icon: 'fast-food-outline', color: '#ECF8EF', itemCount: 4 },
  { id: 'cat-4', name: 'Bebidas', icon: 'wine-outline', color: '#EDF5F7', itemCount: 3 },
  { id: 'cat-5', name: 'Postres', icon: 'ice-cream-outline', color: '#FFF0F0', itemCount: 3 },
  { id: 'cat-6', name: 'Snacks', icon: 'nutrition-outline', color: '#ECF8EF', itemCount: 3 },
];