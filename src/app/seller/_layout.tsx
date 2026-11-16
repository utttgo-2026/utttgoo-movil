import React from 'react';
import { Stack } from 'expo-router';
import { RequireSession } from '@/components/navigation/RequireSession';

export default function SellerLayout() {
  return <RequireSession title="Perfil vendedor"><Stack screenOptions={{ headerShown: false }} /></RequireSession>;
}
