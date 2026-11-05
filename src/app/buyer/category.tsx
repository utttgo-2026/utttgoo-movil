import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Pressable, useWindowDimensions } from 'react-native';

import { AppButton, AppHeader, AppText, Badge, Screen, SectionHeader, Surface } from '@/components';
import { colors, fontSize, layout, radii, spacing, moderateScale } from '@/theme';
import { mockCategories } from '@/data/mock';
import type { FoodCategory } from '@/types/models';

export default function CategoryScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  
  const CARD_WIDTH = (screenWidth - layout.screenPadding * 2 - spacing.md) / 2;

  const handleCategoryPress = (category: FoodCategory) => {
    router.push(`/buyer/available-now?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}` as any);
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <AppHeader title="Categorías" showBack />

      <View style={styles.content}>
        <AppText variant="subtitle" style={styles.sectionTitle}>
          Elige una categoría
        </AppText>
        <AppText variant="caption" color={colors.textMuted} style={styles.subtitle}>
          Explora los alimentos disponibles por tipo
        </AppText>

        <View style={styles.categoriesGrid}>
          {mockCategories.map((cat) => (
            <Pressable key={cat.id} style={[styles.categoryCard, { width: CARD_WIDTH }]} onPress={() => handleCategoryPress(cat)}>
              <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                <Ionicons name={cat.icon as any} size={moderateScale(24)} color={colors.text} />
              </View>
              <AppText variant="subtitle" style={styles.categoryName}>
                {cat.name}
              </AppText>
              <Badge label={`${cat.itemCount} productos`} tone="neutral" style={styles.badge} />
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    marginTop: 24,
  },
  subtitle: {
    marginTop: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: 150,
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    textAlign: 'center',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'center',
    marginTop: 8,
  },
});