import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { isBetaRegistrationOnly } from '@/config/betaRegistration';
import { useAuth } from '@/context/AuthContext';
import { pendingRegistration } from '@/services/pendingRegistration';
import { errorMessage } from '@/services/api/errors';
import { registrationDiagnostic } from '@/services/api/registrationDiagnostics';
import { colors, spacing } from '@/theme';
import { institutionalEmail, registrationName, requirePassword } from '@/utils/apiValidation';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, logout, status } = useAuth();
  const betaRegistrationOnly = isBetaRegistrationOnly();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const received = useRef(false);
  const [registrationReceived, setRegistrationReceived] = useState(false);
  const [exploring, setExploring] = useState(false);
  const proceeding = useRef(false);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setError(undefined);
  };
  const fieldError = (key: 'fullName' | 'email' | 'password') => {
    if (!form[key]) return undefined;
    try {
      if (key === 'fullName') registrationName(form[key]);
      else if (key === 'email') institutionalEmail(form[key]);
      else requirePassword(form[key]);
    } catch (cause) { return errorMessage(cause); }
    return undefined;
  };

  const handleRegister = async () => {
    if (submitting.current || received.current) return;
    setError(undefined);
    registrationDiagnostic({ event: 'form_submit' });
    const rejectForm = (message: string) => { setError(message); registrationDiagnostic({ event: 'form_validation_failed' }); };
    if (!form.fullName.trim()) return rejectForm('Ingresa tu nombre completo.');
    if (!form.email.trim()) return rejectForm('Ingresa tu correo institucional.');
    if (!form.password.trim()) return rejectForm('Ingresa tu contraseña.');
    if (form.password !== form.confirmPassword) return rejectForm('Las contraseñas no coinciden.');
    try { registrationName(form.fullName); institutionalEmail(form.email); requirePassword(form.password); }
    catch (cause) { rejectForm(errorMessage(cause)); return; }

    submitting.current = true;
    setLoading(true);
    try {
      registrationDiagnostic({ event: 'form_dispatch' });
      const result = await register(form.fullName, form.email, form.password);
      registrationDiagnostic({ event: 'form_result', accepted: result.success });
      if (!result.success) { setError(result.error ?? 'No se pudo crear la cuenta.'); return; }
      if (betaRegistrationOnly) {
        received.current = true;
        if (pendingRegistration.preparePendingLogin()) router.push('/login');
        else setRegistrationReceived(true);
      } else router.push('/verify-email');
    } finally {
      setForm((previous) => ({ ...previous, password: '', confirmPassword: '' }));
      setLoading(false);
      submitting.current = false;
    }
  };

  const exploreAsGuest = async () => {
    if (proceeding.current) return;
    proceeding.current = true;
    setExploring(true);
    setError(undefined);
    try {
      if (status !== 'anonymous') {
        const result = await logout();
        if (!result.success) { setError(result.error ?? 'No se pudo cerrar la sesión anterior.'); return; }
      }
      router.push('/buyer');
    } finally { setExploring(false); proceeding.current = false; }
  };

  if (registrationReceived) return (
    <Screen backgroundColor={colors.background} scroll constrained header={<AppHeader title="Crear cuenta" />}>
      <View style={styles.content}>
        <AppText variant="title" style={styles.title} accessibilityLiveRegion="polite">Registro recibido</AppText>
        <AppText variant="body" color={colors.textMuted}>Beta de solo registro</AppText>
        <Surface style={styles.card} bordered>
          <AppText>La solicitud fue aceptada por AWS. La cuenta está pendiente de verificación; no has iniciado sesión con esta cuenta.</AppText>
          <AppText color={colors.textMuted}>Este acuse no confirma que la identidad o el perfil estén guardados.</AppText>
          <AppButton label="Seguir explorando como invitado" loading={exploring} onPress={() => { void exploreAsGuest(); }} />
          <AppButton label="Verificar correo (opcional)" variant="outline" disabled={exploring} onPress={() => router.push('/verify-email')} />
        </Surface>
        {error ? <AppText accessibilityRole="alert" color={colors.danger}>{error}</AppText> : null}
      </View>
    </Screen>
  );

  return (
    <Screen backgroundColor={colors.background} scroll constrained header={<AppHeader title="Crear cuenta" />}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoiding}>
        <View style={styles.content}>
          <AppText variant="title" style={styles.title}>Únete a UTTT-GO</AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>Tus datos se validan con la comunidad universitaria.</AppText>
          {betaRegistrationOnly ? <AppText variant="caption" color={colors.textMuted}>Beta de solo registro. Si no recibes respuesta, confirma con backend antes de repetir el alta.</AppText> : null}
          <Surface style={styles.card} bordered>
            <AppInput label="Nombre completo" leftIcon="person-outline" value={form.fullName} onChangeText={(value) => setField('fullName', value)} placeholder="Mariana López Cruz" error={fieldError('fullName')} />
            <AppInput label="Correo institucional" leftIcon="mail-outline" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" value={form.email} onChangeText={(value) => setField('email', value)} placeholder="matricula@uttt.edu.mx" error={fieldError('email')} />
            <AppInput label="Contraseña" leftIcon="lock-closed-outline" secureTextEntry value={form.password} onChangeText={(value) => setField('password', value)} placeholder="········" error={fieldError('password')} helper="Recomendamos al menos 12 caracteres. La política de AWS/Supabase se aplica en el servidor." />
            <AppInput label="Confirmar contraseña" leftIcon="lock-closed-outline" secureTextEntry value={form.confirmPassword} onChangeText={(value) => setField('confirmPassword', value)} placeholder="Repite tu contraseña" />
            {error ? <AppText variant="caption" color={colors.danger}>{error}</AppText> : null}
            <AppButton label="Crear mi cuenta" variant="primary" onPress={handleRegister} loading={loading} style={styles.registerButton} />
            <AppText variant="caption" color={colors.textSubtle} align="center" style={styles.terms}>Al continuar aceptas los Términos de uso y el Aviso de privacidad.</AppText>
          </Surface>
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
  registerButton: { marginTop: spacing.xl },
  terms: { marginTop: spacing.md },
});
