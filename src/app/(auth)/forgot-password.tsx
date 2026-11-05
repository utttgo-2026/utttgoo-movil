import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { colors, radii, spacing } from '@/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setError(undefined);
    if (!email.trim()) {
      setError('Ingresa tu correo institucional.');
      return;
    }
    setLoading(true);
    try {
      // Simulación de envío de enlace
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push('/verify-email');
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
          <AppHeader title="Recuperar contraseña" />

          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={48} color={colors.primary} />
          </View>

          <AppText variant="title" style={styles.title}>
            Recupera tu acceso
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>
            Te enviaremos un enlace seguro a tu correo institucional. Caduca en 15 minutos.
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
              error={error ? 'Correo requerido' : undefined}
              placeholder="20230184@utt.edu.mx"
            />
            <AppButton
              label="Enviar enlace"
              variant="primary"
              onPress={handleSend}
              loading={loading}
              style={styles.sendButton}
            />
          </Surface>

          <View style={styles.backRow}>
            <AppButton
              label="Volver a iniciar sesión"
              variant="outline"
              onPress={() => router.replace('/login')}
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
