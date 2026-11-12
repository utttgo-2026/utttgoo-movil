import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppText, Avatar, Screen, Surface } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { colors, layout, spacing } from '@/theme';
import { RequireSession } from '@/components/navigation/RequireSession';

function ProfileContent() {
  const router = useRouter();
  const { user, logout, isAuthenticated, refreshProfile, sessionError } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string>();

  useEffect(() => {
    if (isAuthenticated) void refreshProfile();
  }, [isAuthenticated, refreshProfile]);

  const handleEditProfile = () => {
    Alert.alert('Editar perfil', 'El servicio de actualización está preparado. Su conexión requiere HTTPS y el contrato JSON de perfil.');
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError(undefined);
    const result = await logout();
    setLoggingOut(false);
    if (result.success) router.replace('/welcome');
    else setLogoutError(result.error);
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll edges={['top']}>
      <AppHeader title="Mi perfil" showBack={false} />

      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <Avatar name={user?.fullName || 'Usuario'} uri={user?.avatar} size={88} />
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
  logoutContainer: {
    marginTop: spacing.xl,
  },
  logoutButton: {},
});
