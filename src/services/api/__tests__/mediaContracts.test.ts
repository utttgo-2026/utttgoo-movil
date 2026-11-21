import { mediaConfirmed, mediaPresigned } from '../mediaContracts';

const upload = { assetId: 'med_fixture', uploadUrl: 'https://upload.example.test/a?signature=fixture', expiresAt: '2030-01-01T00:00:00Z' };
const ready = { assetId: 'med_fixture', publicUrl: 'https://images.example.test/a.jpg', status: 'Ready' };
const now = Date.parse('2029-01-01T00:00:00Z');
describe('Contratos media sin red ni credenciales', () => {
  test('conserva URL presignada exacta y requiere host autorizado y vencimiento futuro', () => {
    expect(mediaPresigned(upload, ['upload.example.test'], now)).toEqual(upload);
    expect(() => mediaPresigned(upload, [], now)).toThrow();
    expect(() => mediaPresigned(upload, ['upload.example.test'], Date.parse(upload.expiresAt))).toThrow();
    for (const uploadUrl of ['http://upload.example.test/a', 'https://upload.example.test.evil.test/a', 'https://user@upload.example.test/a', 'https://upload.example.test/a#fragment']) {
      expect(() => mediaPresigned({ ...upload, uploadUrl }, ['upload.example.test'], now)).toThrow();
    }
  });
  test('solo Ready del mismo asset y origen público permitido', () => {
    expect(mediaConfirmed(ready, 'med_fixture', ['images.example.test'])).toEqual(ready);
    for (const value of [{ ...ready, status: 'PendingUpload' }, { ...ready, assetId: 'other' }, { ...ready, publicUrl: 'https://evil.test/a' }, { ...ready, publicUrl: 'http://images.example.test/a' }]) {
      expect(() => mediaConfirmed(value, 'med_fixture', ['images.example.test'])).toThrow();
    }
  });
});
