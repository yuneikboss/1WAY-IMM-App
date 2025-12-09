import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface Contest {
  id: string;
  title: string;
  prize: number;
  participants: number;
  deadline: string;
  image: string;
  category: string;
}

interface Props {
  contest: Contest;
  onPress: () => void;
}

export default function ContestCard({ contest, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <ImageBackground source={{ uri: contest.image }} style={styles.background} imageStyle={styles.backgroundImage}>
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.gradient}>
          <View style={styles.badge}>
            <Ionicons name="trophy" size={12} color={COLORS.gold} />
            <Text style={styles.badgeText}>{contest.category}</Text>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title}>{contest.title}</Text>
            
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Ionicons name="cash" size={14} color={COLORS.success} />
                <Text style={styles.statText}>${contest.prize.toLocaleString()}</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="people" size={14} color={COLORS.primary} />
                <Text style={styles.statText}>{contest.participants}</Text>
              </View>
            </View>
            
            <View style={styles.footer}>
              <View style={styles.deadline}>
                <Ionicons name="time" size={12} color={COLORS.warning} />
                <Text style={styles.deadlineText}>{contest.deadline}</Text>
              </View>
              <TouchableOpacity style={styles.joinBtn}>
                <Text style={styles.joinText}>Enter Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: 280, height: 180, marginRight: 16, borderRadius: 16, overflow: 'hidden' },
  background: { flex: 1 },
  backgroundImage: { borderRadius: 16 },
  gradient: { flex: 1, justifyContent: 'space-between', padding: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, color: COLORS.textPrimary, fontWeight: '600' },
  content: {},
  title: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  stats: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deadline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deadlineText: { fontSize: 10, color: COLORS.textSecondary },
  joinBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  joinText: { fontSize: 11, color: COLORS.textPrimary, fontWeight: '600' },
});
