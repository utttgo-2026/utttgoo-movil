import React, { useCallback, useRef, useState } from 'react';
import { Linking, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { AppButton, AppText, Surface } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useForeground } from '@/hooks/useOrderViews';
import { validDeliveryToken, type OrderPr27 } from '@/services/api/orderContractsPr27';
import { orderDiagnostic } from '@/services/api/orderDiagnostics';
import { orderUserMessage } from '@/utils/orderPresentation';
import { colors, radii, spacing } from '@/theme';

interface DeliveryScannerProps { orderId: string; active: boolean; onConfirmed: (order: OrderPr27) => void; onRefresh: () => void }
export function DeliveryScanner(props: DeliveryScannerProps) {
  const foreground = useForeground();
  if (!props.active || !foreground) return <Surface bordered style={{ gap: spacing.md }}><AppText>Actualiza el pedido para escanear el código de entrega.</AppText><AppButton label="Actualizar pedido" variant="outline" onPress={props.onRefresh} /></Surface>;
  return <ActiveDeliveryScanner key={props.orderId} {...props} />;
}
function ActiveDeliveryScanner({ orderId, active, onConfirmed, onRefresh }: DeliveryScannerProps) {
  const { confirmOrderDelivery } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const foreground = useForeground();
  const [opened, setOpened] = useState(false), [focused, setFocused] = useState(false);
  const [hasScan, setHasScan] = useState(false), [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const credential = useRef<string | undefined>(undefined);
  const lock = useRef(false), generation = useRef(0);
  useFocusEffect(useCallback(() => {
    setFocused(true);
    return () => { ++generation.current; credential.current = undefined; setHasScan(false); setOpened(false); setFocused(false); };
  }, []));
  const close = () => { credential.current = undefined; setHasScan(false); setOpened(false); };
  const show = async () => {
    const current = generation.current;
    try {
      if (!permission?.granted) { const result = await requestPermission(); if (!result.granted || current !== generation.current) return; }
      setError(undefined); setOpened(true);
    } catch { if (current === generation.current) setError('No pudimos abrir la cámara. Revisa el permiso e intenta de nuevo.'); }
  };
  const scan = ({ data }: { data: string }) => {
    if (!active || !foreground || !focused || credential.current || lock.current) return;
    if (!validDeliveryToken(data)) { setError('Este código QR no es válido. Escanea el código de entrega que aparece en el pedido del comprador.'); return; }
    credential.current = data; setHasScan(true); setError(undefined); setOpened(false);
  };
  const confirm = async () => {
    if (!active || lock.current || needsRefresh || !credential.current || !foreground || !focused) return;
    orderDiagnostic('delivery-confirmation', undefined, undefined, { phase: 'action', transition: 'Delivered' });
    const current = generation.current, scanned = credential.current;
    credential.current = undefined; setHasScan(false); lock.current = true; setBusy(true); setError(undefined);
    try {
      const result = await confirmOrderDelivery(orderId, scanned);
      if (current !== generation.current) return;
      if (result.success && result.data.orderId === orderId && result.data.status === 'Delivered') onConfirmed(result.data);
      else {
        setNeedsRefresh(result.success || result.reason === 'uncertain' || result.reason === 'conflict');
        setError(result.success ? 'No pudimos verificar la entrega. Actualiza el pedido.' : orderUserMessage(result.error));
      }
    } catch { if (current === generation.current) { setNeedsRefresh(true); setError('No pudimos confirmar la entrega. Actualiza el pedido antes de intentar otra vez.'); } }
    finally { lock.current = false; setBusy(false); }
  };
  // Parent unmounts this credential-owning component on background/loss of readiness.
  return <Surface bordered style={{ gap: spacing.md }}>
    <AppText variant="subtitle">Entregar pedido</AppText>
    <AppText variant="caption">Escanea el código del comprador al entregar el alimento. El QR confirma la entrega, no el pago en efectivo.</AppText>
    {opened && active && focused && foreground && permission?.granted ? <View style={{ height: 280, overflow: 'hidden', borderRadius: radii.lg }}>
      <CameraView style={{ flex: 1 }} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={scan} onMountError={() => { setOpened(false); setError('No pudimos abrir la cámara. Revisa el permiso e intenta de nuevo.'); }} accessibilityLabel="Escáner de código de entrega" />
      <AppButton label="Cerrar cámara" variant="outline" onPress={close} />
    </View> : null}
    {!permission?.granted && permission && !permission.canAskAgain ? <>
      <AppText>Permite el acceso a la cámara desde los ajustes para escanear el código.</AppText>
      <AppButton label="Abrir ajustes" variant="outline" onPress={() => void Linking.openSettings()} />
    </> : !permission?.granted && permission?.status === 'denied' ? <AppText>Necesitamos acceso a la cámara para leer el código de entrega.</AppText> : null}
    {hasScan ? <>
      <AppText>Código leído. Comprueba que estás entregando el alimento de este pedido.</AppText>
      <AppButton label="Confirmar entrega" loading={busy} disabled={!active} onPress={() => void confirm()} />
      <AppButton label="Descartar lectura" variant="outline" disabled={busy} onPress={close} />
    </> : <AppButton label="Escanear QR de entrega" icon="qr-code-outline" loading={busy} disabled={!active || opened || needsRefresh} onPress={() => void show()} />}
    {error ? <>
      <AppText accessibilityRole="alert" color={colors.danger}>{error}</AppText>
      <AppButton label="Actualizar pedido" variant="outline" disabled={busy} onPress={() => { close(); onRefresh(); }} />
      <AppText variant="caption">Si necesitas otra lectura, solicita al comprador un código nuevo. La lectura anterior no se reenviará.</AppText>
    </> : null}
  </Surface>;
}
