import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppHeader, AppText, Screen, Surface } from '@/components';
import { spacing } from '@/theme';

export default function SellerProductsScreen() {
  const router = useRouter();
  return <Screen scroll constrained header={<AppHeader title="Mis alimentos" backFallback="/seller" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      <Surface bordered style={{ gap: spacing.md }}>
        <AppText variant="subtitle">Catálogo del vendedor pendiente de integración</AppText>
        <AppText>El catálogo público ya existe. El filtro sellerId/listado privado y el DTO de producto siguen pendientes. No es una lista vacía obtenida de AWS ni se muestran productos publicados ficticios.</AppText>
      </Surface>
      <AppButton label="Agregar alimento (preparación)" onPress={() => router.push('/seller/product-draft')} />
      <AppText>Publicar, editar, ocultar, retirar o cambiar disponibilidad de productos reales requiere autorización y endpoints backend confirmados.</AppText>
      <AppButton label="Publicar productos" disabled />
    </View>
  </Screen>;
}
