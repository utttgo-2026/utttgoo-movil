import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { AppButton, AppText, BrandLogo, Screen } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { colors, radii, spacing } from '@/theme';
import { useSafeBack } from '@/navigation/useSafeBack';

export default function WelcomeScreen() {
  const router = useRouter();
  useSafeBack();

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll constrained>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/foods/welcome-artwork-detail.jpg')}
          style={styles.heroImage}
          contentFit="cover"
          accessible accessibilityLabel="UTTT-GO: comida universitaria al alcance de todos"
        />

        <View style={styles.textBlock}>
          <AppText variant="display" style={styles.headline}>
            “Tu antojo, más cerca.”
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.subhead}>
            Descubre alimentos preparados por la comunidad, pide desde tu salón y recoge sin hacer fila.
          </AppText>
        </View>

        <View style={styles.features}>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="time-outline" size={22} color={colors.primary} accessible={false} />
            </View>
            <AppText variant="label">A tiempo</AppText>
          </View>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="location-outline" size={22} color={colors.primary} accessible={false} />
            </View>
            <AppText variant="label">En campus</AppText>
          </View>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="heart-outline" size={22} color={colors.primary} accessible={false} />
            </View>
            <AppText variant="label">Hecho cerca</AppText>
          </View>
        </View>

        <AppButton
          label="Iniciar sesión"
          variant="primary"
          onPress={() => router.push(ROUTES.auth.login)}
          style={styles.primaryButton}
        />
        <AppButton
          label="Crear cuenta"
          variant="outline"
          onPress={() => router.push(ROUTES.auth.register)}
          style={styles.secondaryButton}
        />
        <AppButton
          label="Seguir explorando"
          variant="ghost"
          onPress={() => {
            router.push(ROUTES.demo.first);
          }}
          style={styles.ghostButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    gap: spacing.xxl,
    justifyContent: 'flex-start',
  },
  heroImage: {
    width: '100%',
    aspectRatio: 1.27,
    borderRadius: radii.xxl,
    overflow: 'hidden',
  },
  textBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  headline: {
    textAlign: 'center',
  },
  subhead: {
    textAlign: 'center',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  featureCard: {
    flexGrow: 1,
    flexBasis: '28%',
    minWidth: 90,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    marginTop: spacing.lg,
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
  ghostButton: {
    marginTop: spacing.sm,
  },
});
