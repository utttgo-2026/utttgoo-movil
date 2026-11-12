import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing } from '@/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(undefined);
  };

  const handleRegister = async () => {
    setError(undefined);
    if (!form.fullName.trim()) {
      setError('Ingresa tu nombre completo.');
      return;
    }
    if (!form.email.trim()) {
      setError('Ingresa tu correo institucional.');
      return;
    }
    if (!form.password.trim()) {
      setError('Ingresa tu contraseña.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const result = await register(form.fullName, form.email, form.password);
      if (result.success) {
        router.push({ pathname: '/verify-email', params: { email: form.email.trim().toLowerCase() } });
      } else {
        setError(result.error ?? 'No se pudo crear la cuenta.');
      }
    } finally {
      setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      setLoading(false);
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

          <Surface style={styles.card} bordered>
            <AppInput
              label="Nombre completo"
              leftIcon="person-outline"
              value={form.fullName}
              onChangeText={(v) => setField('fullName', v)}
              placeholder="Mariana López Cruz"
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
            />
            <AppInput
              label="Contraseña"
              leftIcon="lock-closed-outline"
              secureTextEntry
              value={form.password}
              onChangeText={(v) => setField('password', v)}
              placeholder="········"
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
