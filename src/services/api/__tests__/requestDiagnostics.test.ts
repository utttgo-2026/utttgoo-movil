import { catalogRequestSummary } from '../requestDiagnostics';

describe('URL Catalog diagnóstica exacta o marcada redactada', () => {
  test('URL completa para paginación/orden públicos sin query de credenciales', () => {
    const value = catalogRequestSummary('GET', '/api/v1/products', undefined, { page: 1, pageSize: 50, sortBy: 'priceAsc', absent: undefined }, 'https://3.129.142.54.nip.io', 'seller-products');
    expect(value).toMatchObject({ version: 'catalog-v2', source: 'seller-products', url: 'https://3.129.142.54.nip.io/api/v1/products?page=1&pageSize=50&sortBy=priceAsc', urlRedacted: false });
  });
  test('búsqueda privada, parámetros desconocidos y IDs de ruta nunca aparecen como URL íntegra', () => {
    const value = catalogRequestSummary('GET', '/api/v1/products/private-product', undefined, { search: 'private@email.test', token: 'SECRET', page: 1 }, 'https://3.129.142.54.nip.io', 'buyer-search');
    expect(value?.urlRedacted).toBe(true);
    expect(value?.url).toContain('search=%5Bredacted%5D');
    expect(JSON.stringify(value)).not.toMatch(/private@email|SECRET|private-product/);
  });
});
