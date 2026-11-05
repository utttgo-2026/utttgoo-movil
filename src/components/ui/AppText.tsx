import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { colors, fontFamily, fontSize, lineHeight } from '@/theme';

export type TextVariant =
  | 'hero'
  | 'display'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption'
  | 'overline'
  | 'link';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
}

const variantStyles: Record<TextVariant, TextStyle> = {
  hero: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.hero,
    lineHeight: lineHeight.hero,
    color: colors.text,
  },
  display: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    color: colors.text,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xxl,
    lineHeight: lineHeight.xxl,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    color: colors.text,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    color: colors.text,
  },
  bodyStrong: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    color: colors.text,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: colors.text,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    color: colors.textMuted,
  },
  overline: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xxs,
    lineHeight: lineHeight.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
  link: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: colors.primary,
  },
};

export function AppText({
  variant = 'body',
  color,
  align,
  style,
  children,
  ...rest
}: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[
        variantStyles[variant],
        color ? { color } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export const textStyles = StyleSheet.create({
  muted: { color: colors.textMuted },
  primary: { color: colors.primary },
  center: { textAlign: 'center' },
});
