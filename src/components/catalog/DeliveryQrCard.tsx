import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { AppButton, AppText, Badge, Surface } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing } from '@/theme';
import { validDeliveryToken, type DeliveryCredential, type OrderPr27 } from '@/services/api/orderContractsPr27';
import { orderUserMessage } from '@/utils/orderPresentation';
import { orderDiagnostic } from '@/services/api/orderDiagnostics';

/** QR is exclusively the backend-issued, expiring bearer credential; never an order ID. */
export function DeliveryQrCard({ order, active = false, onRefresh }: { order: OrderPr27; active?: boolean; onRefresh?: () => void }) {
  const { user } = useAuth();
  if (active && order.status === 'Ready') return <ReadyDeliveryQr key={`${order.orderId}:${user?.id ?? ''}`} order={order} onRefresh={onRefresh} />;
  return <Surface bordered style={{ gap: spacing.md }}>
    <AppText variant="subtitle">Código QR de entrega</AppText>
    <View style={{ alignItems: 'center', padding: spacing.md }}><Ionicons name="qr-code-outline" size={48} color={colors.textMuted} /></View>
    <Badge label="No disponible" tone="warning" />
    <AppText variant="caption">{order.status === 'Ready' ? 'Actualiza el seguimiento antes de solicitar tu código de entrega.' : ['Delivered', 'Rejected', 'CancelledByBuyer'].includes(order.status) ? 'Este pedido ya está cerrado y no admite códigos de entrega.' : 'Tu código estará disponible cuando el pedido esté listo.'}</AppText>
    {order.status === 'Ready' && onRefresh ? <AppButton label="Actualizar seguimiento" variant="outline" onPress={onRefresh} /> : null}
  </Surface>;
}
function ReadyDeliveryQr({ order, onRefresh }: { order: OrderPr27; onRefresh?: () => void }) {
  const { issueDeliveryToken } = useAuth();
  const [credential, setCredential] = useState<DeliveryCredential>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [expired, setExpired] = useState(false);
  const [canRenew, setCanRenew] = useState(true);
  const lock = useRef(false), generation = useRef(0);
  useFocusEffect(useCallback(() => () => { ++generation.current; setCredential(undefined); }, []));
  useEffect(() => {
    if (!credential) return;
    const remaining = Date.parse(credential.expiresAt) - Date.now();
    const timer = setTimeout(() => { setCredential(undefined); setExpired(true); }, Math.max(0, remaining));
    const renewal = setTimeout(() => setCanRenew(true), 30000);
    return () => { clearTimeout(timer); clearTimeout(renewal); };
  }, [credential]);
  const request = async () => {
    if (lock.current) return;
    orderDiagnostic('delivery-token', undefined, undefined, { phase: 'action', transition: 'Ready' });
    const current = ++generation.current; lock.current = true; setBusy(true); setError(undefined); setCredential(undefined);
    try {
      const response = await issueDeliveryToken(order.orderId);
      if (current !== generation.current) return;
      if (response.success && response.data.orderId === order.orderId && validDeliveryToken(response.data.token) && Date.parse(response.data.expiresAt) > Date.now()) { setCredential(response.data); setExpired(false); setCanRenew(false); }
      else if (response.success) setError('No pudimos obtener un código de entrega válido. Actualiza el pedido.');
      else setError(orderUserMessage(response.error));
    } catch { if (current === generation.current) setError('No pudimos obtener el código. Actualiza el pedido antes de intentarlo otra vez.'); }
    finally { lock.current = false; setBusy(false); }
  };
  const valid = !expired && credential?.orderId === order.orderId && validDeliveryToken(credential?.token);
  return <Surface bordered style={{ gap: spacing.md }}>
    <AppText variant="subtitle">Código QR de entrega</AppText>
    {valid && credential ? <>
      <View accessible accessibilityRole="image" accessibilityLabel="Código QR de entrega" style={{ padding: spacing.md, backgroundColor: colors.surface, alignSelf: 'center' }}>
        <QRCode value={credential.token} size={180} quietZone={12} backgroundColor={colors.surface} color={colors.text} />
      </View>
      <AppText variant="caption" align="center">Válido hasta {new Date(credential.expiresAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</AppText>
      <AppText variant="caption">Muéstralo solo al vendedor cuando recojas tu alimento. No es un comprobante de pago.</AppText>
    </> : <>
      <View style={{ alignItems: 'center', padding: spacing.md }}><Ionicons name="qr-code-outline" size={48} color={colors.textMuted} /></View>
      <Badge label={order.status === 'Ready' ? expired ? 'Código vencido' : 'Al recoger' : 'No disponible'} tone="warning" />
      <AppText variant="caption">{order.status === 'Ready' ? expired ? 'El código venció. Solicita uno nuevo para recoger tu alimento.' : 'Actualiza el seguimiento y solicita tu código al recoger el alimento.' : ['Delivered', 'Rejected', 'CancelledByBuyer'].includes(order.status) ? 'Este pedido ya está cerrado y no admite códigos de entrega.' : 'Tu código estará disponible cuando el pedido esté listo.'}</AppText>
    </>}
    {error ? <AppText accessibilityRole="alert" color={colors.danger}>{error}</AppText> : null}
    {error && onRefresh ? <AppButton label="Actualizar seguimiento" variant="outline" onPress={onRefresh} /> : null}
    {order.status === 'Ready' ? <>
      <AppButton label={credential ? 'Solicitar nuevo código' : 'Mostrar código de entrega'} loading={busy} disabled={credential !== undefined && !canRenew} onPress={() => void request()} />
      {credential ? <AppText variant="caption">Un código nuevo reemplaza al anterior.</AppText> : null}
    </> : null}
  </Surface>;
}
