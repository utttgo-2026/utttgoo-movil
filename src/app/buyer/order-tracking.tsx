import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppText, Badge, Screen, Surface } from '@/components';
import { colors, fontSize, layout, radii, spacing } from '@/theme';
import { mockOrders, getOrderStatusLabel, getOrderStatusColor } from '@/data/mock';

export default function OrderTrackingScreen() {
  const router = useRouter();

  const order = mockOrders[0];

  const statusSteps = [
    { label: 'Pendiente', completed: true, time: '10:30 AM' },
    { label: 'En preparación', completed: true, time: '10:35 AM' },
    { label: 'Listo', completed: false, time: '11:00 AM' },
    { label: 'Entregado', completed: false, time: '--:--' },
  ];

  const handleBack = () => {
    router.back();
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <AppHeader title="Seguimiento de pedido" showBack={false} onBack={handleBack} />

      <View style={styles.content}>
        <AppText variant="title" style={styles.title}>
          Pedido {order?.code}
        </AppText>
        <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>
          Estado actual: {getOrderStatusLabel(order?.status || 'pending')}
        </AppText>

        <Surface style={styles.timelineCard} bordered>
          {statusSteps.map((step, index) => (
            <View key={step.label} style={styles.stepRow}>
              <View style={[styles.stepCircle, step.completed && styles.stepCircleCompleted]}>
                {step.completed ? (
                  <Ionicons name="checkmark" size={16} color={colors.textOnPrimary} />
                ) : (
                  <AppText variant="caption" color={colors.textSubtle}>
                    {index + 1}
                  </AppText>
                )}
              </View>
              <View style={styles.stepLineContainer}>
                <View style={[styles.stepLineContainer, index < statusSteps.length - 1 && styles.lineCompleted]} />
              </View>
              <View style={styles.stepInfo}>
                <AppText variant="body" style={[styles.stepLabel, step.completed && styles.stepLabelCompleted]}>
                  {step.label}
                </AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {step.time}
                </AppText>
              </View>
            </View>
          ))}
        </Surface>

        <Surface style={styles.detailCard} bordered>
          <View style={styles.detailRow}>
            <AppText variant="label">Vendedor</AppText>
            <AppText variant="body">Ana Sofía Ramírez</AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText variant="label">Lugar de entrega</AppText>
            <AppText variant="body">Puerta 3 - Edificio A</AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText variant="label">Método de pago</AppText>
            <AppText variant="body">Tarjeta universitaria</AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText variant="label">Total</AppText>
            <AppText variant="bodyStrong">$118.00</AppText>
          </View>
        </Surface>

        {order?.status === 'preparing' || order?.status === 'pending' ? (
          <AppButton
            label="Cancelar pedido"
            variant="danger"
            onPress={() => router.push('/buyer/cancel-order' as any)}
            style={styles.cancelButton}
          />
        ) : null}
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
  timelineCard: {
    gap: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  stepCircleCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepLineContainer: {
    width: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  lineCompleted: {
    backgroundColor: colors.success,
  },
  stepInfo: {
    flex: 1,
  },
  stepLabel: {
    color: colors.textMuted,
  },
  stepLabelCompleted: {
    color: colors.text,
    fontWeight: '600',
  },
  detailCard: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cancelButton: {
    marginTop: spacing.xl,
  },
});
