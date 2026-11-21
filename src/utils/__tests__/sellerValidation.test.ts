import { activationBody, priceInCents, validateDraftImage, validateProductDraft } from '../sellerValidation';

const image = { uri: 'file:///fixture.jpg', mimeType: 'image/jpeg', bytes: 1024, width: 400, height: 300 };
const draft = { name: 'Alimento fixture', description: 'Descripción del alimento fixture', price: '65.05', categoryId: 'server-category-fixture', availability: 'available' as const, image };
describe('Vendedor/producto: reglas locales, no DTO API inventado', () => {
  test('alta normaliza texto Unicode y proyecta solo campos permitidos', () => {
    expect(activationBody({ storeName: '  Cocina   María ', description: ' Comida recién preparada ', phone: ' 55 1234 5678 ' }))
      .toEqual({ storeName: 'Cocina María', description: 'Comida recién preparada', phone: '55 1234 5678' });
  });
  test.each([null, { storeName: { $ne: null } }, { storeName: 'A', description: 'short', phone: 'B' },
    { storeName: 'Valid name', description: 'x'.repeat(501), phone: '5551234567' },
    { storeName: 'Valid\nName', description: 'Fixture description', phone: '5551234567' },
    { storeName: 'Valid name', description: 'Fixture description', phone: '5551234567', roles: ['Seller'] },
    { businessName: 'Legacy', description: 'Fixture', pickupPoint: 'Legacy' },
  ])('rechaza tipos/controles/límites/mass assignment: %j', (value) => expect(() => activationBody(value as unknown as Parameters<typeof activationBody>[0])).toThrow());
  test('precio en centavos sin redondeo flotante', () => { expect(priceInCents('65.05')).toBe(6505); expect(priceInCents('0.01')).toBe(1); });
  test.each(['0', '-1', '1.001', '1e3', 'NaN', '1,000.00', '1000000', { $gt: 0 }])('precio inválido: %j', (price) => expect(() => priceInCents(price)).toThrow());
  test.each([{ ...image, bytes: 6 * 1024 * 1024 }, { ...image, mimeType: 'image/svg+xml' }, { ...image, uri: 'https://private.example.test/a.jpg' }, { ...image, width: 0 }])
  ('metadata de imagen inválida: %j', (value) => expect(() => validateDraftImage(value)).toThrow());
  test('categoría requiere identificadores confirmados; nunca toma mocks como catálogo real', () => {
    expect(() => validateProductDraft(draft, [])).toThrow();
    expect(validateProductDraft(draft, [draft.categoryId]).cents).toBe(6505);
    expect(() => validateProductDraft({ ...draft, availability: 'published' as 'available' }, [draft.categoryId])).toThrow();
    expect(() => validateProductDraft({ ...draft, image: null }, [draft.categoryId])).toThrow();
  });
});
