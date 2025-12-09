import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Track } from '../data/tracks';

interface TrackCardProps {
  track: Track;
  showRank?: boolean;
  rank?: number;
  onPress: () => void;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatPlays = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toString();
};

export default function TrackCard({ track, showRank, rank, onPress }: TrackCardProps) {
  const displayRank = rank || track.billboardRank;
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {showRank && displayRank && (
        <View style={styles.rankContainer}>
          <Text style={[styles.rank, displayRank <= 3 && styles.topRank]}>
            {displayRank}
          </Text>
        </View>
      )}
      
      <Image source={{ uri: track.albumArt }} style={styles.albumArt} />
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
        <View style={styles.meta}>
          <Text style={styles.plays}>{formatPlays(track.plays)} plays</Text>
          <Text style={styles.duration}>{formatDuration(track.duration)}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <Text style={styles.price}>${track.price.toFixed(2)}</Text>
        <Ionicons name="play-circle" size={32} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  rankContainer: {
    width: 28,
    alignItems: 'center',
    marginRight: 8,
  },
  rank: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  topRank: {
    color: COLORS.gold,
    fontSize: 18,
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  artist: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  plays: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  duration: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  actions: {
    alignItems: 'flex-end',
    gap: 4,
  },
  price: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
});
