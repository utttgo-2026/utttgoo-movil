import { Ionicons } from '@expo/vector-icons';
import React, { type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fontFamily, fontSize, layout, radii, spacing } from '@/theme';

import { AppText } from './AppText';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IoniconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { minHeight: 38, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  md: { minHeight: 44, paddingHorizontal: spacing.lg, paddingVertical: 10 },
  lg: { minHeight: layout.buttonHeight, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const iconColor = variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textOnPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={size === 'sm' ? 5 : undefined}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        fullWidth ? styles.fullWidth : null,
        variantStyles[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
        <View style={[styles.content, loading && styles.reserved]}>
          {icon && iconPosition === 'left' ? (
            <Ionicons name={icon} size={18} color={iconColor} />
          ) : null}
          <AppText
            variant="label"
            style={[styles.label, size === 'sm' && styles.compactLabel, variant === 'outline' || variant === 'ghost' ? styles.labelOutline : null]}
          >
            {label}
          </AppText>
          {icon && iconPosition === 'right' ? (
            <Ionicons name={icon} size={18} color={iconColor} />
          ) : null}
        </View>
      {loading ? <View pointerEvents="none" style={styles.spinner}><ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textOnPrimary} /></View> : null}
    </Pressable>
  );
}

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  secondary: { backgroundColor: colors.primarySoft },
  outline: { backgroundColor: colors.transparent, borderWidth: 1, borderColor: colors.primary },
  ghost: { backgroundColor: colors.transparent },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    maxWidth: '100%',
    minWidth: 0,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    lineHeight: 24,
    flexShrink: 1,
    textAlign: 'center',
    color: colors.textOnPrimary,
  },
  labelOutline: {
    color: colors.primary,
  },
  compactLabel: { fontSize: fontSize.sm, lineHeight: 18 },
  reserved: { opacity: 0 },
  spinner: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.45,
  },
});
