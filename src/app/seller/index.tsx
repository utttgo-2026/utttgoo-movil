import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { spacing } from '@/theme';
import type { SellerActiveResponse } from '@/types/api';

export default function BusinessScreen() {
  const router = useRouter();
  const { consultSeller } = useAuth();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [message, setMessage] = useState<string>();
  const [seller, setSeller] = useState<SellerActiveResponse>();
  const [needsLogin, setNeedsLogin] = useState(false);
  const check = async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    try {
      const result = await consultSeller();
      if (result.success) setSeller(result.seller); else setSeller(undefined);
      setNeedsLogin(result.success && !result.roleSynced);
      setMessage(result.success
        ? `Negocio Active confirmado por AWS (HTTP ${result.status}). ${result.roleSynced ? 'Seller revalidado.' : 'Vuelve a iniciar sesión: este JWT no confirma aún Seller.'}`
        : `${result.status ? `HTTP ${result.status}. ` : ''}${result.error} No se deduce un estado administrativo de este error.`);
    } finally { setBusy(false); lock.current = false; }
  };
  return <Screen scroll constrained header={<AppHeader title="Mi negocio" backFallback="/buyer/profile" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      <AppText variant="title">Perfil vendedor</AppText>
      <AppText>Consulta el negocio y revalida los permisos de tu sesión contra AWS.</AppText>
      <AppButton label="Consultar mi solicitud" loading={busy} onPress={() => { void check(); }} />
      {message ? <AppText accessibilityLiveRegion="polite">{message}</AppText> : null}
      {needsLogin ? <AppButton label="Actualizar permisos en login" variant="outline" onPress={() => router.push('/login')} /> : null}
      <Surface bordered style={{ gap: spacing.md }}>
        <AppInput label="Nombre del negocio" value={seller?.businessName ?? ''} editable={false} placeholder="Consulta tu negocio" />
        <AppInput label="Descripción" value={seller?.description ?? ''} editable={false} multiline placeholder="Consulta tu negocio" />
        <AppInput label="Punto de entrega" value={seller?.pickupPoint ?? ''} editable={false} placeholder="Consulta tu negocio" />
        <AppText variant="caption">No se muestran datos ficticios. Foto y teléfono no forman parte del PATCH acordado.</AppText>
        <AppButton label="Guardar cambios" disabled />
      </Surface>
      <AppButton label="Solicitar activación" variant="outline" disabled={busy} onPress={() => router.push('/seller/activation')} />
      <AppButton label="Mis productos" variant="outline" disabled={busy} onPress={() => router.push('/seller/products')} />
      <AppText variant="caption">Edición de negocio y publicación requieren contratos de respuesta específicos; no se habilitan con un permiso local.</AppText>
    </View>
  </Screen>;
}
