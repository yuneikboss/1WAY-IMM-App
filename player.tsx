import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import AudioVisualizer from './components/AudioVisualizer';
import { useApp } from './context/AppContext';

export default function PlayerScreen() {
  const router = useRouter();
  const { currentTrack, isPlaying, togglePlay, likedTracks, likeTrack, dislikedTracks, dislikeTrack, addToPlaylist } = useApp();
  const [progress, setProgress] = useState(0.35);

  if (!currentTrack) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTrack}>No track selected</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLiked = likedTracks.includes(currentTrack.id);
  const isDisliked = dislikedTracks.includes(currentTrack.id);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = Math.floor(currentTrack.duration * progress);

  return (
    <LinearGradient colors={[COLORS.primary, COLORS.background]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.artContainer}>
        <Image source={{ uri: currentTrack.albumArt }} style={styles.albumArt} />
      </View>

      <AudioVisualizer isPlaying={isPlaying} />

      <View style={styles.info}>
        <Text style={styles.title}>{currentTrack.title}</Text>
        <TouchableOpacity onPress={() => router.push(`/artist/${currentTrack.artistId}`)}>
          <Text style={styles.artist}>{currentTrack.artist}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatTime(currentTime)}</Text>
          <Text style={styles.time}>{formatTime(currentTrack.duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity>
          <Ionicons name="shuffle" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="play-skip-back" size={32} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color={COLORS.background} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="play-skip-forward" size={32} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="repeat" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => likeTrack(currentTrack.id)}>
          <Ionicons name={isLiked ? 'thumbs-up' : 'thumbs-up-outline'} size={24} color={isLiked ? COLORS.success : COLORS.textMuted} />
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => dislikeTrack(currentTrack.id)}>
          <Ionicons name={isDisliked ? 'thumbs-down' : 'thumbs-down-outline'} size={24} color={isDisliked ? COLORS.error : COLORS.textMuted} />
          <Text style={styles.actionText}>Dislike</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => addToPlaylist(currentTrack)}>
          <Ionicons name="add-circle-outline" size={24} color={COLORS.textMuted} />
          <Text style={styles.actionText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={24} color={COLORS.textMuted} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.priceTag}>
        <Text style={styles.priceText}>Buy for ${currentTrack.price.toFixed(2)}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  noTrack: { color: COLORS.textMuted, textAlign: 'center', marginTop: 100 },
  backBtn: { alignSelf: 'center', marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  backText: { color: COLORS.textPrimary, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  headerTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  artContainer: { alignItems: 'center', marginTop: 30 },
  albumArt: { width: 280, height: 280, borderRadius: 20 },
  info: { alignItems: 'center', marginTop: 24 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  artist: { fontSize: 16, color: COLORS.textSecondary, marginTop: 4 },
  progressContainer: { paddingHorizontal: 30, marginTop: 24 },
  progressBar: { height: 4, backgroundColor: COLORS.backgroundLight, borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  time: { fontSize: 12, color: COLORS.textMuted },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28, marginTop: 24 },
  playBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.textPrimary, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 24 },
  actionBtn: { alignItems: 'center' },
  actionText: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  priceTag: { alignSelf: 'center', backgroundColor: COLORS.success, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 20 },
  priceText: { color: COLORS.textPrimary, fontWeight: '700' },
});
