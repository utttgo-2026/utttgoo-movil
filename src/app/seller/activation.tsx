import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { activationBody } from '@/utils/sellerValidation';
import { errorMessage } from '@/services/api/errors';
import { colors, radii, spacing } from '@/theme';

export default function ActivationScreen() {
  const router = useRouter();
  const { requestSellerActivation } = useAuth();
  const [form, setForm] = useState({ businessName: '', description: '', pickupPoint: '' });
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState<string>();
  const locked = useRef(false);
  const [uncertain, setUncertain] = useState(false);
  const submit = async () => {
    if (locked.current || accepted || uncertain) return;
    setMessage(undefined);
    let body;
    try { body = activationBody(form); } catch (error) { setMessage(errorMessage(error)); return; }
    locked.current = true; setBusy(true);
    try {
      const result = await requestSellerActivation(body);
      if (result.success) {
        setAccepted(true);
        setMessage(`Solicitud recibida por AWS (HTTP ${result.status}). Esto no confirma aprobación ni un cambio de rol. Consulta el estado y coordina con backend la validación de la respuesta.`);
      } else {
        setMessage(`${result.status ? `HTTP ${result.status}. ` : ''}${result.error}`);
        // Network outcomes may have persisted. Consult before any manual retry; no automatic retry.
        setUncertain(true);
      }
    } finally { locked.current = false; setBusy(false); }
  };
  return <Screen scroll constrained header={<AppHeader title="Activa tu perfil vendedor" backFallback="/seller" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      <View style={{ backgroundColor: colors.dangerSoft, borderRadius: radii.xl, padding: spacing.xxl, alignItems: 'center' }}>
        <Ionicons name="storefront-outline" size={56} color={colors.primary} accessible={false} />
      </View>
      <AppText variant="title" align="center">Vende dentro de la comunidad UTTT</AppText>
      <AppText>Solicita la activación de tu negocio. No se aprueba automáticamente.</AppText>
      <Surface bordered style={{ gap: spacing.md }}>
        <AppInput label="Nombre del emprendimiento" accessibilityLabel="Nombre del negocio" value={form.businessName} editable={!busy && !accepted && !uncertain}
          onChangeText={(businessName) => setForm((value) => ({ ...value, businessName }))} placeholder="Nombre del negocio" />
        <AppInput label="Descripción" accessibilityLabel="Descripción del negocio" value={form.description} multiline editable={!busy && !accepted && !uncertain}
          onChangeText={(description) => setForm((value) => ({ ...value, description }))} placeholder="Describe tu negocio" />
        <AppInput label="Punto de entrega" accessibilityLabel="Punto de entrega" value={form.pickupPoint} editable={!busy && !accepted && !uncertain}
          onChangeText={(pickupPoint) => setForm((value) => ({ ...value, pickupPoint }))} placeholder="Lugar de entrega" />
        <AppInput label="Teléfono de contacto" value="" editable={false} placeholder="No incluido en el contrato AWS" />
        <AppButton label="Solicitar activación" loading={busy} disabled={accepted || uncertain} onPress={() => { void submit(); }} />
      </Surface>
      {message ? <AppText accessibilityLiveRegion="polite">{message}</AppText> : null}
      {uncertain ? <AppText>Consulta con backend antes de repetir la solicitud. Un timeout o error no prueba que no se guardó.</AppText> : null}
      <AppButton label="Consultar estado de solicitud" variant="outline" disabled={busy} onPress={() => router.push('/seller')} />
    </View>
  </Screen>;
}
