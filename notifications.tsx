import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import BottomNav from './components/BottomNav';
import { useAuth } from './context/AuthContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, markNotificationRead, markAllNotificationsRead, getUnreadCount } = useAuth();
  const unreadCount = getUnreadCount();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'vote': return { name: 'heart', color: COLORS.error };
      case 'elimination': return { name: 'trending-down', color: COLORS.error };
      case 'advance': return { name: 'trending-up', color: COLORS.success };
      case 'winner': return { name: 'trophy', color: COLORS.gold };
      default: return { name: 'notifications', color: COLORS.primary };
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllNotificationsRead}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Ionicons name="notifications" size={20} color={COLORS.primary} />
          <Text style={styles.unreadText}>{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const icon = getNotificationIcon(item.type);
          return (
            <TouchableOpacity 
              style={[styles.notifItem, !item.read && styles.notifUnread]}
              onPress={() => markNotificationRead(item.id)}
            >
              <View style={[styles.notifIcon, { backgroundColor: `${icon.color}20` }]}>
                <Ionicons name={icon.name as any} size={24} color={icon.color} />
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifMessage}>{item.message}</Text>
                <Text style={styles.notifTime}>{formatTime(item.timestamp)}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>You're all caught up!</Text>
          </View>
        }
      />

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  markAllRead: { color: COLORS.primary, fontWeight: '600' },
  unreadBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.backgroundCard, marginHorizontal: 20, padding: 12, borderRadius: 12, marginBottom: 16 },
  unreadText: { color: COLORS.textPrimary, fontWeight: '600' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12, marginBottom: 8 },
  notifUnread: { backgroundColor: 'rgba(139,92,246,0.1)', borderWidth: 1, borderColor: COLORS.primary },
  notifIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1, marginLeft: 12 },
  notifTitle: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
  notifMessage: { color: COLORS.textMuted, fontSize: 13, marginTop: 4, lineHeight: 20 },
  notifTime: { color: COLORS.textMuted, fontSize: 11, marginTop: 8 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16 },
  emptyText: { color: COLORS.textMuted, marginTop: 8 },
});
