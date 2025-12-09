import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';
import { useApp } from '../context/AppContext';

export default function MiniPlayer() {
  const router = useRouter();
  const { currentTrack, isPlaying, togglePlay, likedTracks, likeTrack } = useApp();

  if (!currentTrack) return null;

  const isLiked = likedTracks.includes(currentTrack.id);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => router.push('/player')}
      activeOpacity={0.9}
    >
      <Image source={{ uri: currentTrack.albumArt }} style={styles.albumArt} />
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => likeTrack(currentTrack.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons 
            name={isLiked ? 'heart' : 'heart-outline'} 
            size={22} 
            color={isLiked ? COLORS.error : COLORS.textMuted} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.playButton} 
          onPress={(e) => { e.stopPropagation(); togglePlay(); }}
        >
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={24} 
            color={COLORS.textPrimary} 
          />
        </TouchableOpacity>
      </View>
      
      {isPlaying && <View style={styles.progressBar} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70,
    left: 10,
    right: 10,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.backgroundLight,
    overflow: 'hidden',
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  artist: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingRight: 4,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
  },
});
