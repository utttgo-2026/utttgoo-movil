import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { AppButton, AppHeader, AppText, Screen } from '@/components/ui';
import { CatalogControls } from '@/components/catalog/CatalogControls';
import { FoodImage } from '@/components/catalog/FoodImage';
import { mockCategories, mockFoods } from '@/data/mock';
import { foodDetailRoute } from '@/navigation/buyerRoutes';
import { catalogRoute, filtersRoute, readCatalogSelection, selectFoods, selectionParams, type CatalogParams } from '@/utils/catalog';
import { colors, layout, radii, spacing } from '@/theme';

export default function CategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<CatalogParams>();
  const selection = readCatalogSelection(params);
  const category = mockCategories.find((item) => item.id === selection.categoryId);
  const foods = category ? selectFoods(mockFoods, selection) : [];
  return (
    <Screen padded={false}>
      <AppHeader title={category?.name ?? 'Categoría no disponible'} backFallback="/buyer/search" right={category ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir filtros" onPress={() => router.push(filtersRoute('/buyer/category', selection))} hitSlop={8}>
          <Ionicons name="options-outline" size={24} color={colors.primary} />
        </Pressable>
      ) : null} />
      <FlatList testID="category-products" style={styles.list} data={foods} keyExtractor={(food) => food.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={category ? (
          <View style={styles.header}>
            {category.id === 'cat-1' ? <Image source={require('../../assets/images/foods/tortas-banner-detail.jpg')}
              style={styles.banner} contentFit="cover" accessible accessibilityLabel="Selección ilustrativa de tortas" /> : null}
            <AppText variant="body" color={colors.textMuted}>{foods.length} alimento{foods.length === 1 ? '' : 's'} con esta selección</AppText>
            <CatalogControls selection={selection} onChange={(next) => router.setParams(selectionParams(next))} />
          </View>
        ) : undefined}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <AppText variant="subtitle">{category ? 'Sin alimentos compatibles' : 'Selecciona una categoría desde Buscar'}</AppText>
            <AppText>{category ? 'No hay productos que cumplan esta selección. Puedes cambiar los filtros o seguir explorando.' : 'La categoría recibida no existe en el catálogo.'}</AppText>
            <AppButton label="Ir a Buscar" variant="outline" onPress={() => router.navigate(catalogRoute('/buyer/search', { ...selection, categoryId: undefined }))} />
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${item.name}`} style={styles.foodRow} onPress={() => router.push(foodDetailRoute(item.id))}>
            <FoodImage foodId={item.id} name={item.name} variant="thumbnail" style={styles.image} />
            <View style={styles.info}>
              <AppText variant="bodyStrong">{item.name}</AppText>
              <AppText variant="bodyStrong" color={colors.primary}>${item.price.toFixed(2)}</AppText>
              <AppText variant="caption">★ {item.rating} · {item.reviewCount} reseñas</AppText>
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { padding: layout.screenPadding, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: spacing.lg, marginBottom: spacing.md },
  banner: { width: '100%', aspectRatio: 3, borderRadius: radii.lg },
  empty: { gap: spacing.lg, paddingVertical: spacing.xl },
  foodRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg },
  image: { width: 72, height: 72, borderRadius: radii.md },
  info: { flex: 1, gap: spacing.xs },
});
