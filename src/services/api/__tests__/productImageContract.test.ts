import { productImageFields } from '../productImageContract';
describe('Par imageUrl/imageUrlExpiresAt PR33', () => {
  test('acepta legado ausente, null y URL temporal del host permitido', () => {
    expect(productImageFields({})).toEqual({});
    expect(productImageFields({ imageUrl: null, imageUrlExpiresAt: null })).toEqual({ imageUrl: null, imageUrlExpiresAt: null });
    const pair = { imageUrl: 'https://utttgo.s3.us-east-2.amazonaws.com/x?signature=fixture', imageUrlExpiresAt: '2030-01-01T00:00:00Z' };
    expect(productImageFields(pair)).toEqual(pair);
    expect(productImageFields({ ...pair, imageUrl: 'https://utttgo-images-2427dbc8.s3.us-east-2.amazonaws.com/x?signature=fixture' }).imageUrl).toContain('utttgo-images-2427dbc8');
  });
  test.each([
    { imageUrl: null }, { imageUrl: 'https://evil.test/a', imageUrlExpiresAt: '2030-01-01T00:00:00Z' },
    { imageUrl: 'https://utttgo.s3.amazonaws.com/x', imageUrlExpiresAt: 'bad' },
    { imageUrl: 'http://utttgo.s3.amazonaws.com/x', imageUrlExpiresAt: '2030-01-01T00:00:00Z' },
  ])('rechaza par inválido %j', (pair) => expect(() => productImageFields(pair)).toThrow());
});
