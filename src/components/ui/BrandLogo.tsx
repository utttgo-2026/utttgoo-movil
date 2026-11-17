import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fontFamily, radii } from '@/theme';

import { AppText } from './AppText';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  style?: StyleProp<ViewStyle>;
}

const sizes = {
  sm: { mark: 28, gap: 8, text: 18, icon: 16 },
  md: { mark: 38, gap: 10, text: 24, icon: 22 },
  lg: { mark: 54, gap: 14, text: 34, icon: 30 },
} as const;

export function BrandLogo({ size = 'md', showTagline = false, style }: BrandLogoProps) {
  const scale = sizes[size];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <View
          style={[
            styles.mark,
            {
              width: scale.mark,
              height: scale.mark,
              borderRadius: Math.max(radii.sm, scale.mark * 0.26),
            },
          ]}
        >
          <Ionicons name="restaurant" size={scale.icon} color={colors.textOnPrimary} />
        </View>
        <AppText
          style={[
            styles.wordmark,
            {
              fontSize: scale.text,
              lineHeight: scale.text * 1.15,
            },
          ]}
        >
          UTTT-GO
        </AppText>
      </View>
      {showTagline ? (
        <AppText variant="label" color={colors.textMuted} style={styles.tagline}>
          Del campus a tus manos.
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '100%',
    alignItems: 'center',
    gap: 10,
  },
  mark: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    flexShrink: 1,
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    color: colors.primary,
    letterSpacing: 0.2,
  },
  tagline: {
    letterSpacing: 0.1,
  },
});
