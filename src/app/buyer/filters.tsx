import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppInput, AppText, Screen } from '@/components/ui';
import { FilterChip } from '@/components/catalog/FilterChip';
import { mockCategories } from '@/data/mock';
import { catalogRoute, readCatalogSelection, singleParam, type CatalogDestination, type CatalogParams } from '@/utils/catalog';
import { colors, layout, spacing } from '@/theme';

export default function FiltersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<CatalogParams>();
  const source = singleParam(params.origin);
  const origin: CatalogDestination = source === '/buyer/category' || source === '/buyer/available-now' ? source : '/buyer/search';
  const [selection, setSelection] = useState(() => readCatalogSelection(params));
  const [price, setPrice] = useState(selection.maxPrice === undefined ? '' : String(selection.maxPrice));
  const [error, setError] = useState<string>();

  const apply = () => {
    const maxPrice = price.trim() ? Number(price) : undefined;
    if (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) {
      setError('Ingresa un precio máximo válido.');
      return;
    }
    // Cierra filtros hacia su origen, conserva categoría/query y evita push de otra lista.
    router.dismissTo(catalogRoute(origin, {
      ...selection, maxPrice, availability: origin === '/buyer/available-now' ? 'available' : selection.availability,
    }));
  };

  const clear = () => {
    setSelection({ query: '', availability: origin === '/buyer/available-now' ? 'available' : 'all', sort: 'rating', categoryId: origin === '/buyer/category' ? selection.categoryId : undefined });
    setPrice('');
    setError(undefined);
  };

  return (
    <Screen padded={false} scroll>
      <AppHeader title="Filtros" />
      <View style={styles.content}>
        <AppText variant="subtitle">Disponibilidad</AppText>
        <View style={styles.row}>
          <FilterChip label="Disponible ahora" selected={selection.availability === 'available'} onPress={() => setSelection({ ...selection, availability: 'available' })} />
          {origin !== '/buyer/available-now' ? <>
            <FilterChip label="Todas" selected={selection.availability === 'all'} onPress={() => setSelection({ ...selection, availability: 'all' })} />
            <FilterChip label="Mostrar agotados" selected={selection.availability === 'sold-out'} onPress={() => setSelection({ ...selection, availability: 'sold-out' })} />
          </> : null}
        </View>
        <AppText variant="subtitle">Categoría</AppText>
        <View style={styles.row}>
          {origin !== '/buyer/category' ? <FilterChip label="Todas las categorías" selected={!selection.categoryId} onPress={() => setSelection({ ...selection, categoryId: undefined })} /> : null}
          {mockCategories.map((category) => <FilterChip key={category.id} label={category.name} selected={selection.categoryId === category.id}
            onPress={() => setSelection({ ...selection, categoryId: category.id })} />)}
        </View>
        <AppInput label="Precio máximo" keyboardType="decimal-pad" value={price} onChangeText={(value) => { setPrice(value); setError(undefined); }} placeholder="Sin límite" />
        {error ? <AppText color={colors.danger}>{error}</AppText> : null}
        <AppButton label="Limpiar filtros" variant="outline" onPress={clear} />
        <AppButton label="Aplicar filtros" onPress={apply} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ content: { padding: layout.screenPadding, gap: spacing.lg }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm } });
