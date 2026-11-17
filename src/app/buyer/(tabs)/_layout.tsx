import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { colors } from '@/theme';
import { getTabBarHeight } from '@/hooks/useResponsive';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AnimatedBuyerTabBar, AnimatedTabIcon, SlidingTabBackground } from '@/components/navigation/AnimatedBuyerTabBar';
import { motion } from '@/navigation/motion';

const icon = (tab: React.ComponentProps<typeof AnimatedTabIcon>['tab'], name: React.ComponentProps<typeof AnimatedTabIcon>['name']) =>
  function TabIcon({ size }: { size: number }) {
    return <AnimatedTabIcon tab={tab} name={name} size={size} />;
  };
const renderTabBar = (props: React.ComponentProps<typeof AnimatedBuyerTabBar>) => <AnimatedBuyerTabBar {...props} />;
const renderTabBackground = () => <SlidingTabBackground />;

export default function BuyerTabs() {
  const insets = useSafeAreaInsets();
  const { fontScale, width } = useWindowDimensions();
  const reduced = useReducedMotion();
  return (
    <Tabs backBehavior="history" tabBar={renderTabBar} screenOptions={{
      headerShown: false,
      animation: reduced ? 'none' : 'fade',
      transitionSpec: { animation: 'timing', config: { duration: motion.scene, easing: motion.easing } },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { height: getTabBarHeight(fontScale, insets.bottom, width - 2 * Math.max(insets.left, insets.right)), paddingBottom: insets.bottom, paddingTop: 5, backgroundColor: colors.background },
      tabBarLabelPosition: 'below-icon',
      tabBarAllowFontScaling: true,
      tabBarBackground: renderTabBackground,
      tabBarLabel: ({ children, focused }) => (
        <View style={styles.label}>
          <AppText variant="caption" style={{ textAlign: 'center', flexShrink: 1 }} color={focused ? colors.primary : colors.textMuted}>{children}</AppText>
          <View style={styles.indicatorSlot} />
        </View>
      ),
    }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarAccessibilityLabel: 'Inicio', tabBarButtonTestID: 'tab-index', tabBarIcon: icon('index', 'home-outline') }} />
      <Tabs.Screen name="search" options={{ title: 'Buscar', tabBarAccessibilityLabel: 'Buscar', tabBarButtonTestID: 'tab-search', tabBarIcon: icon('search', 'search-outline') }} />
      <Tabs.Screen name="orders" options={{ title: 'Pedidos', tabBarAccessibilityLabel: 'Pedidos', tabBarButtonTestID: 'tab-orders', tabBarIcon: icon('orders', 'bag-handle-outline') }} />
      <Tabs.Screen name="notifications" options={{ title: 'Avisos', tabBarAccessibilityLabel: 'Avisos', tabBarButtonTestID: 'tab-notifications', tabBarIcon: icon('notifications', 'notifications-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarAccessibilityLabel: 'Perfil', tabBarButtonTestID: 'tab-profile', tabBarIcon: icon('profile', 'person-outline') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({ label: { alignItems: 'center', maxWidth: '100%', flexShrink: 1 }, indicatorSlot: { height: 4 } });
