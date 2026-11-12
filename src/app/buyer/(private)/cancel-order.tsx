import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppText, Screen, Surface } from '@/components';
import { colors, radii, spacing } from '@/theme';
import { navigateBack } from '@/navigation/buyerRoutes';

export default function CancelOrderScreen() {
  const router = useRouter();

  const handleConfirmCancel = () => {
    router.push('/buyer/orders');
  };

  const handleBack = () => {
    navigateBack(router, '/buyer/orders');
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <AppHeader title="Cancelar pedido" onBack={handleBack} backFallback="/buyer/orders" />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="alert-circle" size={48} color={colors.danger} />
        </View>

        <AppText variant="title" align="center" style={styles.title}>
          ¿Cancelar este pedido?
        </AppText>
        <AppText variant="body" align="center" color={colors.textMuted} style={styles.subtitle}>
          El pedido se cancelará y no se podrá recuperar. ¿Estás seguro?
        </AppText>

        <Surface style={styles.reasonCard} bordered>
          <AppText variant="label">Motivo de cancelación</AppText>
          <View style={styles.reasonOptions}>
            <View style={styles.reasonOption}>
              <Ionicons name="radio-button-off" size={20} color={colors.textSubtle} />
              <AppText variant="body">Tiempo de entrega demasiado largo</AppText>
            </View>
            <View style={styles.reasonOption}>
              <Ionicons name="radio-button-off" size={20} color={colors.textSubtle} />
              <AppText variant="body">Cambié de opinión</AppText>
            </View>
            <View style={styles.reasonOption}>
              <Ionicons name="radio-button-off" size={20} color={colors.textSubtle} />
              <AppText variant="body">Problema con el pago</AppText>
            </View>
          </View>
        </Surface>

        <AppButton
          label="Sí, cancelar pedido"
          variant="danger"
          onPress={handleConfirmCancel}
          style={styles.cancelButton}
        />
        <AppButton
          label="No, continuar"
          variant="outline"
          onPress={handleBack}
          style={styles.continueButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  title: {
    marginTop: spacing.md,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  reasonCard: {
    gap: spacing.md,
  },
  reasonOptions: {
    gap: spacing.md,
  },
  reasonOption: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelButton: {
    marginTop: spacing.xl,
  },
  continueButton: {
    marginTop: spacing.sm,
  },
});
