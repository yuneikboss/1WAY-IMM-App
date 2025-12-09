import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { ARTISTS } from './data/artists';
import { TRACKS } from './data/tracks';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';
import { useApp } from './context/AppContext';

export default function SearchScreen() {
  const router = useRouter();
  const { playTrack } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'artists' | 'tracks'>('all');

  const filteredArtists = ARTISTS.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));
  const filteredTracks = TRACKS.filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.artist.toLowerCase().includes(query.toLowerCase()));

  const showArtists = filter === 'all' || filter === 'artists';
  const showTracks = filter === 'all' || filter === 'tracks';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Search artists, tracks..." placeholderTextColor={COLORS.textMuted} value={query} onChangeText={setQuery} autoFocus />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filters}>
        {(['all', 'artists', 'tracks'] as const).map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.results} contentContainerStyle={styles.resultsContent}>
        {query.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={60} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Search Famous.ai</Text>
            <Text style={styles.emptyText}>Find artists, tracks, and more</Text>
          </View>
        ) : (
          <>
            {showArtists && filteredArtists.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Artists ({filteredArtists.length})</Text>
                {filteredArtists.map(artist => (
                  <TouchableOpacity key={artist.id} style={styles.resultItem} onPress={() => router.push(`/artist/${artist.id}`)}>
                    <Image source={{ uri: artist.image }} style={styles.artistImage} />
                    <View style={styles.resultInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.resultName}>{artist.name}</Text>
                        {artist.verified && <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />}
                      </View>
                      <Text style={styles.resultMeta}>{artist.category} • {artist.genre}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {showTracks && filteredTracks.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Tracks ({filteredTracks.length})</Text>
                {filteredTracks.map(track => (
                  <TouchableOpacity key={track.id} style={styles.resultItem} onPress={() => playTrack(track)}>
                    <Image source={{ uri: track.albumArt }} style={styles.trackImage} />
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{track.title}</Text>
                      <Text style={styles.resultMeta}>{track.artist} • {track.genre}</Text>
                    </View>
                    <TouchableOpacity>
                      <Ionicons name="play-circle" size={32} color={COLORS.primary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {filteredArtists.length === 0 && filteredTracks.length === 0 && (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.noResultsText}>No results found for "{query}"</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      <MiniPlayer />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.textPrimary, paddingVertical: 12 },
  filters: { flexDirection: 'row', paddingHorizontal: 20, gap: 10 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: COLORS.backgroundCard },
  filterActive: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.textMuted, fontWeight: '600' },
  filterTextActive: { color: COLORS.textPrimary },
  results: { flex: 1 },
  resultsContent: { padding: 20, paddingBottom: 180 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textMuted, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16, marginBottom: 12 },
  resultItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 12, borderRadius: 12, marginBottom: 8 },
  artistImage: { width: 50, height: 50, borderRadius: 25 },
  trackImage: { width: 50, height: 50, borderRadius: 8 },
  resultInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resultName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  resultMeta: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  noResults: { alignItems: 'center', paddingTop: 60 },
  noResultsText: { fontSize: 14, color: COLORS.textMuted, marginTop: 12 },
});
