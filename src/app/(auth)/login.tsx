import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useApiHealth } from '@/hooks/useApiHealth';
import { colors, spacing } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, status, sessionError } = useAuth();
  const health = useApiHealth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(undefined);
    if (!email.trim() || !password) {
      setError('Ingresa tu correo institucional y contraseña.');
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        router.push('/buyer');
      } else {
        setError(result.error ?? 'No se pudo iniciar sesión.');
      }
    } finally {
      setPassword('');
      setLoading(false);
    }
  };

  return (
    <Screen backgroundColor={colors.background} scroll constrained header={<AppHeader title="Acceso UTTT" />}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.content}>
          <AppText variant="title" style={styles.title}>
            ¿Qué gusto verte
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>
            Ingresa con tu correo institucional para continuar.
          </AppText>

          <Surface style={styles.card} bordered>
            <AppInput
              label="Correo institucional"
              leftIcon="mail-outline"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={error}
              placeholder="matricula@uttt.edu.mx"
            />
            <AppInput
              label="Contraseña"
              leftIcon="lock-closed-outline"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={error}
              placeholder="········"
            />
            <View style={styles.forgotRow}>
              <AppButton
                label="¿Olvidaste tu contraseña?"
                variant="ghost"
                onPress={() => router.push('/forgot-password')}
                fullWidth={false}
              />
            </View>
            <AppButton
              label="Iniciar sesión"
              variant="primary"
              onPress={handleLogin}
              loading={loading}
              disabled={status === 'restoring'}
              style={styles.loginButton}
            />
          </Surface>

          {sessionError && !error ? (
            <AppText variant="caption" color={colors.danger}>{sessionError}</AppText>
          ) : null}

          <Surface style={styles.infoCard} bordered={false} backgroundColor={colors.surfaceBlue}>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.info} />
              <View style={styles.infoText}>
                <AppText variant="label">Acceso institucional</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  Usa la cuenta activa que te asignó la Universidad.
                </AppText>
              </View>
            </View>
            {__DEV__ ? (
              <>
                <AppButton
                  label="Comprobar conexión"
                  variant="ghost"
                  size="sm"
                  loading={health.loading}
                  onPress={() => { void health.check(); }}
                />
                {health.response ? (
                  <AppText variant="caption" color={colors.textMuted}>
                    HTTP {health.response.status} · API: {health.response.data.status} · MongoDB: {health.response.data.checks.mongodb} · Redis: {health.response.data.checks.redis}
                  </AppText>
                ) : null}
                {health.error ? <AppText variant="caption" color={colors.danger}>{health.error}</AppText> : null}
              </>
            ) : null}
          </Surface>

          <View style={styles.signupRow}>
            <AppText variant="body" color={colors.textMuted}>
              ¿Primera vez?
            </AppText>
            <AppButton
              label="Crear cuenta"
              variant="outline"
              onPress={() => router.push('/register')}
              fullWidth={false}
            />
          </View>
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
  forgotRow: {
    marginTop: spacing.sm,
  },
  loginButton: {
    marginTop: spacing.xl,
  },
  infoCard: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  infoText: {
    flex: 1,
  },
  signupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
