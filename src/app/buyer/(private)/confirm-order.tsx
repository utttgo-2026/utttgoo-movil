import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppText, Badge, Screen, Surface } from '@/components';
import { useCart } from '@/context/CartContext';
import { FoodImage } from '@/components/catalog/FoodImage';
import { colors, fontSize, layout, radii, spacing } from '@/theme';
import { formatCurrency } from '@/utils/format';

export default function ConfirmOrderScreen() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const serviceFee = 10;
  const total = subtotal + serviceFee;

  const handleConfirm = () => {
    // Simulate order creation
    router.push('/buyer/order-created');
    clearCart();
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <AppHeader title="Confirmar pedido" showBack />

      <View style={styles.content}>
        <AppText variant="title" style={styles.title}>
          Confirma tu orden
        </AppText>
        <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>
          Revisa los detalles antes de enviar tu pedido al vendedor.
        </AppText>

        <Surface style={styles.orderCard} bordered>
          <View style={styles.orderHeader}>
            <AppText variant="subtitle">Pedido #UTTT-1005</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              Hoy • {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </AppText>
          </View>
          <View style={styles.orderItems}>
            {items.map((item) => (
              <View key={item.food.id} style={styles.orderItemRow}>
                <FoodImage foodId={item.food.id} name={item.food.name} variant="thumbnail" style={styles.orderItemImage} />
                <View style={styles.orderItemQty}>
                  <AppText variant="bodyStrong">x{item.quantity}</AppText>
                </View>
                <View style={styles.orderItemInfo}>
                  <AppText variant="body">{item.food.name}</AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    ${item.food.price} c/u
                  </AppText>
                </View>
                <AppText variant="bodyStrong">
                  {formatCurrency(item.food.price * item.quantity)}
                </AppText>
              </View>
            ))}
          </View>
          <View style={styles.orderDivider} />
          <View style={styles.summaryRow}>
            <AppText variant="body">Subtotal</AppText>
            <AppText variant="bodyStrong">{formatCurrency(subtotal)}</AppText>
          </View>
          <View style={styles.summaryRow}>
            <AppText variant="body">Servicio</AppText>
            <AppText variant="bodyStrong">{formatCurrency(serviceFee)}</AppText>
          </View>
          <View style={styles.summaryRowTotal}>
            <AppText variant="subtitle">Total a pagar</AppText>
            <AppText variant="display" style={styles.totalPrice}>
              {formatCurrency(total)}
            </AppText>
          </View>
        </Surface>

        <View style={styles.paymentMethodCard}>
          <View style={styles.paymentMethodIcon}>
            <Ionicons name="cash-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.paymentMethodInfo}>
            <AppText variant="label">Método de pago</AppText>
            <AppText variant="bodyStrong" color={colors.text}>
              Efectivo
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              Pago al recibir el pedido
            </AppText>
          </View>
        </View>

        <View style={styles.sellerInfo}>
          <View style={styles.sellerRow}>
            <AppText variant="label">Vendedor</AppText>
            <AppText variant="body">Ana Sofía Ramírez</AppText>
          </View>
          <View style={styles.sellerRow}>
            <AppText variant="label">Lugar de entrega</AppText>
            <AppText variant="body">Puerta 3 - Edificio A</AppText>
          </View>
          <View style={styles.sellerRow}>
            <AppText variant="label">Tiempo estimado</AppText>
            <AppText variant="body">25-35 min</AppText>
          </View>
        </View>

        <View style={styles.notesRow}>
          <AppText variant="label">Notas para el vendedor</AppText>
          <View style={styles.notesInput}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.textSubtle} />
          </View>
        </View>

        <AppButton
          label="Confirmar pedido"
          variant="primary"
          onPress={handleConfirm}
          style={styles.confirmButton}
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
  orderCard: {
    gap: spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  orderItems: {
    gap: spacing.sm,
  },
  orderItemRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  orderItemInfo: {
    flex: 1,
    minWidth: 80,
  },
  orderItemImage: { width: 48, borderRadius: radii.md },
  orderItemQty: {
    width: 40,
    textAlign: 'right',
  },
  orderDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
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
  sellerInfo: {
    gap: spacing.sm,
  },
  sellerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  notesRow: {
    gap: spacing.md,
  },
  notesInput: {
    height: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  confirmButton: {
    marginTop: spacing.xl,
  },
});
