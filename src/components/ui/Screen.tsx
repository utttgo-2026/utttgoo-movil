import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, layout } from '@/theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  backgroundColor?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  header?: React.ReactNode;
  constrained?: boolean;
}

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'bottom'],
  backgroundColor = colors.background,
  contentContainerStyle,
  style,
  keyboardShouldPersistTaps = 'handled',
  header,
  constrained = false,
}: ScreenProps) {
  return (
    <SafeAreaView edges={Array.from(new Set<Edge>([...edges, 'left', 'right']))} style={[styles.safeArea, { backgroundColor }, style]}>
      {header}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            padded ? styles.paddedContent : null,
            constrained && styles.constrained,
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}
          style={styles.viewport}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.viewport, padded ? styles.paddedContent : null, constrained && styles.constrained, contentContainerStyle]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  viewport: {
    flex: 1,
  },
  paddedContent: {
    paddingHorizontal: layout.screenPadding,
  },
  constrained: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' },
});
