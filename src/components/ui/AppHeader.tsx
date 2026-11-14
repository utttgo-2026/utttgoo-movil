import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, layout, spacing } from '@/theme';
import { useSafeBack } from '@/navigation/useSafeBack';

import { AppText } from './AppText';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  backFallback?: Href;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderBottom?: boolean;
}

export function AppHeader({
  title,
  showBack = true,
  onBack,
  backFallback,
  right,
  style,
  borderBottom = true,
}: AppHeaderProps) {
  const goBack = useSafeBack(backFallback);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    goBack();
  };

  return (
    <View style={[styles.container, borderBottom ? styles.border : null, style]}>
        {showBack ? <View style={styles.side}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={handleBack}
            hitSlop={8}
            style={({ pressed }) => [styles.backButton, pressed ? styles.pressed : null]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
      </View> : null}
      <AppText variant="subtitle" style={styles.title}>
        {title ?? ''}
      </AppText>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    marginLeft: -8,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  title: {
    flex: 1,
    flexShrink: 1,
    textAlign: 'left',
  },
});
