import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { ARTISTS } from './data/artists';
import BottomNav from './components/BottomNav';
import { useApp } from './context/AppContext';

export default function MessagesScreen() {
  const router = useRouter();
  const { messages, following } = useApp();
  const [search, setSearch] = useState('');

  const followedArtists = ARTISTS.filter(a => following.includes(a.id));
  const filteredArtists = followedArtists.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  const getLastMessage = (artistId: string) => {
    const artistMessages = messages.filter(m => m.senderId === artistId || m.receiverId === artistId);
    return artistMessages[artistMessages.length - 1];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity onPress={() => router.push('/videochat')}>
          <Ionicons name="videocam" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <TextInput style={styles.searchInput} placeholder="Search conversations..." placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
      </View>

      <ScrollView style={styles.chatList} contentContainerStyle={styles.chatContent}>
        {filteredArtists.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={60} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Conversations</Text>
            <Text style={styles.emptyText}>Follow artists to start messaging them</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/artists')}>
              <Text style={styles.browseBtnText}>Browse Artists</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredArtists.map(artist => {
            const lastMsg = getLastMessage(artist.id);
            return (
              <TouchableOpacity key={artist.id} style={styles.chatItem} onPress={() => router.push(`/chat/${artist.id}`)}>
                <Image source={{ uri: artist.image }} style={styles.avatar} />
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{artist.name}</Text>
                    {artist.verified && <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />}
                  </View>
                  <Text style={styles.lastMessage} numberOfLines={1}>{lastMsg?.text || 'Start a conversation'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.textPrimary },
  chatList: { flex: 1 },
  chatContent: { padding: 20, paddingBottom: 100 },
  chatItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 16, marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  chatInfo: { flex: 1, marginLeft: 12 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chatName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  lastMessage: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textMuted, marginTop: 8 },
  browseBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, marginTop: 20 },
  browseBtnText: { color: COLORS.textPrimary, fontWeight: '600' },
});
