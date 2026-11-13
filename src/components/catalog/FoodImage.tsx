import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { getFoodMedia, type FoodMedia } from '@/data/catalog/foodMedia';
import { colors } from '@/theme';

type Props = {
  foodId: string;
  name: string;
  variant?: 'card' | 'detail' | 'thumbnail';
  style?: StyleProp<ViewStyle>;
};

export function FoodImage({ foodId, name, variant = 'card', style }: Props) {
  const media = getFoodMedia(foodId);
  // A new identity resets failures immediately, including recycled list cells.
  return <ResolvedFoodImage key={`${foodId}:${media.photoId}:${variant}`} foodId={foodId}
    name={name} variant={variant} style={style} media={media} />;
}

function ResolvedFoodImage({ foodId, name, variant, style, media }: Required<Pick<Props, 'variant'>> & Props & { media: FoodMedia }) {
  const [failed, setFailed] = useState(false);
  const source = variant === 'detail' ? media.detail : media.thumbnail;
  const available = Boolean(source) && !failed;
  return (
    <View accessibilityRole="image" accessible
      accessibilityLabel={available ? `Fotografía de ${name}` : `Imagen no disponible de ${name}`}
      style={[styles.frame, { aspectRatio: variant === 'thumbnail' ? 1 : 1.6 }, style]}>
      {available ? (
        <Image testID={`food-image-${foodId}`} source={source} style={styles.image}
          accessible={false} contentFit="cover" transition={0} cachePolicy="memory-disk"
          recyclingKey={`${foodId}:${media.photoId}:${variant}`}
          contentPosition={{ left: `${media.focalPoint.x}%`, top: `${media.focalPoint.y}%` }}
          onError={() => setFailed(true)} />
      ) : <Ionicons name="image-outline" size={24} color={colors.textMuted} accessible={false} />}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  image: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
});
