import React, { type ReactNode } from 'react';
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { usePressMotion } from '@/hooks/useMotion';

type Props = Omit<PressableProps, 'style' | 'children'> & { style?: StyleProp<ViewStyle>; children: ReactNode };
/** Keep native hit area/layout and callbacks; only the visual content responds to touch. */
export function MotionPressable({ children, disabled, onPressIn, onPressOut, ...props }: Props) {
  const press = usePressMotion(!!disabled);
  return <Pressable {...props} disabled={disabled}
    onPressIn={(event) => { press.onPressIn(); onPressIn?.(event); }}
    onPressOut={(event) => { press.onPressOut(); onPressOut?.(event); }}>
    <Animated.View style={press.style}>{children}</Animated.View>
  </Pressable>;
}
