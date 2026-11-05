import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, shadows, spacing } from '@/theme';

interface SurfaceProps {
  children: React.ReactNode;
  padded?: boolean;
  elevated?: boolean;
  bordered?: boolean;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function Surface({
  children,
  padded = true,
  elevated = false,
  bordered = true,
  backgroundColor = colors.surface,
  style,
}: SurfaceProps) {
  return (
    <View
      style={[
        styles.base,
        padded ? styles.padded : null,
        bordered ? styles.bordered : null,
        elevated ? shadows.card : null,
        { backgroundColor },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
