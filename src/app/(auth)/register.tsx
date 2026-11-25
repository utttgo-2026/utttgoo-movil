import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing } from '@/theme';
import { registrationDiagnostic } from '@/services/api/registrationDiagnostics';
import { isBetaRegistrationOnly } from '@/config/betaRegistration';
import { institutionalEmail, registrationName, requirePassword } from '@/utils/apiValidation';
import { errorMessage } from '@/services/api/errors';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const betaRegistrationOnly = isBetaRegistrationOnly();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const received = useRef(false);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
    registrationDiagnostic({ event: 'form_submit' });
    setError(undefined);
    const rejectForm = (message: string) => {
      setError(message);
      registrationDiagnostic({ event: 'form_validation_failed' });
    };
    if (!form.fullName.trim()) {
      rejectForm('Ingresa tu nombre completo.');
      return;
    }
    if (!form.email.trim()) {
      rejectForm('Ingresa tu correo institucional.');
      return;
    }
    if (!form.password.trim()) {
      rejectForm('Ingresa tu contraseña.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      rejectForm('Las contraseñas no coinciden.');
      return;
    }
    try { registrationName(form.fullName); institutionalEmail(form.email); requirePassword(form.password); }
    catch (cause) { rejectForm(errorMessage(cause)); return; }

    submitting.current = true;
    setLoading(true);
    try {
      registrationDiagnostic({ event: 'form_dispatch' });
      const result = await register(form.fullName, form.email, form.password);
      registrationDiagnostic({ event: 'form_result', accepted: result.success });
      if (result.success) {
        received.current = true;
        router.replace('/verify-email');
      } else {
        setError(result.error ?? 'No se pudo crear la cuenta.');
      }
    } finally {
      setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      setLoading(false);
      submitting.current = false;
    }
  };

  return (
    <Screen backgroundColor={colors.background} scroll constrained header={<AppHeader title="Crear cuenta" />}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.content}>
          <AppText variant="title" style={styles.title}>
            Únete a UTTT-GO
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>
            Tus datos se validan con la comunidad universitaria.
          </AppText>
          {betaRegistrationOnly ? <AppText variant="caption" color={colors.textMuted}>
            Si no recibes respuesta, consulta a soporte antes de repetir el registro.
          </AppText> : null}

          <Surface style={styles.card} bordered>
            <AppInput
              label="Nombre completo"
              leftIcon="person-outline"
              value={form.fullName}
              onChangeText={(v) => setField('fullName', v)}
              placeholder="Mariana López Cruz"
              error={fieldError('fullName')}
            />
            <AppInput
              label="Correo institucional"
              leftIcon="mail-outline"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={form.email}
              onChangeText={(v) => setField('email', v)}
              placeholder="matricula@uttt.edu.mx"
              error={fieldError('email')}
            />
            <AppInput
              label="Contraseña"
              leftIcon="lock-closed-outline"
              secureTextEntry
              value={form.password}
              onChangeText={(v) => setField('password', v)}
              placeholder="········"
              error={fieldError('password')}
              helper="Recomendamos al menos 12 caracteres."
            />
            <AppInput
              label="Confirmar contraseña"
              leftIcon="lock-closed-outline"
              secureTextEntry
              value={form.confirmPassword}
              onChangeText={(v) => setField('confirmPassword', v)}
              placeholder="Repite tu contraseña"
            />
            {error ? <AppText variant="caption" color={colors.danger}>{error}</AppText> : null}
            <AppButton
              label="Crear mi cuenta"
              variant="primary"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />
            <View style={styles.terms}>
              <AppText variant="caption" color={colors.textSubtle} align="center">
                Al continuar aceptas los Términos de uso y el Aviso de privacidad.
              </AppText>
            </View>
          </Surface>
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
  registerButton: {
    marginTop: spacing.xl,
  },
  terms: {
    marginTop: spacing.md,
  },
});
