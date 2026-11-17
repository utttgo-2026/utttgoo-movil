import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';

export function FilterChip({ label, selected = false, disabled = false, onPress }: { label: string; selected?: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onPress} hitSlop={7}
      style={[styles.chip, selected && styles.selected]}>
      <AppText variant="label" style={{ flexShrink: 1, textAlign: 'center' }} color={selected ? colors.textOnPrimary : colors.textMuted}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { minHeight: 34, maxWidth: '100%', flexShrink: 1, justifyContent: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
});
