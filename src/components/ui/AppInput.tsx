import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useState, type ComponentProps } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, fontFamily, fontSize, layout, radii, spacing } from '@/theme';

import { AppText } from './AppText';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface AppInputProps extends TextInputProps {
  label?: string;
  leftIcon?: IoniconName;
  rightIcon?: IoniconName;
  onRightIconPress?: () => void;
  error?: string;
  helper?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const AppInput = forwardRef<React.ComponentRef<typeof TextInput>, AppInputProps>(function AppInput(
  {
    label,
    leftIcon,
    rightIcon,
    onRightIconPress,
    error,
    helper,
    containerStyle,
    secureTextEntry,
    onFocus,
    onBlur,
    style,
    ...rest
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(Boolean(secureTextEntry));

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <AppText variant="label" style={styles.label}>{label}</AppText> : null}
      <View
        style={[
          styles.inputWrapper,
          focused ? styles.inputFocused : null,
          error ? styles.inputError : null,
        ]}
      >
        {leftIcon ? <Ionicons name={leftIcon} size={18} color={colors.textSubtle} /> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={secure}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, style]}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={secure ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            onPress={() => setSecure((value) => !value)}
            hitSlop={10}
          >
            <Ionicons
              name={secure ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textSubtle}
            />
          </Pressable>
        ) : rightIcon ? (
          <Pressable
            accessibilityRole="button"
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            hitSlop={10}
          >
            <Ionicons name={rightIcon} size={20} color={colors.textSubtle} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="caption" color={colors.danger} style={styles.helper}>
          {error}
        </AppText>
      ) : helper ? (
        <AppText variant="caption" style={styles.helper}>
          {helper}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textMuted,
  },
  inputWrapper: {
    minHeight: layout.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  helper: {
    paddingHorizontal: spacing.xs,
  },
});
