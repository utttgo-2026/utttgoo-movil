import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { colors } from '@/theme';

export default function BuyerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      <Stack.Screen name="filters" />
      <Stack.Screen name="available-now" />
      <Stack.Screen name="category" />
      <Stack.Screen name="food" />
      <Stack.Screen name="order-data" />
      <Stack.Screen name="confirm-order" />
      <Stack.Screen name="order-created" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="order-tracking" />
      <Stack.Screen name="rate-order" />
      <Stack.Screen name="cancel-order" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
