import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppButton, AppHeader, AppInput, AppText, Badge, Screen, Surface } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/format';
import { colors, spacing } from '@/theme';
import { AwsProductImage } from './AwsProductImage';
import { MotionFeedback } from '@/components/ui/MotionFeedback';
import { DeliveryQrCard } from './DeliveryQrCard';

export function AwsOrderReview({ confirm = false }: { confirm?: boolean }) {
  const router = useRouter();
  const { orderPreparation, submitOrder, updateOrderNotes } = useAuth();
  const [notes, setNotes] = useState(orderPreparation?.notes ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const lock = useRef(false);
  const submit = async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(undefined);
    try {
      const response = await submitOrder();
      if (response.success) router.push({ pathname: '/buyer/order-created', params: { id: response.data.id } });
      else setError(response.error);
    } finally { lock.current = false; setBusy(false); }
  };
  const product = orderPreparation?.product;
  return <Screen scroll constrained header={<AppHeader title={confirm ? 'Confirmar pedido' : 'Datos del pedido'} backFallback="/buyer" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      <MotionFeedback trigger={orderPreparation?.key ?? 'empty'}>
        <AppText variant="title">{confirm ? 'Confirma tu orden' : 'Revisa tu pedido'}</AppText>
      </MotionFeedback>
      {product && orderPreparation ? <Surface bordered style={{ gap: spacing.md }}>
        <AwsProductImage uri={null} name={product.name} />
        <AppText variant="subtitle">{product.name}</AppText>
        <AppText>Cantidad: {orderPreparation.quantity}</AppText>
        <AppText>Precio unitario: {formatCurrency(product.price)}</AppText>
        <AppText variant="title">Total estimado: {formatCurrency(Math.round(product.price * 100) * orderPreparation.quantity / 100)}</AppText>
        <AppText variant="caption">AWS confirma disponibilidad y precio final al crear el pedido.</AppText>
      </Surface> : <AppText>No hay un producto preparado en esta sesión. Selecciona un alimento del catálogo.</AppText>}
      {product ? <Surface backgroundColor={colors.surfaceYellow} style={{ gap: spacing.xs }}>
        <AppText variant="label">Forma de pago</AppText>
        <AppText variant="bodyStrong">Efectivo</AppText>
        <AppText variant="caption">Pago al recibir el pedido. No se realiza un cobro desde la aplicación.</AppText>
      </Surface> : null}
      {product ? confirm ? <AppText>Notas: {orderPreparation?.notes || 'Sin notas'}</AppText> : <>
        <AppInput label="Notas para el vendedor (opcional)" accessibilityLabel="Notas para el vendedor" multiline editable={!busy}
          value={notes} onChangeText={(value) => {
            setNotes(value);
            const response = updateOrderNotes(value);
            setError(response.success ? undefined : response.error);
          }} />
        <AppText variant="caption">{notes.length}/250 caracteres</AppText>
      </> : null}
      {error ? <AppText accessibilityRole="alert">{error}</AppText> : null}
      <AppButton label={confirm ? 'Confirmar pedido' : 'Continuar'} loading={busy} disabled={!product || (!confirm && notes.length > 250)}
        onPress={() => {
          if (confirm) void submit();
          else {
            const response = updateOrderNotes(notes);
            if (response.success) router.push('/buyer/confirm-order'); else setError(response.error);
          }
        }} />
    </View>
  </Screen>;
}

export function AwsOrderReceipt() {
  const { lastOrder } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const order = lastOrder && lastOrder.id === id ? lastOrder : null;
  return <Screen scroll constrained header={<AppHeader title="Pedido generado" backFallback="/buyer" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      {order ? <>
        <MotionFeedback trigger={order.id}><AppText variant="title">¡Pedido generado!</AppText></MotionFeedback>
        <Surface bordered style={{ gap: spacing.md }}>
          <AppText>Número de pedido: {order.id}</AppText><Badge label="Pendiente" tone="info" />
          <AppText>Producto: {order.productId}</AppText><AppText>Cantidad: {order.quantity}</AppText>
          <AppText>Precio unitario: {formatCurrency(order.unitPrice)}</AppText>
          <AppText variant="title">Total: {formatCurrency(order.totalAmount)}</AppText>
          <AppText>{order.createdAt}</AppText>
          {order.notes ? <AppText>Notas: {order.notes}</AppText> : null}
        </Surface>
        <DeliveryQrCard orderId={order.id} />
        <AppText>Recibo de la respuesta AWS en esta sesión. Historial y seguimiento pendientes de integración y verificación.</AppText>
      </> : <AppText>No hay un recibo AWS validado para este ID en la sesión actual.</AppText>}
      <AppButton label="Volver al inicio" onPress={() => router.push('/buyer')} />
    </View>
  </Screen>;
}

export function AwsOrdersPending() {
  return <Screen constrained header={<AppHeader title="Mis pedidos" backFallback="/buyer" />}>
    <AppText>El historial y seguimiento AWS están pendientes de integración y verificación de contratos. Los pedidos creados se confirman con su recibo real; no se muestran pedidos de demostración.</AppText>
  </Screen>;
}
