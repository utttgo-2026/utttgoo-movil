import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components/ui';
import { FilterChip } from './FilterChip';
import { useCatalogCategories } from '@/hooks/useCatalogCategories';
import { productService } from '@/services/api/productService';
import { errorMessage } from '@/services/api/errors';
import { readCatalogSelection, catalogRoute, filtersRoute, type CatalogParams } from '@/utils/catalog';
import { colors, spacing } from '@/theme';

export function AwsCatalog({ title, search = false, category = false }: { title: string; search?: boolean; category?: boolean }) {
  const router = useRouter();
  const params = useLocalSearchParams<CatalogParams>();
  const selection = readCatalogSelection(params);
  const categories = useCatalogCategories();
  const [revision, setRevision] = useState(0);
  const key = JSON.stringify([selection.query, selection.categoryId, selection.maxPrice, category, revision]);
  const [result, setResult] = useState<{ key: string; message: string }>();
  const invalidCategory = category && !selection.categoryId;
  const loading = !invalidCategory && result?.key !== key;
  const message = invalidCategory ? 'Selecciona una categoría válida.' : result?.key === key ? result.message : '';
  const selected = categories.items.find((item) => item.id === selection.categoryId);
  useEffect(() => {
    let current = true;
    if (invalidCategory) return;
    const timer = setTimeout(() => {
      void productService.getPage({ search: selection.query || undefined, categoryId: selection.categoryId, maxPrice: selection.maxPrice })
        .then((data) => { if (current) setResult({ key, message: data.total === 0 ? 'AWS no tiene productos públicos con esta selección.' : 'AWS informa productos, pero falta el DTO completo para mostrarlos.' }); })
        .catch((cause: unknown) => { if (current) setResult({ key, message: errorMessage(cause) }); });
    }, 300);
    return () => { current = false; clearTimeout(timer); };
  }, [invalidCategory, key, selection.query, selection.categoryId, selection.maxPrice]);
  return <Screen scroll constrained header={<AppHeader title={category ? selected?.name ?? title : title} showBack={!search && title !== 'Inicio'} />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      {search ? <AppInput label="Buscar alimentos" placeholder="Buscar alimentos" value={selection.query}
        onChangeText={(query) => router.setParams({ query })} /> : null}
      <AppText variant="caption">Catálogo AWS — sin productos de demostración</AppText>
      {categories.loading ? <AppText>Cargando categorías…</AppText> : null}
      {categories.error ? <AppText accessibilityRole="alert">{categories.error}</AppText> : null}
      {!categories.loading && !categories.error && !categories.items.length ? <AppText>AWS no tiene categorías configuradas.</AppText> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {categories.items.map((item) => <FilterChip key={item.id} label={item.name} selected={item.id === selection.categoryId}
          onPress={() => router.push(catalogRoute('/buyer/category', { ...selection, categoryId: item.id }))} />)}
      </View>
      <AppButton label="Abrir filtros" variant="outline" onPress={() => router.push(filtersRoute(search ? '/buyer/search' : category ? '/buyer/category' : '/buyer/available-now', selection))} />
      <Surface bordered><AppText accessibilityLiveRegion="polite">{loading ? 'Consultando productos en AWS…' : message}</AppText></Surface>
      <AppButton label="Volver a consultar" loading={loading} onPress={() => { setRevision((value) => value + 1); categories.reload(); }} />
      <AppText variant="caption">Fotografías y DTO completo del producto pendientes; no se muestran datos inventados ni se mezclan mocks.</AppText>
    </View>
  </Screen>;
}

export function AwsProductDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [result, setResult] = useState<{ id: string; message: string }>();
  useEffect(() => {
    let current = true;
    if (typeof id !== 'string') return;
    void productService.getById(id).catch((cause: unknown) => { if (current) setResult({ id, message: errorMessage(cause) }); });
    return () => { current = false; };
  }, [id]);
  const message = typeof id !== 'string' ? 'Identificador de producto inválido.' : result?.id === id ? result.message : 'Consultando producto…';
  return <Screen header={<AppHeader title="Detalle del alimento" backFallback="/buyer" />}>
    <View accessible accessibilityRole="image" accessibilityLabel="Imagen de producto no disponible" style={{ minHeight: 140, backgroundColor: colors.surfaceMuted, marginVertical: spacing.lg }} />
    <AppText accessibilityLiveRegion="polite">{message}</AppText>
    <AppButton label="Agregar al pedido" disabled />
  </Screen>;
}
