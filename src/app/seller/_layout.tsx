import React from 'react';
import { Stack } from 'expo-router';
import { RequireSession } from '@/components/navigation/RequireSession';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { stackMotionOptions } from '@/navigation/motion';

export default function SellerLayout() {
  const reduced = useReducedMotion();
  return <RequireSession title="Perfil vendedor"><Stack screenOptions={({ route }) => ({ ...stackMotionOptions(reduced, route.name), headerShown: false })} /></RequireSession>;
}
