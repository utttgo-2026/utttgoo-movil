import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader, AppText, Screen } from '@/components/ui';
import { CatalogControls } from '@/components/catalog/CatalogControls';
import { ResponsiveFoodGrid } from '@/components/catalog/ResponsiveFoodGrid';
import { mockFoods } from '@/data/mock';
import { foodDetailRoute } from '@/navigation/buyerRoutes';
import { filtersRoute, readCatalogSelection, selectFoods, selectionParams, type CatalogParams } from '@/utils/catalog';
import { colors, layout, spacing } from '@/theme';

export default function AvailableNowScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<CatalogParams>();
  const selection = { ...readCatalogSelection(params), availability: 'available' as const };
  const foods = selectFoods(mockFoods, selection);
  return (
    <Screen padded={false}>
      <AppHeader title="Disponible ahora" right={(
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir filtros" onPress={() => router.push(filtersRoute('/buyer/available-now', selection))} hitSlop={8}>
          <Ionicons name="options-outline" size={24} color={colors.primary} />
        </Pressable>
      )} />
      <ResponsiveFoodGrid testID="available-products" foods={foods}
        header={(
          <View style={styles.header}>
            <AppText>{foods.length} opciones disponibles</AppText>
            <CatalogControls availableOnly selection={selection} onChange={(next) => router.setParams(selectionParams(next))} />
          </View>
        )}
        empty={<AppText>No hay alimentos disponibles con esta selección.</AppText>}
        onFoodPress={(food) => router.push(foodDetailRoute(food.id))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { padding: layout.screenPadding, gap: spacing.md, paddingBottom: spacing.xxl },
  columns: { gap: spacing.md },
  header: { gap: spacing.lg, marginBottom: spacing.md },
});
