import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View, Image } from 'react-native';
import { Pressable, useWindowDimensions } from 'react-native';

import { AppButton, AppHeader, AppText, Badge, Screen, SectionHeader, Surface } from '@/components';
import { colors, fontSize, layout, radii, spacing, moderateScale } from '@/theme';
import { mockCategories } from '@/data/mock';
import type { FoodCategory } from '@/types/models';

const categoryImages: Record<string, string> = {
  'Desayunos': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200&q=80',
  'Comida corrida': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',
  'Antojitos': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=200&q=80',
  'Bebidas': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&q=80',
  'Postres': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&q=80',
  'Snacks': 'https://images.unsplash.com/photo-1599490659283-7c1b7a3d4c7a?w=200&q=80',
};

export default function CategoryScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const CARD_WIDTH = moderateScale(156);
  const CARD_HEIGHT = moderateScale(200);

  const handleCategoryPress = (category: FoodCategory) => {
    router.push(`/buyer/available-now?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}` as any);
  };

  const renderItem = ({ item }: { item: FoodCategory }) => (
    <Pressable key={item.id} style={[styles.categoryCard, { width: CARD_WIDTH, height: CARD_HEIGHT }]} onPress={() => handleCategoryPress(item)}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: categoryImages[item.name] }}
          style={styles.categoryImage}
          resizeMode="cover"
        />
        <View style={styles.gradientOverlay} />
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon as any} size={moderateScale(28)} color={colors.textOnPrimary} />
        </View>
      </View>
      <View style={styles.cardContent}>
        <AppText variant="subtitle" style={styles.categoryName}>
          {item.name}
        </AppText>
        <View style={styles.countRow}>
          <Ionicons name="restaurant-outline" size={moderateScale(12)} color={colors.textSubtle} />
          <AppText variant="caption" color={colors.textSubtle}>
            {item.itemCount} opciones
          </AppText>
        </View>
      </View>
    </Pressable>
  );

  return (
    <Screen backgroundColor={colors.background} padded={false}>
      <AppHeader title="Categorías" showBack />

      <View style={styles.content}>
        <AppText variant="subtitle" style={styles.sectionTitle}>
          ¿Qué se te antoja hoy?
        </AppText>
        <AppText variant="caption" color={colors.textMuted} style={styles.subtitle}>
          Explora por categoría y descubre tus favoritos
        </AppText>

        <FlatList
          data={mockCategories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          snapToInterval={CARD_WIDTH + spacing.md}
          decelerationRate="fast"
        />
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
  listContainer: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  categoryCard: {
    width: 156,
    height: 200,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageContainer: {
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
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  iconContainer: {
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
  cardContent: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  categoryName: {
    textAlign: 'center',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    marginTop: spacing.xxs,
  },
});