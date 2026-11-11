import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, AppHeader, BrandLogo, Screen, Surface } from '@/components';
import { demoOffers } from '@/data/demo';
import { colors, radii, spacing } from '@/theme';
import { formatCurrency } from '@/utils/format';

export default function DemoTwoScreen() {
  const router = useRouter();

  return (
    <Screen scroll padded={false}>
      <View style={styles.content}>
        <AppHeader title="UTTT-GO" right={<BrandLogo size="sm" />} />
        <View style={styles.guestRow}>
          <View style={styles.guestBadge}>
            <Ionicons name="eye-outline" size={16} color={colors.primary} />
            <AppText variant="label" style={styles.guestText}>Invitado</AppText>
          </View>
          <AppText variant="label" style={styles.progressText}>2/2</AppText>
        </View>
        <View style={styles.intro}>
          <AppText variant="title">También la vende</AppText>
          <AppText variant="body" color={colors.textMuted}>
            Compara opciones demo para descubrir cómo funcionarán las ofertas.
          </AppText>
        </View>
        <View style={styles.demoLabel}>
          <Ionicons name="flask-outline" size={16} color={colors.info} />
          <AppText variant="caption" color={colors.info}>DEMO LOCAL · Product / Offer</AppText>
        </View>
        <View style={styles.offers}>
          {demoOffers.map((offer) => (
            <Surface key={offer.id} bordered style={styles.offerCard}>
              <View style={styles.offerMain}>
                <View style={styles.sellerIcon}><Ionicons name="storefront-outline" size={22} color={colors.primary} /></View>
                <View style={styles.sellerInfo}>
                  <AppText variant="subtitle">{offer.seller}</AppText>
                  <AppText variant="caption" color={colors.textMuted}>{offer.comment}</AppText>
                </View>
                <View style={styles.rating}>
                  <Ionicons name="star" size={15} color={colors.warning} />
                  <AppText variant="label">{offer.rating.toFixed(1)}</AppText>
                </View>
              </View>
              <View style={styles.offerFooter}>
                <View style={styles.activeRow}>
                  <View style={styles.activeDot} />
                  <AppText variant="caption" style={styles.active}>Activo</AppText>
                </View>
                <AppText variant="subtitle" style={styles.price}>{formatCurrency(offer.price)}</AppText>
              </View>
            </Surface>
          ))}
        </View>
        <AppButton label="Continuar para pedir" icon="arrow-forward" iconPosition="right" onPress={() => router.push('/login')} style={styles.button} />
        <AppText variant="caption" color={colors.textSubtle} align="center">Para pedir necesitas iniciar sesión.</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl, gap: spacing.lg },
  guestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg },
  guestBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primarySoft, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill },
  guestText: { color: colors.primary },
  progressText: { color: colors.primary },
  intro: { paddingHorizontal: spacing.lg, gap: spacing.sm, marginTop: spacing.md },
  demoLabel: { marginHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.infoSoft, padding: spacing.sm, borderRadius: radii.sm },
  offers: { paddingHorizontal: spacing.lg, gap: spacing.md },
  offerCard: { gap: spacing.md },
  offerMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sellerIcon: { width: 42, height: 42, borderRadius: radii.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  sellerInfo: { flex: 1, gap: spacing.xs },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  offerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.sm },
  active: { color: colors.success },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success, marginRight: 4 },
  price: { color: colors.primary },
  button: { marginHorizontal: spacing.lg, marginTop: spacing.md },
});
