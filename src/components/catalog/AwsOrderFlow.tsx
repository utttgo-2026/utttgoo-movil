import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, RefreshControl, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { AppButton, AppHeader, AppInput, AppText, Badge, Screen, Surface } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/format';
import { colors, radii, spacing } from '@/theme';
import { MotionFeedback } from '@/components/ui/MotionFeedback';
import { DeliveryQrCard } from './DeliveryQrCard';
import { sellerOrderTransitions, type OrderPr27, type OrderStatus, type SellerOrderTarget } from '@/services/api/orderContractsPr27';
import { orderDiagnostic } from '@/services/api/orderDiagnostics';
import { FilterChip } from './FilterChip';
import { RefreshingProductImage } from './RefreshingProductImage';
import { useOrderDetails, useOrderList } from '@/hooks/useOrderViews';
import { orderBadgeTone, orderDate, orderReference, orderStatusLabels, orderUserMessage } from '@/utils/orderPresentation';
import { DeliveryScanner } from '@/components/seller/DeliveryScanner';

export function AwsOrderReview({ confirm = false }: { confirm?: boolean }) {
  const router = useRouter();
  const { orderPreparation, submitOrder, updateOrderNotes } = useAuth();
  const [notes, setNotes] = useState(orderPreparation?.notes ?? '');
  const [busy, setBusy] = useState(false), [error, setError] = useState<string>(), [uncertain, setUncertain] = useState(false);
  const lock = useRef(false);
  const completed = useRef(false);
  const focusEpoch = useRef(0);
  useFocusEffect(useCallback(() => () => { ++focusEpoch.current; }, []));
  const submit = async () => {
    if (lock.current || completed.current || uncertain) return;
    const epoch = focusEpoch.current;
    lock.current = true; setBusy(true); setError(undefined);
    try {
      const response = await submitOrder();
      if (response.success) {
        completed.current = true;
        if (focusEpoch.current === epoch) {
          // Pop the buyer stack to its existing tabs, then open one receipt above Mis pedidos.
          router.dismissTo('/buyer/orders');
          router.navigate({ pathname: '/buyer/order-created', params: { id: response.data.orderId } });
        }
      }
      else { setError(orderUserMessage(response.error)); setUncertain(response.reason === 'uncertain'); }
    } catch { setUncertain(true); setError('No pudimos confirmar la compra. Revisa Mis pedidos antes de volver a pedir.'); }
    finally { lock.current = false; setBusy(false); }
  };
  const product = orderPreparation?.product;
  return <Screen scroll constrained header={<AppHeader title={confirm ? 'Confirmar pedido' : 'Datos del pedido'} backFallback="/buyer" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      <MotionFeedback trigger={orderPreparation?.key ?? 'empty'}><AppText variant="title">{confirm ? 'Confirma tu orden' : 'Revisa tu pedido'}</AppText></MotionFeedback>
      {product && orderPreparation ? <Surface bordered style={{ gap: spacing.md }}>
        <RefreshingProductImage key={`${product.id}:${product.imageUrlExpiresAt ?? ''}`} product={product} />
        <AppText variant="subtitle">{product.name}</AppText><AppText>Cantidad: {orderPreparation.quantity}</AppText>
        <AppText>Precio unitario: {formatCurrency(product.price)}</AppText>
        <AppText variant="title" color={colors.primary}>Total estimado: {formatCurrency(Math.round(product.price * 100) * orderPreparation.quantity / 100)}</AppText>
        <AppText variant="caption">La disponibilidad y el precio final se confirman al realizar el pedido.</AppText>
      </Surface> : <AppText>Selecciona un alimento del catálogo para preparar tu pedido.</AppText>}
      {product ? <Surface backgroundColor={colors.surfaceYellow} style={{ gap: spacing.xs }}>
        <AppText variant="label">Forma de pago</AppText><AppText variant="bodyStrong">Efectivo</AppText>
        <AppText variant="caption">Pago al recibir el pedido. No se realiza un cobro desde la aplicación.</AppText>
      </Surface> : null}
      {product ? confirm ? <AppText>Notas: {orderPreparation?.notes || 'Sin notas'}</AppText> : <>
        <AppInput label="Notas para el vendedor (opcional)" accessibilityLabel="Notas para el vendedor" multiline editable={!busy} value={notes} onChangeText={(value) => {
          setNotes(value); const result = updateOrderNotes(value); setError(result.success ? undefined : orderUserMessage(result.error ?? 'Revisa las notas.'));
        }} /><AppText variant="caption">{notes.length}/250 caracteres</AppText>
      </> : null}
      {error ? <AppText accessibilityRole="alert" color={colors.danger}>{error}</AppText> : null}
      {uncertain ? <><AppText variant="caption">La compra no se enviará otra vez automáticamente. Si no puedes identificarla en tus pedidos, contacta a soporte.</AppText>
        <AppButton label="Revisar mis pedidos" variant="outline" onPress={() => router.dismissTo('/buyer/orders')} /></> : null}
      {busy ? <AppText accessibilityLiveRegion="polite">Realizando pedido…</AppText> : null}
      <AppButton label={confirm ? 'Confirmar pedido' : 'Continuar'} loading={busy} disabled={!product || uncertain || (!confirm && notes.length > 250)} onPress={() => {
        if (confirm) void submit(); else { const response = updateOrderNotes(notes); if (response.success) router.navigate('/buyer/confirm-order'); else setError(orderUserMessage(response.error ?? 'Revisa las notas.')); }
      }} />
      {confirm && product ? <AppButton label="Modificar pedido" variant="outline" disabled={busy || uncertain} onPress={() => router.dismissTo('/buyer/order-data')} /> : null}
    </View>
  </Screen>;
}

export function OrderDetailsCard({ order }: { order: OrderPr27 }) {
  return <Surface bordered style={{ gap: spacing.md }}>
    <AppText variant="subtitle">Pedido {orderReference(order.orderId)}</AppText><Badge label={orderStatusLabels[order.status]} tone={orderBadgeTone(order.status)} />
    <AppText variant="bodyStrong">{order.productName} × {order.quantity}</AppText>
    <AppText>Precio unitario: {formatCurrency(order.unitPrice)}</AppText>
    <AppText variant="title" color={colors.primary}>Total: {formatCurrency(order.totalAmount)} MXN</AppText>
    <AppText>Pago: Efectivo</AppText><AppText>Recogida / contacto: {order.pickupPoint || 'Por confirmar con el vendedor'}</AppText>
    <AppText variant="caption">{orderDate(order.createdAt)}</AppText>
    {order.notes ? <AppText>Notas: {order.notes}</AppText> : null}
  </Surface>;
}

export function AwsOrderReceipt() {
  const { lastOrder } = useAuth(), { id } = useLocalSearchParams<{ id?: string }>();
  const details = useOrderDetails(typeof id === 'string' ? id : undefined, false, false), router = useRouter();
  const order = details.order ?? (lastOrder?.orderId === id ? lastOrder : undefined);
  return <Screen scroll constrained header={<AppHeader title="Pedido generado" backFallback="/buyer/orders" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      {order ? <>
        <View style={{ alignItems: 'center', gap: spacing.md }}><View style={{ backgroundColor: colors.successSoft, borderRadius: radii.pill, padding: spacing.lg }}><Ionicons name="checkmark-outline" size={40} color={colors.success} /></View>
          <MotionFeedback trigger={order.orderId}><AppText variant="title" align="center">¡Pedido generado!</AppText></MotionFeedback>
          <AppText align="center" color={colors.textMuted}>Tu pedido fue realizado correctamente. Consulta su avance antes de recogerlo.</AppText>
        </View>
        <OrderDetailsCard order={order} />
        <Surface bordered><AppText variant="caption">Consulta el código de entrega en el seguimiento cuando el pedido esté listo.</AppText></Surface>
        <AppButton label="Ver mi pedido" onPress={() => router.replace({ pathname: '/buyer/order-tracking', params: { orderId: order.orderId } })} />
      </> : details.busy ? <AppText>Cargando comprobante…</AppText> : null}
      {details.error ? <><AppText accessibilityRole="alert">{orderUserMessage(details.error)}</AppText><AppButton label="Consultar comprobante" variant="outline" onPress={details.refresh} /></> : null}
      <AppButton label="Mis pedidos" variant="outline" onPress={() => router.dismissTo('/buyer/orders')} />
      <AppButton label="Ir al inicio" variant="ghost" onPress={() => router.dismissTo('/buyer')} />
    </View>
  </Screen>;
}

const sellerFilters: { label: string; status?: OrderStatus }[] = [
  { label: 'Todos' }, { label: 'Pendientes', status: 'Pending' }, { label: 'Aceptados', status: 'Accepted' },
  { label: 'En preparación', status: 'InPreparation' }, { label: 'Listos', status: 'Ready' }, { label: 'Entregados', status: 'Delivered' },
  { label: 'Rechazados', status: 'Rejected' }, { label: 'Cancelados', status: 'CancelledByBuyer' },
];
function OrdersList({ seller = false }: { seller?: boolean }) {
  const [filter, setFilter] = useState<OrderStatus>();
  const list = useOrderList(seller, filter), router = useRouter(), { lastOrder } = useAuth();
  const items = list.data?.items.filter((item, index, all) => all.findIndex((other) => other.orderId === item.orderId) === index) ?? [];
  const missingRecent = !seller && list.data?.page === 1 && lastOrder && !items.some((item) => item.orderId === lastOrder.orderId);
  return <Screen scroll constrained refreshControl={<RefreshControl testID="orders-refresh" refreshing={list.busy} onRefresh={() => void list.load(1)} />} header={<AppHeader title={seller ? 'Pedidos recibidos' : 'Mis pedidos'} showBack={seller} backFallback={seller ? '/seller' : '/buyer'} />}>
    <View style={{ gap: spacing.md, paddingVertical: spacing.lg }}>
      {seller ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
        {sellerFilters.map(({ label, status }) => <FilterChip key={label} label={label} selected={filter === status} onPress={() => setFilter(status)} />)}
      </View> : null}
      {list.busy ? <AppText accessibilityLiveRegion="polite">Cargando pedidos…</AppText> : null}
      {list.error ? <AppText accessibilityRole="alert" color={colors.danger}>{orderUserMessage(list.error)}</AppText> : null}
      {missingRecent ? <Surface backgroundColor={colors.warningSoft} style={{ gap: spacing.sm }}>
        <AppText>Tu compra confirmada aún no aparece en esta página. Puedes consultar su seguimiento mientras actualizas la lista.</AppText>
        <AppButton label="Ver mi pedido reciente" variant="outline" onPress={() => router.navigate({ pathname: '/buyer/order-tracking', params: { orderId: lastOrder.orderId } })} />
      </Surface> : null}
      {items.map((order) => <Surface key={order.orderId} bordered style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' }}><AppText variant="bodyStrong">Pedido {orderReference(order.orderId)}</AppText><Badge label={orderStatusLabels[order.status]} tone={orderBadgeTone(order.status)} /></View>
        <AppText>{order.productName} × {order.quantity}</AppText><AppText variant="caption" color={colors.textMuted}>{orderDate(order.createdAt)}</AppText>
        <AppText variant="subtitle" color={colors.primary}>{formatCurrency(order.totalAmount)} MXN</AppText>
        <AppButton label={seller ? 'Revisar pedido' : 'Ver seguimiento'} size="md" variant="outline" onPress={() => router.navigate({ pathname: seller ? '/seller/order-detail' : '/buyer/order-tracking', params: { orderId: order.orderId } })} />
      </Surface>)}
      {list.data && !items.length ? <AppText>{list.data.totalCount === 0 ? seller ? filter ? 'No hay pedidos en este estado.' : 'Aún no recibes pedidos.' : 'No tienes pedidos.' : 'No hay pedidos en esta página.'}</AppText> : null}
      {list.data ? <><AppText variant="caption">Página {list.data.page} · {list.data.totalCount} pedidos</AppText>
        <AppButton label="Página anterior" size="md" variant="outline" disabled={list.busy || list.data.page === 1} onPress={() => void list.load(list.data!.page - 1)} />
        <AppButton label="Página siguiente" size="md" variant="outline" disabled={list.busy || list.data.page * list.data.pageSize >= list.data.totalCount} onPress={() => void list.load(list.data!.page + 1)} />
      </> : null}
      <AppButton label="Actualizar" variant="outline" disabled={list.busy} onPress={() => void list.load(1)} />
    </View>
  </Screen>;
}
export function AwsBuyerOrders() { return <OrdersList />; }
export function AwsSellerOrders() { return <OrdersList seller />; }

function OrderTimeline({ order }: { order: OrderPr27 }) {
  const steps = ['Pending', 'Accepted', 'InPreparation', 'Ready', 'Delivered'] as const;
  const index = steps.findIndex((step) => step === order.status);
  if (index < 0) return <Surface backgroundColor={colors.dangerSoft}><AppText color={colors.danger}>{orderStatusLabels[order.status]}</AppText></Surface>;
  return <View style={{ gap: spacing.md }} accessibilityLabel="Progreso del pedido">
    {steps.map((step, position) => <View key={step} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
      <Ionicons name={position <= index ? 'checkmark-circle' : 'ellipse-outline'} color={position <= index ? colors.success : colors.borderStrong} size={24} />
      <AppText variant={position === index ? 'bodyStrong' : 'body'} color={position <= index ? colors.text : colors.textMuted}>{orderStatusLabels[step]}</AppText>
    </View>)}
  </View>;
}

export function AwsBuyerTracking() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>(), router = useRouter();
  const details = useOrderDetails(typeof orderId === 'string' ? orderId : undefined);
  return <Screen scroll constrained refreshControl={<RefreshControl refreshing={details.busy} onRefresh={details.refresh} />} header={<AppHeader title={details.order ? `Pedido ${orderReference(details.order.orderId)}` : 'Seguimiento de pedido'} backFallback="/buyer/orders" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      {details.busy ? <AppText>Consultando pedido…</AppText> : null}
      {details.error ? <AppText accessibilityRole="alert">{orderUserMessage(details.error)}</AppText> : null}
      {details.order ? <>
        <Surface backgroundColor={colors.infoSoft} style={{ gap: spacing.xs }}><AppText variant="caption">ESTADO ACTUAL</AppText><AppText variant="subtitle">{orderStatusLabels[details.order.status]}</AppText></Surface>
        <OrderTimeline order={details.order} /><OrderDetailsCard order={details.order} />
        <DeliveryQrCard order={details.order} active={details.active} onRefresh={details.refresh} />
        {details.order.status === 'Pending' ? <AppButton label="Cancelar pedido" variant="outline" disabled={details.busy} onPress={() => router.navigate({ pathname: '/buyer/cancel-order', params: { orderId: details.order!.orderId } })} /> : !['Delivered', 'Rejected', 'CancelledByBuyer'].includes(details.order.status) ? <AppText variant="caption">La cancelación solo está disponible mientras el pedido está pendiente.</AppText> : null}
      </> : null}
      <AppButton label="Actualizar" variant="outline" disabled={details.busy || !orderId} onPress={details.refresh} />
      <AppButton label="Volver a Mis pedidos" variant="outline" onPress={() => router.dismissTo('/buyer/orders')} />
      {details.order?.status === 'Delivered' ? <AppButton label="Ir al inicio" variant="ghost" onPress={() => router.dismissTo('/buyer')} /> : null}
    </View>
  </Screen>;
}

export function AwsBuyerCancel() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>(), { cancelBuyerOrder } = useAuth(), router = useRouter();
  const details = useOrderDetails(typeof orderId === 'string' ? orderId : undefined);
  const [busy, setBusy] = useState(false), [error, setError] = useState<string>(), [blocked, setBlocked] = useState(false), [done, setDone] = useState(false);
  const lock = useRef(false);
  const cancel = async () => {
    if (!orderId || lock.current || blocked || details.order?.status !== 'Pending') return;
    lock.current = true; setBusy(true); setError(undefined);
    try {
      const result = await cancelBuyerOrder(orderId);
      if (result.success) { setDone(true); details.refresh(); }
      else { setError(orderUserMessage(result.error)); setBlocked(result.reason === 'uncertain'); }
    } catch { setBlocked(true); setError('No pudimos confirmar la cancelación. Actualiza el pedido antes de continuar.'); }
    finally { lock.current = false; setBusy(false); }
  };
  return <Screen scroll constrained header={<AppHeader title="Cancelar pedido" backFallback="/buyer/orders" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      <Ionicons name={done ? 'checkmark-circle-outline' : 'alert-circle-outline'} size={56} color={done ? colors.success : colors.primary} />
      <AppText variant="title">{done ? 'Pedido cancelado' : '¿Cancelar este pedido?'}</AppText>
      {details.order ? <OrderDetailsCard order={details.order} /> : null}
      {details.busy ? <AppText>Consultando pedido…</AppText> : null}
      {error || details.error ? <AppText accessibilityRole="alert">{error ?? orderUserMessage(details.error!)}</AppText> : null}
      {!done && details.order?.status === 'Pending' ? <AppButton label="Sí, cancelar pedido" loading={busy} disabled={blocked || details.busy} onPress={() => void cancel()} /> : !done && details.order ? <AppText>Este pedido ya no puede cancelarse.</AppText> : null}
      <AppButton label="Actualizar pedido" variant="outline" disabled={busy || details.busy} onPress={() => { setBlocked(false); details.refresh(); }} />
      <AppButton label={done ? 'Mis pedidos' : 'Conservar pedido'} variant="outline" onPress={() => router.dismissTo(!done && orderId ? { pathname: '/buyer/order-tracking', params: { orderId } } : '/buyer/orders')} />
    </View>
  </Screen>;
}

export function AwsSellerOrderDetail() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>(), { changeSellerOrder } = useAuth();
  const router = useRouter();
  const details = useOrderDetails(typeof orderId === 'string' ? orderId : undefined, true);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState<string>(), [blocked, setBlocked] = useState(false);
  const lock = useRef(false);
  const update = async (target: SellerOrderTarget) => {
    if (!orderId || lock.current || blocked || details.busy) return;
    orderDiagnostic('status', undefined, undefined, { phase: 'action', transition: target });
    lock.current = true; setBusy(true); setMessage(undefined);
    try {
      const result = await changeSellerOrder(orderId, target);
      if (result.success) { details.applyVerified(result.data); setMessage(`Pedido ${orderStatusLabels[result.data.status].toLowerCase()}.`); }
      else {
        setMessage(orderUserMessage(result.error)); setBlocked(result.reason === 'uncertain');
        if (result.reason === 'conflict' || result.reason === 'uncertain') details.refresh();
      }
    } catch { setBlocked(true); setMessage('No pudimos confirmar el cambio. Actualiza el pedido antes de continuar.'); }
    finally { lock.current = false; setBusy(false); }
  };
  const actions: Record<SellerOrderTarget, string> = { Accepted: 'Aceptar pedido', Rejected: 'Rechazar pedido', InPreparation: 'Comenzar preparación', Ready: 'Marcar listo para recoger' };
  return <Screen scroll constrained refreshControl={<RefreshControl refreshing={details.busy} onRefresh={details.refresh} />} header={<AppHeader title={details.order ? `Pedido ${orderReference(details.order.orderId)}` : 'Detalle del pedido'} backFallback="/seller/orders" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      {details.busy ? <AppText>Consultando pedido…</AppText> : null}
      {details.error ? <AppText accessibilityRole="alert">{orderUserMessage(details.error)}</AppText> : null}
      {details.order ? <>
        <OrderDetailsCard order={details.order} />
        {details.order.status === 'Delivered' ? <Surface backgroundColor={colors.successSoft} style={{ alignItems: 'center', gap: spacing.md }}><Ionicons name="checkmark-circle-outline" size={48} color={colors.success} /><AppText variant="subtitle">¡Pedido entregado con éxito!</AppText></Surface> : null}
        {(sellerOrderTransitions[details.order.status] ?? []).map((target) => <AppButton key={target} label={actions[target]} variant={target === 'Rejected' ? 'outline' : 'primary'} disabled={busy || blocked || details.busy} onPress={() => target === 'Rejected' ? Alert.alert('Rechazar pedido', 'El pedido se cerrará y el comprador podrá consultar el rechazo.', [{ text: 'Volver', style: 'cancel' }, { text: 'Rechazar', onPress: () => void update(target) }]) : void update(target)} />)}
        {details.order.status === 'Ready' ? <DeliveryScanner orderId={details.order.orderId} active={details.active && !busy && !blocked} onConfirmed={(confirmed) => { details.applyVerified(confirmed); setMessage('Entrega confirmada.'); }} onRefresh={details.refresh} /> : null}
      </> : null}
      {message ? <AppText accessibilityLiveRegion="polite">{message}</AppText> : null}
      {details.order?.status === 'Delivered' ? <>
        <AppButton label="Ver pedidos recibidos" onPress={() => router.dismissTo('/seller/orders')} />
        <AppButton label="Ir a Mi negocio" variant="outline" onPress={() => router.dismissTo('/seller')} />
      </> : <AppButton label="Actualizar estado del pedido" variant="outline" disabled={busy || details.busy} onPress={() => { setBlocked(false); details.refresh(); }} />}
    </View>
  </Screen>;
}

/** Only unrelated legacy screens still awaiting their own integration use this honest placeholder. */
export function AwsOrdersPending() {
  return <Screen constrained header={<AppHeader title="Mis pedidos" backFallback="/buyer" />}><AppText>Esta opción todavía no está disponible. Consulta el seguimiento de tu pedido.</AppText></Screen>;
}
