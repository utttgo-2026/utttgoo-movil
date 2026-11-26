import { Pr33MediaSimulation, type Pr33SimulationTransport } from '../mediaPr33Simulation';

const asset = '507f1f77bcf86cd799439011';
let mockFileSize = 4;
jest.mock('expo-file-system', () => ({ File: class { exists = true; size = mockFileSize; async bytes() { const bytes = new Uint8Array(mockFileSize); bytes.set([255, 216, 255]); return bytes; } } }));
const photo = { uri: 'file:///fixture.jpg', mimeType: 'image/jpeg' as const, size: 4, width: 50, height: 50 };
const upload = { mediaAssetId: asset, uploadUrl: 'https://upload.example.test/path?signature=fixture', expiresAt: '2099-01-01T00:00:00Z', headers: { 'Content-Type': 'image/jpeg' } };
function fixture() {
  const request = jest.fn(); const put = jest.fn().mockResolvedValue(undefined);
  const transport: Pr33SimulationTransport = { request, put };
  return { request, put, flow: new Pr33MediaSimulation(transport, 'upload.example.test', 'images.example.test') };
}
describe('PR33 flujo simulado sin red', () => {
  beforeEach(() => { mockFileSize = 4; });
  test.each([3999999, 4000000])('solicita upload-url solo tras comprobar %i bytes reales', async (size) => {
    mockFileSize = size;
    const { flow, request } = fixture(); request.mockResolvedValueOnce(upload).mockResolvedValueOnce({ mediaAssetId: asset, status: 'PendingModeration' });
    await flow.upload({ ...photo, size });
    expect(request).toHaveBeenCalledWith('/api/v1/media/upload-url', 'POST', expect.objectContaining({ size }));
  });
  test('un archivo real demasiado grande se rechaza antes de pedir URL aunque el metadato diga 4', async () => {
    mockFileSize = 4000001;
    const { flow, request, put } = fixture();
    await expect(flow.upload(photo)).rejects.toThrow('La fotografía supera el límite de 4 MB. Selecciona una imagen más pequeña.');
    expect(request).not.toHaveBeenCalled(); expect(put).not.toHaveBeenCalled();
  });
  test.each([0, NaN])('tamaño real no verificable o vacío (%s) nunca solicita upload-url', async (size) => {
    mockFileSize = size;
    const { flow, request, put } = fixture();
    await expect(flow.upload(photo)).rejects.toThrow(/tamaño|vacío/);
    expect(request).not.toHaveBeenCalled(); expect(put).not.toHaveBeenCalled();
  });
  test('MIME incoherente con firma no solicita upload-url', async () => {
    const { flow, request, put } = fixture();
    await expect(flow.upload({ ...photo, mimeType: 'image/png' })).rejects.toThrow(/JPEG, PNG o WebP/);
    expect(request).not.toHaveBeenCalled(); expect(put).not.toHaveBeenCalled();
  });
  test('upload y confirmación PendingModeration no autorizan asociación; Approved sí', async () => {
    const { flow, request, put } = fixture();
    request.mockResolvedValueOnce(upload).mockResolvedValueOnce({ mediaAssetId: asset, status: 'PendingModeration' })
      .mockResolvedValueOnce({ mediaAssetId: asset, status: 'Approved', imageUrl: 'https://images.example.test/a?sig=fixture', imageUrlExpiresAt: '2099-01-01T00:00:00Z' });
    expect(await flow.upload(photo)).toBe('PendingModeration'); expect(flow.approvedAssetId()).toBeUndefined();
    expect(request).toHaveBeenCalledWith('/api/v1/media/upload-url', 'POST', { fileName: 'producto.jpg', mimeType: 'image/jpeg', size: 4 });
    expect(put).toHaveBeenCalledTimes(1);
    expect(await flow.checkStatus()).toBe('Approved'); expect(flow.approvedAssetId()).toBe(asset);
  });
  test.each(['PendingUpload', 'PendingModeration', 'Rejected', 'ProcessingFailed'] as const)('%s no autoriza asociación', async (state) => {
    const { flow, request } = fixture(); request.mockResolvedValueOnce(upload).mockResolvedValueOnce({ mediaAssetId: asset, status: state });
    expect(await flow.upload(photo)).toBe(state); expect(flow.approvedAssetId()).toBeUndefined();
  });
  test('timeout de confirmación conserva asset y no repite PUT', async () => {
    const { flow, request, put } = fixture(); request.mockResolvedValueOnce(upload).mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ mediaAssetId: asset, status: 'PendingModeration' });
    await expect(flow.upload(photo)).rejects.toThrow(); expect(await flow.retryConfirmation()).toBe('PendingModeration');
    expect(put).toHaveBeenCalledTimes(1); expect(request).toHaveBeenLastCalledWith('/api/v1/media/confirm', 'POST', { mediaAssetId: asset });
  });
  test('no acepta host ajeno ni tipos de archivo inválidos', async () => {
    const { flow, request, put } = fixture(); request.mockResolvedValue({ ...upload, uploadUrl: 'https://evil.test/a' });
    await expect(flow.upload(photo)).rejects.toThrow(); expect(put).not.toHaveBeenCalled();
    const other = fixture(); await expect(other.flow.upload({ ...photo, size: 4000001 })).rejects.toThrow(); expect(other.request).not.toHaveBeenCalled();
  });
  test('la simulación rechaza producción aunque exista un transporte', () => {
    jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', false);
    try { expect(() => fixture()).toThrow(); } finally { jest.restoreAllMocks(); }
  });
});
