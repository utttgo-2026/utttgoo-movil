import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Pressable } from 'react-native';

import { AppButton, AppHeader, AppText, Screen } from '@/components';
import { colors, spacing } from '@/theme';
import { mockNotifications } from '@/data/mock';
import type { AppNotification } from '@/types/models';

export default function NotificationsScreen() {
  const router = useRouter();

  const handleNotificationPress = (notification: AppNotification) => {
    router.push('/buyer/orders' as any);
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <Pressable style={styles.notificationItem} onPress={() => handleNotificationPress(item)}>
      <View style={[styles.iconCircle, { backgroundColor: item.read ? colors.surfaceMuted : colors.primarySoft }]}>
        <Ionicons
          name={item.type === 'order' ? 'receipt-outline' : item.type === 'chat' ? 'chatbubble-outline' : 'information-circle-outline'}
          size={20}
          color={item.read ? colors.textMuted : colors.primary}
        />
      </View>
      <View style={styles.notificationInfo}>
        <AppText variant="body" style={[styles.title, !item.read && styles.titleUnread]}>
          {item.title}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} style={[styles.body, !item.read && styles.bodyUnread]}>
          {item.body}
        </AppText>
        <AppText variant="caption" color={colors.textSubtle} style={styles.time}>
          {new Date(item.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
        </AppText>
      </View>
      {!item.read && (
        <View style={styles.dot} />
      )}
    </Pressable>
  );

  return (
    <Screen backgroundColor={colors.background} padded={false} scroll>
      <AppHeader title="Notificaciones" showBack />

      <View style={styles.content}>
        {mockNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={48} color={colors.textMuted} />
            <AppText variant="subtitle" align="center" color={colors.textMuted}>
              Sin notificaciones
            </AppText>
            <AppText variant="caption" align="center" color={colors.textSubtle}>
              Cuando tengas novedades, aparecerán aquí
            </AppText>
          </View>
        ) : (
          <FlatList
            data={mockNotifications}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: spacing.xxl }}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationInfo: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
  titleUnread: {
    color: colors.text,
  },
  body: {
    marginTop: spacing.xs,
  },
  bodyUnread: {
    color: colors.text,
  },
  time: {
    marginTop: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.huge,
  },
});
