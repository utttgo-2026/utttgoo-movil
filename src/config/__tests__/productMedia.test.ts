import { isRealProductMediaEnabled, productMediaBlockReason, usesProductMediaDemo } from '../productMedia';

describe('Activación controlada evaluada al usarla, no al importar módulo', () => {
  const previousReal = process.env.EXPO_PUBLIC_MEDIA_REAL;
  const previousDemo = process.env.EXPO_PUBLIC_MEDIA_DEMO;
  beforeEach(() => { delete process.env.EXPO_PUBLIC_MEDIA_REAL; delete process.env.EXPO_PUBLIC_MEDIA_DEMO; });
  afterEach(() => {
    jest.restoreAllMocks();
    if (previousReal === undefined) delete process.env.EXPO_PUBLIC_MEDIA_REAL; else process.env.EXPO_PUBLIC_MEDIA_REAL = previousReal;
    if (previousDemo === undefined) delete process.env.EXPO_PUBLIC_MEDIA_DEMO; else process.env.EXPO_PUBLIC_MEDIA_DEMO = previousDemo;
  });
  test('detecta controlled sin conservar el false de una evaluación anterior', () => {
    expect(isRealProductMediaEnabled()).toBe(false);
    expect(productMediaBlockReason()).toContain('no está configurado');
    process.env.EXPO_PUBLIC_MEDIA_REAL = 'controlled'; process.env.EXPO_PUBLIC_MEDIA_DEMO = '';
    expect(isRealProductMediaEnabled()).toBe(true); expect(productMediaBlockReason()).toBeUndefined();
    delete process.env.EXPO_PUBLIC_MEDIA_REAL;
    expect(isRealProductMediaEnabled()).toBe(false);
  });
  test('demo y producción conservan el bloqueo', () => {
    process.env.EXPO_PUBLIC_MEDIA_REAL = 'controlled'; process.env.EXPO_PUBLIC_MEDIA_DEMO = 'pr33';
    expect(usesProductMediaDemo()).toBe(true); expect(isRealProductMediaEnabled()).toBe(false);
    expect(productMediaBlockReason()).toContain('EXPO_PUBLIC_MEDIA_DEMO=pr33');
    delete process.env.EXPO_PUBLIC_MEDIA_DEMO;
    jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', false);
    expect(isRealProductMediaEnabled()).toBe(false); expect(productMediaBlockReason()).toContain('producción');
  });
  test('valor desconocido se rechaza sin imprimirlo', () => {
    process.env.EXPO_PUBLIC_MEDIA_REAL = 'unrecognized-private-value';
    expect(isRealProductMediaEnabled()).toBe(false);
    expect(productMediaBlockReason()).toContain('no coincide exactamente');
    expect(productMediaBlockReason()).not.toContain('unrecognized-private-value');
  });
});
