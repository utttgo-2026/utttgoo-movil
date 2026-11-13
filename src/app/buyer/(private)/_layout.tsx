import { Stack } from 'expo-router';
import React from 'react';

import { RequireSession } from '@/components/navigation/RequireSession';
import { colors } from '@/theme';

export default function PrivateBuyerLayout() {
  return (
    <RequireSession>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, gestureEnabled: true }} />
    </RequireSession>
  );
}
