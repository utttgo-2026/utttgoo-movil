import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { Pressable } from 'react-native';

import { AppButton, AppHeader, AppInput, AppText, Badge, Screen, SectionHeader, Surface } from '@/components';
import { colors, fontFamily, fontSize, layout, radii, spacing } from '@/theme';
import { mockFoods } from '@/data/mock';
import type { FoodItem } from '@/types/models';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filtered = mockFoods.filter(
    (f) =>
      f.availability === 'available' &&
      f.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleFoodPress = (food: FoodItem) => {
    router.push(`/buyer/food?foodId=${food.id}` as any);
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <AppHeader title="Buscar" showBack />

      <View style={styles.content}>
        <AppInput
          label="Buscar alimentos"
          leftIcon="search-outline"
          value={query}
          onChangeText={setQuery}
          placeholder="¿Qué deseas comer hoy?"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <SectionHeader title="Resultados" />

        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <AppText variant="subtitle" align="center" color={colors.textMuted}>
              No se encontraron resultados
            </AppText>
            <AppText variant="caption" align="center" color={colors.textSubtle}>
              Intenta con otro término de búsqueda
            </AppText>
          </View>
        ) : (
          <View style={styles.foodsList}>
            {filtered.map((food) => (
              <Pressable key={food.id} style={styles.foodItem} onPress={() => handleFoodPress(food)}>
                <View style={styles.foodInfo}>
                  <AppText variant="subtitle" numberOfLines={1}>
                    {food.name}
                  </AppText>
                  <AppText variant="body" color={colors.textMuted}>
                    {food.description}
                  </AppText>
                  <View style={styles.foodMeta}>
                    <AppText variant="caption" color={colors.textSubtle}>
                      ${food.price}
                    </AppText>
                    <AppText variant="caption" color={colors.textSubtle}>
                      • {food.prepTimeMinutes} min
                    </AppText>
                  </View>
                </View>
                <Badge label={food.rating.toFixed(1)} tone="warning" />
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.huge,
  },
  foodsList: {
    gap: spacing.md,
  },
  foodItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
  },
  foodMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
