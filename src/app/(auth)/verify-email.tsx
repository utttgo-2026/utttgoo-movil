import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { colors, radii, spacing } from '@/theme';
import { usePendingRegistration } from '@/hooks/usePendingRegistration';
import { emailConfirmation } from '@/services/emailConfirmation';
import { pendingRegistration } from '@/services/pendingRegistration';
import { supabaseConfigurationMessage } from '@/services/supabase/config';
import { VerificationError, verificationError } from '@/services/supabase/verificationErrors';

export default function VerifyEmailScreen() {
  const flow = usePendingRegistration();
  return <VerificationForm key={flow.pending?.id ?? 'no-registration'} {...flow} />;
}

function VerificationForm({ pending, resendSeconds, blockedSeconds }: ReturnType<typeof usePendingRegistration>) {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
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
    setError(undefined);
    setNotice(undefined);
    if (action === 'verify' && !/^[0-9]{6}$/.test(token)) {
      setError(new VerificationError('invalid_code').message);
      return;
    }
    if (!pending) return;
    submitting.current = true;
    setOperation(action);
    try {
      if (action === 'verify') await emailConfirmation.verify(pending.id, token);
      else await emailConfirmation.resend(pending.id);
      if (mounted.current) {
        setToken('');
        if (action === 'resend') setNotice('Si tu correo está pendiente de verificación, recibirás un nuevo código. Revisa también el correo no deseado.');
      }
    } catch (cause) {
      if (mounted.current) setError(verificationError(cause).message);
    } finally {
      if (mounted.current) {
        if (action === 'verify') setToken('');
        setOperation(null);
      }
      submitting.current = false;
    }
  };

  const continueToLogin = () => {
    if (!pending?.verified || busy) return;
    if (!pendingRegistration.prepareLogin(pending.id)) return;
    router.dismissTo('/login');
  };

  return (
    <Screen backgroundColor={colors.background} scroll constrained header={<AppHeader title="Verificar correo" />}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.content}>
          <AppText variant="title" style={styles.title} accessibilityLiveRegion="polite">
            {pending?.verified ? '¡Correo verificado!' : 'Verifica tu correo'}
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>
            {pending?.verified ? 'Inicia sesión para completar el acceso a tu cuenta.' : 'Introduce el código de 6 dígitos que enviamos a tu correo electrónico.'}
          </AppText>

          <Surface style={styles.card} bordered>
            <AppInput
              label="Correo institucional"
              leftIcon="mail-outline"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={false}
              value={pending?.email ?? ''}
              accessibilityLabel="Correo del registro reciente"
              placeholder="matricula@uttt.edu.mx"
            />
            {!pending?.verified ? <>
            <AppText variant="label">Código de verificación</AppText>
            <View style={styles.otp}>
              <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={styles.cells}>
                {Array.from({ length: 6 }, (_, index) => <View key={index} style={[styles.cell, focused && index === Math.min(token.length, 5) && styles.activeCell]}>
                  <AppText variant="subtitle">{token[index] ?? '–'}</AppText>
                </View>)}
              </View>
              <TextInput
              keyboardType="number-pad"
              inputMode="numeric"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              autoCorrect={false}
              autoCapitalize="none"
              accessibilityLabel="Código OTP de seis dígitos"
              accessibilityHint="Escribe o pega los seis dígitos del correo."
              editable={!unavailable}
              value={token}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={styles.nativeInput}
              underlineColorAndroid="transparent"
              caretHidden
              onChangeText={(value) => {
                const digits = value.replace(/[\s-]/g, '');
                if (!/^[0-9]{0,6}$/.test(digits)) {
                  setToken(''); setError(new VerificationError('invalid_code').message); return;
                }
                setToken(digits); setError(undefined);
              }}
              />
            </View>
            <AppText variant="caption" color={colors.textMuted}>Puedes pegar los seis dígitos del correo.</AppText>
            </> : null}
            <AppButton
              label={pending?.verified ? 'Iniciar sesión' : 'Verificar correo'}
              variant="primary"
              onPress={pending?.verified ? continueToLogin : () => { void perform('verify'); }}
              loading={operation === 'verify'}
              disabled={pending?.verified ? busy : unavailable || blockedSeconds > 0}
              style={styles.verifyButton}
            />
          </Surface>

          {!pending ? <View style={styles.card}>
            <AppText accessibilityRole="alert">No hay un registro reciente disponible. Si ya solicitaste el registro, consulta a soporte antes de repetirlo.</AppText>
            <AppButton label="Volver" variant="outline" onPress={() => router.canGoBack() ? router.back() : router.navigate('/welcome')} />
          </View> : configurationError && !pending.verified ? <AppText accessibilityRole="alert" color={colors.danger}>{configurationError}</AppText> : null}
          {error ? <AppText accessibilityRole="alert" accessibilityLiveRegion="polite" variant="caption" color={colors.danger}>{error}</AppText> : null}
          {notice ? <AppText accessibilityLiveRegion="polite" variant="caption">{notice}</AppText> : null}
          {blockedSeconds > 0 ? <AppText>Podrás intentarlo de nuevo en {blockedSeconds} s.</AppText> : null}

          {!pending?.verified ? <View style={styles.resendRow}>
            <AppText variant="body" color={colors.textMuted}>
              ¿No recibiste el correo?
            </AppText>
            <AppButton
              label={resendSeconds > 0 ? `Reenviar código (${resendSeconds} s)` : 'Reenviar código'}
              variant="outline"
              onPress={() => { void perform('resend'); }}
              loading={operation === 'resend'}
              disabled={unavailable || resendSeconds > 0 || blockedSeconds > 0}
              fullWidth={false}
            />
          </View> : null}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
  content: {
    flex: 1,
    gap: spacing.xl,
    justifyContent: 'flex-start',
  },
  title: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  card: {
    gap: spacing.md,
  },
  otp: { position: 'relative' },
  cells: { flexDirection: 'row', gap: spacing.xs },
  cell: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  activeCell: { borderColor: colors.primary },
  nativeInput: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, color: 'transparent', backgroundColor: 'transparent' },
  verifyButton: {
    marginTop: spacing.xl,
  },
  resendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
