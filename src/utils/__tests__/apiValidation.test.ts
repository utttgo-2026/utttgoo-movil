import { adminUsersQuery, institutionalEmail, sellerBody, userPatchBody } from '../apiValidation';

describe('Validaciones del contrato conocido', () => {
  test('dominio institucional exacto normalizado', () => {
    expect(institutionalEmail(' Student@UTTT.EDU.MX ')).toBe('student@uttt.edu.mx');
  });
  test.each(['a@utt.edu.mx', 'a@sub.uttt.edu.mx', 'a@uttt.edu.mx.evil.test', 'a@@uttt.edu.mx',
    'a b@uttt.edu.mx', 'a..b@uttt.edu.mx', '@uttt.edu.mx', 'a.@uttt.edu.mx', ''])
  ('rechaza %s', (value) => expect(() => institutionalEmail(value)).toThrow());

  test('PATCH envía solo los campos documentados', () => {
    expect(userPatchBody({ displayName: ' Fixture ', phone: '1234567890' }))
      .toEqual({ displayName: 'Fixture', phone: '1234567890' });
    expect(sellerBody({ description: 'Fixture' })).toEqual({ description: 'Fixture' });
  });

  test.each([{}, { displayName: null }, { phone: null }, { phone: 42 }, { email: 'a@uttt.edu.mx' },
    { displayName: 'Fixture', role: 'admin' }, { displayName: '' }])
  ('PATCH usuario rechaza extras/null/tipos/vacío %j', (value) => {
    // Entrada externa deliberadamente inválida: verificar también validación en runtime.
    expect(() => userPatchBody(value as Parameters<typeof userPatchBody>[0])).toThrow();
  });

  test.each([{}, { description: null }, { businessName: 42 }, { pickupPoint: 'Fixture', status: 'active' }])
  ('PATCH vendedor rechaza %j', (value) => {
    expect(() => sellerBody(value as Parameters<typeof sellerBody>[0])).toThrow();
  });

  test('activación requiere todos los campos', () => {
    expect(() => sellerBody({ businessName: 'Fixture' }, true)).toThrow();
  });

  test.each([{ page: 0 }, { page: 1.5 }, { pageSize: -1 }, { pageSize: NaN }, { filter: 'invented' }])
  ('admin rechaza parámetros inválidos %j', (value) => {
    expect(() => adminUsersQuery(value as Parameters<typeof adminUsersQuery>[0])).toThrow();
  });
});
