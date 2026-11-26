import { photoUserMessage, productUserMessage } from '../productPresentation';

describe('Errores públicos separados del diagnóstico técnico', () => {
  test.each(['HTTP 503 /api/v1/products correlationId=private', 'mediaAssetId 507f1f77bcf86cd799439011', 'PendingUpload', 'ProcessingFailed', 'https://bucket.invalid/file?signature=private', 'Rekognition: Rejected'])('no expone %s', (message) => {
    const visible = productUserMessage(message);
    expect(visible).not.toMatch(/HTTP|api\/v1|correlationId|mediaAssetId|507f1f77|PendingUpload|ProcessingFailed|signature|Rekognition|Rejected/);
    expect(visible).not.toMatch(/list[ao]|publicado|correctamente/i);
  });
  test('validación y seguridad legítimas siguen visibles', () => {
    expect(productUserMessage('Este producto no pertenece a tu negocio.')).toBe('Este producto no pertenece a tu negocio.');
    expect(photoUserMessage('La fotografía supera el límite de 4 MB. Selecciona una imagen más pequeña.')).toBe('La fotografía supera el límite de 4 MB. Selecciona una imagen más pequeña.');
    expect(photoUserMessage('Permite el acceso a la cámara para tomar una fotografía.')).toContain('Permite el acceso');
  });
  test('fallos nativos desconocidos no muestran rutas ni metadatos privados', () => {
    expect(photoUserMessage('Native failure /private/user/picture.jpg')).not.toMatch(/private|picture.jpg|Native/);
  });
});
