import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppText, Screen, Surface } from '@/components';
import { useCart } from '@/context/CartContext';
import { FoodImage } from '@/components/catalog/FoodImage';
import { colors, fontSize, layout, radii, spacing } from '@/theme';
import { formatCurrency } from '@/utils/format';

export default function OrderDataScreen() {
  const router = useRouter();
  const { items, itemCount, subtotal, clearCart } = useCart();

  const serviceFee = 10;
  const total = subtotal + serviceFee;

  const handleContinue = () => {
    router.push('/buyer/confirm-order');
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <AppHeader title="Datos del pedido" showBack />

      <View style={styles.content}>
        <AppText variant="title" style={styles.title}>
          Revisa tu pedido
        </AppText>
        <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>
          Confirma los alimentos y datos antes de continuar.
        </AppText>

        <Surface style={styles.itemsCard} bordered>
          <AppText variant="label">Alimentos seleccionados</AppText>
          {items.length === 0 ? (
            <AppText variant="body" color={colors.textMuted} style={styles.emptyItems}>
              No hay alimentos en tu pedido
            </AppText>
          ) : (
            items.map((item) => (
              <View key={item.food.id} style={styles.orderItem}>
                <FoodImage foodId={item.food.id} name={item.food.name} variant="thumbnail" style={styles.orderItemImage} />
                <View style={styles.orderItemInfo}>
                  <AppText variant="subtitle">
                    {item.food.name}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    ${item.food.price} c/u
                  </AppText>
                </View>
                <View style={styles.orderItemQty}>
                  <AppText variant="bodyStrong">x{item.quantity}</AppText>
                </View>
              </View>
            ))
          )}
        </Surface>

        <Surface style={styles.summaryCard} bordered>
          <View style={styles.summaryRow}>
            <AppText variant="body">Subtotal</AppText>
            <AppText variant="bodyStrong">{formatCurrency(subtotal)}</AppText>
          </View>
          <View style={styles.summaryRow}>
            <AppText variant="body">Costo de servicio</AppText>
            <AppText variant="bodyStrong">{formatCurrency(serviceFee)}</AppText>
          </View>
          <View style={styles.summaryRowTotal}>
            <AppText variant="subtitle">Total</AppText>
            <AppText variant="display" style={styles.totalPrice}>
              {formatCurrency(total)}
            </AppText>
          </View>
        </Surface>

        <View style={styles.paymentRow}>
          <AppText variant="label">Método de pago</AppText>
          <View style={styles.paymentMethodCard}>
            <View style={styles.paymentMethodIcon}>
              <Ionicons name="cash-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.paymentMethodInfo}>
              <AppText variant="bodyStrong" color={colors.text}>
                Efectivo
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>
                Pago al recibir el pedido
              </AppText>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          </View>
        </View>

        <AppButton
          label="Continuar"
          variant="primary"
          onPress={handleContinue}
          disabled={items.length === 0}
          style={styles.continueButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  itemsCard: {
    gap: spacing.md,
  },
  emptyItems: {
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  orderItemImage: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemQty: {},
  summaryCard: {
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  summaryRowTotal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  totalPrice: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  paymentRow: {
    gap: spacing.md,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentMethodIcon: {
    padding: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  continueButton: {
    marginTop: spacing.xl,
  },
});
