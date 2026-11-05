import React from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fontFamily, fontSize, radii } from '@/theme';

import { AppText } from './AppText';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function Avatar({ name, uri, size = 48, backgroundColor = colors.primarySoft, style }: AvatarProps) {
  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: Math.min(size / 2, radii.pill),
          backgroundColor,
        },
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <AppText
          style={[
            styles.initials,
            { fontSize: Math.max(fontSize.xs, size * 0.34) },
          ]}
        >
          {initials(name)}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontFamily: fontFamily.semibold,
    color: colors.primary,
  },
});
