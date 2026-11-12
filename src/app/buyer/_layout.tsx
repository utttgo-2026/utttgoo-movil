import { Stack } from 'expo-router';
import React from 'react';

import { colors } from '@/theme';

// Ancla pública para entradas directas; no insertar auth como fallback de buyer.
export const unstable_settings = { anchor: '(tabs)' };
export { NavigationErrorBoundary as ErrorBoundary } from '@/components/navigation/NavigationErrorBoundary';

export default function BuyerLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, gestureEnabled: true }} />;
}
