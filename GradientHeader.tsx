import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { IMAGES } from '../constants/images';

const { width } = Dimensions.get('window');

interface Props {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearchPress?: () => void;
  onProfilePress?: () => void;
}

export default function GradientHeader({ title = 'Famous.ai', subtitle, showSearch = true, onSearchPress, onProfilePress }: Props) {
  return (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary, COLORS.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <Image source={{ uri: IMAGES.hero }} style={styles.bgImage} />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          <View style={styles.actions}>
            {showSearch && (
              <TouchableOpacity style={styles.iconBtn} onPress={onSearchPress}>
                <Ionicons name="search" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconBtn} onPress={onProfilePress}>
              <Ionicons name="person-circle" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.tagline}>The World's #1 Music Platform</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { width, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, position: 'relative', overflow: 'hidden' },
  bgImage: { position: 'absolute', width: '100%', height: '100%', opacity: 0.3 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  content: { zIndex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20 },
  tagline: { fontSize: 16, color: COLORS.textPrimary, marginTop: 12, fontWeight: '500' },
});
