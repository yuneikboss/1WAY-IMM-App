import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import ArtistCard from './components/ArtistCard';
import CategoryPill from './components/CategoryPill';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';
import { ARTISTS, CATEGORIES, GENRES } from './data/artists';

export default function ArtistsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVIPOnly, setShowVIPOnly] = useState(false);

  const filteredArtists = ARTISTS.filter(artist => {
    const matchesCategory = selectedCategory === 'All' || artist.category === selectedCategory;
    const matchesGenre = selectedGenre === 'All' || artist.genre === selectedGenre;
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVIP = !showVIPOnly || artist.isVIP;
    return matchesCategory && matchesGenre && matchesSearch && matchesVIP;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Artists</Text>
        <Text style={styles.subtitle}>Discover talented creators</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <TextInput style={styles.searchInput} placeholder="Search artists..." placeholderTextColor={COLORS.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <View style={styles.vipToggle}>
        <TouchableOpacity style={[styles.vipBtn, showVIPOnly && styles.vipActive]} onPress={() => setShowVIPOnly(!showVIPOnly)}>
          <Ionicons name="star" size={16} color={showVIPOnly ? COLORS.textPrimary : COLORS.gold} />
          <Text style={[styles.vipText, showVIPOnly && styles.vipTextActive]}>VIP Only</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.filterLabel}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filtersList}>
        {CATEGORIES.map((cat) => (
          <CategoryPill key={cat} label={cat} isActive={selectedCategory === cat} onPress={() => setSelectedCategory(cat)} />
        ))}
      </ScrollView>

      <Text style={styles.filterLabel}>Genres</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filtersList}>
        {GENRES.slice(0, 8).map((genre) => (
          <CategoryPill key={genre} label={genre} isActive={selectedGenre === genre} onPress={() => setSelectedGenre(genre)} />
        ))}
      </ScrollView>

      <Text style={styles.resultsCount}>{filteredArtists.length} artists found</Text>

      <FlatList
        data={filteredArtists}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.artistGrid}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.artistItem}>
            <ArtistCard artist={item} size="large" onPress={() => router.push(`/artist/${item.id}`)} />
          </View>
        )}
      />
      <MiniPlayer />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.textPrimary },
  vipToggle: { paddingHorizontal: 20, marginTop: 12 },
  vipBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: COLORS.backgroundCard, borderWidth: 1, borderColor: COLORS.gold },
  vipActive: { backgroundColor: COLORS.gold },
  vipText: { color: COLORS.gold, fontWeight: '600' },
  vipTextActive: { color: COLORS.textPrimary },
  filterLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, paddingHorizontal: 20, marginTop: 16, marginBottom: 8 },
  filters: { maxHeight: 45 },
  filtersList: { paddingHorizontal: 20 },
  resultsCount: { fontSize: 12, color: COLORS.textMuted, paddingHorizontal: 20, marginTop: 16 },
  artistGrid: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 180 },
  artistItem: { flex: 1, alignItems: 'center', marginBottom: 20 },
});
