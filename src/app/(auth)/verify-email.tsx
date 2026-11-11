import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppText, Screen, Surface } from '@/components';
import { colors, radii, spacing } from '@/theme';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const registeredEmail = typeof email === 'string' ? email : 'tu correo institucional';

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
            Enviamos un enlace de confirmación a tu correo institucional. Abre el mensaje para completar tu registro en UTTT-GO.
          </AppText>
        </View>
        <Surface style={styles.card} bordered>
          <AppText variant="label" color={colors.textMuted}>Correo utilizado</AppText>
          <AppText variant="subtitle" style={styles.email}>{registeredEmail}</AppText>
          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <AppText variant="caption" color={colors.textMuted} style={styles.noticeText}>
              La verificación se completa desde el enlace enviado por Supabase. No necesitas introducir un token.
            </AppText>
          </View>
        </Surface>
        <AppButton label="Ir a iniciar sesión" onPress={() => router.push('/login')} style={styles.button} />
        <AppText variant="caption" color={colors.textSubtle} align="center" style={styles.resendNote}>
          Si no recibiste el correo, revisa spam o solicita el reenvío desde el canal institucional habilitado.
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
  button: { marginTop: spacing.md },
  resendNote: { marginTop: spacing.sm },
});
