import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, Image } from 'react-native';
import { useWindowDimensions } from 'react-native';

import { AppButton, AppText, Avatar, Badge, BrandLogo, Screen, SectionHeader, Surface } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { colors, fontFamily, fontSize, layout, radii, spacing, moderateScale } from '@/theme';
import { mockCategories, featuredFoods, mockFoods } from '@/data/mock';
import type { FoodItem } from '@/types/models';

const categoryImages: Record<string, string> = {
  'Desayunos': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200&q=80',
  'Comida corrida': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',
  'Antojitos': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=200&q=80',
  'Bebidas': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&q=80',
  'Postres': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&q=80',
  'Snacks': 'https://images.unsplash.com/photo-1599490659283-7c1b7a3d4c7a?w=200&q=80',
};

const foodImages: Record<string, string> = {
  'Torta de Milanesa': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&q=80',
  'Enchiladas Verdes': 'https://images.unsplash.com/photo-1559338353-b2e69999b91f?w=300&q=80',
  'Chilaquiles con Huevo': 'https://images.unsplash.com/photo-1543064986-ea913744d4f6?w=300&q=80',
  'Quesadillas de Hongos': 'https://images.unsplash.com/photo-1565299624964-b32404e929b4?w=300&q=80',
};

export default function BuyerHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const CAT_CARD_WIDTH = moderateScale(156);
  const CAT_CARD_HEIGHT = moderateScale(200);
  const FOOD_CARD_WIDTH = (screenWidth - layout.screenPadding * 2 - spacing.md) / 2;
  const FOOD_CARD_HEIGHT = moderateScale(280);

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

  const renderCategory = ({ item }: { item: typeof mockCategories[0] }) => (
    <Pressable key={item.id} style={[styles.categoryCard, { width: CAT_CARD_WIDTH, height: CAT_CARD_HEIGHT }]} onPress={() => handleCategoryPress(item.id)}>
      <View style={styles.categoryImageContainer}>
        <Image
          source={{ uri: categoryImages[item.name] }}
          style={styles.categoryImage}
          resizeMode="cover"
        />
        <View style={styles.categoryGradientOverlay} />
        <View style={styles.categoryIconContainer}>
          <Ionicons name={item.icon as any} size={moderateScale(28)} color={colors.textOnPrimary} />
        </View>
      </View>
      <View style={styles.categoryContent}>
        <AppText variant="subtitle" style={styles.categoryName}>
          {item.name}
        </AppText>
        <View style={styles.categoryCountRow}>
          <Ionicons name="restaurant-outline" size={moderateScale(12)} color={colors.textSubtle} />
          <AppText variant="caption" color={colors.textSubtle}>
            {item.itemCount} opciones
          </AppText>
        </View>
      </View>
    </Pressable>
  );

  const renderFood = ({ item }: { item: FoodItem }) => (
    <Pressable key={item.id} style={[styles.foodCard, { width: FOOD_CARD_WIDTH, height: moderateScale(280) }]} onPress={() => handleFoodPress(item)}>
      <View style={styles.foodImageContainer}>
        <Image
          source={{ uri: foodImages[item.name] || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&q=80' }}
          style={styles.foodImage}
          resizeMode="cover"
        />
        <View style={styles.foodGradientOverlay} />
        {item.isFavorite ? (
          <View style={styles.favoriteBadge}>
            <Ionicons name="heart" size={moderateScale(18)} color={colors.danger} />
          </View>
        ) : null}
      </View>
      <View style={styles.foodInfo}>
        <AppText variant="subtitle" numberOfLines={1} style={styles.foodName}>
          {item.name}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={2} style={styles.foodDesc}>
          {item.description}
        </AppText>
        <View style={styles.foodRow}>
          <AppText variant="bodyStrong" style={styles.price}>
            ${item.price}
          </AppText>
          <AppText variant="caption" color={colors.textSubtle}>
            {item.prepTimeMinutes} min
          </AppText>
          <Badge label={item.rating.toFixed(1)} tone="warning" />
        </View>
      </View>
    </Pressable>
  );

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

      <FlatList
        data={mockCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
        snapToInterval={moderateScale(156) + spacing.md}
        decelerationRate="fast"
      />

      <SectionHeader title="Disponible ahora" />

      <FlatList
        data={filteredFoods}
        renderItem={renderFood}
        keyExtractor={(item) => item.id}
        horizontal={false}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.foodsList}
      />
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
    paddingHorizontal: layout.screenPadding,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  categoryCard: {
    width: moderateScale(156),
    height: moderateScale(200),
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  categoryImageContainer: {
    width: '100%',
    height: '65%',
    position: 'relative',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  categoryIconContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryContent: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  categoryName: {
    textAlign: 'center',
  },
  categoryCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    marginTop: spacing.xxs,
  },
  foodsList: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  foodCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  foodImageContainer: {
    width: '100%',
    height: '55%',
    position: 'relative',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  foodGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  favoriteBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: radii.pill,
    backgroundColor: colors.textOnPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodInfo: {
    padding: spacing.md,
    flex: 1,
    justifyContent: 'space-between',
  },
  foodName: {
    marginBottom: spacing.xxs,
  },
  foodDesc: {
    marginBottom: spacing.sm,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bold,
    color: colors.primary,
  },
});