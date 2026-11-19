import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppText, Avatar, Screen, Surface } from '@/components';
import { legalUrls } from '@/config/legal';
import { useAuth } from '@/context/AuthContext';
import { colors, layout, spacing } from '@/theme';
import { RequireSession } from '@/components/navigation/RequireSession';

function ProfileContent() {
  const router = useRouter();
  const { user, logout, sessionError } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string>();

  const handleEditProfile = () => {
    Alert.alert('Editar perfil', 'Los datos del perfil ya se consultan en AWS. La pantalla de edición aún no está implementada.');
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError(undefined);
    const result = await logout();
    setLoggingOut(false);
    if (result.success) router.replace('/welcome');
    else setLogoutError(result.error);
  };

  const openLegalDocument = async (url: string, title: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      Alert.alert(title, 'No fue posible abrir el documento. Intenta nuevamente más tarde.');
    }
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll edges={['top']}>
      <AppHeader title="Mi perfil" showBack={false} />

      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <Avatar name={user?.fullName || 'Usuario'} uri={user?.avatar ?? undefined} size={88} />
          <View style={styles.profileInfo}>
            <AppText variant="title">{user?.fullName ?? 'Invitado'}</AppText>
            <AppText variant="body" color={colors.textMuted}>{user?.email}</AppText>
            <AppText variant="caption" color={colors.textSubtle}>
              Estudiante UTTT • {user?.studentId || 'N/A'}
            </AppText>
          </View>
        </View>

        {logoutError || sessionError ? (
          <AppText variant="caption" color={colors.danger}>{logoutError ?? sessionError}</AppText>
        ) : null}

        <AppButton
          label="Editar perfil"
          variant="outline"
          onPress={handleEditProfile}
          style={styles.editButton}
        />
        <AppButton label="Quiero vender" variant="outline" onPress={() => router.push('/seller')} />

        <Surface style={styles.settingsCard} bordered>
          <View style={styles.settingsRow}>
            <Ionicons name="card-outline" size={20} color={colors.textMuted} />
            <AppText variant="body">Tarjeta universitaria</AppText>
            <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
          </View>
          <View style={styles.settingsRow}>
            <Ionicons name="location-outline" size={20} color={colors.textMuted} />
            <AppText variant="body">Dirección de entrega</AppText>
            <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
          </View>
          <View style={styles.settingsRow}>
            <Ionicons name="notifications-outline" size={20} color={colors.textMuted} />
            <AppText variant="body">Notificaciones</AppText>
            <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
          </View>
          <View style={styles.settingsRow}>
            <Ionicons name="help-outline" size={20} color={colors.textMuted} />
            <AppText variant="body">Ayuda y soporte</AppText>
            <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
          </View>
        </Surface>

        <Surface style={styles.legalCard} bordered>
          <AppText variant="subtitle">Privacidad y seguridad</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            Consulta cómo se usan tus datos y cómo solicitar la eliminación de tu cuenta.
          </AppText>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Abrir política de privacidad"
            onPress={() => void openLegalDocument(legalUrls.privacy, 'Política de privacidad')}
            style={styles.legalRow}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <AppText variant="body" color={colors.primary} style={styles.legalLabel}>Política de privacidad</AppText>
            <Ionicons name="open-outline" size={16} color={colors.primary} />
          </Pressable>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Abrir eliminación de cuenta"
            onPress={() => void openLegalDocument(legalUrls.accountDeletion, 'Eliminación de cuenta')}
            style={styles.legalRow}
          >
            <Ionicons name="trash-outline" size={20} color={colors.primary} />
            <AppText variant="body" color={colors.primary} style={styles.legalLabel}>Eliminar cuenta y datos</AppText>
            <Ionicons name="open-outline" size={16} color={colors.primary} />
          </Pressable>
        </Surface>

        <View style={styles.logoutContainer}>
          <AppButton
            label="Cerrar sesión"
            variant="danger"
            onPress={handleLogout}
            loading={loggingOut}
            style={styles.logoutButton}
          />
        </View>
      </View>
    </Screen>
  );
}

export default function ProfileScreen() {
  return <RequireSession title="Mi perfil" inTabs><ProfileContent /></RequireSession>;
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  profileHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  profileInfo: {
    flex: 1,
    minWidth: 160,
  },
  editButton: {
    marginTop: spacing.md,
  },
  settingsCard: {
    gap: 0,
  },
  settingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  legalCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  legalLabel: {
    flex: 1,
  },
  logoutContainer: {
    marginTop: spacing.xl,
  },
  logoutButton: {},
});
