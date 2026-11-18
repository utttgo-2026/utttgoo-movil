import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { AppText, Badge, Surface } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';

/** UI017 presentation only. Intentionally has no payload/scanner API until a secure backend DTO exists. */
export function DeliveryQrCard({ orderId }: { orderId: string }) {
  return <Surface bordered style={{ gap: spacing.md }}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
      <AppText variant="subtitle">Código QR de entrega</AppText><Badge label="No disponible" tone="warning" />
    </View>
    <View accessible accessibilityRole="image" accessibilityLabel="Credencial QR pendiente del backend"
      style={{ width: 180, maxWidth: '100%', aspectRatio: 1, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surfaceMuted }}>
      <Ionicons name="lock-closed-outline" size={40} color={colors.textMuted} accessible={false} />
    </View>
    <AppText variant="bodyStrong" align="center">Pedido {orderId}</AppText>
    <AppText variant="caption" align="center">La credencial segura y su validación están pendientes del backend. Este identificador no es un código QR de entrega.</AppText>
  </Surface>;
}
