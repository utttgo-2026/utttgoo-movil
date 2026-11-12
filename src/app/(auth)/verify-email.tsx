import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { colors, spacing } from '@/theme';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [error, setError] = useState<string | undefined>(undefined);

  return (
    <Screen backgroundColor={colors.background} scroll constrained header={<AppHeader title="Verificar correo" />}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.content}>
          <AppText variant="title" style={styles.title}>
            Confirma tu correo
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>
            La verificación de correo se realiza mediante Supabase. Falta confirmar el
            flujo con el backend; esta pantalla todavía no valida ni reenvía códigos.
          </AppText>

          <Surface style={styles.card} bordered>
            <AppInput
              label="Correo institucional"
              leftIcon="mail-outline"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={false}
              value={email ?? ''}
              placeholder="matricula@uttt.edu.mx"
            />
            <AppInput
              label="Token de verificación"
              leftIcon="key-outline"
              keyboardType="number-pad"
              maxLength={6}
              editable={false}
              value=""
              placeholder="Pendiente de contrato de verificación"
            />
            <AppButton
              label="Volver a iniciar sesión"
              variant="primary"
              onPress={() => router.push('/login')}
              style={styles.verifyButton}
            />
          </Surface>

          {error ? <AppText variant="caption" color={colors.danger}>{error}</AppText> : null}

          <View style={styles.resendRow}>
            <AppText variant="body" color={colors.textMuted}>
              ¿No recibiste el correo?
            </AppText>
            <AppButton
              label="Reenviar token"
              variant="outline"
              onPress={() => setError('El contrato de reenvío de Supabase aún no está disponible. No se envió ningún código.')}
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
