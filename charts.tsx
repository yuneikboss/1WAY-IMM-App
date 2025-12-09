import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { IMAGES } from './constants/images';
import TrackCard from './components/TrackCard';
import ArtistCard from './components/ArtistCard';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';
import { TRACKS } from './data/tracks';
import { ARTISTS } from './data/artists';
import { useApp } from './context/AppContext';

export default function ChartsScreen() {
  const router = useRouter();
  const { playTrack } = useApp();
  const [tab, setTab] = useState<'billboard' | 'artists'>('billboard');

  const numberOne = ARTISTS[0];
  const top10 = ARTISTS.slice(0, 10);
  const hottest100 = ARTISTS;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Charts</Text>
        <Text style={styles.subtitle}>Top rankings this week</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'billboard' && styles.tabActive]} onPress={() => setTab('billboard')}>
          <Text style={[styles.tabText, tab === 'billboard' && styles.tabTextActive]}>Billboard Top 10</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'artists' && styles.tabActive]} onPress={() => setTab('artists')}>
          <Text style={[styles.tabText, tab === 'artists' && styles.tabTextActive]}>Artist Rankings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {tab === 'billboard' ? (
          <>
            <Text style={styles.sectionTitle}>Billboard Top 10</Text>
            {TRACKS.slice(0, 10).map((track, idx) => (
              <TrackCard key={track.id} track={track} showRank rank={idx + 1} onPress={() => playTrack(track)} />
            ))}
          </>
        ) : (
          <>
            <View style={styles.numberOneSection}>
              <Text style={styles.sectionTitle}>#1 Artist</Text>
              <TouchableOpacity style={styles.numberOneCard} onPress={() => router.push(`/artist/${numberOne.id}`)}>
                <Image source={{ uri: numberOne.image }} style={styles.numberOneImage} />
                <View style={styles.crownBadge}>
                  <Ionicons name="trophy" size={24} color={COLORS.gold} />
                </View>
                <Text style={styles.numberOneName}>{numberOne.name}</Text>
                <Text style={styles.numberOneCategory}>{numberOne.category}</Text>
                {numberOne.certification !== 'none' && (
                  <Image source={{ uri: IMAGES.awards[numberOne.certification] }} style={styles.certBadge} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Top 10 Artists</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {top10.map((artist, idx) => (
                <View key={artist.id} style={styles.rankedArtist}>
                  <View style={styles.rankBadge}><Text style={styles.rankText}>{idx + 1}</Text></View>
                  <ArtistCard artist={artist} size="medium" onPress={() => router.push(`/artist/${artist.id}`)} />
                </View>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Hottest 100 Artists</Text>
            <Text style={styles.viewAllText}>Showing {hottest100.length} artists</Text>
            {hottest100.map((artist, idx) => (
              <TouchableOpacity key={artist.id} style={styles.artistRow} onPress={() => router.push(`/artist/${artist.id}`)}>
                <Text style={styles.artistRank}>{idx + 1}</Text>
                <Image source={{ uri: artist.image }} style={styles.artistThumb} />
                <View style={styles.artistInfo}>
                  <Text style={styles.artistName}>{artist.name}</Text>
                  <Text style={styles.artistCategory}>{artist.category}</Text>
                </View>
                {artist.verified && <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
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
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginTop: 16 },
  tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: COLORS.backgroundCard },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontWeight: '600' },
  tabTextActive: { color: COLORS.textPrimary },
  content: { padding: 20, paddingBottom: 180 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16, marginBottom: 12 },
  numberOneSection: { alignItems: 'center', marginBottom: 20 },
  numberOneCard: { alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 20, borderRadius: 20, width: '100%' },
  numberOneImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: COLORS.gold },
  crownBadge: { position: 'absolute', top: 10, right: 10 },
  numberOneName: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginTop: 12 },
  numberOneCategory: { fontSize: 14, color: COLORS.textMuted },
  certBadge: { width: 40, height: 40, borderRadius: 20, marginTop: 8 },
  horizontalList: { paddingVertical: 8 },
  rankedArtist: { marginRight: 16 },
  rankBadge: { position: 'absolute', top: -8, left: -8, zIndex: 1, backgroundColor: COLORS.primary, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  rankText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 12 },
  viewAllText: { color: COLORS.textMuted, fontSize: 12, marginBottom: 12 },
  artistRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 12, borderRadius: 12, marginBottom: 8 },
  artistRank: { width: 30, fontSize: 16, fontWeight: '700', color: COLORS.primary },
  artistThumb: { width: 44, height: 44, borderRadius: 22 },
  artistInfo: { flex: 1, marginLeft: 12 },
  artistName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  artistCategory: { fontSize: 12, color: COLORS.textMuted },
});
