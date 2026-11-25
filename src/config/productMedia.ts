/** Evaluate at use time, not as a module-load snapshot. Expo still requires rebundling changed .env. */
export function isRealProductMediaEnabled(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_MEDIA_REAL === 'controlled' && process.env.EXPO_PUBLIC_MEDIA_DEMO !== 'pr33';
}
/** Only public configuration classifications; never print environment objects or unknown values. */
export function productMediaBlockReason(): string | undefined {
  if (!__DEV__) return 'Las subidas reales no están habilitadas en builds de producción.';
  if (process.env.EXPO_PUBLIC_MEDIA_DEMO === 'pr33') return 'Está activo EXPO_PUBLIC_MEDIA_DEMO=pr33; desactiva la demostración para la prueba real.';
  if (!process.env.EXPO_PUBLIC_MEDIA_REAL) return 'EXPO_PUBLIC_MEDIA_REAL no está configurado en este bundle. Usa controlled y reinicia Metro con caché limpia.';
  if (process.env.EXPO_PUBLIC_MEDIA_REAL !== 'controlled') return 'EXPO_PUBLIC_MEDIA_REAL no coincide exactamente con controlled en este bundle. Corrige la configuración y reinicia Metro.';
  return undefined;
}
export const PRODUCT_IMAGE_UPLOAD_HOSTS: readonly string[] = ['utttgo-images-2427dbc8.s3.us-east-2.amazonaws.com', 'utttgo.s3.us-east-2.amazonaws.com'];
export const PRODUCT_IMAGE_READ_HOSTS: readonly string[] = [...PRODUCT_IMAGE_UPLOAD_HOSTS, 'utttgo.s3.amazonaws.com'];
export function usesProductMediaDemo(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_MEDIA_DEMO === 'pr33';
}
