import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, Badge, Screen, Surface } from '@/components';
import { colors, spacing } from '@/theme';
import { mockOrders } from '@/data/mock';

import { usesMockCatalog } from '@/config/catalogSource';
import { AwsOrderReceipt } from '@/components/catalog/AwsOrderFlow';

export default function OrderCreatedScreen() { return usesMockCatalog() ? <MockOrderCreatedScreen /> : <AwsOrderReceipt />; }
function MockOrderCreatedScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  // Find the order by ID from query params, fallback to first order
  const orderId = id || 'order-1';
  const order = mockOrders.find((o) => o.id === orderId) || mockOrders[0];

  const handleTrackOrder = () => {
    router.push({ pathname: '/buyer/order-tracking', params: { orderId: order.id } });
  };

  const handleBackHome = () => {
    router.replace('/buyer');
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <View style={styles.content}>
        <AppText variant="caption">Demostración · Este pedido no es una compra real.</AppText>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
        </View>

        <AppText variant="display" align="center" style={styles.title}>
          ¡Pedido generado!
        </AppText>
        <AppText variant="body" align="center" color={colors.textMuted} style={styles.subtitle}>
          Tu pedido ha sido recibido y está en proceso.
        </AppText>

        <Surface style={styles.orderCard} bordered>
          <View style={styles.orderInfo}>
            <AppText variant="label">Número de pedido</AppText>
            <AppText variant="bodyStrong" style={styles.orderCode}>
              {order.code}
            </AppText>
          </View>
          <View style={styles.orderInfo}>
            <AppText variant="label">Estado</AppText>
            <Badge label={order.status === 'delivered' ? 'Entregado' : order.status === 'preparing' ? 'En preparación' : order.status === 'ready' ? 'Listo' : order.status === 'pending' ? 'Pendiente' : 'Cancelado'} tone={order.status === 'delivered' || order.status === 'ready' ? 'success' : order.status === 'preparing' ? 'warning' : order.status === 'cancelled' ? 'danger' : 'info'} />
          </View>
          <View style={styles.orderInfo}>
            <AppText variant="label">Método de pago</AppText>
            <AppText variant="bodyStrong" style={styles.orderTotal}>
              Efectivo
            </AppText>
          </View>
          <View style={styles.orderInfo}>
            <AppText variant="label">Total</AppText>
            <AppText variant="bodyStrong" style={styles.orderTotal}>
              ${order.total.toFixed(2)}
            </AppText>
          </View>
          <View style={styles.orderInfo}>
            <AppText variant="label">Tiempo estimado</AppText>
            <AppText variant="body">30 min</AppText>
          </View>
        </Surface>

        <AppText variant="subtitle" align="center" style={styles.qrTitle}>
          Código QR para la entrega
        </AppText>
        <AppText variant="caption" align="center" color={colors.textMuted} style={styles.qrSubtitle}>
          Los pedidos de demostración no permiten entregar alimentos.
        </AppText>

        <Surface style={styles.qrContainer} bordered={false} backgroundColor={colors.background}>
          <Ionicons name="qr-code-outline" size={64} color={colors.textMuted} />
        </Surface>

        <AppText variant="caption" align="center" color={colors.textSubtle} style={styles.qrCodeText}>
          {order.code}
        </AppText>

        <AppText variant="subtitle" align="center" style={styles.nextSectionTitle}>
          ¿Qué quieres hacer ahora?
        </AppText>

        <View style={styles.actions}>
          <AppButton
            label="Rastrear pedido"
            variant="primary"
            onPress={handleTrackOrder}
            style={styles.trackButton}
          />
          <AppButton
            label="Volver al inicio"
            variant="outline"
            onPress={handleBackHome}
            style={styles.backButton}
          />
        </View>

        <AppText variant="caption" align="center" color={colors.textSubtle} style={styles.footer}>
          Puedes ver el estado de tu pedido en {'"'}Mis pedidos{' "'}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  title: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  orderCard: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  orderCode: {
    color: colors.primary,
    fontWeight: '700',
  },
  orderTotal: {
    color: colors.primary,
    fontWeight: '700',
  },
  nextSectionTitle: {
    marginTop: spacing.lg,
  },
  qrTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  qrSubtitle: {
    marginBottom: spacing.lg,
  },
  qrContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  qrCodeText: {
    marginTop: spacing.sm,
    fontFamily: 'monospace',
  },
  actions: {
    gap: spacing.md,
    width: '100%',
  },
  trackButton: {},
  backButton: {},
  footer: {
    marginTop: spacing.lg,
  },
});
