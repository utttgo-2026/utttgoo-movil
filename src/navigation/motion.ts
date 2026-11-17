import { Easing } from 'react-native';
import type { NativeStackNavigationOptions } from 'expo-router/native-stack';

export const motion = { tab: 220, scene: 120, feedback: 140, pressIn: 80, pressOut: 120, easing: Easing.out(Easing.cubic) };
export function stackMotionOptions(reduced: boolean, routeName = ''): NativeStackNavigationOptions {
  return {
    animation: reduced ? 'none' : routeName.split('/').pop() === 'filters' ? 'slide_from_bottom' : 'slide_from_right',
    animationDuration: 220, // iOS timing hint; Android retains its native stack timing/interactive back.
    gestureEnabled: true,
  };
}
export function tabIndicatorX(width: number, index: number, count: number, horizontalInset: number, rtl = false): number {
  const safeCount = Math.max(1, count);
  const position = Math.max(0, Math.min(safeCount - 1, index));
  const visualIndex = rtl ? safeCount - 1 - position : position;
  return horizontalInset + Math.max(0, width - horizontalInset * 2) / safeCount * (visualIndex + 0.5) - 11;
}
