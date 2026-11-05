import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandLogo, Screen } from '@/components';
import { colors, radii, spacing } from '@/theme';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll={false}>
      <View style={styles.container}>
        <BrandLogo size="lg" showTagline />
        <View style={styles.divider} />
      </View>
      <View style={styles.university}>
        <View style={styles.universityTextContainer}>
          <View style={styles.universityLine} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 48,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
  },
  university: {
    position: 'absolute',
    bottom: spacing.xxl,
    width: '100%',
    alignItems: 'center',
  },
  universityTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  universityLine: {
    width: 32,
    height: 2,
    backgroundColor: colors.textMuted,
    borderRadius: radii.pill,
  },
});
