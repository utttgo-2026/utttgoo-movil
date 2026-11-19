import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { Image } from 'react-native';

export interface LocalProductPhoto { uri: string; mimeType: 'image/jpeg' | 'image/png' | 'image/webp'; size: number; width: number; height: number }
const maxBytes = 5 * 1024 * 1024;

function imageMime(bytes: Uint8Array): LocalProductPhoto['mimeType'] | undefined {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value)) return 'image/png';
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  return undefined;
}

/** Local-only selection. No EXIF is requested and no file or URL is sent to AWS. */
export async function selectProductPhoto(source: 'camera' | 'gallery'): Promise<LocalProductPhoto | null> {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new Error('Permite el acceso a la cámara para tomar una fotografía.');
  }
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: false, exif: false, quality: 1 };
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset || !/^(file|content):\/\//i.test(asset.uri)) throw new Error('No se pudo acceder al archivo seleccionado.');
  let file: File;
  let bytes: Uint8Array;
  try {
    file = new File(asset.uri);
    if (!file.exists || !Number.isSafeInteger(file.size) || file.size <= 0 || file.size > maxBytes) {
      throw new Error('Selecciona un archivo accesible de hasta 5 MB.');
    }
    bytes = await file.bytes();
    if (bytes.length !== file.size) throw new Error('El archivo cambió o no pudo leerse completamente.');
  } catch (error) {
    if (error instanceof Error && (error.message.includes('5 MB') || error.message.includes('cambió'))) throw error;
    throw new Error('No se pudo leer la fotografía seleccionada.');
  }
  const mimeType = imageMime(bytes);
  if (!mimeType || (asset.mimeType && asset.mimeType.toLowerCase() !== mimeType)) throw new Error('Selecciona una imagen JPEG, PNG o WebP válida.');
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    Image.getSize(asset.uri, (width, height) => resolve({ width, height }), () => reject(new Error('No se pudo abrir la fotografía.')));
  });
  if (!Number.isSafeInteger(dimensions.width) || !Number.isSafeInteger(dimensions.height) || dimensions.width < 1 || dimensions.height < 1 ||
      dimensions.width > 6000 || dimensions.height > 6000 || dimensions.width * dimensions.height > 24000000) throw new Error('La fotografía supera las dimensiones admitidas.');
  return { uri: asset.uri, mimeType, size: bytes.length, ...dimensions };
}
