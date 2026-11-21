import React, { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { AppButton, AppHeader, AppInput, AppText, Badge, Screen, Surface } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/format';
import { colors, spacing } from '@/theme';
import { AwsProductImage } from './AwsProductImage';
import { MotionFeedback } from '@/components/ui/MotionFeedback';
import { DeliveryQrCard } from './DeliveryQrCard';
import type { OrderPr27, OrderSummaryPr27 } from '@/services/api/orderContractsPr27';
import type { ApiPage } from '@/types/api';

export function AwsOrderReview({ confirm = false }: { confirm?: boolean }) {
  const router = useRouter();
  const { orderPreparation, submitOrder, updateOrderNotes } = useAuth();
  const [notes, setNotes] = useState(orderPreparation?.notes ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [uncertain, setUncertain] = useState(false);
  const lock = useRef(false);
  const submit = async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(undefined);
    try {
      const response = await submitOrder();
      if (response.success) router.push({ pathname: '/buyer/order-created', params: { id: response.data.orderId } });
      else { setError(response.error); setUncertain(response.reason === 'uncertain'); }
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
      {uncertain ? <><AppText>Revisa el historial. Una coincidencia no confirma por sí sola este intento; si no puedes identificarlo, consulta con backend.</AppText>
        <AppButton label="Revisar mis pedidos" variant="outline" onPress={() => router.push('/buyer/orders')} /></> : null}
      <AppButton label={confirm ? 'Confirmar pedido' : 'Continuar'} loading={busy} disabled={!product || uncertain || (!confirm && notes.length > 250)}
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
  const order = lastOrder && lastOrder.orderId === id ? lastOrder : null;
  return <Screen scroll constrained header={<AppHeader title="Pedido generado" backFallback="/buyer" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      {order ? <>
        <MotionFeedback trigger={order.orderId}><AppText variant="title">¡Pedido generado!</AppText></MotionFeedback>
        <Surface bordered style={{ gap: spacing.md }}>
          <AppText>Número de pedido: {order.orderId}</AppText><Badge label={statusLabel(order.status)} tone="info" />
          <AppText>Producto: {order.productName}</AppText><AppText>Cantidad: {order.quantity}</AppText>
          <AppText>Precio unitario: {formatCurrency(order.unitPrice)}</AppText>
          <AppText variant="title">Total: {formatCurrency(order.totalAmount)} MXN</AppText><AppText>Pago: Efectivo</AppText>
          <AppText>{order.createdAt}</AppText>
          {order.notes ? <AppText>Notas: {order.notes}</AppText> : null}
        </Surface>
        <DeliveryQrCard orderId={order.orderId} />
        <AppButton label="Seguimiento" onPress={() => router.push({ pathname: '/buyer/order-tracking', params: { orderId: order.orderId } })} />
      </> : <AppText>No hay un recibo AWS validado para este ID en la sesión actual.</AppText>}
      <AppButton label="Volver al inicio" onPress={() => router.push('/buyer')} />
    </View>
  </Screen>;
}

const labels: Record<OrderPr27['status'], string> = { Pending: 'Pendiente', Accepted: 'Aceptado', InPreparation: 'En preparación', Ready: 'Listo', Delivered: 'Entregado', Rejected: 'Rechazado', CancelledByBuyer: 'Cancelado' };
function statusLabel(status: OrderPr27['status']) { return labels[status]; }

export function AwsBuyerOrders() {
  const { listBuyerOrders } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ApiPage<OrderSummaryPr27>>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  useFocusEffect(useCallback(() => {
    void revision;
    let current = true; setBusy(true); setError(undefined); setData(undefined);
    void listBuyerOrders(page).then((result) => {
      if (!current) return;
      if (result.success) setData(result.data); else setError(result.error);
      setBusy(false);
    });
    return () => { current = false; };
  }, [listBuyerOrders, page, revision]));
  return <Screen scroll constrained header={<AppHeader title="Mis pedidos" showBack={false} />}>
    <View style={{ gap: spacing.md, paddingVertical: spacing.lg }}>
      {busy ? <AppText>Cargando pedidos…</AppText> : null}
      {error ? <AppText accessibilityRole="alert">{error}</AppText> : null}
      {data?.items.map((order) => <Surface key={order.orderId} bordered style={{ gap: spacing.sm }}>
        <AppText variant="bodyStrong">Pedido {order.orderId}</AppText><Badge label={statusLabel(order.status)} tone="info" />
        <AppText>{order.productName} × {order.quantity}</AppText>
        <AppText>{formatCurrency(order.totalAmount)} MXN · {new Date(order.createdAt).toLocaleDateString('es-MX')}</AppText>
        <AppButton label="Ver seguimiento" variant="outline" onPress={() => router.push({ pathname: '/buyer/order-tracking', params: { orderId: order.orderId } })} />
      </Surface>)}
      {data && !data.items.length ? <AppText>{data.totalCount === 0 ? 'No tienes pedidos.' : 'No hay compras en esta página.'}</AppText> : null}
      {data ? <><AppText>Página {data.page} · {data.totalCount} pedidos</AppText>
        <AppButton label="Página anterior" variant="outline" disabled={busy || page === 1} onPress={() => setPage(page - 1)} />
        <AppButton label="Página siguiente" variant="outline" disabled={busy || page * data.pageSize >= data.totalCount} onPress={() => setPage(page + 1)} /></> : null}
      <AppButton label="Actualizar" variant="outline" disabled={busy} onPress={() => setRevision((n) => n + 1)} />
    </View>
  </Screen>;
}

export function AwsBuyerTracking() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { buyerOrder } = useAuth();
  const [order, setOrder] = useState<OrderPr27>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  useFocusEffect(useCallback(() => {
    void revision;
    let current = true; setOrder(undefined); setError(undefined);
    if (!orderId || typeof orderId !== 'string') { setError('Falta el identificador del pedido.'); return () => { current = false; }; }
    setBusy(true);
    void buyerOrder(orderId).then((result) => {
      if (!current) return;
      if (result.success) setOrder(result.data); else setError(result.error);
      setBusy(false);
    });
    return () => { current = false; };
  }, [buyerOrder, orderId, revision]));
  return <Screen scroll constrained header={<AppHeader title="Seguimiento de pedido" backFallback="/buyer/orders" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      {busy ? <AppText>Consultando pedido…</AppText> : null}
      {error ? <AppText accessibilityRole="alert">{error}</AppText> : null}
      {order ? <><AppText variant="title">Pedido {order.orderId}</AppText>
        <Surface bordered style={{ gap: spacing.md }}><AppText>Estado actual: {statusLabel(order.status)}</AppText>
          <AppText>{order.productName} × {order.quantity}</AppText><AppText>Entrega: {order.pickupPoint || 'Sin especificar'}</AppText>
          <AppText>Pago: Efectivo</AppText><AppText variant="bodyStrong">Total: {formatCurrency(order.totalAmount)} MXN</AppText>
          <AppText>{order.createdAt}</AppText>{order.notes ? <AppText>Notas: {order.notes}</AppText> : null}</Surface></> : null}
      <AppButton label="Actualizar" variant="outline" disabled={busy || !orderId} onPress={() => setRevision((n) => n + 1)} />
    </View>
  </Screen>;
}

export function AwsOrdersPending() {
  return <Screen constrained header={<AppHeader title="Mis pedidos" backFallback="/buyer" />}>
    <AppText>El historial y seguimiento AWS están pendientes de integración y verificación de contratos. Los pedidos creados se confirman con su recibo real; no se muestran pedidos de demostración.</AppText>
  </Screen>;
}
