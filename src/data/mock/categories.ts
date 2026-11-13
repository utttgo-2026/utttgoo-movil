import type { FoodCategory } from '@/types/models';
import { mockFoods } from './foods';

const categories = [
  { id: 'cat-1', name: 'Tortas', icon: 'fast-food-outline', color: '#FFF7E7' },
  { id: 'cat-2', name: 'Comida corrida', icon: 'restaurant-outline', color: '#FFF0F0' },
  { id: 'cat-3', name: 'Postres', icon: 'ice-cream-outline', color: '#FFF0F0' },
  { id: 'cat-4', name: 'Bebidas', icon: 'wine-outline', color: '#EDF5F7' },
  { id: 'cat-5', name: 'Snacks', icon: 'nutrition-outline', color: '#ECF8EF' },
  { id: 'cat-6', name: 'Vegano', icon: 'leaf-outline', color: '#ECF8EF' },
];

export const mockCategories: FoodCategory[] = categories.map((category) => ({
  ...category, itemCount: mockFoods.filter((food) => food.categoryId === category.id).length,
}));
