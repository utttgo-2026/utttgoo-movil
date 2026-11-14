import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader, AppInput, AppText, Screen } from '@/components/ui';
import { FilterChip } from '@/components/catalog/FilterChip';
import { ResponsiveFoodGrid } from '@/components/catalog/ResponsiveFoodGrid';
import { mockCategories, mockFoods } from '@/data/mock';
import { foodDetailRoute } from '@/navigation/buyerRoutes';
import { catalogRoute, filtersRoute, readCatalogSelection, selectFoods, type CatalogParams } from '@/utils/catalog';
import { colors, layout, spacing } from '@/theme';

// Tipo de componente estable: cambios de query no desmontan input/encabezado.
export function SearchHeader({ query, onQueryChange, onCategory }: {
  query: string; onQueryChange: (query: string) => void; onCategory: (id: string) => void;
}) {
  return (
    <View style={styles.header}>
      <AppInput label="Buscar alimentos" leftIcon="search-outline" placeholder="Buscar alimentos" value={query}
        onChangeText={onQueryChange} autoCapitalize="none" autoCorrect={false} />
      <AppText variant="subtitle">Explora por categoría</AppText>
      <View style={styles.chips}>
        {mockCategories.map((category) => <FilterChip key={category.id} label={category.name} onPress={() => onCategory(category.id)} />)}
      </View>
    </View>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<CatalogParams>();
  const selection = readCatalogSelection(params);
  const searching = Boolean(selection.query.trim() || selection.categoryId || selection.maxPrice !== undefined || selection.availability !== 'all');
  const foods = searching ? selectFoods(mockFoods, selection) : [];
  return (
    <Screen padded={false} edges={['top']}>
      <AppHeader title="Buscar" showBack={false} right={(
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir filtros" onPress={() => router.push(filtersRoute('/buyer/search', selection))} hitSlop={8}>
          <Ionicons name="options-outline" size={24} color={colors.primary} />
        </Pressable>
      )} />
      <ResponsiveFoodGrid testID="search-products" foods={foods}
        header={<SearchHeader query={selection.query} onQueryChange={(query) => router.setParams({ query })}
          onCategory={(categoryId) => router.push(catalogRoute('/buyer/category', { ...selection, query: '', categoryId }))} />}
        empty={searching ? <AppText style={styles.empty}>No se encontraron alimentos con esta selección.</AppText> : undefined}
        onFoodPress={(food) => router.push(foodDetailRoute(food.id))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.xxl, gap: spacing.md },
  header: { gap: spacing.xl, paddingVertical: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  empty: { paddingVertical: spacing.xl },
});
