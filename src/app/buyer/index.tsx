import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useWindowDimensions } from 'react-native';

import { AppButton, AppText, Avatar, Badge, BrandLogo, Screen, SectionHeader, Surface } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { colors, fontFamily, fontSize, layout, radii, spacing, moderateScale, horizontalScale, verticalScale } from '@/theme';
import { mockCategories, featuredFoods, mockFoods } from '@/data/mock';
import type { FoodItem } from '@/types/models';

export default function BuyerHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const CATEGORY_CARD_WIDTH = moderateScale(76);
  const FOOD_IMAGE_WIDTH = (screenWidth - layout.screenPadding * 2 - spacing.md) / 2;

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
        <Avatar name={user?.fullName || 'Usuario'} size={moderateScale(44)} />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={moderateScale(20)} color={colors.textSubtle} />
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
              { ...styles.categoryCard, width: CATEGORY_CARD_WIDTH },
              selectedCategory === cat.id && styles.categoryCardActive,
            ]}
          >
            <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
              <Ionicons name={cat.icon as any} size={moderateScale(20)} color={colors.text} />
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
          <Pressable key={food.id} style={[styles.foodCard, { width: FOOD_IMAGE_WIDTH }]} onPress={() => handleFoodPress(food)}>
            <View style={styles.foodImage}>
              {food.image ? (
                <View style={styles.foodImageContainer}>
                  <Ionicons name="restaurant-outline" size={moderateScale(32)} color={colors.textMuted} />
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
                  <Ionicons name="heart" size={moderateScale(18)} color={colors.danger} />
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
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  categoriesList: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoryCard: {
    width: 76,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    textAlign: 'center',
    fontSize: 12,
  },
  foodsList: {
    paddingHorizontal: 20,
    gap: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: 120,
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
    paddingVertical: 4,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.textOnPrimary,
    borderRadius: 999,
    padding: 4,
  },
  foodInfo: {
    padding: 12,
    justifyContent: 'center',
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: colors.primary,
  },
});