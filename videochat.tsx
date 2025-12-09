import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { ARTISTS } from './data/artists';
import { useAuth } from './context/AuthContext';

export default function VideoChatScreen() {
  const { artistId } = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isCalling, setIsCalling] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [quality, setQuality] = useState<'HD' | '4K'>('HD');

  const artist = artistId ? ARTISTS.find(a => a.id === artistId) : null;
  const isPremium = profile?.isPremium;

  useEffect(() => {
    // Simulate call connecting
    const timer = setTimeout(() => {
      setIsCalling(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Call duration timer
    if (!isCalling) {
      const interval = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isCalling]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    Alert.alert('Call Ended', `Call duration: ${formatDuration(callDuration)}`);
    router.back();
  };

  const toggleQuality = () => {
    if (!isPremium && quality === 'HD') {
      Alert.alert('Premium Feature', '4K video quality is available for Premium members', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: () => router.push('/premium') }
      ]);
      return;
    }
    setQuality(q => q === 'HD' ? '4K' : 'HD');
  };

  return (
    <View style={styles.container}>
      <View style={styles.remoteVideo}>
        {artist ? (
          <>
            <Image source={{ uri: artist.image }} style={styles.remoteImage} blurRadius={isCalling ? 10 : 0} />
            {isCalling && (
              <View style={styles.callingOverlay}>
                <Image source={{ uri: artist.image }} style={styles.callingAvatar} />
                <Text style={styles.callingText}>Calling {artist.name}...</Text>
                <View style={styles.callingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </View>
            )}
            {!isCalling && (
              <View style={styles.qualityBadge}>
                <TouchableOpacity style={styles.qualityBtn} onPress={toggleQuality}>
                  <Ionicons name="videocam" size={14} color={COLORS.textPrimary} />
                  <Text style={styles.qualityText}>{quality}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noArtist}>
            <Ionicons name="videocam-off" size={60} color={COLORS.textMuted} />
            <Text style={styles.noArtistText}>Select an artist to video chat</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/artists')}>
              <Text style={styles.browseBtnText}>Browse Artists</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.localVideo}>
        <View style={styles.localPlaceholder}>
          {isVideoOff ? (
            <Ionicons name="videocam-off" size={30} color={COLORS.textMuted} />
          ) : (
            <Ionicons name="person" size={30} color={COLORS.textMuted} />
          )}
        </View>
        <View style={styles.localQuality}>
          <Text style={styles.localQualityText}>{quality}</Text>
        </View>
      </View>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        {artist && (
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{artist.name}</Text>
            <Text style={styles.headerStatus}>
              {isCalling ? 'Calling...' : `Connected • ${formatDuration(callDuration)}`}
            </Text>
          </View>
        )}
        <View style={styles.headerRight}>
          {!isCalling && (
            <View style={styles.connectionStatus}>
              <View style={styles.connectionDot} />
              <Text style={styles.connectionText}>Crystal Clear</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.controlBtn, isMuted && styles.controlActive]} onPress={() => setIsMuted(!isMuted)}>
          <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color={COLORS.textPrimary} />
          <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, isVideoOff && styles.controlActive]} onPress={() => setIsVideoOff(!isVideoOff)}>
          <Ionicons name={isVideoOff ? 'videocam-off' : 'videocam'} size={24} color={COLORS.textPrimary} />
          <Text style={styles.controlLabel}>{isVideoOff ? 'Video On' : 'Video Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn}>
          <Ionicons name="chatbubble" size={24} color={COLORS.textPrimary} />
          <Text style={styles.controlLabel}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn}>
          <Ionicons name="share" size={24} color={COLORS.textPrimary} />
          <Text style={styles.controlLabel}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, styles.endCall]} onPress={handleEndCall}>
          <Ionicons name="call" size={24} color={COLORS.textPrimary} style={{ transform: [{ rotate: '135deg' }] }} />
          <Text style={styles.controlLabel}>End</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  remoteVideo: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  remoteImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  callingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  callingAvatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  callingText: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '600' },
  callingDots: { flexDirection: 'row', marginTop: 16 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, marginHorizontal: 4 },
  dot1: { opacity: 0.3 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 1 },
  qualityBadge: { position: 'absolute', top: 110, left: 20 },
  qualityBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  qualityText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700' },
  noArtist: { alignItems: 'center' },
  noArtistText: { color: COLORS.textMuted, fontSize: 16, marginTop: 16 },
  browseBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, marginTop: 20 },
  browseBtnText: { color: COLORS.textPrimary, fontWeight: '600' },
  localVideo: { position: 'absolute', top: 100, right: 20, width: 100, height: 140, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: COLORS.primary },
  localPlaceholder: { flex: 1, backgroundColor: COLORS.backgroundCard, justifyContent: 'center', alignItems: 'center' },
  localQuality: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  localQualityText: { color: COLORS.textPrimary, fontSize: 10, fontWeight: '700' },
  header: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  backBtn: { padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  headerInfo: { flex: 1, marginLeft: 16 },
  headerName: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '600' },
  headerStatus: { color: COLORS.textMuted, fontSize: 12 },
  headerRight: {},
  connectionStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  connectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  connectionText: { color: COLORS.success, fontSize: 11, fontWeight: '600' },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingVertical: 24, paddingBottom: 40, backgroundColor: 'rgba(0,0,0,0.9)' },
  controlBtn: { alignItems: 'center', width: 60 },
  controlActive: {},
  controlLabel: { color: COLORS.textMuted, fontSize: 10, marginTop: 4 },
  endCall: {},
});
