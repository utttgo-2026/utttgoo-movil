import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { usePendingRegistration } from '@/hooks/usePendingRegistration';
import { useAuth } from '@/context/AuthContext';
import { emailConfirmation } from '@/services/emailConfirmation';
import { pendingRegistration } from '@/services/pendingRegistration';
import { supabaseConfigurationMessage } from '@/services/supabase/config';
import { VerificationError, verificationError } from '@/services/supabase/verificationErrors';
import { colors, spacing } from '@/theme';

export default function VerifyEmailScreen() {
  const flow = usePendingRegistration();
  return <VerificationForm key={flow.pending?.id ?? 'no-registration'} {...flow} />;
}

function VerificationForm({ pending, resendSeconds, blockedSeconds }: ReturnType<typeof usePendingRegistration>) {
  const router = useRouter();
  let auth: ReturnType<typeof useAuth> | null = null;
  try { auth = useAuth(); } catch { /* Isolated OTP screens may render without the provider. */ }
  const [token, setToken] = useState('');
  const [verifiedWithoutAuth, setVerifiedWithoutAuth] = useState(false);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [operation, setOperation] = useState<'verify' | 'resend' | null>(null);
  const submitting = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const configurationError = supabaseConfigurationMessage();
  const busy = Boolean(pending?.busy) || operation !== null;
  const unavailable = !pending || Boolean(configurationError) || busy || Boolean(pending.verified);

  const perform = async (action: 'verify' | 'resend') => {
    if (submitting.current || unavailable || blockedSeconds > 0 || (action === 'resend' && resendSeconds > 0)) return;
    setError(undefined); setNotice(undefined);
    if (action === 'verify' && !/^[0-9]{6}$/.test(token)) { setError(new VerificationError('invalid_code').message); return; }
    if (!pending) return;
    submitting.current = true; setOperation(action);
    try {
      if (action === 'verify') {
        await emailConfirmation.verify(pending.id, token);
          const credentials = pendingRegistration.getVerifiedCredentials(pending.id);
          if (!auth || !credentials) {
            pendingRegistration.prepareLoginHint(pending.id);
            pendingRegistration.clearPassword();
            if (mounted.current) setVerifiedWithoutAuth(true);
          } else {
            const result = await auth.login(credentials.email, credentials.password);
            pendingRegistration.clearPassword();
            if (!result.success) throw new VerificationError('provider');
            pendingRegistration.clear(pending.id);
            router.push('/buyer');
        }
      } else await emailConfirmation.resend(pending.id);
      if (mounted.current) { setToken(''); if (action === 'resend') setNotice('Solicitud de reenvío aceptada por Supabase. Revisa tu correo.'); }
    } catch (cause) {
      if (mounted.current) setError(verificationError(cause).message);
    } finally {
      if (mounted.current) { if (action === 'verify') setToken(''); setOperation(null); }
      submitting.current = false;
    }
  };

  return (
    <Screen backgroundColor={colors.background} scroll constrained header={<AppHeader title="Verificar correo" />}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoiding}>
        <View style={styles.content}>
          <AppText variant="title" style={styles.title}>Confirma tu correo</AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>Introduce el código de seis dígitos del correo de confirmación de tu registro.</AppText>
          <Surface style={styles.card} bordered>
            <AppInput label="Correo institucional" leftIcon="mail-outline" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" editable={false} value={pending?.email ?? ''} accessibilityLabel="Correo del registro reciente" placeholder="matricula@uttt.edu.mx" />
            <AppInput label="Token de verificación" leftIcon="key-outline" keyboardType="number-pad" inputMode="numeric" autoComplete="one-time-code" textContentType="oneTimeCode" autoCorrect={false} autoCapitalize="none" accessibilityLabel="Código OTP de seis dígitos" maxLength={6} editable={!unavailable} value={token} onChangeText={(value) => { setToken(value.replace(/\D/g, '')); setError(undefined); }} placeholder="000000" onSubmitEditing={() => { void perform('verify'); }} />
            {pending?.verified ? <AppText accessibilityLiveRegion="polite" color={colors.success}>Correo confirmado en Supabase. Iniciando sesión con AWS...</AppText> : null}
             <AppButton label={verifiedWithoutAuth ? 'Continuar al login' : 'Verificar código'} variant="primary" onPress={verifiedWithoutAuth ? () => { const current = pendingRegistration.read(); if (current) pendingRegistration.clear(current.id); router.push('/login'); } : () => { void perform('verify'); }} loading={operation === 'verify'} disabled={verifiedWithoutAuth ? false : unavailable || blockedSeconds > 0} style={styles.verifyButton} />
          </Surface>
          {!pending ? <View style={styles.card}><AppText accessibilityRole="alert">No hay un registro reciente disponible en esta sesión. El correo no se recupera desde enlaces ni parámetros de URL.</AppText><AppButton label="Volver al registro" variant="outline" onPress={() => router.push('/register')} /></View> : configurationError && !pending.verified ? <AppText accessibilityRole="alert" color={colors.danger}>{configurationError}</AppText> : null}
          {error ? <AppText accessibilityRole="alert" accessibilityLiveRegion="polite" variant="caption" color={colors.danger}>{error}</AppText> : null}
          {notice ? <AppText accessibilityLiveRegion="polite" variant="caption">{notice}</AppText> : null}
          {blockedSeconds > 0 ? <AppText>Podrás intentarlo de nuevo en {blockedSeconds} s.</AppText> : null}
          <View style={styles.resendRow}><AppText variant="body" color={colors.textMuted}>¿No recibiste el correo?</AppText><AppButton label={resendSeconds > 0 ? `Reenviar token (${resendSeconds} s)` : 'Reenviar token'} variant="outline" onPress={() => { void perform('resend'); }} loading={operation === 'resend'} disabled={unavailable || resendSeconds > 0 || blockedSeconds > 0} fullWidth={false} /></View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: { flex: 1 },
  content: { flex: 1, gap: spacing.xl, justifyContent: 'flex-start' },
  title: { marginTop: spacing.lg },
  subtitle: { marginTop: spacing.xs },
  card: { gap: spacing.md },
  verifyButton: { marginTop: spacing.xl },
  resendRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md },
});
