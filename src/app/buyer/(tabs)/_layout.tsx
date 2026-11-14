import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { type ComponentProps } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { colors } from '@/theme';
import { getTabBarHeight } from '@/hooks/useResponsive';

const icon = (name: ComponentProps<typeof Ionicons>['name']) =>
  function TabIcon({ focused, size }: { focused: boolean; size: number }) {
    return <Ionicons name={name} color={focused ? colors.primary : colors.textMuted} size={size} />;
  };

export default function BuyerTabs() {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  return (
    <Tabs backBehavior="history" screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { height: getTabBarHeight(fontScale, insets.bottom), paddingBottom: insets.bottom, paddingTop: 5, backgroundColor: colors.background },
      tabBarLabel: ({ children, focused }) => (
        <View style={styles.label}>
          <AppText variant="caption" style={{ textAlign: 'center', flexShrink: 1 }} color={focused ? colors.primary : colors.textMuted}>{children}</AppText>
          <View style={[styles.indicator, { backgroundColor: focused ? colors.primary : colors.transparent }]} />
        </View>
      ),
    }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: icon('home-outline') }} />
      <Tabs.Screen name="search" options={{ title: 'Buscar', tabBarIcon: icon('search-outline') }} />
      <Tabs.Screen name="orders" options={{ title: 'Pedidos', tabBarIcon: icon('bag-handle-outline') }} />
      <Tabs.Screen name="notifications" options={{ title: 'Avisos', tabBarIcon: icon('notifications-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: icon('person-outline') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({ label: { alignItems: 'center', maxWidth: '100%', flexShrink: 1 }, indicator: { width: 22, height: 2, borderRadius: 1, marginTop: 2 } });
