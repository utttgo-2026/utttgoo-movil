import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { AppButton, AppInput, AppText, Surface } from '@/components/ui';
import { useAuth, type SellerOperationResult } from '@/context/AuthContext';
import { activationBody } from '@/utils/sellerValidation';
import { errorMessage } from '@/services/api/errors';
import { colors, radii, spacing } from '@/theme';

/** Existing activation form shared by both seller entry routes; never creates a local permission. */
export function SellerActivationForm({ onActivated, onRefresh }: { onActivated: (result: SellerOperationResult) => void; onRefresh: () => void }) {
  const { requestSellerActivation } = useAuth();
  const [form, setForm] = useState({ storeName: '', description: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [message, setMessage] = useState<string>();
  const lock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const submit = async () => {
    if (lock.current || blocked) return;
    let body;
    try { body = activationBody(form); } catch (error) { setMessage(errorMessage(error)); return; }
    lock.current = true; setBusy(true); setMessage(undefined);
    try {
      const result = await requestSellerActivation(body);
      if (!mounted.current) return;
      if (result.success && result.kind === 'active') onActivated(result);
      else {
        const received = result.received || result.uncertain;
        setBlocked(!!received);
        setMessage(result.success ? 'Reconsulta tu negocio antes de repetir el alta.' :
          `${received ? 'Alta recibida o resultado incierto. Reconsulta sin repetir el alta. ' : ''}${result.error}`);
      }
    } catch (error) {
      if (mounted.current) { setBlocked(true); setMessage(errorMessage(error)); }
    } finally { lock.current = false; if (mounted.current) setBusy(false); }
  };
  return <View style={{ gap: spacing.lg }}>
    <View style={{ backgroundColor: colors.dangerSoft, borderRadius: radii.xl, padding: spacing.xxl, alignItems: 'center' }}>
      <Ionicons name="storefront-outline" size={56} color={colors.primary} accessible={false} />
    </View>
    <AppText variant="title" align="center">Vende dentro de la comunidad UTTT</AppText>
    <AppText>Todavía no tienes negocio. El alta es inmediata; después verificamos el perfil y los permisos con AWS.</AppText>
    <Surface bordered style={{ gap: spacing.md }}>
      <AppInput label="Nombre del emprendimiento" accessibilityLabel="Nombre del negocio" value={form.storeName} editable={!busy && !blocked}
        onChangeText={(storeName) => setForm((value) => ({ ...value, storeName }))} placeholder="Nombre del negocio" />
      <AppInput label="Descripción" accessibilityLabel="Descripción del negocio" value={form.description} multiline editable={!busy && !blocked}
        onChangeText={(description) => setForm((value) => ({ ...value, description }))} placeholder="Describe tu negocio" />
      <AppInput label="Teléfono de contacto" accessibilityLabel="Teléfono de contacto" value={form.phone} editable={!busy && !blocked}
        onChangeText={(phone) => setForm((value) => ({ ...value, phone }))} placeholder="Teléfono de contacto" />
      <AppButton label="Registrar negocio" loading={busy} disabled={blocked} onPress={() => void submit()} />
    </Surface>
    {message ? <AppText accessibilityRole="alert">{message}</AppText> : null}
    <AppButton label="Reconsultar mi negocio" variant="outline" disabled={busy} onPress={onRefresh} />
  </View>;
}
