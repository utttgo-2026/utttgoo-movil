import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppText, LoadingState, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { spacing } from '@/theme';

export function RequireSession({ children, title = 'Inicia sesión para continuar', inTabs = false }: {
  children: React.ReactNode;
  title?: string;
  inTabs?: boolean;
}) {
  const { isAuthenticated, status } = useAuth();
  const router = useRouter();
  if (status === 'restoring') {
    return <Screen edges={inTabs ? ['top'] : ['top', 'bottom']}><LoadingState /></Screen>;
  }
  if (isAuthenticated) return <>{children}</>;
  return (
    <Screen padded={false} edges={inTabs ? ['top'] : ['top', 'bottom']}>
      <AppHeader title={title} showBack={!inTabs} />
      <View style={styles.content}>
        <AppText variant="title">Exploras como invitado</AppText>
        <AppText>Para consultar información personal o realizar un pedido necesitas una sesión validada.</AppText>
        <AppButton label="Iniciar sesión" onPress={() => router.push('/login')} />
        <AppButton label="Seguir explorando" variant="outline" onPress={() => router.navigate('/buyer')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ content: { padding: spacing.xl, gap: spacing.lg } });
