import React, { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components/ui';
import { MotionFeedback } from '@/components/ui/MotionFeedback';
import { useAuth, type SellerOperationResult } from '@/context/AuthContext';
import { errorMessage } from '@/services/api/errors';
import { spacing } from '@/theme';
import { SellerActivationForm } from './SellerActivationForm';
import { productUserMessage } from '@/utils/productPresentation';

export function SellerEntry({ activationRoute = false, authorizedChildren }: { activationRoute?: boolean; authorizedChildren?: React.ReactNode }) {
  const router = useRouter();
  const { consultSeller, user, role } = useAuth();
  const [resultState, setResultState] = useState<{ key: string; result: SellerOperationResult }>();
  const [busy, setBusy] = useState(true);
  const [revision, setRevision] = useState(0);
  const queryKey = JSON.stringify([user?.id, revision]);
  const result = resultState?.key === queryKey ? resultState.result : undefined;
  const focused = useRef(false);
  useFocusEffect(useCallback(() => {
    let current = true; focused.current = true;
    setBusy(true);
    void consultSeller().then((response) => { if (current) setResultState({ key: queryKey, result: response }); })
      .catch((error: unknown) => { if (current) setResultState({ key: queryKey, result: { success: false, error: errorMessage(error) } }); })
      .finally(() => { if (current) setBusy(false); });
    return () => { current = false; focused.current = false; };
  }, [consultSeller, queryKey]));
  const refresh = () => setRevision((value) => value + 1);
  const active = result?.success && result.kind === 'active' ? result : undefined;
  const authorized = !!active?.roleSynced && role === 'seller';
  const missing = result?.success && result.kind === 'missing';
  const submissionBlocked = !!result && (result.received || result.uncertain);
  if (authorized && authorizedChildren) return <>{authorizedChildren}</>;
  return <Screen scroll constrained header={<AppHeader title={active ? 'Mi negocio' : 'Perfil vendedor'} backFallback={activationRoute ? '/seller' : '/buyer/profile'} />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      {busy ? <AppText accessibilityLiveRegion="polite">Consultando tu negocio…</AppText> : null}
      {!busy && missing && !submissionBlocked ? <SellerActivationForm onRefresh={refresh} onActivated={(response) => { if (focused.current) setResultState({ key: queryKey, result: response }); }} /> : null}
      {!busy && missing && submissionBlocked ? <AppText>No pudimos confirmar el registro de tu negocio. Consulta de nuevo antes de repetirlo; si no aparece, contacta a soporte.</AppText> : null}
      {!busy && result && !result.success ? <AppText accessibilityRole="alert">{result.received ? 'Registro recibido; verificación pendiente. ' : ''}{productUserMessage(result.error)}</AppText> : null}
      {active ? <>
        <MotionFeedback trigger={active.seller.sellerId}>
          <AppText accessibilityLiveRegion="polite">{authorized ? 'Tu negocio está activo.' : 'Tu negocio está registrado. Vuelve a iniciar sesión para actualizar tus permisos.'}</AppText>
        </MotionFeedback>
        <Surface bordered style={{ gap: spacing.md }}>
          <AppInput label="Nombre del negocio" value={active.seller.storeName} editable={false} />
          <AppInput label="Descripción" value={active.seller.description} editable={false} multiline />
          <AppInput label="Teléfono de contacto" value={active.seller.phone} editable={false} />
          <AppButton label="Guardar cambios" disabled />
        </Surface>
        {!authorized ? <AppButton label="Volver a iniciar sesión" variant="outline" onPress={() => router.push('/login')} /> : null}
        <AppButton label="Mis productos" disabled={busy || !authorized} onPress={() => router.push('/seller/products')} />
        <AppButton label="Pedidos recibidos" variant="outline" disabled={busy || !authorized} onPress={() => router.push('/seller/orders')} />
      </> : null}
      {!(missing && !submissionBlocked && !busy) ? <AppButton label="Reconsultar mi negocio" variant="outline" loading={busy} onPress={refresh} /> : null}
    </View>
  </Screen>;
}
