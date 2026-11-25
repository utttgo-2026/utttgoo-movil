import { File } from 'expo-file-system';
import { assertProductImageSize, productImageMime } from '@/utils/productImage';

/** Re-read actual local file before issuing a network intention; never trust picker size alone. */
export async function readProductImage(uri: string, mimeType?: string) {
  if (typeof uri !== 'string' || !/^(file|content):\/\//i.test(uri)) throw new Error('No se pudo acceder al archivo seleccionado.');
  let file: File;
  try { file = new File(uri); if (!file.exists) throw new Error(); }
  catch { throw new Error('Selecciona un archivo accesible.'); }
  assertProductImageSize(file.size);
  let bytes: Uint8Array<ArrayBuffer>;
  try { bytes = await file.bytes(); } catch { throw new Error('No se pudo leer la fotografía seleccionada.'); }
  assertProductImageSize(bytes.length);
  if (bytes.length !== file.size) throw new Error('El archivo cambió o no pudo leerse completamente.');
  const detected = productImageMime(bytes);
  if (!detected || (mimeType && mimeType.toLowerCase() !== detected)) throw new Error('Selecciona una imagen JPEG, PNG o WebP válida.');
  return { bytes, mimeType: detected, size: bytes.length };
}
