import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { colors, radii, spacing } from '@/theme';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setError(undefined);
    if (!token.trim() || token.length < 6) {
      setError('Ingresa el token de verificación.');
      return;
    }
    setLoading(true);
    try {
      // Simulación de verificación de token
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push('/buyer' as any);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Token reenviado (simulado)
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
          <AppHeader title="Verificar correo" />

          <AppText variant="title" style={styles.title}>
            Confirma tu correo
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>
            Enviamos un token a tu correo institucional. Introdúcelo para completar tu
            registro en UTTT-GO.
          </AppText>

          <Surface style={styles.card} bordered>
            <AppInput
              label="Correo institucional"
              leftIcon="mail-outline"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={false}
              value="20230184@utt.edu.mx"
              placeholder="20230184@utt.edu.mx"
            />
            <AppInput
              label="Token de verificación"
              leftIcon="key-outline"
              keyboardType="number-pad"
              maxLength={6}
              value={token}
              onChangeText={setToken}
              error={error ? 'Token requerido' : undefined}
              placeholder="Introduce tu token"
            />
            <AppButton
              label="Verificar y continuar"
              variant="primary"
              onPress={handleVerify}
              loading={loading}
              style={styles.verifyButton}
            />
          </Surface>

          <View style={styles.resendRow}>
            <AppText variant="body" color={colors.textMuted}>
              ¿No recibiste el correo?
            </AppText>
            <AppButton
              label="Reenviar token"
              variant="outline"
              onPress={handleResend}
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
  verifyButton: {
    marginTop: spacing.xl,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
