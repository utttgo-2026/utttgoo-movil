import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppInput, AppText, Badge, Screen, SectionHeader, Surface } from '@/components';
import { useCart } from '@/context/CartContext';
import { colors, fontSize, layout, radii, spacing } from '@/theme';
import { formatCurrency } from '@/utils/format';
import { mockFoods } from '@/data/mock';
import type { FoodItem } from '@/types/models';
import { FoodImage } from '@/components/catalog/FoodImage';

export default function FoodDetailScreen() {
  const router = useRouter();
  const { addItem, itemCount } = useCart();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);

  const food = mockFoods.find((f) => f.id === id);

  if (!food) {
    return (
      <Screen backgroundColor={colors.background} padded>
        <AppHeader title="Detalle no disponible" backFallback="/buyer" />
        <AppText variant="title" align="center">Alimento no encontrado</AppText>
      </Screen>
    );
  }

  const handleAddToCart = () => {
    addItem(food, quantity);
    router.push('/buyer/order-data');
  };

  const handleFavorite = () => {
    // Toggle favorite (mock)
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <AppHeader title={food.name} showBack />

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <FoodImage foodId={food.id} name={food.name} variant="detail" style={styles.image} />
          {food.isFavorite ? (
            <View style={styles.favoriteBadge}>
              <Ionicons name="heart" size={24} color={colors.danger} />
            </View>
          ) : null}
        </View>

        <AppText variant="title">{food.name}</AppText>
        <AppText variant="bodyStrong">{food.sellerName || 'Vendedor'}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {food.prepTimeMinutes} min • {food.tags.join(' • ')}
        </AppText>

        <Surface style={styles.descriptionCard} bordered>
          <AppText variant="label">Descripción</AppText>
          <AppText variant="body" style={styles.descriptionText}>
            {food.description}
          </AppText>
        </Surface>

        <View style={styles.stockRow}>
          <AppText variant="label">Disponibilidad</AppText>
          <Badge
            label={food.availability === 'available' ? 'Disponible' : 'Agotado'}
            tone={food.availability === 'available' ? 'success' : 'danger'}
          />
          <AppText variant="caption" color={colors.textMuted}>
            {food.stock} disponibles
          </AppText>
        </View>

        <View style={styles.quantityRow}>
          <AppText variant="label">Cantidad</AppText>
          <View style={styles.quantityControls}>
            <AppButton
              label="−"
              variant="outline"
              size="sm"
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              fullWidth={false}
            />
            <AppText variant="title" style={styles.quantityValue}>
              {quantity}
            </AppText>
            <AppButton
              label="+"
              variant="outline"
              size="sm"
              onPress={() => setQuantity((q) => q + 1)}
              fullWidth={false}
            />
          </View>
        </View>

        <View style={styles.priceRow}>
          <AppText variant="label">Total</AppText>
          <AppText variant="display" style={styles.totalPrice}>
            {formatCurrency(food.price * quantity)}
          </AppText>
        </View>

        <AppButton
          label="Agregar al pedido"
          variant="primary"
          onPress={handleAddToCart}
          disabled={food.availability !== 'available'}
          style={styles.addButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.6,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: spacing.lg,
  },
  image: { width: '100%', borderRadius: radii.xxl },
  favoriteBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.textOnPrimary,
    borderRadius: radii.pill,
    padding: spacing.md,
  },
  descriptionCard: {
    gap: spacing.md,
  },
  descriptionText: {
    lineHeight: 24,
  },
  stockRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quantityValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  addButton: {
    marginTop: spacing.xl,
  },
});
