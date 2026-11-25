/** Presentation only: never changes API errors, diagnostics, gates or retry policy. */
export function productUserMessage(message: string): string {
  if (/CATALOG_UNAVAILABLE|catálogo AWS|AWS no disponible/i.test(message)) return 'No pudimos cargar tus alimentos. Intenta más tarde.';
  if (/IMAGE_NOT_APPROVED|fotografía.*(?:Approved|no está aprobada|no pertenece)/i.test(message)) return 'La fotografía aún no está lista para usarse. Revísala o elige otra imagen.';
  if (/IMAGE_NOT_AVAILABLE|Fase 05|subidas reales|modo controlled|EXPO_PUBLIC_|origen HTTPS/i.test(message)) return 'No puedes subir fotografías en este momento. Puedes publicar sin fotografía.';
  if (/Seller|JWT|sesión AWS/i.test(message)) return 'Necesitas una cuenta de vendedor activa. Revisa tu negocio o vuelve a iniciar sesión.';
  if (/URL.*expir|URL.*venci/i.test(message)) return 'El tiempo para subir la fotografía terminó. Selecciónala de nuevo.';
  if (/persistencia|resultado anterior es incierto/i.test(message)) return 'No pudimos confirmar el resultado. Revisa tus alimentos antes de volver a publicar.';
  if (/no cumple las validaciones|no pudo procesar los datos/i.test(message)) return 'Revisa los datos del alimento e intenta de nuevo.';
  if (/contrato|backend|\bAPI\b|servidor|endpoint|HTTP|correlationId|mediaAssetId|upload-url|PendingUpload|PendingModeration|Approved|Rejected|ProcessingFailed|AWS|Azure|Rekognition|\bS3\b|\bMedia\b|\bMIME\b|SecureStore|TraceIdentifier|\b(?:GET|POST|PATCH|PUT)\b|https?:\/\/|file:\/\/|content:\/\/|\b[a-f\d]{24}\b|\b[A-Z]+_[A-Z_]+\b/i.test(message)) return 'No pudimos completar la operación. Intenta de nuevo más tarde.';
  return message;
}

const selectionErrors = new Set([
  'Permite el acceso a la cámara para tomar una fotografía.', 'Permite el acceso a la cámara.',
  'No se pudo acceder al archivo seleccionado.', 'Selecciona un archivo accesible.',
  'No se pudo leer la fotografía seleccionada.', 'El archivo cambió o no pudo leerse completamente.',
  'Selecciona una imagen JPEG, PNG o WebP válida.', 'No se pudo abrir la fotografía.',
  'La fotografía supera las dimensiones admitidas.',
  'La fotografía supera el límite de 4 MB. Selecciona una imagen más pequeña.',
  'No se pudo verificar el tamaño de la fotografía o el archivo está vacío.',
]);

/** Native picker errors may contain local paths or metadata; only known copy is displayed. */
export function photoUserMessage(message: string): string {
  if (selectionErrors.has(message)) return message;
  const friendly = productUserMessage(message);
  return friendly !== message ? friendly : 'No pudimos completar la fotografía. Revisa su estado o elige otra imagen.';
}

export const photoStatusLabels = {
  Approved: 'Fotografía lista', PendingModeration: 'Revisando fotografía…',
  PendingUpload: 'Revisando fotografía…',
  Rejected: 'No se aceptó la fotografía. Elige otra imagen de tu alimento.',
  ProcessingFailed: 'No pudimos revisar la fotografía. Puedes consultar de nuevo o elegir otra imagen.',
} as const;
