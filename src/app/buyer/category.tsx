import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Pressable } from 'react-native';

import { AppButton, AppHeader, AppText, Badge, Screen, SectionHeader, Surface } from '@/components';
import { colors, fontSize, layout, radii, spacing } from '@/theme';
import { mockCategories } from '@/data/mock';
import type { FoodCategory } from '@/types/models';

export default function CategoryScreen() {
  const router = useRouter();

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
            <Pressable key={cat.id} style={styles.categoryCard} onPress={() => handleCategoryPress(cat)}>
              <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                <Ionicons name={cat.icon as any} size={24} color={colors.text} />
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
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryCard: {
    width: (layout.maxContentWidth - spacing.md) / 2,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  categoryName: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
});
