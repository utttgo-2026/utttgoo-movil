import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppText, Screen, Surface } from '@/components';
import { colors, radii, spacing } from '@/theme';
import { navigateBack } from '@/navigation/buyerRoutes';

export default function RateOrderScreen() {
  const router = useRouter();
  const [rating, setRating] = useState(0);

  const stars = [5, 4, 3, 2, 1];

  const handleSubmit = () => {
    if (rating === 0) {
      return;
    }
    router.push('/buyer/order-created');
  };

  const handleBack = () => {
    navigateBack(router, '/buyer/orders');
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <AppHeader title="Calificar pedido" onBack={handleBack} backFallback="/buyer/orders" />

      <View style={styles.content}>
        <AppText variant="title" style={styles.title}>
          ¿Cómo estuvo tu comida?
        </AppText>
        <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>
          Tu opinión ayuda a los vendedores a mejorar.
        </AppText>

        <Surface style={styles.starsCard} bordered>
          <AppText variant="label" style={styles.starsLabel}>
            Calificación general
          </AppText>
          <View style={styles.starsRow}>
            {stars.map((star) => (
              <Ionicons
                key={star}
                name={star <= rating ? 'star' : 'star-outline'}
                size={36}
                color={star <= rating ? colors.warning : colors.border}
                onPress={() => setRating(star)}
                hitSlop={20}
              />
            ))}
          </View>
          {rating > 0 ? (
            <AppText variant="caption" color={colors.textMuted} style={styles.ratingText}>
              {rating} estrella{rating > 1 ? 's' : ''}
            </AppText>
          ) : null}
        </Surface>

        <View style={styles.commentRow}>
          <AppText variant="label">Comentario (opcional)</AppText>
        </View>
        <View style={styles.commentInputContainer}>
          <View style={styles.commentInput}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSubtle} />
          </View>
        </View>

        <AppButton
          label="Enviar calificación"
          variant="primary"
          onPress={handleSubmit}
          disabled={rating === 0}
          style={styles.submitButton}
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
  title: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  starsCard: {
    gap: spacing.md,
  },
  starsLabel: {
    marginBottom: spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  ratingText: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  commentRow: {
    marginTop: spacing.sm,
  },
  commentInputContainer: {
    marginTop: spacing.sm,
  },
  commentInput: {
    height: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
});
