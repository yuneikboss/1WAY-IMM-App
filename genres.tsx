import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { IMAGES } from './constants/images';
import { GENRES } from './data/artists';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';

const GENRE_DATA = [
  { name: 'Hip-Hop', colors: ['#6366f1', '#8b5cf6'], icon: 'musical-notes' },
  { name: 'R&B', colors: ['#ec4899', '#f472b6'], icon: 'heart' },
  { name: 'Rap', colors: ['#ef4444', '#f87171'], icon: 'mic' },
  { name: 'Pop', colors: ['#f59e0b', '#fbbf24'], icon: 'star' },
  { name: 'EDM', colors: ['#10b981', '#34d399'], icon: 'flash' },
  { name: 'Trap', colors: ['#8b5cf6', '#a78bfa'], icon: 'flame' },
  { name: 'Soul', colors: ['#06b6d4', '#22d3ee'], icon: 'moon' },
  { name: 'Lo-Fi', colors: ['#64748b', '#94a3b8'], icon: 'cafe' },
  { name: 'Jazz', colors: ['#d97706', '#fbbf24'], icon: 'musical-note' },
  { name: 'Rock', colors: ['#dc2626', '#ef4444'], icon: 'skull' },
  { name: 'Country', colors: ['#65a30d', '#84cc16'], icon: 'leaf' },
  { name: 'Latin', colors: ['#ea580c', '#fb923c'], icon: 'sunny' },
];

export default function GenresScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Genres</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>Explore all music styles</Text>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.grid}>
          {GENRE_DATA.map((genre, index) => (
            <TouchableOpacity key={genre.name} style={styles.genreCard} onPress={() => router.push('/charts')}>
              <LinearGradient colors={genre.colors as [string, string]} style={styles.genreGradient}>
                <Ionicons name={genre.icon as any} size={32} color="rgba(255,255,255,0.9)" />
                <Text style={styles.genreName}>{genre.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured Playlists</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
            {['Top Hits', 'New Releases', 'Chill Vibes', 'Workout'].map((playlist, i) => (
              <TouchableOpacity key={playlist} style={styles.featuredCard}>
                <Image source={{ uri: IMAGES.albums[i % IMAGES.albums.length] }} style={styles.featuredImage} />
                <Text style={styles.featuredName}>{playlist}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      <MiniPlayer />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textMuted, paddingHorizontal: 20, marginBottom: 16 },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 180 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  genreCard: { width: '47%', aspectRatio: 1.5, borderRadius: 16, overflow: 'hidden' },
  genreGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  genreName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 8 },
  featuredSection: { marginTop: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  featuredList: { gap: 12 },
  featuredCard: { width: 140 },
  featuredImage: { width: 140, height: 140, borderRadius: 12 },
  featuredName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', marginTop: 8 },
});
