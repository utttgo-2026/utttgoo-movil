import React, { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { Alert, Image, RefreshControl, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { useAuth } from '@/context/AuthContext';
import type { ProductResponse, ProductStatus, ProductPatch } from '@/types/api';
import { priceInCents } from '@/utils/sellerValidation';
import { ApiError, errorMessage } from '@/services/api/errors';
import { colors, radii, spacing } from '@/theme';
import { MotionFeedback } from '@/components/ui/MotionFeedback';
import { SellerEntry } from '@/components/seller/SellerEntry';
import { AwsProductImage } from '@/components/catalog/AwsProductImage';
import { formatCurrency } from '@/utils/format';
import { isRealProductMediaEnabled, usesProductMediaDemo } from '@/config/productMedia';
import { pr33Demo } from '@/services/pr33Demo';
import { useProductPhotoFlow } from '@/hooks/useProductPhotoFlow';
import { ProductPhotoPanel } from '@/components/seller/ProductPhotoPanel';
import { RefreshingProductImage } from '@/components/catalog/RefreshingProductImage';
import { productUserMessage } from '@/utils/productPresentation';

const demoVisible = async () => ({ success: true as const, data: pr33Demo.list() });
const demoConsult = async (id: string, patch?: ProductPatch) => ({ success: true as const, data: await pr33Demo.consult(id, patch) });
const demoStatus = async (id: string, input: { status: ProductStatus }) => ({ success: true as const, data: await pr33Demo.availability(id, input.status) });

export default function SellerProductsScreen() { return usesProductMediaDemo() ? <SellerProductsContent /> : <SellerEntry authorizedChildren={<SellerProductsContent />} />; }
function SellerProductsContent() {
  const router = useRouter();
  const auth = useAuth();
  const demo = usesProductMediaDemo();
  const realEnabled = isRealProductMediaEnabled();
  useSyncExternalStore(pr33Demo.subscribe, pr33Demo.snapshot, pr33Demo.snapshot);
  const sessionProducts = demo ? pr33Demo.list() : auth.sessionProducts;
  const consultProduct = demo ? demoConsult : auth.consultProduct;
  const updateProductStatus = demo ? demoStatus : auth.updateProductStatus;
  const visibleSellerProducts = demo ? demoVisible : auth.visibleSellerProducts;
  const photoFlow = useProductPhotoFlow();
  const [visible, setVisible] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string>();
  const [search, setSearch] = useState('');
  const [revision, setRevision] = useState(0);
  useFocusEffect(useCallback(() => {
    void revision;
    let current = true; setLoading(true); setListError(undefined);
    void visibleSellerProducts().then((result) => {
      if (!current) return;
      if (result.success) setVisible(result.data); else { setVisible([]); setListError(result.error); }
      setLoading(false);
    }).catch(() => { if (current) { setVisible([]); setListError('No se pudieron consultar los alimentos.'); setLoading(false); } });
    return () => { current = false; };
  }, [visibleSellerProducts, revision]));
  const [id, setId] = useState('');
  const [product, setProduct] = useState<ProductResponse>();
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const consult = async (save = false, selectedId = id) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMessage('');
    try {
      if (save && (!product || product.id !== selectedId)) throw new ApiError('validation', 'Consulta primero el producto propio.');
      if (save && !/^\d+$/.test(stock)) throw new ApiError('validation', 'Stock debe ser entero no negativo.');
      const newPrice = save ? priceInCents(price) / 100 : undefined;
      const newStock = save ? Number(stock) : undefined;
      const patch = save && product ? { ...(newPrice !== product.price ? { price: newPrice } : {}), ...(newStock !== product.stock ? { stock: newStock } : {}) } : undefined;
      if (save && patch && !Object.keys(patch).length) throw new ApiError('validation', 'No hay cambios para guardar.');
      const result = await consultProduct(selectedId, patch);
      if (result.success) {
        if (!save) photoFlow.reset();
        setId(result.data.id); setProduct(result.data); setPrice(String(result.data.price)); setStock(String(result.data.stock));
        setVisible((items) => items.map((item) => item.id === result.data.id ? result.data : item));
        setMessage(save ? 'Precio y stock actualizados.' : '');
      } else { if (!save) setProduct(undefined); setMessage(result.error); }
    } catch (cause) { setMessage(errorMessage(cause)); }
    finally { lock.current = false; setBusy(false); }
  };
  const saveImage = async (remove: boolean) => {
    if ((!demo && !realEnabled) || !product || lock.current || photoFlow.busy) return;
    lock.current = true; setBusy(true); setMessage('');
    try {
      const flow = photoFlow.flow;
       if (!remove && !photoFlow.approvedMediaAssetId) throw new ApiError('validation', 'La fotografía aún no está lista para usarse.');
      const result = demo ? { success: true as const, data: await pr33Demo.catalog().patchImage(product.id, remove ? null : flow ?? null) } : await consultProduct(product.id, { mediaAssetId: remove ? null : photoFlow.approvedMediaAssetId });
      if (!result.success) throw new ApiError('http', result.error);
      const updated = result.data;
      setProduct(updated); setVisible((items) => items.map((item) => item.id === updated.id ? updated : item));
      photoFlow.reset(); setMessage(demo ? 'Fotografía actualizada solo en demostración.' : remove ? 'Fotografía quitada.' : 'Fotografía actualizada.');
    } catch (cause) { setMessage(errorMessage(cause)); }
    finally { lock.current = false; setBusy(false); }
  };
  const changeStatus = async (selectedId: string, status: ProductStatus) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMessage('');
    try {
      const result = await updateProductStatus(selectedId, { status });
      if (result.success) {
        setId(result.data.id); setProduct(result.data); setPrice(String(result.data.price)); setStock(String(result.data.stock));
        setVisible((items) => items.map((item) => item.id === result.data.id ? result.data : item));
        setMessage(result.data.status === 'Paused' ? 'Publicación pausada.' : 'Publicación reactivada.');
      } else { setProduct(undefined); setMessage(result.error); }
    } catch (cause) { setMessage(errorMessage(cause)); }
    finally { lock.current = false; setBusy(false); }
  };
  const items = [...(sessionProducts ?? []), ...visible].filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
    .filter((item) => item.name.toLocaleLowerCase('es-MX').includes(search.trim().toLocaleLowerCase('es-MX')));
  return <Screen scroll constrained refreshControl={<RefreshControl refreshing={loading} onRefresh={() => setRevision((value) => value + 1)} />} header={<AppHeader title="Mis alimentos" backFallback="/seller" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      {demo ? <AppText variant="caption">Demostración · Estos alimentos no están publicados.</AppText> : null}
      {demo ? <AppButton label="Ver catálogo de demostración" variant="outline" onPress={() => router.push('/buyer')} /> : null}
      <AppText variant="caption">Algunas publicaciones pausadas pueden no aparecer en esta lista.</AppText>
      <AppButton label="Agregar alimento" onPress={() => router.push('/seller/product-draft')} />
      <AppInput label="Buscar alimentos" accessibilityLabel="Buscar alimentos" value={search} onChangeText={setSearch} />
      {loading ? <AppText>Cargando alimentos…</AppText> : null}
      {listError ? <AppText accessibilityRole="alert">{productUserMessage(listError)}</AppText> : null}
      <AppButton label="Actualizar alimentos" variant="outline" disabled={loading} onPress={() => setRevision((value) => value + 1)} />
      {!loading && !listError && !items.length ? <AppText>No hay alimentos para mostrar.</AppText> : null}
      {items.map((item) => <Surface bordered key={item.id} style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <View style={{ width: 76 }}>{demo ? pr33Demo.uri(item.id) ? <Image source={{ uri: pr33Demo.uri(item.id) }} accessibilityLabel="Fotografía de demostración" style={{ width: '100%', aspectRatio: 1, borderRadius: radii.md }} /> : <AwsProductImage uri={null} name={item.name} style={{ aspectRatio: 1, borderRadius: radii.md }} /> : <RefreshingProductImage key={`${item.id}:${revision}:${item.imageUrlExpiresAt ?? ''}`} product={item} style={{ aspectRatio: 1, borderRadius: radii.md }} />}</View>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <AppText variant="label">{item.name}</AppText>
            <AppText variant="caption" color={colors.textMuted}>{item.categoryName || 'Alimento'} · {item.status === 'Active' ? 'Activo' : 'Pausado'}</AppText>
            <AppText variant="bodyStrong" color={colors.primary}>{formatCurrency(item.price)}</AppText>
            <AppText variant="caption">Stock {item.stock}</AppText>
          </View>
        </View>
        <AppButton label={`Editar ${item.name}`} size="md" variant="outline" disabled={busy} onPress={() => void consult(false, item.id)} />
        <AppButton label={`${item.status === 'Active' ? 'Pausar' : 'Reactivar'} ${item.name}`} size="sm" variant="ghost" disabled={busy}
          onPress={() => item.status === 'Active' ? Alert.alert('Retirar del catálogo', 'El alimento permanecerá registrado y podrás intentar reactivarlo.', [
            { text: 'Cancelar', style: 'cancel' }, { text: 'Pausar', onPress: () => void changeStatus(item.id, 'Paused') },
          ]) : void changeStatus(item.id, 'Active')} />
      </Surface>)}
      {product ? <Surface bordered style={{ gap: spacing.md }}>
        <AppText variant="subtitle">Editar alimento</AppText>
        <AppText variant="subtitle">{product.name}</AppText>
        {!demo ? <RefreshingProductImage key={`${product.id}:${revision}:${product.imageUrlExpiresAt ?? ''}`} product={product} /> : null}
        {demo || realEnabled ? <><AppText variant="label">Fotografía</AppText>
          {demo && pr33Demo.uri(product.id) ? <Image source={{ uri: pr33Demo.uri(product.id) }} accessibilityLabel="Imagen actual de demostración" style={{ width: '100%', aspectRatio: 1.6 }} /> : null}
          <ProductPhotoPanel photo={photoFlow} disabled={busy} />
          <AppButton label={demo ? 'Guardar fotografía simulada' : 'Guardar fotografía'} disabled={busy || photoFlow.busy || !photoFlow.approvedMediaAssetId} onPress={() => void saveImage(false)} />
          <AppButton label={demo ? 'Quitar imagen actual (demostración)' : 'Quitar imagen actual'} variant="outline" disabled={busy || photoFlow.busy} onPress={() => void saveImage(true)} />
        </> : null}
        <AppInput label="Precio MXN" accessibilityLabel="Precio MXN" value={price} editable={!busy} keyboardType="decimal-pad" onChangeText={setPrice} />
        <AppInput label="Stock" accessibilityLabel="Stock" value={stock} editable={!busy} keyboardType="number-pad" onChangeText={setStock} />
        <AppButton label="Guardar precio y stock" disabled={busy} onPress={() => void consult(true)} />
      </Surface> : null}
      {message ? <MotionFeedback trigger={message}><AppText accessibilityLiveRegion="polite">{productUserMessage(message)}</AppText></MotionFeedback> : null}
    </View>
  </Screen>;
}
