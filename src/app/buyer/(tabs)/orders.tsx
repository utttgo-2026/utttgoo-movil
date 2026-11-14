import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Pressable } from 'react-native';

import { AppButton, AppHeader, AppText, Badge, Screen, SectionHeader, Surface } from '@/components';
import { colors, fontSize, layout, radii, spacing } from '@/theme';
import { RequireSession } from '@/components/navigation/RequireSession';
import { mockOrders, getOrderStatusLabel, getOrderStatusColor } from '@/data/mock';
import type { Order } from '@/types/models';

function OrdersContent() {
  const router = useRouter();

  const handleOrderPress = (order: Order) => {
    router.push({ pathname: '/buyer/order-tracking', params: { orderId: order.id } });
  };

  const renderItem = ({ item }: { item: Order }) => (
    <Pressable key={item.id} style={styles.orderCard} onPress={() => handleOrderPress(item)}>
      <View style={styles.orderHeader}>
        <View style={styles.orderCodeBox}>
          <AppText variant="bodyStrong">{item.code}</AppText>
        </View>
        <Badge label={getOrderStatusLabel(item.status)} tone="info" />
      </View>
      <View style={styles.orderItems}>
        {item.items.map((i) => (
          <View key={i.foodId} style={styles.orderItemRow}>
            <AppText variant="body">{i.name}</AppText>
            <AppText variant="bodyStrong">x{i.quantity}</AppText>
          </View>
        ))}
      </View>
      <View style={styles.orderFooter}>
        <AppText variant="bodyStrong">{`$${item.total}`}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {new Date(item.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
        </AppText>
      </View>
    </Pressable>
  );

  return (
    <Screen backgroundColor={colors.background} padded={false} edges={['top']}>
      <AppHeader title="Mis pedidos" showBack={false} />

      <View style={styles.content}>
        {mockOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
            <AppText variant="subtitle" align="center" color={colors.textMuted}>
              No tienes pedidos
            </AppText>
            <AppText variant="caption" align="center" color={colors.textSubtle}>
              Realiza tu primera orden desde el inicio
            </AppText>
          </View>
        ) : (
          <FlatList
            testID="orders-list"
            style={{ flex: 1 }}
            data={mockOrders}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: layout.screenPadding, paddingBottom: spacing.xxl }}
          />
        )}
      </View>
    </Screen>
  );
}

export default function OrdersScreen() {
  return <RequireSession title="Mis pedidos" inTabs><OrdersContent /></RequireSession>;
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: spacing.xl,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  orderCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  orderItems: {
    gap: spacing.xs,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.huge,
  },
});
