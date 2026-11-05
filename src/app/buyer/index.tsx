import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText, Avatar, Badge, BrandLogo, Screen, SectionHeader, Surface } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { colors, fontFamily, fontSize, layout, radii, spacing } from '@/theme';
import { mockCategories, featuredFoods, mockFoods } from '@/data/mock';
import type { FoodItem } from '@/types/models';

export default function BuyerHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    router.push(`/buyer/category?categoryId=${categoryId}` as any);
  };

  const handleFoodPress = (food: FoodItem) => {
    router.push(`/buyer/food?foodId=${food.id}` as any);
  };

  const filteredFoods = selectedCategory
    ? mockFoods.filter((f) => f.categoryId === selectedCategory && f.availability === 'available')
    : featuredFoods;

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppText variant="title">Hola, {user?.fullName.split(' ')[0]}</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            Bienvenido a UTTT-GO
          </AppText>
        </View>
        <Avatar name={user?.fullName || 'Usuario'} size={44} />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={colors.textSubtle} />
        <AppText variant="body" color={colors.textSubtle}>
          Buscar alimentos…
        </AppText>
      </View>

      <SectionHeader title="Categorías" actionLabel="Ver todas" onAction={() => router.push('/buyer/category' as any)} />

      <View style={styles.categoriesList}>
        {mockCategories.map((cat) => (
          <View
            key={cat.id}
            style={[
              styles.categoryCard,
              selectedCategory === cat.id && styles.categoryCardActive,
            ]}
          >
            <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
              <Ionicons name={cat.icon as any} size={20} color={colors.text} />
            </View>
            <AppText variant="label" style={styles.categoryName}>
              {cat.name}
            </AppText>
          </View>
        ))}
      </View>

      <SectionHeader title="Disponible ahora" />

      <View style={styles.foodsList}>
        {filteredFoods.map((food) => (
          <Pressable key={food.id} style={styles.foodCard} onPress={() => handleFoodPress(food)}>
            <View style={styles.foodImage}>
              {food.image ? (
                <View style={styles.foodImageContainer}>
                  <Ionicons name="restaurant-outline" size={32} color={colors.textMuted} />
                </View>
              ) : null}
              {food.availability === 'sold-out' ? (
                <View style={styles.soldOutBadge}>
                  <AppText variant="caption" color={colors.textOnPrimary}>
                    Agotado
                  </AppText>
                </View>
              ) : null}
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
              <AppText variant="caption" color={colors.textMuted} numberOfLines={2}>
                {food.description}
              </AppText>
              <View style={styles.foodRow}>
                <AppText variant="bodyStrong" style={styles.price}>
                  $${food.price}
                </AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {food.prepTimeMinutes} min
                </AppText>
                <Badge label={food.rating.toFixed(1)} tone="warning" />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
  },
  categoriesList: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
  },
  categoryCard: {
    width: 76,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryCardActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  categoryName: {
    textAlign: 'center',
    fontSize: fontSize.sm,
  },
  foodsList: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.md,
  },
  foodCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  foodImage: {
    width: 96,
    height: 96,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  foodImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingVertical: spacing.xs,
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
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  price: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bold,
    color: colors.primary,
  },
});
