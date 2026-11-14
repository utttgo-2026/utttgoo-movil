import { getApiBaseUrl, parseApiBaseUrl } from '../config';

describe('Configuración API', () => {
  const previous = process.env.EXPO_PUBLIC_API_BASE_URL;
  afterEach(() => {
    if (previous === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL;
    else process.env.EXPO_PUBLIC_API_BASE_URL = previous;
  });

  test.each([
    [' https://api.example.test/ ', 'https://api.example.test'],
    ['http://api.example.test:8080', 'http://api.example.test:8080'],
    ['https://3.129.142.54.nip.io', 'https://3.129.142.54.nip.io'],
  ])('normaliza %s', (input, expected) => {
    expect(parseApiBaseUrl(input)).toBe(expected);
  });

  test.each([undefined, '', 'invalid', 'ftp://api.example.test', 'https://user:secret@api.example.test',
    'https://api.example.test/api/v1', 'https://api.example.test?token=x', 'https://api.example.test#x'])
  ('rechaza configuración inválida sin fallback: %s', (input) => {
    expect(() => parseApiBaseUrl(input)).toThrow(expect.objectContaining({ kind: 'configuration' }));
  });

  test('lee la variable centralizada', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://configured.example.test';
    expect(getApiBaseUrl()).toBe('https://configured.example.test');
  });

  test('sin variable no vuelve silenciosamente a la IP HTTP anterior', () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    expect(() => getApiBaseUrl()).toThrow(expect.objectContaining({ kind: 'configuration' }));
  });
});
