import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, BrandLogo, Screen, SectionHeader } from '@/components/ui';
import { ResponsiveFoodGrid } from '@/components/catalog/ResponsiveFoodGrid';
import { useAuth } from '@/context/AuthContext';
import { mockFoods } from '@/data/mock';
import { foodDetailRoute } from '@/navigation/buyerRoutes';
import { useSafeBack } from '@/navigation/useSafeBack';
import { colors, layout, spacing } from '@/theme';

export default function BuyerHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  useSafeBack();
  const foods = mockFoods.filter((food) => food.availability === 'available');
  return (
    <Screen padded={false} edges={['top']}>
      <View style={styles.header}>
        <BrandLogo size="sm" />
        <AppText variant="bodyStrong" style={styles.greeting}>{user ? `Hola, ${user.fullName.split(' ')[0]}` : 'Invitado'}</AppText>
        <Pressable accessibilityRole="button" accessibilityLabel="Ver avisos" onPress={() => router.navigate('/buyer/notifications')} hitSlop={8}>
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
        </Pressable>
      </View>
      <ResponsiveFoodGrid
        testID="home-products"
        foods={foods}
        header={(
          <Pressable accessibilityRole="button" accessibilityLabel="Ver disponibles" onPress={() => router.push('/buyer/available-now')}>
            <SectionHeader title="Disponible ahora" />
          </Pressable>
        )}
        onFoodPress={(food) => router.push(foodDetailRoute(food.id))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  greeting: { flex: 1, flexShrink: 1 },
  list: { flex: 1 },
  content: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.xxl, gap: spacing.md },
  columns: { gap: spacing.md },
});
