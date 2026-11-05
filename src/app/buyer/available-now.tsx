import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Pressable } from 'react-native';

import { AppButton, AppHeader, AppText, Badge, Screen, SectionHeader, Surface } from '@/components';
import { colors, fontSize, layout, radii, spacing } from '@/theme';
import { mockFoods } from '@/data/mock';
import type { FoodItem } from '@/types/models';

export default function AvailableNowScreen() {
  const router = useRouter();

  const availableFoods = mockFoods.filter((f) => f.availability === 'available');

  const handleFoodPress = (food: FoodItem) => {
    router.push(`/buyer/food?foodId=${food.id}` as any);
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <AppHeader title="Disponible ahora" showBack />

      <View style={styles.content}>
        <AppText variant="subtitle" style={styles.sectionTitle}>
          Listos para entregar
        </AppText>
        <AppText variant="caption" color={colors.textMuted} style={styles.subtitle}>
          Alimentos preparados y disponibles hoy
        </AppText>

        <View style={styles.foodsList}>
          {availableFoods.map((food) => (
            <Pressable key={food.id} style={styles.foodCard} onPress={() => handleFoodPress(food)}>
              <View style={styles.foodImage}>
                <Ionicons name="restaurant-outline" size={32} color={colors.textMuted} />
                {food.isFavorite ? (
                  <View style={styles.favoriteBadge}>
                    <Ionicons name="heart" size={18} color={colors.danger} />
                  </View>
                ) : null}
              </View>
              <View style={styles.foodInfo}>
                <AppText variant="subtitle" numberOfLines={1}>
                  {food.name}
                </AppText>
                <AppText variant="body" color={colors.textMuted} numberOfLines={2}>
                  {food.description}
                </AppText>
                <View style={styles.foodRow}>
                  <AppText variant="bodyStrong" style={styles.price}>
                    $${food.price}
                  </AppText>
                  <AppText variant="caption" color={colors.textSubtle}>
                    {food.prepTimeMinutes} min
                  </AppText>
                  <Badge label={food.rating.toFixed(1)} tone="warning" />
                </View>
                <AppButton
                  label="Agregar"
                  variant="outline"
                  size="sm"
                  icon="cart-outline"
                  onPress={() => {
                    // Add to cart logic handled in food detail
                  }}
                  fullWidth={false}
                />
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  foodsList: {
    gap: spacing.md,
  },
  foodCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  favoriteBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.textOnPrimary,
    borderRadius: radii.pill,
    padding: spacing.xs,
  },
  foodInfo: {
    padding: spacing.lg,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
});
