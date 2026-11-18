import { Stack } from 'expo-router';
import React from 'react';

import { colors } from '@/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { stackMotionOptions } from '@/navigation/motion';

// Ancla pública para entradas directas; no insertar auth como fallback de buyer.
export const unstable_settings = { anchor: '(tabs)' };
export { NavigationErrorBoundary as ErrorBoundary } from '@/components/navigation/NavigationErrorBoundary';

export default function BuyerLayout() {
  const reduced = useReducedMotion();
  return <Stack screenOptions={({ route }) => ({ ...stackMotionOptions(reduced, route.name), headerShown: false, contentStyle: { backgroundColor: colors.background } })} />;
}
