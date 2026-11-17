import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { useAuth } from '@/context/AuthContext';
import type { ProductResponse, ProductStatus } from '@/types/api';
import { priceInCents } from '@/utils/sellerValidation';
import { ApiError, errorMessage } from '@/services/api/errors';
import { spacing } from '@/theme';
import { MotionFeedback } from '@/components/ui/MotionFeedback';
import { SellerEntry } from '@/components/seller/SellerEntry';

export default function SellerProductsScreen() { return <SellerEntry authorizedChildren={<SellerProductsContent />} />; }
function SellerProductsContent() {
  const router = useRouter();
  const { sessionProducts, consultProduct, updateProductStatus } = useAuth();
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
      const result = await consultProduct(selectedId, save ? { price: priceInCents(price) / 100, stock: Number(stock) } : undefined);
      if (result.success) {
        setId(result.data.id); setProduct(result.data); setPrice(String(result.data.price)); setStock(String(result.data.stock));
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
        setMessage(result.data.status === 'Paused' ? 'Publicación pausada por AWS.' : 'Publicación reactivada por AWS.');
      } else { setProduct(undefined); setMessage(result.error); }
    } catch (cause) { setMessage(errorMessage(cause)); }
    finally { lock.current = false; setBusy(false); }
  };
  return <Screen scroll constrained header={<AppHeader title="Mis alimentos" backFallback="/seller" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      <AppText>Productos consultados o creados en esta sesión. El listado privado completo aún no tiene contrato.</AppText>
      {(sessionProducts ?? []).map((item) => <Surface bordered key={item.id}>
        <AppText variant="subtitle">{item.name}</AppText><AppText>{item.id} · {item.status} · Stock {item.stock}</AppText>
        <AppButton label={`Consultar ${item.name}`} variant="outline" disabled={busy} onPress={() => void consult(false, item.id)} />
        <AppButton label={`${item.status === 'Active' ? 'Pausar' : 'Reactivar'} ${item.name}`} variant="outline" disabled={busy}
          onPress={() => void changeStatus(item.id, item.status === 'Active' ? 'Paused' : 'Active')} />
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
      <AppButton label="Agregar alimento" onPress={() => router.push('/seller/product-draft')} />
      <AppText>Puedes pausar y reactivar tus publicaciones. Fotografías pendientes de la Fase 05; listado privado completo pendiente.</AppText>
    </View>
  </Screen>;
}
