import { validateProductForm } from '../productForm';

const valid = { name: 'Tacos de piña', description: 'Recién hechos, con limón.', ingredients: 'Piña, Maíz', price: '25.50', stock: '0', categoryId: 'aws-category' };
const check = (patch: Partial<typeof valid>) => validateProductForm({ ...valid, ...patch }, ['aws-category']);
describe('Formulario de alimento', () => {
  test('acepta Unicode, stock cero y no envía imagen', () => {
    expect(check({}).body).toEqual({ name: valid.name, description: valid.description, ingredients: ['Piña', 'Maíz'], price: 25.5, stock: 0, categoryId: valid.categoryId });
  });
  test.each([
    [{ name: ' ' }, 'name'], [{ name: '<script>alert(1)</script>' }, 'name'], [{ description: '<img src=x onerror=alert(1)>' }, 'description'],
    [{ name: 'a\u0000b' }, 'name'], [{ name: 'a'.repeat(101) }, 'name'], [{ description: 'x'.repeat(501) }, 'description'],
    [{ price: '-1' }, 'price'], [{ price: '1.001' }, 'price'], [{ price: '1e3' }, 'price'], [{ stock: '1.5' }, 'stock'],
    [{ stock: '1000001' }, 'stock'], [{ categoryId: 'inventada' }, 'categoryId'], [{ ingredients: 'Maíz,,Chile' }, 'ingredients'],
    [{ ingredients: 'Maíz, maíz' }, 'ingredients'], [{ ingredients: '<script>x</script>' }, 'ingredients'],
  ] as const)('rechaza %j con error de campo', (patch, field) => {
    const result = check(patch); expect(result.body).toBeUndefined(); expect(result.errors[field]).toBeTruthy();
  });
});
