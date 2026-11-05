import { useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

import { AppButton, AppText, BrandLogo, Screen } from '@/components';
import { colors, radii, spacing } from '@/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <View style={styles.content}>
        <BrandLogo size="md" />

        <ImageBackground
          source={require('../../assets/images/welcome-hero.png')}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
            <View style={styles.logoBadge}>
              <AppText variant="label" style={styles.badgeText}>
                UTTT-GO
              </AppText>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.textBlock}>
          <AppText variant="display" style={styles.headline}>
            Comida universitaria al alcance de todos
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.subhead}>
            Descubre, apoya y disfruta lo mejor del campus.
          </AppText>
        </View>

        <View style={styles.features}>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <AppText variant="body" style={styles.featureIconText}>
                ⏱️
              </AppText>
            </View>
            <AppText variant="label">A tiempo</AppText>
          </View>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <AppText variant="body" style={styles.featureIconText}>
                📍
              </AppText>
            </View>
            <AppText variant="label">En campus</AppText>
          </View>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <AppText variant="body" style={styles.featureIconText}>
                ❤️
              </AppText>
            </View>
            <AppText variant="label">Hecho cerca</AppText>
          </View>
        </View>

        <AppButton
          label="Iniciar sesión"
          variant="primary"
          onPress={() => router.push('/login')}
          style={styles.primaryButton}
        />
        <AppButton
          label="Crear cuenta"
          variant="outline"
          onPress={() => router.push('/register')}
          style={styles.secondaryButton}
        />
        <AppButton
          label="Seguir explorando"
          variant="ghost"
          onPress={() => {
            // navegar como invitado al home comprador
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
    gap: spacing.xxl,
    justifyContent: 'flex-start',
  },
  heroImage: {
    width: '100%',
    height: 320,
    borderRadius: radii.xxl,
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    alignItems: 'flex-start',
    zIndex: 1,
  },
  logoBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.textOnPrimary,
    fontWeight: '700',
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
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  featureCard: {
    flex: 1,
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
  featureIconText: {
    fontSize: 24,
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
