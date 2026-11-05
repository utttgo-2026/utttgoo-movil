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
}: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor }, style]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            padded ? styles.paddedContent : null,
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, padded ? styles.paddedContent : null, contentContainerStyle]}>
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
  paddedContent: {
    paddingHorizontal: layout.screenPadding,
  },
});
