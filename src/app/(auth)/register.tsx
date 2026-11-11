import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing } from '@/theme';
import { isInstitutionalEmail } from '@/utils/validation';

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
    if (!isInstitutionalEmail(form.email)) {
      setError('Usa un correo con dominio @utt.edu.mx.');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
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
      setLoading(false);
    }
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.content}>
          <AppHeader title="Crear cuenta" />

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
              error={error ? 'Correo inválido' : undefined}
              placeholder="20230184@utt.edu.mx"
            />
            <AppInput
              label="Contraseña"
              leftIcon="lock-closed-outline"
              secureTextEntry
              value={form.password}
              onChangeText={(v) => setField('password', v)}
              error={error ? 'Contraseña requerida' : undefined}
              placeholder="········"
            />
            <AppInput
              label="Confirmar contraseña"
              leftIcon="lock-closed-outline"
              secureTextEntry
              value={form.confirmPassword}
              onChangeText={(v) => setField('confirmPassword', v)}
              error={error ? 'Las contraseñas no coinciden' : undefined}
              placeholder="Repite tu contraseña"
            />
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
    paddingHorizontal: spacing.lg,
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
