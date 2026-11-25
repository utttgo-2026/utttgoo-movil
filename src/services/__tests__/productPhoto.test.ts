import { Image } from 'react-native';
import { selectProductPhoto } from '../productPhoto';

const mockCameraPermission = jest.fn();
const mockCamera = jest.fn();
const mockGallery = jest.fn();
let mockBytes = new Uint8Array([255, 216, 255, 1]);
let mockSize = 4;
let mockExists = true;
jest.mock('expo-image-picker', () => ({ requestCameraPermissionsAsync: () => mockCameraPermission(), launchCameraAsync: (options: unknown) => mockCamera(options), launchImageLibraryAsync: (options: unknown) => mockGallery(options) }));
jest.mock('expo-file-system', () => ({ File: class { exists = mockExists; size = mockSize; async bytes() { return mockBytes; } } }));

describe('selección local de producto', () => {
  beforeEach(() => {
    jest.clearAllMocks(); mockExists = true; mockBytes = new Uint8Array([255, 216, 255, 1]); mockSize = 4;
    jest.spyOn(Image, 'getSize').mockImplementation((_uri, success) => { if (success) success(800, 600); return Promise.resolve({ width: 800, height: 600 }); });
  });
  afterEach(() => jest.restoreAllMocks());
  const selected = (mimeType: string) => ({ canceled: false, assets: [{ uri: 'file:///fixture', mimeType }] });
  test('cámara pide permiso; cancelación no devuelve selección', async () => {
    mockCameraPermission.mockResolvedValue({ granted: false });
    await expect(selectProductPhoto('camera')).rejects.toThrow(/cámara/); expect(mockCamera).not.toHaveBeenCalled();
    mockCameraPermission.mockResolvedValue({ granted: true }); mockCamera.mockResolvedValue({ canceled: true, assets: null });
    expect(await selectProductPhoto('camera')).toBeNull();
  });
  test.each([
    ['image/jpeg', [255, 216, 255, 1]],
    ['image/png', [137, 80, 78, 71, 13, 10, 26, 10]],
    ['image/webp', [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]],
  ])('galería valida bytes y tamaño real para %s', async (mime, bytes) => {
    mockBytes = new Uint8Array(bytes); mockSize = bytes.length; mockGallery.mockResolvedValue(selected(mime));
    expect(await selectProductPhoto('gallery')).toMatchObject({ mimeType: mime, size: bytes.length, width: 800, height: 600 });
    expect(mockCameraPermission).not.toHaveBeenCalled();
  });
  test.each([3999999, 4000000])('acepta %i bytes reales aunque el selector no informe tamaño', async (size) => {
    mockBytes = new Uint8Array(size); mockBytes.set([255, 216, 255]); mockSize = size;
    mockGallery.mockResolvedValue(selected('image/jpeg'));
    expect(await selectProductPhoto('gallery')).toMatchObject({ size });
  });
  test.each([0, NaN])('rechaza tamaño vacío o desconocido en archivo: %s', async (size) => {
    mockSize = size; mockGallery.mockResolvedValue(selected('image/jpeg'));
    await expect(selectProductPhoto('gallery')).rejects.toThrow(/tamaño|vacío/);
  });
  test('rechaza archivo inaccesible, demasiado grande, tipo no permitido y contenido incompatible', async () => {
    mockGallery.mockResolvedValue(selected('image/jpeg'));
    mockExists = false; await expect(selectProductPhoto('gallery')).rejects.toThrow(/accesible/);
    mockExists = true; mockSize = 4000001; await expect(selectProductPhoto('gallery')).rejects.toThrow('La fotografía supera el límite de 4 MB. Selecciona una imagen más pequeña.');
    mockSize = 4; mockGallery.mockResolvedValue(selected('image/heic')); await expect(selectProductPhoto('gallery')).rejects.toThrow(/JPEG/);
    mockGallery.mockResolvedValue(selected('image/jpeg')); mockBytes = new Uint8Array([1, 2, 3, 4]); await expect(selectProductPhoto('gallery')).rejects.toThrow(/JPEG/);
  });
});
