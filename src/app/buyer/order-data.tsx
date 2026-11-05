import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { useCart } from '@/context/CartContext';
import { colors, fontSize, layout, radii, spacing } from '@/theme';
import { formatCurrency } from '@/utils/format';

export default function OrderDataScreen() {
  const router = useRouter();
  const { items, itemCount, subtotal, clearCart } = useCart();

  const serviceFee = 10;
  const total = subtotal + serviceFee;

  const handleContinue = () => {
    router.push('/buyer/confirm-order' as any);
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
                <View style={styles.orderItemImage}>
                  <Ionicons name="restaurant-outline" size={24} color={colors.textMuted} />
                </View>
                <View style={styles.orderItemInfo}>
                  <AppText variant="subtitle" numberOfLines={1}>
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
          <AppInput
            label="Tarjeta universitaria"
            leftIcon="card-outline"
            value=""
            editable={false}
            placeholder="···· ···· ···· 1234"
          />
        </View>

        <AppButton
          label="Continuar con el pago"
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
    justifyContent: 'space-between',
  },
  summaryRowTotal: {
    flexDirection: 'row',
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
  continueButton: {
    marginTop: spacing.xl,
  },
});
