import { registrationName, institutionalEmail, requirePassword } from '../apiValidation';
import { authService } from '@/services/api/authService';
import { httpClient } from '@/services/api/httpClient';

describe('Validación de registro; payloads sintéticos, nunca ataques a AWS', () => {
  afterEach(() => jest.restoreAllMocks());
  test.each([['  María   José O’Neill-García  ', 'María José O’Neill-García'], ['李 明', '李 明'], ['Jose\u0301 Pérez', 'José Pérez'], ["D'Ávila Jr.", "D'Ávila Jr."]])
  ('nombre legítimo Unicode %s', (input, expected) => expect(registrationName(input)).toBe(expected));
  test.each(['', 'A', 'a'.repeat(101), 'Ana\nMaría', 'Ana\u0000', 'Ana\u202e', '<script>alert(1)</script>', '<img src=x onerror=alert(1)>', 'javascript:alert(1)', { $ne: null }, ['Ana'], 123, null])
  ('rechaza nombre mal tipado/control/markup sin renderizarlo: %j', (input) => expect(() => registrationName(input)).toThrow());
  test.each(['a'.repeat(65) + '@uttt.edu.mx', 'a'.repeat(255), 'a@uttt.edu.mx.evil.test', 'a@sub.uttt.edu.mx', 'a@utt.edu.mx', { $gt: '' }, null, 42, 'a\n@uttt.edu.mx'])
  ('correo institucional estricto y tipado %j', (input) => expect(() => institutionalEmail(input)).toThrow());
  test('normaliza correo sin modificar contraseña ni bloquear símbolos legítimos', () => {
    expect(institutionalEmail(' TEST@UTTT.EDU.MX ')).toBe('test@uttt.edu.mx');
    const password = '  Strong-ñ-密码!$<>"\'\\;{}[]123456  ';
    expect(requirePassword(password)).toBe(password);
    expect(requirePassword('a'.repeat(4096))).toHaveLength(4096);
    expect(() => requirePassword('a'.repeat(4097))).toThrow();
    expect(() => requirePassword({ $ne: null })).toThrow();
  });
  test.each([
    { email: { $ne: null }, password: 'synthetic-password', displayName: 'Fixture Name' },
    { email: 'fixture@uttt.edu.mx', password: { $gt: '' }, displayName: 'Fixture Name' },
    { email: 'fixture@uttt.edu.mx', password: 'synthetic-password', displayName: { $ne: null } },
    { email: 'fixture@uttt.edu.mx', password: 'synthetic-password', displayName: 'Fixture Name', roles: ['Admin'] },
    JSON.parse('{"email":"fixture@uttt.edu.mx","password":"synthetic-password","displayName":"Fixture Name","__proto__":{"admin":true}}'),
    null,
  ])('esquema/lista blanca impide objetos/operadores/campos extras antes del transporte', (input) => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 202, data: null, headers: {} });
    expect(() => authService.register(input as Parameters<typeof authService.register>[0])).toThrow();
    expect(request).not.toHaveBeenCalled();
  });
});
