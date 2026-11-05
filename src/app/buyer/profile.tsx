import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppHeader, AppText, Avatar, Screen, Surface } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { colors, radii, spacing } from '@/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleEditProfile = () => {
    // Placeholder - edit profile would be a separate screen
  };

  const handleLogout = () => {
    logout();
    router.replace('/welcome' as any);
  };

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <AppHeader title="Mi perfil" showBack />

      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <Avatar name={user?.fullName || 'Usuario'} uri={user?.avatar} size={88} />
          <View style={styles.profileInfo}>
            <AppText variant="title">{user?.fullName}</AppText>
            <AppText variant="body" color={colors.textMuted}>{user?.email}</AppText>
            <AppText variant="caption" color={colors.textSubtle}>
              Estudiante UTTT • {user?.studentId || 'N/A'}
            </AppText>
          </View>
        </View>

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
            style={styles.logoutButton}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  editButton: {
    marginTop: spacing.md,
  },
  settingsCard: {
    gap: 0,
  },
  settingsRow: {
    flexDirection: 'row',
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
