import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppButton, AppHeader, AppText, Screen, Surface } from '@/components';
import { colors, radii, spacing } from '@/theme';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const registeredEmail = typeof email === 'string' ? email : 'tu correo institucional';
  const { verifyEmail, resendEmailCode } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string>();
  const [feedback, setFeedback] = useState<string>();

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const verify = async () => {
    setError(undefined);
    if (!/^\d{6}$/.test(otp)) { setError('Ingresa los seis dígitos del código.'); return; }
    setLoading(true);
    try {
      const result = await verifyEmail(registeredEmail, otp);
      if (result.success) router.push('/buyer');
      else setError(result.error);
    } finally { setLoading(false); }
  };

  const resend = async () => {
    if (resending || cooldown > 0) return;
    setError(undefined); setFeedback(undefined); setResending(true);
    try {
      const result = await resendEmailCode(registeredEmail);
      if (result.success) { setFeedback('Código reenviado. Revisa tu correo institucional.'); setCooldown(30); }
      else setError(result.error);
    } finally { setResending(false); }
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <View style={styles.content}>
        <AppHeader title="Confirmar correo" />
        <View style={styles.titleBlock}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-open-outline" size={30} color={colors.primary} />
          </View>
          <AppText variant="title">Confirma tu correo</AppText>
          <AppText variant="body" color={colors.textMuted} align="center">
             Enviamos un código de seis dígitos a tu correo institucional.
          </AppText>
        </View>
        <Surface style={styles.card} bordered>
          <AppText variant="label" color={colors.textMuted}>Correo utilizado</AppText>
          <AppText variant="subtitle" style={styles.email}>{registeredEmail}</AppText>
           <TextInput accessibilityLabel="Código OTP" keyboardType="number-pad" maxLength={6} value={otp}
             onChangeText={(value) => { setOtp(value.replace(/\D/g, '')); setError(undefined); }}
             editable={!loading} placeholder="000000" style={styles.otpInput} />
           {error ? <AppText accessibilityLiveRegion="polite" variant="caption" color={colors.danger}>{error}</AppText> : null}
           {feedback ? <AppText accessibilityLiveRegion="polite" variant="caption" color={colors.success}>{feedback}</AppText> : null}
         </Surface>
         <AppButton label="Verificar y continuar" onPress={() => { void verify(); }} loading={loading} disabled={loading || otp.length !== 6} style={styles.button} />
         <AppButton label={cooldown ? `Reenviar código (${cooldown}s)` : 'Reenviar código'} variant="ghost" onPress={() => { void resend(); }} loading={resending} disabled={resending || cooldown > 0} />
        <AppText variant="caption" color={colors.textSubtle} align="center" style={styles.resendNote}>
           Revisa spam si no aparece. El código se envía desde Supabase.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: spacing.lg, gap: spacing.xl },
  titleBlock: { alignItems: 'center', gap: spacing.md, marginTop: spacing.xl },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  card: { gap: spacing.sm, marginTop: spacing.md },
  email: { color: colors.primary },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.infoSoft, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.md },
  noticeText: { flex: 1 },
  otpInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, fontSize: 24, letterSpacing: 8, textAlign: 'center', color: colors.text },
  button: { marginTop: spacing.md },
  resendNote: { marginTop: spacing.sm },
});
