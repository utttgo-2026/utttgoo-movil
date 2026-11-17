import { mockCategories, mockFoods } from '@/data/mock';
import { UNCLASSIFIED_CATEGORY } from '@/data/mock/foodCategoryMap';
import { catalogRoute, filtersRoute, readCatalogSelection, selectFoods, selectionParams } from '../catalog';

describe('Categorías Figma y catálogo mock006', () => {
  test('conserva los21 ids y no inventa alimentos', () => {
    expect(mockFoods).toHaveLength(21);
    expect(new Set(mockFoods.map((food) => food.id)).size).toBe(21);
    expect(mockFoods.map((food) => food.id)).toEqual([
      'food-1', 'food-2', 'food-3', 'food-4', 'food-5', 'food-5b', 'food-5c', 'food-5d',
      'food-6', 'food-7', 'food-7b', 'food-7c', 'food-8', 'food-8b', 'food-8c',
      'food-9', 'food-9b', 'food-9c', 'food-10', 'food-10b', 'food-10c',
    ]);
  });

  test('seis nombres exactos, contadores reales y Vegano vacío', () => {
    expect(mockCategories.map((category) => category.name)).toEqual(['Tortas', 'Comida corrida', 'Postres', 'Bebidas', 'Snacks', 'Vegano']);
    expect(mockCategories.map((category) => category.itemCount)).toEqual([1, 3, 3, 3, 3, 0]);
    for (const category of mockCategories) {
      expect(category.itemCount).toBe(mockFoods.filter((food) => food.categoryId === category.id).length);
    }
  });

  test('ocho desayunos/antojitos no se etiquetan arbitrariamente como comida corrida/vegano', () => {
    expect(mockFoods.filter((food) => food.categoryId === UNCLASSIFIED_CATEGORY).map((food) => food.id))
      .toEqual(['food-1', 'food-2', 'food-3', 'food-4', 'food-6', 'food-7', 'food-7b', 'food-7c']);
    expect(selectFoods(mockFoods, readCatalogSelection({}))).toHaveLength(21);
  });

  test.each([
    ['cat-1', ['food-5']], ['cat-2', ['food-5b', 'food-5c', 'food-5d']],
    ['cat-3', ['food-9', 'food-9b', 'food-9c']], ['cat-4', ['food-8', 'food-8b', 'food-8c']],
    ['cat-5', ['food-10', 'food-10b', 'food-10c']], ['cat-6', []], ['missing', []],
  ])('filtra exclusivamente %s', (categoryId, ids) => {
    const selected = selectFoods(mockFoods, readCatalogSelection({ categoryId: categoryId as string }));
    expect(selected.map((food) => food.id).sort()).toEqual([...ids].sort());
  });

  test('disponibilidad/precio/query/orden se combinan sin mutar el catálogo', () => {
    const before = JSON.stringify(mockFoods);
    const selection = readCatalogSelection({ categoryId: 'cat-4', availability: 'available', maxPrice: '20', sort: 'price', query: 'agua' });
    expect(selectFoods(mockFoods, selection).map((food) => food.id)).toEqual(['food-8b', 'food-8']);
    expect(JSON.stringify(mockFoods)).toBe(before);
    expect(selectFoods(mockFoods, readCatalogSelection({ query: 'platano' }))[0].name).toBe('Licuado de Plátano');
  });

  test('estado vacío no se convierte en todos los productos; inválidos no crean clasificación', () => {
    expect(selectFoods(mockFoods, readCatalogSelection({ categoryId: ['cat-1', 'cat-2'] }))).toEqual([]);
    expect(readCatalogSelection({ maxPrice: 'NaN', availability: 'invented' })).toMatchObject({ maxPrice: undefined, availability: 'all' });
  });

  test('params de navegación conservan selección y origen permitido', () => {
    const selection = readCatalogSelection({ categoryId: 'cat-4', query: 'agua', availability: 'available', maxPrice: '20', sort: 'price' });
    expect(readCatalogSelection(selectionParams(selection))).toEqual(selection);
    expect(catalogRoute('/buyer/category', selection)).toEqual({ pathname: '/buyer/category', params: selectionParams(selection) });
    expect(filtersRoute('/buyer/category', selection)).toEqual({ pathname: '/buyer/filters', params: { ...selectionParams(selection), origin: '/buyer/category' } });
  });
});
