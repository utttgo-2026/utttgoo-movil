import React, { useCallback, useRef, useState } from 'react';
import { Alert, RefreshControl, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { useAuth } from '@/context/AuthContext';
import type { ProductResponse, ProductStatus } from '@/types/api';
import { priceInCents } from '@/utils/sellerValidation';
import { ApiError, errorMessage } from '@/services/api/errors';
import { spacing } from '@/theme';
import { MotionFeedback } from '@/components/ui/MotionFeedback';
import { SellerEntry } from '@/components/seller/SellerEntry';
import { AwsProductImage } from '@/components/catalog/AwsProductImage';
import { formatCurrency } from '@/utils/format';

export default function SellerProductsScreen() { return <SellerEntry authorizedChildren={<SellerProductsContent />} />; }
function SellerProductsContent() {
  const router = useRouter();
  const { sessionProducts, consultProduct, updateProductStatus, visibleSellerProducts } = useAuth();
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
        setId(result.data.id); setProduct(result.data); setPrice(String(result.data.price)); setStock(String(result.data.stock));
        setVisible((items) => items.map((item) => item.id === result.data.id ? result.data : item));
        setMessage(save ? 'Precio y stock confirmados por AWS.' : 'Producto propio verificado con AWS.');
      } else { setProduct(undefined); setMessage(result.error); }
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
        setMessage(result.data.status === 'Paused' ? 'Publicación pausada por AWS.' : 'Publicación reactivada por AWS.');
      } else { setProduct(undefined); setMessage(result.error); }
    } catch (cause) { setMessage(errorMessage(cause)); }
    finally { lock.current = false; setBusy(false); }
  };
  const items = [...(sessionProducts ?? []), ...visible].filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
    .filter((item) => item.name.toLocaleLowerCase('es-MX').includes(search.trim().toLocaleLowerCase('es-MX')));
  return <Screen scroll constrained refreshControl={<RefreshControl refreshing={loading} onRefresh={() => setRevision((value) => value + 1)} />} header={<AppHeader title="Mis alimentos" backFallback="/seller" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      <AppText>Productos consultados o creados en esta sesión. El listado privado completo aún no tiene contrato.</AppText>
      <AppText>También se muestran tus productos visibles del catálogo público; los pausados o no visibles pueden faltar.</AppText>
      <AppButton label="Agregar alimento" onPress={() => router.push('/seller/product-draft')} />
      <AppInput label="Buscar en productos recuperados" accessibilityLabel="Buscar alimentos" value={search} onChangeText={setSearch} />
      {loading ? <AppText>Cargando catálogo público…</AppText> : null}
      {listError ? <AppText accessibilityRole="alert">{listError}</AppText> : null}
      <AppButton label="Actualizar alimentos" variant="outline" disabled={loading} onPress={() => setRevision((value) => value + 1)} />
      {!loading && !listError && !items.length ? <AppText>No hay alimentos en los resultados recuperados.</AppText> : null}
      {items.map((item) => <Surface bordered key={item.id} style={{ gap: spacing.sm }}>
        <AwsProductImage uri={null} name={item.name} />
        <AppText variant="subtitle">{item.name}</AppText><AppText>{item.description}</AppText>
        <AppText>{item.categoryName || 'Categoría sin nombre'} · {formatCurrency(item.price)}</AppText>
        <AppText>{item.id} · {item.status} · Stock {item.stock}</AppText>
        <AppButton label={`Consultar ${item.name}`} variant="outline" disabled={busy} onPress={() => void consult(false, item.id)} />
        <AppButton label={`${item.status === 'Active' ? 'Pausar' : 'Reactivar'} ${item.name}`} variant="outline" disabled={busy}
          onPress={() => item.status === 'Active' ? Alert.alert('Retirar del catálogo', 'El alimento permanecerá registrado y podrás intentar reactivarlo.', [
            { text: 'Cancelar', style: 'cancel' }, { text: 'Pausar', onPress: () => void changeStatus(item.id, 'Paused') },
          ]) : void changeStatus(item.id, 'Active')} />
      </Surface>)}
      <AppInput label="ID de producto AWS" accessibilityLabel="ID de producto AWS" value={id} editable={!busy} onChangeText={(value) => { setId(value); setProduct(undefined); }} />
      <AppButton label="Consultar producto propio" loading={busy} disabled={!id.trim()} onPress={() => void consult()} />
      {product ? <Surface bordered style={{ gap: spacing.md }}>
        <AppText variant="subtitle">{product.name}</AppText>
        <AppInput label="Precio MXN" accessibilityLabel="Precio MXN" value={price} keyboardType="decimal-pad" onChangeText={setPrice} />
        <AppInput label="Stock" accessibilityLabel="Stock" value={stock} keyboardType="number-pad" onChangeText={setStock} />
        <AppButton label="Guardar precio y stock" disabled={busy} onPress={() => void consult(true)} />
      </Surface> : null}
      {message ? <MotionFeedback trigger={message}><AppText accessibilityLiveRegion="polite">{message}</AppText></MotionFeedback> : null}
      <AppText>Puedes pausar y reactivar tus publicaciones. Fotografías pendientes de la Fase 05; listado privado completo pendiente.</AppText>
    </View>
  </Screen>;
}
