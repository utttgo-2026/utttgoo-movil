import React, { useState } from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/theme';

/** Real products never use the mock photo registry. Unsafe/missing/broken URLs stay neutral. */
export function AwsProductImage({ uri, name, style }: { uri: string | null; name: string; style?: StyleProp<ViewStyle> }) {
  const [failed, setFailed] = useState<string>();
  let safe = false;
  try { const url = new URL(uri ?? ''); safe = url.protocol === 'https:' && !!url.hostname && !url.username && !url.password; } catch { /* No usable media. */ }
  return <View style={[{ width: '100%', aspectRatio: 1.6, backgroundColor: colors.surfaceMuted, overflow: 'hidden' }, style]}>
    {safe && uri && failed !== uri ? <Image source={{ uri }} accessibilityLabel={`Fotografía de ${name}`} resizeMode="cover"
      style={{ width: '100%', height: '100%' }} onError={() => setFailed(uri)} /> :
      <View accessible accessibilityRole="image" accessibilityLabel="Imagen de producto no disponible" style={{ flex: 1 }} />}
  </View>;
}
