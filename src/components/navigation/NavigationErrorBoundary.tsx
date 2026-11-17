import { usePathname, useRouter, type ErrorBoundaryProps } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/ui';
import { recordNavigation } from '@/navigation/diagnostics';
import { spacing } from '@/theme';

export function NavigationErrorBoundary({ retry }: ErrorBoundaryProps) {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => { recordNavigation('execution_error', pathname); }, [pathname]);
  return (
    <View style={styles.container}>
      <AppText variant="title">No se pudo mostrar esta pantalla</AppText>
      <AppText>Ocurrió un error de ejecución. Puedes reintentar o regresar al catálogo.</AppText>
      <AppButton label="Reintentar" onPress={retry} />
      <AppButton label="Ir al catálogo" variant="outline" onPress={() => router.replace('/buyer')} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.lg } });
