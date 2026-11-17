import { usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

import { AppButton, AppHeader, AppText, Screen } from '@/components/ui';
import { recordNavigation } from '@/navigation/diagnostics';
import { spacing } from '@/theme';

export default function NotFoundScreen() {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => { recordNavigation('route_not_found', pathname); }, [pathname]);
  return (
    <Screen padded={false}>
      <AppHeader title="Página no encontrada" backFallback="/buyer" />
      <View style={{ padding: spacing.xl, gap: spacing.lg }}>
        <AppText>Esta ruta no existe. Puedes regresar al catálogo público.</AppText>
        <AppButton label="Ir al catálogo" onPress={() => router.replace('/buyer')} />
      </View>
    </Screen>
  );
}
