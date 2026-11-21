import React, { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppButton, AppHeader, AppInput, AppText, Badge, Screen, Surface } from '@/components/ui';
import { FilterChip } from './FilterChip';
import { AwsProductImage } from './AwsProductImage';
import { useCatalogCategories } from '@/hooks/useCatalogCategories';
import { getGridMetrics, useWindowDimensions } from '@/hooks/useResponsive';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/api/productService';
import { errorMessage } from '@/services/api/errors';
import { readCatalogSelection, catalogRoute, filtersRoute, type CatalogParams } from '@/utils/catalog';
import { formatCurrency } from '@/utils/format';
import type { ProductPage, ProductResponse } from '@/types/api';
import { colors, radii, spacing } from '@/theme';
import { MotionPressable } from '@/components/ui/MotionPressable';
import { MotionFeedback } from '@/components/ui/MotionFeedback';

export function AwsCatalog({ title, search = false, category = false }: { title: string; search?: boolean; category?: boolean }) {
  const router = useRouter();
  const params = useLocalSearchParams<CatalogParams>();
  const selection = readCatalogSelection(params);
  const categories = useCatalogCategories();
  const [revision, setRevision] = useState(0);
  const selectionKey = JSON.stringify([selection.query, selection.categoryId, selection.maxPrice, selection.awsSort, category]);
  const [pagination, setPagination] = useState({ selectionKey, page: 1 });
  const page = pagination.selectionKey === selectionKey ? pagination.page : 1;
  const key = JSON.stringify([selectionKey, page, revision]);
  const [result, setResult] = useState<{ key: string; data?: ProductPage; error?: string }>();
  const [fetching, setFetching] = useState(false);
  const invalidCategory = category && !selection.categoryId;
  const loading = !invalidCategory && (fetching || result?.key !== key);
  const data = result?.key === key ? result.data : undefined;
  const message = invalidCategory ? 'Selecciona una categoría válida.' : result?.key === key ? result.error : undefined;
  const selected = categories.items.find((item) => item.id === selection.categoryId);
  const dimensions = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const metrics = getGridMetrics(Math.min(width || dimensions.width, dimensions.width), dimensions.fontScale, 0, spacing.md);
  useFocusEffect(useCallback(() => {
    let current = true;
    if (invalidCategory) return;
    setFetching(true);
    const timer = setTimeout(() => {
      void productService.getPage({ search: selection.query || undefined, categoryId: selection.categoryId, maxPrice: selection.maxPrice,
        sortBy: selection.awsSort, page })
        .then((value) => { if (current) setResult({ key, data: value }); })
        .catch((cause: unknown) => { if (current) setResult({ key, error: errorMessage(cause) }); })
        .finally(() => { if (current) setFetching(false); });
    }, 300);
    return () => { current = false; clearTimeout(timer); };
  }, [invalidCategory, key, selection.query, selection.categoryId, selection.maxPrice, selection.awsSort, page]));
  return <Screen scroll constrained header={<AppHeader title={category ? selected?.name ?? title : title} showBack={!search && title !== 'Inicio'} />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      {search ? <AppInput label="Buscar alimentos" placeholder="Buscar alimentos" value={selection.query}
        onChangeText={(query) => router.setParams({ query })} /> : null}
      {categories.loading ? <AppText>Cargando categorías…</AppText> : null}
      {categories.error ? <AppText accessibilityRole="alert">{categories.error}</AppText> : null}
      {!categories.loading && !categories.error && !categories.items.length ? <AppText>AWS no tiene categorías configuradas.</AppText> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {categories.items.map((item) => <FilterChip key={item.id} label={item.name} selected={item.id === selection.categoryId}
          onPress={() => router.push(catalogRoute('/buyer/category', { ...selection, categoryId: item.id }))} />)}
      </View>
      <AppButton label="Abrir filtros" variant="outline" onPress={() => router.push(filtersRoute(search ? '/buyer/search' : category ? '/buyer/category' : '/buyer/available-now', selection))} />
      <MotionFeedback trigger={loading ? 'loading' : message ? 'error' : data?.items.length ? 'content' : 'empty'} style={{ gap: spacing.lg }}>
      {loading ? <AppText accessibilityLiveRegion="polite">Consultando productos en AWS…</AppText> : null}
      {message ? <AppText accessibilityRole="alert">{message}</AppText> : null}
      {data && !data.items.length ? <Surface bordered><AppText>{data.totalCount === 0 ? 'AWS no tiene productos públicos con esta selección.' : 'No hay productos en esta página.'}</AppText></Surface> : null}
      <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        {data?.items.map((product) => <MotionPressable key={product.id} accessibilityRole="button" accessibilityLabel={`Ver ${product.name}`}
          onPress={() => router.push({ pathname: '/buyer/food/[id]', params: { id: product.id } })}
          style={{ width: metrics.cardWidth, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', backgroundColor: colors.surface }}>
          <AwsProductImage uri={null} name={product.name} />
          <View style={{ padding: spacing.md, gap: spacing.xs }}>
            <AppText variant="cardTitle">{product.name}</AppText><AppText variant="caption" numberOfLines={2}>{product.description}</AppText>
            <AppText variant="bodyStrong" color={colors.primary}>{formatCurrency(product.price)}</AppText>
            <Badge label={product.status === 'Paused' ? 'En pausa' : product.isAvailable && product.stock > 0 ? 'Disponible ahora' : 'No disponible'} tone={product.status === 'Active' && product.isAvailable && product.stock > 0 ? 'success' : 'danger'} />
          </View>
        </MotionPressable>)}
      </View>
      {data ? <View style={{ gap: spacing.sm }}>
        <AppText>Página {data.page} · {data.totalCount} productos</AppText>
        <AppButton label="Página anterior" variant="outline" disabled={page <= 1} onPress={() => setPagination({ selectionKey, page: page - 1 })} />
        <AppButton label="Página siguiente" variant="outline" disabled={page * data.pageSize >= data.totalCount || !data.items.length} onPress={() => setPagination({ selectionKey, page: page + 1 })} />
      </View> : null}
      </MotionFeedback>
      <AppButton label="Volver a consultar" loading={loading} onPress={() => { setRevision((value) => value + 1); categories.reload(); }} />
    </View>
  </Screen>;
}

export function AwsProductDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { prepareOrder, isAuthenticated } = useAuth();
  const [quantitySelection, setQuantitySelection] = useState<{ key: string; value: number }>();
  const [error, setError] = useState<{ key: string; message?: string }>();
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ key: string; product?: ProductResponse; error?: string }>();
  const key = JSON.stringify([id, revision]);
  const quantity = quantitySelection?.key === key ? quantitySelection.value : 1;
  useFocusEffect(useCallback(() => {
    let current = true;
    if (typeof id !== 'string') return;
    void productService.getById(id).then((product) => { if (current) setResult({ key, product }); })
      .catch((cause: unknown) => { if (current) setResult({ key, error: errorMessage(cause) }); });
    return () => { current = false; };
  }, [id, key]));
  const product = result?.key === key ? result.product : undefined;
  const message = typeof id !== 'string' ? 'Identificador de producto inválido.' : result?.key === key ? result.error : 'Consultando producto…';
  const prepare = () => {
    if (!product) return;
    const response = prepareOrder(product, quantity);
    if (response.success) router.push('/buyer/order-data'); else setError({ key, message: response.error });
  };
  return <Screen scroll constrained header={<AppHeader title={product?.name ?? 'Detalle del alimento'} backFallback="/buyer" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      <AwsProductImage uri={null} name={product?.name ?? 'producto'} style={{ borderRadius: radii.xxl }} />
      {message ? <AppText accessibilityLiveRegion="polite">{message}</AppText> : null}
      {product ? <>
        <AppText variant="title">{product.name}</AppText>
        <Surface bordered><AppText variant="label">Descripción</AppText><AppText>{product.description}</AppText></Surface>
        <AppText>Ingredientes: {product.ingredients.join(', ') || 'Sin ingredientes informados'}</AppText>
        <AppText>{product.status === 'Paused' ? 'En pausa' : product.isAvailable && product.stock > 0 ? 'Disponible' : 'No disponible'} · Stock {product.stock}</AppText>
        <AppText variant="label">Cantidad</AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <AppButton label="−" variant="outline" fullWidth={false} disabled={quantity <= 1} onPress={() => setQuantitySelection({ key, value: quantity - 1 })} />
          <AppText>{quantity}</AppText>
          <AppButton label="+" variant="outline" fullWidth={false} disabled={quantity >= product.stock} onPress={() => setQuantitySelection({ key, value: quantity + 1 })} />
        </View>
        <AppText variant="title">{formatCurrency(Math.round(product.price * 100) * quantity / 100)}</AppText>
      </> : null}
      {error?.key === key && error.message ? <AppText accessibilityRole="alert">{error.message}</AppText> : null}
      {!isAuthenticated ? <AppButton label="Iniciar sesión para comprar" variant="outline" onPress={() => router.push('/(auth)/login')} /> : null}
      <AppButton label="Agregar al pedido" disabled={!isAuthenticated || !product || !product.isAvailable || product.status !== 'Active' || quantity > product.stock} onPress={prepare} />
      <AppButton label="Consultar disponibilidad" variant="outline" onPress={() => setRevision((value) => value + 1)} />
    </View>
  </Screen>;
}
