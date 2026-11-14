import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { AppButton, AppHeader, AppText, Badge, Screen, Surface } from '@/components';
import { colors, fontSize, layout, radii, spacing } from '@/theme';
import { formatCurrency } from '@/utils/format';
import { mockOrders } from '@/data/mock';

export default function OrderCreatedScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  // Find the order by ID from query params, fallback to first order
  const orderId = id || 'order-1';
  const order = mockOrders.find((o) => o.id === orderId) || mockOrders[0];

  const qrPayload = order.qrPayload || JSON.stringify({
    orderId: order.id,
    code: order.code,
    buyerId: order.buyerId,
    sellerId: order.sellerId,
    timestamp: order.createdAt,
    status: order.status,
  });

  const handleTrackOrder = () => {
    router.push({ pathname: '/buyer/order-tracking', params: { orderId: order.id } });
  };

  const handleBackHome = () => {
    router.replace('/buyer');
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <View style={styles.content}>
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
          Muestra este QR al vendedor al recibir tu pedido
        </AppText>

        <Surface style={styles.qrContainer} bordered={false} backgroundColor={colors.background}>
          <QRCode
            value={qrPayload}
            size={200}
            color={colors.text}
            backgroundColor={colors.background}
            getRef={(ref) => { /* QRCode ref */ }}
          />
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
