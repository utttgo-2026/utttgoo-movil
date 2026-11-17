import { Stack } from 'expo-router';
import React from 'react';

import { RequireSession } from '@/components/navigation/RequireSession';
import { colors } from '@/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { stackMotionOptions } from '@/navigation/motion';

export default function PrivateBuyerLayout() {
  const reduced = useReducedMotion();
  return (
    <RequireSession>
      <Stack screenOptions={({ route }) => ({ ...stackMotionOptions(reduced, route.name), headerShown: false, contentStyle: { backgroundColor: colors.background } })} />
    </RequireSession>
  );
}
