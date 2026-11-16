import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { spacing } from '@/theme';

export default function BusinessScreen() {
  const router = useRouter();
  const { consultSeller } = useAuth();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [message, setMessage] = useState<string>();
  const check = async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    try {
      const result = await consultSeller();
      setMessage(result.success
        ? `AWS respondió HTTP ${result.status}. Falta confirmar el contrato de perfil y autorización: esta respuesta no permite afirmar si tu solicitud está pendiente, aprobada o rechazada.`
        : `${result.status ? `HTTP ${result.status}. ` : ''}${result.error} No se deduce un estado administrativo de este error.`);
    } finally { setBusy(false); lock.current = false; }
  };
  return <Screen scroll constrained header={<AppHeader title="Mi negocio" backFallback="/buyer/profile" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      <AppText variant="title">Perfil vendedor</AppText>
      <AppText>Consulta la respuesta de AWS. Los campos y estados del negocio requieren un contrato de respuesta confirmado.</AppText>
      <AppButton label="Consultar mi solicitud" loading={busy} onPress={() => { void check(); }} />
      {message ? <AppText accessibilityLiveRegion="polite">{message}</AppText> : null}
      <Surface bordered style={{ gap: spacing.md }}>
        <AppInput label="Nombre del negocio" value="" editable={false} placeholder="Pendiente de contrato de perfil" />
        <AppInput label="Descripción" value="" editable={false} multiline placeholder="Pendiente de contrato de perfil" />
        <AppInput label="Punto de entrega" value="" editable={false} placeholder="Pendiente de contrato de perfil" />
        <AppText variant="caption">No se muestran datos ficticios. Foto y teléfono no forman parte del PATCH acordado.</AppText>
        <AppButton label="Guardar cambios" disabled />
      </Surface>
      <AppButton label="Solicitar activación" variant="outline" disabled={busy} onPress={() => router.push('/seller/activation')} />
      <AppButton label="Mis productos" variant="outline" disabled={busy} onPress={() => router.push('/seller/products')} />
      <AppText variant="caption">Sin contrato de estados y roles, no se habilita publicar ni se cambia tu identidad de comprador.</AppText>
    </View>
  </Screen>;
}
