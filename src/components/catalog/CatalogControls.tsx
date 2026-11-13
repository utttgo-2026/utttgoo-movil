import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { spacing } from '@/theme';
import type { CatalogSelection } from '@/utils/catalog';

import { FilterChip } from './FilterChip';

export function CatalogControls({ selection, onChange, availableOnly = false }: {
  selection: CatalogSelection; onChange: (selection: CatalogSelection) => void; availableOnly?: boolean;
}) {
  return (
    <View style={styles.content}>
      <AppText variant="label">Filtros</AppText>
      <View style={styles.row}>
        {!availableOnly ? <FilterChip label="Disponible" selected={selection.availability === 'available'}
          onPress={() => onChange({ ...selection, availability: selection.availability === 'available' ? 'all' : 'available' })} /> : null}
        <FilterChip label="Hasta $60" selected={selection.maxPrice === 60}
          onPress={() => onChange({ ...selection, maxPrice: selection.maxPrice === 60 ? undefined : 60 })} />
      </View>
      <AppText variant="label">Ordenar por</AppText>
      <View style={styles.row}>
        <FilterChip label="Mejor calificación" selected={selection.sort === 'rating'} onPress={() => onChange({ ...selection, sort: 'rating' })} />
        <FilterChip label="Menor precio" selected={selection.sort === 'price'} onPress={() => onChange({ ...selection, sort: 'price' })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ content: { gap: spacing.md }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm } });
