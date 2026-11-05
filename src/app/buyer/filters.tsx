import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppText, Badge, Screen, SectionHeader, Surface } from '@/components';
import { colors, radii, spacing } from '@/theme';
import { mockFoods } from '@/data/mock';

export default function FiltersScreen() {
  const router = useRouter();

  const handleApply = () => {
    router.push('/buyer/available-now' as any);
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <AppHeader title="Filtros" showBack />

      <View style={styles.content}>
        <Surface style={styles.filterCard} bordered>
          <SectionHeader title="Disponibilidad" />

          <View style={styles.filterOption}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
            <AppText variant="body">Disponible ahora</AppText>
          </View>
          <View style={styles.filterOption}>
            <Ionicons name="stop-circle-outline" size={20} color={colors.danger} />
            <AppText variant="body">Agotado</AppText>
          </View>

          <SectionHeader title="Rango de precios" />

          <View style={styles.priceRange}>
            <AppText variant="caption" color={colors.textMuted}>
              $20 - $150
            </AppText>
          </View>

          <SectionHeader title="Tiempo de preparación" />

          <View style={styles.filterOption}>
            <Ionicons name="flash-outline" size={20} color={colors.warning} />
            <AppText variant="body">Rápido (menos de 15 min)</AppText>
          </View>
          <View style={styles.filterOption}>
            <Ionicons name="time-outline" size={20} color={colors.info} />
            <AppText variant="body">Estándar (15-30 min)</AppText>
          </View>
        </Surface>

        <View style={styles.actions}>
          <AppButton
            label="Limpiar filtros"
            variant="outline"
            onPress={() => {}}
            style={styles.clearButton}
          />
          <AppButton
            label="Aplicar filtros"
            variant="primary"
            onPress={handleApply}
            style={styles.applyButton}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  filterCard: {
    gap: spacing.md,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  priceRange: {
    paddingVertical: spacing.sm,
  },
  actions: {
    gap: spacing.md,
  },
  clearButton: {},
  applyButton: {},
});
