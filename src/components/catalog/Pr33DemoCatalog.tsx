import React, { useState, useSyncExternalStore } from 'react';
import { Image, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { pr33Demo } from '@/services/pr33Demo';
import { AppButton, AppHeader, AppText, Screen, Surface } from '@/components/ui';
import { AwsProductImage } from './AwsProductImage';
import { spacing } from '@/theme';
import { formatCurrency } from '@/utils/format';

/** Uses the SAME demo inventory as seller screens; no purchase IDs ever enter real orders. */
export function Pr33DemoCatalog({ detail = false }: { detail?: boolean }) {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  useSyncExternalStore(pr33Demo.subscribe, pr33Demo.snapshot, pr33Demo.snapshot);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [clock] = useState(() => Date.now());
  const items = pr33Demo.list().filter((item) => !detail || item.id === id);
  return <Screen scroll constrained header={<AppHeader title={detail ? 'Detalle de demostración' : 'Catálogo de demostración'} backFallback="/seller/products" />}>
    <View style={{ gap: spacing.lg }}>
      <AppText variant="caption">Demostración · Estos alimentos no están a la venta.</AppText>
      {error ? <AppText accessibilityRole="alert">{error}</AppText> : null}
      {!items.length ? <AppText>No hay productos simulados. Crea un alimento desde la demostración del vendedor.</AppText> : null}
      {items.map((item) => {
        const expired = !!item.imageUrlExpiresAt && Date.parse(item.imageUrlExpiresAt) <= clock;
        const uri = item.imageUrl && !expired ? pr33Demo.uri(item.id) : undefined;
        return <Surface key={item.id} bordered style={{ gap: spacing.md }}>
          {uri ? <Image source={{ uri }} accessibilityLabel={`Foto local simulada de ${item.name}`} style={{ width: '100%', aspectRatio: 1.6 }} /> : <AwsProductImage uri={null} name={item.name} />}
          <AppText variant="subtitle">{item.name}</AppText><AppText>{item.description}</AppText><AppText>{formatCurrency(item.price)} · Stock {item.stock}</AppText>
          {expired ? <AppText>La imagen no está disponible. Consulta de nuevo para actualizarla.</AppText> : null}
          {!detail ? <AppButton label="Ver detalle simulado" onPress={() => router.push({ pathname: '/buyer/food/[id]', params: { id: item.id } })} /> : <>
            <AppButton label="Simular vencimiento de imagen" disabled={busy || !item.imageUrl} onPress={() => pr33Demo.expire(item.id)} />
            <AppButton label="Renovar imagen simulada" variant="outline" disabled={busy || !expired} onPress={() => {
              setBusy(true); setError(undefined); void pr33Demo.renew(item.id).catch(() => setError('No se pudo renovar la imagen simulada.')).finally(() => setBusy(false));
            }} />
          </>}
        </Surface>;
      })}
      <AppButton label="Volver a Mis alimentos" variant="outline" onPress={() => router.push('/seller/products')} />
    </View>
  </Screen>;
}
