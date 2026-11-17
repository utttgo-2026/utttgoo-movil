import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { AppText } from './AppText';

export type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
}

const tones: Record<BadgeTone, { background: string; text: string }> = {
  primary: { background: colors.primarySoft, text: colors.primary },
  success: { background: colors.successSoft, text: colors.success },
  warning: { background: colors.warningSoft, text: colors.warning },
  danger: { background: colors.dangerSoft, text: colors.danger },
  info: { background: colors.infoSoft, text: colors.info },
  neutral: { background: colors.surfaceMuted, text: colors.textMuted },
};

export function Badge({ label, tone = 'neutral', style }: BadgeProps) {
  const palette = tones[tone];
  return (
    <View style={[styles.base, { backgroundColor: palette.background }, style]}>
      <AppText variant="label" style={[styles.label, { color: palette.text }]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    maxWidth: '100%',
    flexShrink: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    lineHeight: 16,
    flexShrink: 1,
  },
});
