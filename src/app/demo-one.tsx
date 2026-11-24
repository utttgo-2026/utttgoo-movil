import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText, BrandLogo, Screen, Surface } from '@/components';
import { demoFoods } from '@/data/demo';
import { ROUTES } from '@/navigation/routes';
import { colors, radii, spacing } from '@/theme';
import { formatCurrency } from '@/utils/format';

export default function DemoOneScreen() {
  const router = useRouter();

  return (
    <Screen scroll padded={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <BrandLogo size="sm" />
          <View style={styles.guestBadge}>
            <Ionicons name="eye-outline" size={16} color={colors.primary} />
            <AppText variant="label" style={styles.guestText}>Invitado</AppText>
          </View>
        </View>
        <View style={styles.progressRow}>
          <AppText variant="caption" color={colors.textMuted}>Explora antes de pedir</AppText>
          <AppText variant="label" style={styles.progressText}>1/2</AppText>
        </View>
        <View style={styles.intro}>
          <AppText variant="title">¡Elige tu antojo favorito!</AppText>
          <AppText variant="body" color={colors.textMuted}>
            Mira opciones rápidas antes de continuar.
          </AppText>
        </View>
        <AppText variant="subtitle">Prueba un antojo</AppText>
        {demoFoods.map((food) => (
          <Surface key={food.id} bordered style={styles.foodCard}>
            <Image source={{ uri: food.image }} style={styles.foodImage} accessibilityLabel={`Imagen de ${food.name}`} />
            <View style={styles.foodInfo}>
              <AppText variant="subtitle">{food.name}</AppText>
              <AppText variant="caption" color={colors.textMuted}>{food.seller}</AppText>
              <AppText variant="subtitle" style={styles.price}>{formatCurrency(food.price)}</AppText>
            </View>
          </Surface>
        ))}
        <AppButton
          label="Ver torta de milanesa"
          icon="arrow-forward"
          iconPosition="right"
          onPress={() => router.push(ROUTES.demo.second)}
          style={styles.primaryButton}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Ir a iniciar sesión" onPress={() => router.push(ROUTES.auth.login)} style={styles.accountLink}>
          <AppText variant="label" style={styles.linkText}>Ya tengo cuenta</AppText>
        </Pressable>
        <AppText variant="caption" color={colors.textSubtle} align="center" style={styles.demoNote}>
          DEMO LOCAL · Estas opciones son ilustrativas y no requieren conexión.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  guestBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primarySoft, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill },
  guestText: { color: colors.primary },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressText: { color: colors.primary },
  intro: { gap: spacing.sm, marginTop: spacing.md },
  foodCard: { padding: 0, overflow: 'hidden', flexDirection: 'row' },
  foodImage: { width: 112, height: 112, backgroundColor: colors.surfaceMuted },
  foodInfo: { flex: 1, justifyContent: 'center', gap: spacing.xs, padding: spacing.md },
  price: { color: colors.primary, marginTop: spacing.xs },
  primaryButton: { marginTop: spacing.md },
  accountLink: { alignItems: 'center', padding: spacing.sm },
  linkText: { color: colors.primary },
  demoNote: { marginTop: spacing.md },
});
