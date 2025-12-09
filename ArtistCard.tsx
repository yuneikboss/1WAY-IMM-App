import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Artist } from '../data/artists';

interface ArtistCardProps {
  artist: Artist;
  size?: 'small' | 'medium' | 'large';
  onPress: () => void;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toString();
};

export default function ArtistCard({ artist, size = 'medium', onPress }: ArtistCardProps) {
  const dimensions = {
    small: { width: 100, height: 100, imageSize: 60 },
    medium: { width: 140, height: 160, imageSize: 80 },
    large: { width: 160, height: 200, imageSize: 100 },
  };

  const { width, height, imageSize } = dimensions[size];

  return (
    <TouchableOpacity 
      style={[styles.container, { width, minHeight: height }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: artist.image }} 
          style={[styles.image, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }]} 
        />
        {artist.isVIP && (
          <View style={styles.vipBadge}>
            <Ionicons name="star" size={10} color={COLORS.textPrimary} />
          </View>
        )}
        {artist.certification !== 'none' && (
          <View style={[styles.certBadge, { backgroundColor: artist.certification === 'diamond' ? '#B9F2FF' : artist.certification === 'platinum' ? '#C0C0C0' : COLORS.gold }]}>
            <Ionicons name="disc" size={10} color={COLORS.background} />
          </View>
        )}
      </View>
      
      <View style={styles.nameRow}>
        <Text style={styles.name} numberOfLines={1}>{artist.name}</Text>
        {artist.verified && <Ionicons name="checkmark-circle" size={12} color={COLORS.primary} />}
      </View>
      
      <Text style={styles.category} numberOfLines={1}>{artist.category}</Text>
      
      {size !== 'small' && (
        <Text style={styles.followers}>{formatNumber(artist.followers)} followers</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  vipBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.gold,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  category: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  followers: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
