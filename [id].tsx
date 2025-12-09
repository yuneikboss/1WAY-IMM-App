import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';
import { IMAGES } from '../constants/images';
import TrackCard from '../components/TrackCard';
import { ARTISTS } from '../data/artists';
import { TRACKS } from '../data/tracks';
import { useApp } from '../context/AppContext';

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toString();
};

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { playTrack, following, toggleFollow, likedTracks, likeTrack, dislikeTrack, dislikedTracks } = useApp();
  const [activeTab, setActiveTab] = useState<'tracks' | 'videos' | 'posts'>('tracks');

  const artist = ARTISTS.find(a => a.id === id);
  const artistTracks = TRACKS.filter(t => t.artistId === id);
  const isFollowing = following.includes(id as string);

  if (!artist) {
    return <View style={styles.container}><Text style={styles.notFound}>Artist not found</Text></View>;
  }

  const certImage = artist.certification !== 'none' ? IMAGES.awards[artist.certification] : null;

  const handleFollow = () => {
    toggleFollow(artist.id);
    Alert.alert(isFollowing ? 'Unfollowed' : 'Following', isFollowing ? `You unfollowed ${artist.name}` : `You are now following ${artist.name}`);
  };

  const handleMessage = () => router.push(`/chat/${artist.id}`);
  const handleSponsor = () => router.push('/sponsor');

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[COLORS.primary, COLORS.background]} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Image source={{ uri: artist.image }} style={styles.avatar} />
          <View style={styles.nameRow}>
            <Text style={styles.name}>{artist.name}</Text>
            {artist.verified && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
            {artist.isVIP && <Ionicons name="star" size={18} color={COLORS.gold} />}
          </View>
          <Text style={styles.category}>{artist.category} • {artist.genre}</Text>
          
          {certImage && (
            <View style={styles.certBadge}>
              <Image source={{ uri: certImage }} style={styles.certImage} />
              <Text style={styles.certText}>{artist.certification.toUpperCase()}</Text>
            </View>
          )}
          
          <View style={styles.stats}>
            <View style={styles.stat}><Text style={styles.statValue}>{formatNumber(artist.followers)}</Text><Text style={styles.statLabel}>Followers</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>{formatNumber(artist.plays)}</Text><Text style={styles.statLabel}>Plays</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>{formatNumber(artist.sales)}</Text><Text style={styles.statLabel}>Sales</Text></View>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.followBtn, isFollowing && styles.followingBtn]} onPress={handleFollow}>
              <Ionicons name={isFollowing ? 'checkmark' : 'person-add'} size={18} color={COLORS.textPrimary} />
              <Text style={styles.followText}>{isFollowing ? 'Following' : 'Follow'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleMessage}>
              <Ionicons name="chatbubble" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleSponsor}>
              <Ionicons name="cash" size={18} color={COLORS.success} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.tabs}>
          {(['tracks', 'videos', 'posts'] as const).map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{activeTab === 'tracks' ? `Songs (${artistTracks.length}/20)` : activeTab === 'videos' ? 'Videos' : 'Posts & Reels'}</Text>
          {activeTab === 'tracks' && artistTracks.map(track => (
            <View key={track.id} style={styles.trackRow}>
              <TrackCard track={track} onPress={() => playTrack(track)} />
              <View style={styles.likeActions}>
                <TouchableOpacity onPress={() => likeTrack(track.id)}>
                  <Ionicons name={likedTracks.includes(track.id) ? 'thumbs-up' : 'thumbs-up-outline'} size={20} color={likedTracks.includes(track.id) ? COLORS.success : COLORS.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => dislikeTrack(track.id)}>
                  <Ionicons name={dislikedTracks.includes(track.id) ? 'thumbs-down' : 'thumbs-down-outline'} size={20} color={dislikedTracks.includes(track.id) ? COLORS.error : COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {activeTab !== 'tracks' && <Text style={styles.noContent}>No {activeTab} yet</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  notFound: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 100 },
  header: { paddingTop: 50, paddingBottom: 30, alignItems: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20, padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: COLORS.textPrimary },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  name: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
  category: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  certBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
  certImage: { width: 24, height: 24, borderRadius: 12 },
  certText: { fontSize: 12, color: COLORS.gold, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: 40, marginTop: 20 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  followBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  followingBtn: { backgroundColor: COLORS.success },
  followText: { color: COLORS.textPrimary, fontWeight: '600' },
  actionBtn: { backgroundColor: COLORS.backgroundCard, padding: 10, borderRadius: 20 },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: COLORS.backgroundCard },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontWeight: '600' },
  tabTextActive: { color: COLORS.textPrimary },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  trackRow: { flexDirection: 'row', alignItems: 'center' },
  likeActions: { flexDirection: 'row', gap: 12, marginLeft: 8 },
  noContent: { color: COLORS.textMuted, textAlign: 'center', paddingVertical: 40 },
});
