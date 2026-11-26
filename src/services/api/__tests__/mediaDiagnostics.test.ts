import { recordMediaFailure } from '../mediaDiagnostics';
import { ApiError } from '../errors';
describe('Diagnóstico Media sanitizado', () => {
  test('registra etapa/status/código/correlación sin message, credenciales, URL ni cuerpo arbitrario', () => {
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    const correlationId = '00-123456789abcdef0123456789abcdef0-123456789abcdef0-01';
    try {
      const error = new ApiError('http', 'secret-value', 400, { status: 400, code: 'INVALID_OBJECT', correlationId, message: 'https://signed.invalid/?signature=SECRET', password: 'SECRET' });
      const diagnostic = recordMediaFailure('confirm', 'POST', '/api/v1/media/confirm', error);
      expect(diagnostic).toMatchObject({ stage: 'confirm', status: 400, code: 'INVALID_OBJECT', correlationId });
      expect(JSON.stringify(log.mock.calls)).not.toMatch(/SECRET|signed\.invalid|secret-value|password/);
      expect(recordMediaFailure('put-s3', 'PUT', 'S3 PutObject', new Error('private'))).not.toHaveProperty('correlationId');
    } finally { log.mockRestore(); }
  });
  test('acepta traceIdentifier .NET observado y nombres de campos sin mensajes de validación', () => {
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    try {
      const failure = new ApiError('http', 'private', 400, { code: 'VALIDATION_ERROR', correlationId: '0HNQ90MLLHKR1:00000001', errors: { pageSize: ['private value'], name: ['echo personal name'], password: ['secret'] } });
      const value = recordMediaFailure('get-product', 'GET', '/api/v1/products', failure);
      expect(value.correlationId).toBe('0HNQ90MLLHKR1:00000001');
      expect(value.validationFields).toEqual(['pageSize', 'name']);
      expect(value.recordedAt).toEqual(expect.any(String));
      expect(JSON.stringify(value)).not.toMatch(/private|personal|password|secret/);
    } finally { log.mockRestore(); }
  });
  test('preserva message y details útiles seguros, sin ecos de datos privados', () => {
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    try {
      const value = recordMediaFailure('get-product', 'GET', '/api/v1/products', new ApiError('http', 'private', 400, {
        code: 'VALIDATION_ERROR', message: 'Solicitud inválida.', correlationId: '0HNQ9283G4KFI:00000001',
        details: { pageSize: { maximum: 50, minimum: 1 }, allowedSorts: ['priceAsc', 'nameAsc'], name: 'Private user', password: 'SECRET', url: 'https://signed.invalid/?token=SECRET' },
      }));
      expect(value.message).toBe('Solicitud inválida.');
      expect(value.details).toMatchObject({ pageSize: { maximum: 50, minimum: 1 }, allowedSorts: ['priceAsc', 'nameAsc'], name: '[redacted]' });
      expect(value.failureType).toBe('validation');
      expect(JSON.stringify(value)).not.toMatch(/Private user|SECRET|signed.invalid|password/);
    } finally { log.mockRestore(); }
  });
});
