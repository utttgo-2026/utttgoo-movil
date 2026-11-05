import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppText, Badge, Screen, Surface } from '@/components';
import { colors, fontSize, layout, radii, spacing } from '@/theme';
import { formatCurrency } from '@/utils/format';

export default function OrderCreatedScreen() {
  const router = useRouter();

  const handleTrackOrder = () => {
    router.push('/buyer/order-tracking' as any);
  };

  const handleBackHome = () => {
    router.replace('/buyer' as any);
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
              UTTT-1005
            </AppText>
          </View>
          <View style={styles.orderInfo}>
            <AppText variant="label">Estado</AppText>
            <Badge label="Pendiente" tone="warning" />
          </View>
          <View style={styles.orderInfo}>
            <AppText variant="label">Total</AppText>
            <AppText variant="bodyStrong" style={styles.orderTotal}>
              $118.00
            </AppText>
          </View>
          <View style={styles.orderInfo}>
            <AppText variant="label">Tiempo estimado</AppText>
            <AppText variant="body">30 min</AppText>
          </View>
        </Surface>

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
          Puedes ver el estado de tu pedido en "Mis pedidos"
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
