import { mediaPr33Client } from '../mediaPr33Client';
import { productPatchBody, createProductBody } from '../productService';
import { httpClient } from '../httpClient';
import { usesProductMediaDemo } from '@/config/productMedia';

describe('PR33 cerrado antes de cualquier request real', () => {
  afterEach(() => jest.restoreAllMocks());
  test('upload, confirm, estado y asociación real no envían red', async () => {
    const request = jest.spyOn(httpClient, 'request');
    const photo = { uri: 'file:///x.jpg', mimeType: 'image/jpeg' as const, size: 4, width: 100, height: 100 };
    await expect(mediaPr33Client.upload('fixture', photo, () => undefined)).rejects.toMatchObject({ kind: 'contract_unavailable' });
    await expect(mediaPr33Client.confirm('fixture', '507f1f77bcf86cd799439011')).rejects.toMatchObject({ kind: 'contract_unavailable' });
    await expect(mediaPr33Client.status('fixture', '507f1f77bcf86cd799439011')).rejects.toMatchObject({ kind: 'contract_unavailable' });
    expect(() => productPatchBody({ mediaAssetId: null })).toThrow(/EXPO_PUBLIC_MEDIA_REAL no está configurado/);
    expect(() => createProductBody({ name: 'Fixture', description: 'Fixture', ingredients: [], price: 25, stock: 4, categoryId: 'fixture', mediaAssetId: '507f1f77bcf86cd799439011' }, ['fixture'])).toThrow(/EXPO_PUBLIC_MEDIA_REAL no está configurado/);
    expect(request).not.toHaveBeenCalled();
  });
  test('una variable pública no habilita demo en producción', () => {
    const previous = process.env.EXPO_PUBLIC_MEDIA_DEMO;
    process.env.EXPO_PUBLIC_MEDIA_DEMO = 'pr33';
    jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', false);
    try { expect(usesProductMediaDemo()).toBe(false); }
    finally { if (previous === undefined) delete process.env.EXPO_PUBLIC_MEDIA_DEMO; else process.env.EXPO_PUBLIC_MEDIA_DEMO = previous; }
  });
  test('opt-in real permanece cerrado en producción incluso con controlled', () => {
    const previous = process.env.EXPO_PUBLIC_MEDIA_REAL;
    process.env.EXPO_PUBLIC_MEDIA_REAL = 'controlled';
    jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', false);
    try {
      jest.isolateModules(() => {
        const config = jest.requireActual<typeof import('@/config/productMedia')>('@/config/productMedia');
        expect(config.isRealProductMediaEnabled()).toBe(false);
      });
    } finally { if (previous === undefined) delete process.env.EXPO_PUBLIC_MEDIA_REAL; else process.env.EXPO_PUBLIC_MEDIA_REAL = previous; }
  });
});
