import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';
import { useApp } from './context/AppContext';

export default function PlaylistsScreen() {
  const router = useRouter();
  const { playlist, removeFromPlaylist, playTrack, favorites } = useApp();

  const handleRemove = (trackId: string, title: string) => {
    Alert.alert('Remove Track', `Remove "${title}" from playlist?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromPlaylist(trackId) }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Playlist</Text>
        <TouchableOpacity>
          <Ionicons name="shuffle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{playlist.length}</Text>
          <Text style={styles.statLabel}>Tracks</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
      </View>

      {playlist.length > 0 && (
        <TouchableOpacity style={styles.playAllBtn} onPress={() => playlist.length > 0 && playTrack(playlist[0])}>
          <Ionicons name="play" size={20} color={COLORS.textPrimary} />
          <Text style={styles.playAllText}>Play All</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {playlist.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={60} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Tracks Yet</Text>
            <Text style={styles.emptyText}>Add tracks to your playlist</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/charts')}>
              <Text style={styles.browseBtnText}>Browse Charts</Text>
            </TouchableOpacity>
          </View>
        ) : (
          playlist.map((track, index) => (
            <TouchableOpacity key={`${track.id}-${index}`} style={styles.trackItem} onPress={() => playTrack(track)}>
              <Text style={styles.trackIndex}>{index + 1}</Text>
              <Image source={{ uri: track.albumArt }} style={styles.trackImage} />
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                <Text style={styles.trackArtist}>{track.artist}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemove(track.id, track.title)}>
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <MiniPlayer />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  stats: { flexDirection: 'row', justifyContent: 'center', gap: 40, paddingVertical: 16 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.textMuted },
  playAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, marginHorizontal: 20, paddingVertical: 14, borderRadius: 12 },
  playAllText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 180 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textMuted, marginTop: 8 },
  browseBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, marginTop: 20 },
  browseBtnText: { color: COLORS.textPrimary, fontWeight: '600' },
  trackItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 12, borderRadius: 12, marginBottom: 8 },
  trackIndex: { width: 24, fontSize: 14, fontWeight: '600', color: COLORS.textMuted, textAlign: 'center' },
  trackImage: { width: 48, height: 48, borderRadius: 8, marginLeft: 8 },
  trackInfo: { flex: 1, marginLeft: 12 },
  trackTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  trackArtist: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
});
