import React, { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components/ui';
import { MotionFeedback } from '@/components/ui/MotionFeedback';
import { useAuth, type SellerOperationResult } from '@/context/AuthContext';
import { errorMessage } from '@/services/api/errors';
import { spacing } from '@/theme';
import { SellerActivationForm } from './SellerActivationForm';

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
      {busy ? <AppText accessibilityLiveRegion="polite">Consultando tu negocio en AWS…</AppText> : null}
      {!busy && missing && !submissionBlocked ? <SellerActivationForm onRefresh={refresh} onActivated={(response) => { if (focused.current) setResultState({ key: queryKey, result: response }); }} /> : null}
      {!busy && missing && submissionBlocked ? <AppText>El alta anterior fue recibida o su resultado es incierto. Confirma con backend antes de repetirla.</AppText> : null}
      {!busy && result && !result.success ? <AppText accessibilityRole="alert">{result.received ? 'Alta recibida; verificación pendiente. ' : ''}{result.error}</AppText> : null}
      {active ? <>
        <MotionFeedback trigger={active.seller.sellerId}>
          <AppText accessibilityLiveRegion="polite">Negocio Active confirmado por GET AWS. {authorized ? 'Seller revalidado.' : 'El JWT actual todavía no confirma Seller. Vuelve a iniciar sesión.'}</AppText>
        </MotionFeedback>
        <Surface bordered style={{ gap: spacing.md }}>
          <AppInput label="Nombre del negocio" value={active.seller.businessName} editable={false} />
          <AppInput label="Descripción" value={active.seller.description} editable={false} multiline />
          <AppInput label="Punto de entrega" value={active.seller.pickupPoint} editable={false} />
          <AppText variant="caption">Foto y teléfono no forman parte del contrato de edición acordado.</AppText>
          <AppButton label="Guardar cambios" disabled />
        </Surface>
        {!authorized ? <AppButton label="Actualizar permisos en login" variant="outline" onPress={() => router.push('/login')} /> : null}
        <AppButton label="Mis productos" disabled={busy || !authorized} onPress={() => router.push('/seller/products')} />
      </> : null}
      {!(missing && !submissionBlocked && !busy) ? <AppButton label="Reconsultar mi negocio" variant="outline" loading={busy} onPress={refresh} /> : null}
    </View>
  </Screen>;
}
