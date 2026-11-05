import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Image, FlatList } from 'react-native';
import { Pressable, useWindowDimensions } from 'react-native';

import { AppButton, AppHeader, AppText, Badge, Screen, SectionHeader, Surface } from '@/components';
import { colors, fontSize, layout, radii, spacing, moderateScale } from '@/theme';
import { mockFoods } from '@/data/mock';
import type { FoodItem } from '@/types/models';

const foodImages: Record<string, string> = {
  'Torta de Milanesa': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&q=80',
  'Enchiladas Verdes': 'https://images.unsplash.com/photo-1559338353-b2e69999b91f?w=300&q=80',
  'Chilaquiles con Huevo': 'https://images.unsplash.com/photo-1543064986-ea913744d4f6?w=300&q=80',
  'Quesadillas de Hongos': 'https://images.unsplash.com/photo-1565299624964-b32404e929b4?w=300&q=80',
  'Agua de Horchata': 'https://images.unsplash.com/photo-1558559565-112b37e3e6e4?w=300&q=80',
  'Flan de Coco': 'https://images.unsplash.com/photo-1593498706210-9217b3403345?w=300&q=80',
  'Elote en Vaso': 'https://images.unsplash.com/photo-1531273447376-51a860cd7460?w=300&q=80',
  'Tacos de Canasta': 'https://images.unsplash.com/photo-1571003123884-3562798094b0?w=300&q=80',
};

export default function AvailableNowScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const availableFoods = mockFoods.filter((f) => f.availability === 'available');
  const CARD_WIDTH = (screenWidth - layout.screenPadding * 2 - spacing.md) / 2;
  const CARD_HEIGHT = moderateScale(280);

  const handleFoodPress = (food: FoodItem) => {
    router.push(`/buyer/food?foodId=${food.id}` as any);
  };

  const renderItem = ({ item }: { item: FoodItem }) => (
    <Pressable key={item.id} style={[styles.foodCard, { width: CARD_WIDTH, height: CARD_HEIGHT }]} onPress={() => handleFoodPress(item)}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: foodImages[item.name] || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&q=80' }}
          style={styles.foodImage}
          resizeMode="cover"
        />
        <View style={styles.gradientOverlay} />
        {item.isFavorite ? (
          <View style={styles.favoriteBadge}>
            <Ionicons name="heart" size={moderateScale(18)} color={colors.danger} />
          </View>
        ) : null}
      </View>
      <View style={styles.foodInfo}>
        <AppText variant="subtitle" numberOfLines={1} style={styles.foodName}>
          {item.name}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={2} style={styles.foodDesc}>
          {item.description}
        </AppText>
        <View style={styles.foodRow}>
          <AppText variant="bodyStrong" style={styles.price}>
            ${item.price}
          </AppText>
          <AppText variant="caption" color={colors.textSubtle}>
            {item.prepTimeMinutes} min
          </AppText>
          <Badge label={item.rating.toFixed(1)} tone="warning" />
        </View>
        <AppButton
          label="Agregar"
          variant="outline"
          size="sm"
          icon="cart-outline"
          onPress={() => handleFoodPress(item)}
          fullWidth={false}
        />
      </View>
    </Pressable>
  );

  return (
    <Screen backgroundColor={colors.background} padded={false}>
      <AppHeader title="Disponible ahora" showBack />

      <View style={styles.content}>
        <AppText variant="subtitle" style={styles.sectionTitle}>
          Listos para entregar
        </AppText>
        <AppText variant="caption" color={colors.textMuted} style={styles.subtitle}>
          Alimentos preparados y disponibles hoy
        </AppText>

        <FlatList
          data={availableFoods}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal={false}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
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
  sectionTitle: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  listContainer: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  foodCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '55%',
    position: 'relative',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  favoriteBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: radii.pill,
    backgroundColor: colors.textOnPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodInfo: {
    padding: spacing.md,
    flex: 1,
    justifyContent: 'space-between',
  },
  foodName: {
    marginBottom: spacing.xxs,
  },
  foodDesc: {
    marginBottom: spacing.sm,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
});