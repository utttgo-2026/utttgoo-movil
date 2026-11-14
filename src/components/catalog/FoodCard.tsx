import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Badge } from '@/components/ui';
import { colors, fontFamily, layout, radii, spacing } from '@/theme';
import type { FoodItem } from '@/types/models';
import { FoodImage } from './FoodImage';

export function FoodCard({ food, width, onPress }: { food: FoodItem; width: number; onPress: (food: FoodItem) => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${food.name}`} onPress={() => onPress(food)}
      style={[styles.card, { width }]}>
      <FoodImage foodId={food.id} name={food.name} style={styles.image} />
      <View style={styles.info}>
        <AppText variant="cardTitle">{food.name}</AppText>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={2}>{food.description}</AppText>
        <AppText variant="bodyStrong" color={colors.primary} style={styles.price}>${food.price.toFixed(2)}</AppText>
        <Badge label={food.availability === 'available' ? 'Disponible ahora' : 'Agotado'} tone={food.availability === 'available' ? 'success' : 'danger'} />
      </View>
    </Pressable>
  );
}

export function gridCardWidth(width: number): number {
  return Math.max(1, (width - layout.screenPadding * 2 - spacing.md) / 2);
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', backgroundColor: colors.surface },
  image: { width: '100%', aspectRatio: 1.6 },
  info: { flex: 1, padding: spacing.md, gap: spacing.xs },
  price: { fontFamily: fontFamily.bold },
});
