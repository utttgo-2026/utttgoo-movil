import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { colors, spacing } from '@/theme';
import { navigateBack } from '@/navigation/buyerRoutes';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSend = () => {
    setError(undefined);
    if (!email.trim()) {
      setError('Ingresa tu correo institucional.');
      return;
    }
    setError('La recuperación está pendiente del contrato del backend/Supabase. No se envió ningún enlace.');
  };

  return (
    <Screen backgroundColor={colors.background} scroll constrained header={<AppHeader title="Recuperar contraseña" />}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={48} color={colors.primary} />
          </View>

          <AppText variant="title" style={styles.title}>
            Recupera tu acceso
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>
            La recuperación de contraseña estará disponible cuando se confirme el flujo del backend.
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
            <AppButton
              label="Enviar enlace"
              variant="primary"
              onPress={handleSend}
              style={styles.sendButton}
            />
          </Surface>

          <View style={styles.backRow}>
            <AppButton
              label="Volver a iniciar sesión"
              variant="outline"
              onPress={() => navigateBack(router, '/login')}
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
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  title: {
    marginTop: spacing.md,
  },
  subtitle: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  card: {
    gap: spacing.md,
  },
  sendButton: {
    marginTop: spacing.xl,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
