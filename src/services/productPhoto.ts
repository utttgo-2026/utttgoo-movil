import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { readProductImage } from './productImageFile';

export interface LocalProductPhoto { uri: string; mimeType: 'image/jpeg' | 'image/png' | 'image/webp'; size: number; width: number; height: number }

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
  const { size, mimeType } = await readProductImage(asset.uri, asset.mimeType);
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    Image.getSize(asset.uri, (width, height) => resolve({ width, height }), () => reject(new Error('No se pudo abrir la fotografía.')));
  });
  if (!Number.isSafeInteger(dimensions.width) || !Number.isSafeInteger(dimensions.height) || dimensions.width < 1 || dimensions.height < 1 ||
      dimensions.width > 6000 || dimensions.height > 6000 || dimensions.width * dimensions.height > 24000000) throw new Error('La fotografía supera las dimensiones admitidas.');
  return { uri: asset.uri, mimeType, size, ...dimensions };
}
