import { Ionicons } from '@expo/vector-icons';
import { BottomTabBar, type BottomTabBarProps } from 'expo-router/js-tabs';
import React, { createContext, useContext, useState, type ComponentProps } from 'react';
import { Animated, I18nManager, StyleSheet, View } from 'react-native';
import { useMotionValue } from '@/hooks/useMotion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion, tabIndicatorX } from '@/navigation/motion';
import { colors } from '@/theme';

type TabName = 'index' | 'search' | 'orders' | 'notifications' | 'profile';
interface TabVisualState {
  progress: Record<TabName, Animated.Value>;
  index: number;
  count: number;
  insets: BottomTabBarProps['insets'];
  reduced: boolean;
}
const TabMotionContext = createContext<TabVisualState | null>(null);
const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

/** Decorates the SDK's bar, preserving its buttons, links, selected state, events and navigation. */
export function AnimatedBuyerTabBar(props: BottomTabBarProps) {
  const reduced = useReducedMotion();
  const active = props.state.routes[props.state.index].name;
  const index = useMotionValue(active === 'index' ? 1 : 0, motion.tab, reduced);
  const search = useMotionValue(active === 'search' ? 1 : 0, motion.tab, reduced);
  const orders = useMotionValue(active === 'orders' ? 1 : 0, motion.tab, reduced);
  const notifications = useMotionValue(active === 'notifications' ? 1 : 0, motion.tab, reduced);
  const profile = useMotionValue(active === 'profile' ? 1 : 0, motion.tab, reduced);
  return <TabMotionContext.Provider value={{ progress: { index, search, orders, notifications, profile },
    index: props.state.index, count: props.state.routes.length, insets: props.insets, reduced }}>
    <BottomTabBar {...props} />
  </TabMotionContext.Provider>;
}

export function AnimatedTabIcon({ tab, name, size }: { tab: TabName; name: ComponentProps<typeof Ionicons>['name']; size: number }) {
  const visual = useContext(TabMotionContext);
  if (!visual) return <Ionicons name={name} size={size} color={colors.textMuted} />;
  const progress = visual.progress[tab];
  // SDK renders focused/unfocused glyph variants; both consume the REAL selection's shared progress.
  return <Animated.View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={{ width: size, height: size, transform: [
      { scale: visual.reduced ? 1 : progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
      { translateY: visual.reduced ? 0 : progress.interpolate({ inputRange: [0, 1], outputRange: [0, -2.5] }) },
    ] }}>
    <AnimatedIonicons name={name} size={size} style={{ color: progress.interpolate({ inputRange: [0, 1], outputRange: [colors.textMuted, colors.primary] }) }} />
  </Animated.View>;
}

export function SlidingTabBackground() {
  const visual = useContext(TabMotionContext);
  const [width, setWidth] = useState(0);
  return <View testID="buyer-tab-background" pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}>
    {visual && width > 0 ? <TabIndicator width={width} visual={visual} /> : null}
  </View>;
}
function TabIndicator({ width, visual }: { width: number; visual: TabVisualState }) {
  const target = tabIndicatorX(width, visual.index, visual.count, Math.max(visual.insets.left, visual.insets.right), I18nManager.isRTL);
  const x = useMotionValue(target, motion.tab, visual.reduced);
  return <Animated.View testID="active-tab-indicator" style={{ position: 'absolute', left: 0, bottom: visual.insets.bottom + 5,
    width: 22, height: 2, borderRadius: 1, backgroundColor: colors.primary, transform: [{ translateX: x }] }} />;
}
