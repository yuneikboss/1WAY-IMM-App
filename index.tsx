import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './constants/colors';
import { IMAGES } from './constants/images';
import GradientHeader from './components/GradientHeader';
import SectionHeader from './components/SectionHeader';
import ArtistCard from './components/ArtistCard';
import TrackCard from './components/TrackCard';
import CategoryPill from './components/CategoryPill';
import ContestCard from './components/ContestCard';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';
import { ARTISTS, CATEGORIES } from './data/artists';
import { TRACKS } from './data/tracks';
import { CONTESTS } from './data/contests';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { playTrack } = useApp();
  const { profile, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredArtists = selectedCategory === 'All' 
    ? ARTISTS 
    : ARTISTS.filter(a => a.category === selectedCategory);

  const numberOne = ARTISTS[0];
  const isPremium = profile?.isPremium;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <GradientHeader 
          onSearchPress={() => router.push('/search')} 
          onProfilePress={() => router.push('/profile')} 
        />

        {!isPremium && (
          <TouchableOpacity style={styles.premiumBanner} onPress={() => router.push('/premium')}>
            <Ionicons name="diamond" size={20} color={COLORS.gold} />
            <Text style={styles.premiumBannerText}>Upgrade to Premium - $12/year</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gold} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.numberOneCard} onPress={() => router.push(`/artist/${numberOne.id}`)}>
          <Image source={{ uri: numberOne.image }} style={styles.numberOneImage} />
          <View style={styles.numberOneInfo}>
            <View style={styles.crownBadge}><Ionicons name="trophy" size={16} color={COLORS.gold} /></View>
            <Text style={styles.numberOneLabel}>#1 ARTIST</Text>
            <Text style={styles.numberOneName}>{numberOne.name}</Text>
            <Text style={styles.numberOneCategory}>{numberOne.category}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.quickLinks}>
          {[
            { icon: 'storefront', label: 'Store', route: '/store', color: COLORS.primary },
            { icon: 'sparkles', label: '1WAY AI', route: '/ai-assistant', color: '#8B5CF6' },
            { icon: 'mic', label: 'Mics', route: '/microphones', color: COLORS.secondary },
            { icon: 'trophy', label: 'Contests', route: '/contests', color: COLORS.gold },
          ].map(link => (
            <TouchableOpacity key={link.label} style={styles.quickLink} onPress={() => router.push(link.route as any)}>
              <View style={[styles.quickIcon, { backgroundColor: link.color }]}>
                <Ionicons name={link.icon as any} size={20} color={COLORS.textPrimary} />
              </View>
              <Text style={styles.quickLabel}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.aiCard} onPress={() => router.push('/ai-assistant')}>
          <Image 
            source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/692bf8fe6f6012747066995c_1764997736375_fd969565.jpg' }} 
            style={styles.aiImage}
          />
          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>1WAY AI Assistant</Text>
            <Text style={styles.aiDesc}>Write lyrics, get rhymes, plan videos & more</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {CATEGORIES.map((cat) => (
              <CategoryPill key={cat} label={cat} isActive={selectedCategory === cat} onPress={() => setSelectedCategory(cat)} />
            ))}
          </ScrollView>
        </View>

        <SectionHeader title="Top 10 Artists" subtitle="Most followed this week" icon="trophy" onSeeAll={() => router.push('/charts')} />
        <FlatList
          data={ARTISTS.slice(0, 10)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.rankedCard}>
              <View style={styles.rankBadge}><Text style={styles.rankText}>{index + 1}</Text></View>
              <ArtistCard artist={item} size="medium" onPress={() => router.push(`/artist/${item.id}`)} />
            </View>
          )}
        />

        <SectionHeader title="Hot Contests" subtitle="Win prizes & recognition" icon="flame" onSeeAll={() => router.push('/contests')} />
        <FlatList
          data={CONTESTS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ContestCard contest={item} onPress={() => router.push('/contests')} />}
        />

        <SectionHeader title="Billboard Top 10" subtitle="Trending now" icon="trending-up" onSeeAll={() => router.push('/charts')} />
        <View style={styles.trackList}>
          {TRACKS.slice(0, 5).map((track) => (
            <TrackCard key={track.id} track={track} showRank onPress={() => playTrack(track)} />
          ))}
        </View>

        <View style={styles.featuresRow}>
          <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/global-stats')}>
            <Ionicons name="globe" size={28} color={COLORS.primary} />
            <Text style={styles.featureTitle}>Global Stats</Text>
            <Text style={styles.featureDesc}>See who's using 1WAY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/wallet')}>
            <Ionicons name="wallet" size={28} color={COLORS.success} />
            <Text style={styles.featureTitle}>Wallet</Text>
            <Text style={styles.featureDesc}>Manage your funds</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="VIP Artists" subtitle="Premium creators" icon="star" onSeeAll={() => router.push('/artists')} />
        <FlatList
          data={ARTISTS.filter(a => a.isVIP)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ArtistCard artist={item} size="medium" onPress={() => router.push(`/artist/${item.id}`)} />
          )}
        />
      </ScrollView>

      <MiniPlayer />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 180 },
  premiumBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 8, 
    backgroundColor: 'rgba(234,179,8,0.15)', 
    marginHorizontal: 20, 
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  premiumBannerText: { color: COLORS.gold, fontWeight: '600' },
  numberOneCard: { flexDirection: 'row', backgroundColor: COLORS.backgroundCard, marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', marginTop: 16 },
  numberOneImage: { width: 100, height: 100 },
  numberOneInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  crownBadge: { position: 'absolute', top: 8, right: 8 },
  numberOneLabel: { fontSize: 10, color: COLORS.gold, fontWeight: '700' },
  numberOneName: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  numberOneCategory: { fontSize: 12, color: COLORS.textMuted },
  quickLinks: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, paddingHorizontal: 10 },
  quickLink: { alignItems: 'center' },
  quickIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  quickLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 6 },
  aiCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.backgroundCard, 
    marginHorizontal: 20, 
    padding: 16, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  aiImage: { width: 50, height: 50, borderRadius: 25 },
  aiContent: { flex: 1, marginLeft: 12 },
  aiTitle: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 16 },
  aiDesc: { color: COLORS.textMuted, fontSize: 13 },
  horizontalList: { paddingHorizontal: 20 },
  categorySection: { marginTop: 8 },
  categoryList: { paddingHorizontal: 20, paddingVertical: 8 },
  trackList: { paddingHorizontal: 20 },
  rankedCard: { marginRight: 16 },
  rankBadge: { position: 'absolute', top: -6, left: -6, zIndex: 1, backgroundColor: COLORS.primary, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rankText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 11 },
  featuresRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 16 },
  featureCard: { 
    flex: 1, 
    backgroundColor: COLORS.backgroundCard, 
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center' 
  },
  featureTitle: { color: COLORS.textPrimary, fontWeight: '700', marginTop: 8 },
  featureDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
});
