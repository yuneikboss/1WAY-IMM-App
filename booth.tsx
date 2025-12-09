import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, Alert, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { IMAGES } from './constants/images';
import { ARTISTS } from './data/artists';
import AudioVisualizer from './components/AudioVisualizer';
import { useAuth } from './context/AuthContext';

const MICROPHONES = [
  { id: 'basic', name: 'Basic', quality: 'Standard', color: COLORS.textMuted },
  { id: 'silver', name: 'Silver', quality: 'Enhanced', color: '#C0C0C0' },
  { id: 'gold', name: 'Gold', quality: 'Pro', color: COLORS.gold },
  { id: 'platinum', name: 'Platinum', quality: 'Premium', color: '#E5E4E2' },
  { id: 'diamond', name: 'Diamond', quality: 'Ultimate', color: '#B9F2FF' },
];

const EFFECTS = [
  { id: 'reverb', name: 'Reverb', icon: 'water' },
  { id: 'delay', name: 'Delay', icon: 'timer' },
  { id: 'compression', name: 'Compress', icon: 'contract' },
  { id: 'eq', name: 'EQ', icon: 'options' },
  { id: 'autotune', name: 'Auto-Tune', icon: 'musical-notes' },
  { id: 'distortion', name: 'Distortion', icon: 'flash' },
];

const TRACKS = [
  { id: '1', name: 'Vocals', color: COLORS.primary, muted: false, solo: false, volume: 80 },
  { id: '2', name: 'Beat', color: COLORS.secondary, muted: false, solo: false, volume: 70 },
  { id: '3', name: 'Bass', color: COLORS.success, muted: false, solo: false, volume: 65 },
  { id: '4', name: 'Synth', color: COLORS.gold, muted: false, solo: false, volume: 50 },
];

type StudioMode = 'record' | 'edit' | 'mix' | 'live';

export default function BoothScreen() {
  const router = useRouter();
  const { profile, addNotification } = useAuth();
  const [mode, setMode] = useState<StudioMode>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [featuringArtist, setFeaturingArtist] = useState<string | null>(null);
  const [viewers, setViewers] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showEffects, setShowEffects] = useState(false);
  const [activeEffects, setActiveEffects] = useState<string[]>([]);
  const [tracks, setTracks] = useState(TRACKS);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [showMixer, setShowMixer] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [showMetronome, setShowMetronome] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isPremium = profile?.isPremium;
  const ownedMics = profile?.ownedMics || ['basic'];
  const activeMic = profile?.activeMic || 'basic';
  const currentMic = MICROPHONES.find(m => m.id === activeMic) || MICROPHONES[0];

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
      
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } else {
      pulseAnim.setValue(1);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const handleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
      Alert.alert('Recording Started', `Using ${currentMic.name} Mic (${currentMic.quality} Quality)\n\nTip: Speak clearly into your device microphone.`);
    } else {
      setIsRecording(false);
      if (recordingTime > 0) {
        Alert.alert(
          'Recording Saved!', 
          `Duration: ${formatTime(recordingTime)}\nQuality: ${currentMic.quality}\n\nWhat would you like to do?`,
          [
            { text: 'Discard', style: 'destructive' },
            { text: 'Edit', onPress: () => setMode('edit') },
            { text: 'Save', onPress: () => {
              addNotification({
                type: 'system',
                title: 'Track Saved!',
                message: `Your recording (${formatTime(recordingTime)}) has been saved to your profile.`,
              });
            }},
          ]
        );
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleGoLive = () => {
    if (!isPremium) {
      Alert.alert('Premium Required', 'Live streaming is a Premium feature', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: () => router.push('/premium') }
      ]);
      return;
    }
    setIsLive(!isLive);
    if (!isLive) {
      setViewers(Math.floor(Math.random() * 100) + 10);
      Alert.alert('You are LIVE!', 'Your booth session is now streaming in crystal clear quality');
    }
  };

  const handleFaceTime = () => {
    if (featuringArtist) {
      router.push(`/videochat?artistId=${featuringArtist}`);
    } else {
      Alert.alert('Select Artist', 'Choose a featuring artist first');
    }
  };

  const handleMicChange = () => {
    router.push('/microphones');
  };

  const toggleEffect = (effectId: string) => {
    if (activeEffects.includes(effectId)) {
      setActiveEffects(activeEffects.filter(e => e !== effectId));
    } else {
      setActiveEffects([...activeEffects, effectId]);
    }
  };

  const toggleTrackMute = (trackId: string) => {
    setTracks(tracks.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  const toggleTrackSolo = (trackId: string) => {
    setTracks(tracks.map(t => t.id === trackId ? { ...t, solo: !t.solo } : t));
  };

  const updateTrackVolume = (trackId: string, delta: number) => {
    setTracks(tracks.map(t => {
      if (t.id === trackId) {
        const newVolume = Math.max(0, Math.min(100, t.volume + delta));
        return { ...t, volume: newVolume };
      }
      return t;
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderRecordMode = () => (
    <View style={styles.recordSection}>
      <View style={styles.waveformContainer}>
        {(isRecording || isPlaying) && <AudioVisualizer isPlaying={true} />}
        {!isRecording && !isPlaying && (
          <View style={styles.waveformPlaceholder}>
            <Ionicons name="pulse" size={48} color={COLORS.textMuted} />
            <Text style={styles.waveformText}>Ready to record</Text>
          </View>
        )}
      </View>

      {isRecording && (
        <View style={styles.recordingStatus}>
          <Animated.View style={[styles.recordingDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
          <Text style={styles.recordingQuality}>Recording in {currentMic.quality}</Text>
        </View>
      )}

      <View style={styles.transportControls}>
        <TouchableOpacity style={styles.transportBtn} onPress={() => setRecordingTime(0)}>
          <Ionicons name="play-skip-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.transportBtn} onPress={handlePlay}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.recordBtn, isRecording && styles.recordingActive]} 
          onPress={handleRecord}
        >
          <Ionicons name={isRecording ? 'stop' : 'mic'} size={32} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.transportBtn} onPress={() => setShowMetronome(!showMetronome)}>
          <Ionicons name="metronome" size={24} color={showMetronome ? COLORS.primary : COLORS.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.transportBtn}>
          <Ionicons name="repeat" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {showMetronome && (
        <View style={styles.metronomeBar}>
          <TouchableOpacity onPress={() => setBpm(Math.max(60, bpm - 5))}>
            <Ionicons name="remove-circle" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.bpmText}>{bpm} BPM</Text>
          <TouchableOpacity onPress={() => setBpm(Math.min(200, bpm + 5))}>
            <Ionicons name="add-circle" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEditMode = () => (
    <View style={styles.editSection}>
      <View style={styles.timelineHeader}>
        <Text style={styles.timelineTitle}>Timeline</Text>
        <View style={styles.timelineActions}>
          <TouchableOpacity style={styles.timelineBtn}>
            <Ionicons name="cut" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.timelineBtn}>
            <Ionicons name="copy" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.timelineBtn}>
            <Ionicons name="trash" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeline}>
        <View style={styles.timelineContent}>
          {tracks.map(track => (
            <TouchableOpacity 
              key={track.id} 
              style={[
                styles.trackRow, 
                selectedTrack === track.id && styles.trackRowSelected,
                track.muted && styles.trackRowMuted
              ]}
              onPress={() => setSelectedTrack(track.id)}
            >
              <View style={[styles.trackLabel, { backgroundColor: track.color }]}>
                <Text style={styles.trackName}>{track.name}</Text>
              </View>
              <View style={styles.trackWaveform}>
                {[...Array(20)].map((_, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.waveformBar, 
                      { 
                        height: Math.random() * 30 + 10,
                        backgroundColor: track.muted ? COLORS.textMuted : track.color,
                      }
                    ]} 
                  />
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.editTools}>
        <TouchableOpacity style={styles.editTool}>
          <Ionicons name="resize" size={24} color={COLORS.textPrimary} />
          <Text style={styles.editToolText}>Trim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editTool}>
          <Ionicons name="swap-horizontal" size={24} color={COLORS.textPrimary} />
          <Text style={styles.editToolText}>Split</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editTool}>
          <Ionicons name="volume-high" size={24} color={COLORS.textPrimary} />
          <Text style={styles.editToolText}>Fade</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editTool} onPress={() => setShowEffects(true)}>
          <Ionicons name="color-wand" size={24} color={COLORS.textPrimary} />
          <Text style={styles.editToolText}>Effects</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMixMode = () => (
    <View style={styles.mixSection}>
      <View style={styles.mixHeader}>
        <Text style={styles.mixTitle}>Mixer</Text>
        <TouchableOpacity style={styles.masterBtn}>
          <Text style={styles.masterText}>Master</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mixerChannels}>
        {tracks.map(track => (
          <View key={track.id} style={styles.channel}>
            <Text style={styles.channelName}>{track.name}</Text>
            
            <View style={styles.faderContainer}>
              <View style={styles.faderTrack}>
                <View style={[styles.faderFill, { height: `${track.volume}%`, backgroundColor: track.color }]} />
              </View>
              <View style={styles.faderControls}>
                <TouchableOpacity onPress={() => updateTrackVolume(track.id, 5)}>
                  <Ionicons name="add" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.volumeText}>{track.volume}</Text>
                <TouchableOpacity onPress={() => updateTrackVolume(track.id, -5)}>
                  <Ionicons name="remove" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.channelButtons}>
              <TouchableOpacity 
                style={[styles.channelBtn, track.muted && styles.channelBtnActive]}
                onPress={() => toggleTrackMute(track.id)}
              >
                <Text style={styles.channelBtnText}>M</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.channelBtn, track.solo && styles.channelBtnSolo]}
                onPress={() => toggleTrackSolo(track.id)}
              >
                <Text style={styles.channelBtnText}>S</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.channelIndicator, { backgroundColor: track.color }]} />
          </View>
        ))}

        {/* Master Channel */}
        <View style={[styles.channel, styles.masterChannel]}>
          <Text style={styles.channelName}>Master</Text>
          <View style={styles.faderContainer}>
            <View style={styles.faderTrack}>
              <View style={[styles.faderFill, { height: '85%', backgroundColor: COLORS.primary }]} />
            </View>
          </View>
          <View style={styles.masterMeter}>
            <View style={[styles.meterBar, { height: '70%' }]} />
            <View style={[styles.meterBar, { height: '65%' }]} />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.effectsBtn} onPress={() => setShowEffects(true)}>
        <Ionicons name="color-wand" size={20} color={COLORS.textPrimary} />
        <Text style={styles.effectsBtnText}>Effects ({activeEffects.length})</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLiveMode = () => (
    <View style={styles.liveSection}>
      {isLive ? (
        <>
          <View style={styles.liveHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <View style={styles.viewerCount}>
              <Ionicons name="eye" size={16} color={COLORS.textPrimary} />
              <Text style={styles.viewerText}>{viewers} watching</Text>
            </View>
          </View>

          <View style={styles.livePreview}>
            <Image source={{ uri: IMAGES.booth }} style={styles.liveImage} />
            <View style={styles.liveOverlay}>
              <AudioVisualizer isPlaying={true} />
            </View>
          </View>

          <View style={styles.liveControls}>
            <TouchableOpacity style={styles.liveControlBtn}>
              <Ionicons name="mic" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.liveControlBtn}>
              <Ionicons name="videocam" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.liveControlBtn}>
              <Ionicons name="chatbubbles" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.liveControlBtn, styles.endLiveBtn]} onPress={handleGoLive}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.goLiveContainer}>
          <Ionicons name="radio" size={64} color={COLORS.primary} />
          <Text style={styles.goLiveTitle}>Go Live</Text>
          <Text style={styles.goLiveDesc}>
            Stream your booth session in crystal clear HD quality to your fans
          </Text>
          <TouchableOpacity style={styles.goLiveBtn} onPress={handleGoLive}>
            <Ionicons name="radio" size={24} color={COLORS.textPrimary} />
            <Text style={styles.goLiveBtnText}>Start Live Session</Text>
          </TouchableOpacity>
          {!isPremium && (
            <View style={styles.premiumRequired}>
              <Ionicons name="diamond" size={16} color={COLORS.gold} />
              <Text style={styles.premiumRequiredText}>Premium Required</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>1Way Music Studio</Text>
        {isLive && (
          <View style={styles.liveTag}>
            <View style={styles.liveDotSmall} />
            <Text style={styles.liveTagText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Current Mic Indicator */}
      <TouchableOpacity style={styles.micIndicator} onPress={handleMicChange}>
        <View style={[styles.micDot, { backgroundColor: currentMic.color }]} />
        <View style={styles.micInfo}>
          <Text style={styles.micName}>{currentMic.name} Mic</Text>
          <Text style={styles.micQuality}>{currentMic.quality} Quality</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      </TouchableOpacity>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        {([
          { id: 'record', icon: 'mic', label: 'Record' },
          { id: 'edit', icon: 'create', label: 'Edit' },
          { id: 'mix', icon: 'options', label: 'Mix' },
          { id: 'live', icon: 'radio', label: 'Live' },
        ] as const).map(m => (
          <TouchableOpacity 
            key={m.id} 
            style={[styles.modeBtn, mode === m.id && styles.modeActive]} 
            onPress={() => setMode(m.id)}
          >
            <Ionicons 
              name={m.icon} 
              size={20} 
              color={mode === m.id ? COLORS.textPrimary : COLORS.textMuted} 
            />
            <Text style={[styles.modeText, mode === m.id && styles.modeTextActive]}>
              {m.label}
            </Text>
            {m.id === 'live' && !isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={10} color={COLORS.gold} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {mode === 'record' && renderRecordMode()}
        {mode === 'edit' && renderEditMode()}
        {mode === 'mix' && renderMixMode()}
        {mode === 'live' && renderLiveMode()}

        {/* Featuring Artist Section */}
        <View style={styles.featureSection}>
          <Text style={styles.sectionTitle}>Featuring Artist</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.artistList}>
            {ARTISTS.slice(0, 6).map(artist => (
              <TouchableOpacity 
                key={artist.id} 
                style={[styles.artistChip, featuringArtist === artist.id && styles.artistSelected]} 
                onPress={() => setFeaturingArtist(artist.id)}
              >
                <Image source={{ uri: artist.image }} style={styles.artistThumb} />
                <Text style={styles.artistName}>{artist.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {featuringArtist && (
            <TouchableOpacity style={styles.faceTimeBtn} onPress={handleFaceTime}>
              <Ionicons name="videocam" size={20} color={COLORS.textPrimary} />
              <Text style={styles.faceTimeText}>FaceTime with Artist (Crystal Clear HD)</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.qualityNote}>
          <Ionicons name="sparkles" size={16} color={COLORS.gold} />
          <Text style={styles.qualityNoteText}>
            Crystal clear recording & mixing with state-of-the-art technology
          </Text>
        </View>
      </ScrollView>

      {/* Effects Modal */}
      <Modal visible={showEffects} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Audio Effects</Text>
              <TouchableOpacity onPress={() => setShowEffects(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.effectsGrid}>
              {EFFECTS.map(effect => (
                <TouchableOpacity 
                  key={effect.id}
                  style={[styles.effectItem, activeEffects.includes(effect.id) && styles.effectItemActive]}
                  onPress={() => toggleEffect(effect.id)}
                >
                  <Ionicons 
                    name={effect.icon as any} 
                    size={32} 
                    color={activeEffects.includes(effect.id) ? COLORS.textPrimary : COLORS.textMuted} 
                  />
                  <Text style={[
                    styles.effectName, 
                    activeEffects.includes(effect.id) && styles.effectNameActive
                  ]}>
                    {effect.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.applyBtn} onPress={() => setShowEffects(false)}>
              <Text style={styles.applyBtnText}>Apply Effects</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginLeft: 16 },
  liveTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.error, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  liveDotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.textPrimary, marginRight: 6 },
  liveTagText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 11 },
  micIndicator: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.backgroundCard, 
    marginHorizontal: 20, 
    padding: 12, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  micDot: { width: 12, height: 12, borderRadius: 6 },
  micInfo: { flex: 1, marginLeft: 12 },
  micName: { color: COLORS.textPrimary, fontWeight: '700' },
  micQuality: { color: COLORS.textMuted, fontSize: 12 },
  modeSelector: { flexDirection: 'row', padding: 20, gap: 8 },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, backgroundColor: COLORS.backgroundCard, borderRadius: 12, position: 'relative' },
  modeActive: { backgroundColor: COLORS.primary },
  modeText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 12 },
  modeTextActive: { color: COLORS.textPrimary },
  premiumBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.backgroundLight, padding: 4, borderRadius: 8 },
  content: { flex: 1 },
  contentContainer: { paddingBottom: 40 },
  // Record Mode
  recordSection: { paddingHorizontal: 20 },
  waveformContainer: { height: 120, backgroundColor: COLORS.backgroundCard, borderRadius: 12, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  waveformPlaceholder: { alignItems: 'center' },
  waveformText: { color: COLORS.textMuted, marginTop: 8 },
  recordingStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 16 },
  recordingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.error },
  recordingTime: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 24 },
  recordingQuality: { color: COLORS.textMuted, fontSize: 12 },
  transportControls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 16 },
  transportBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.backgroundCard, justifyContent: 'center', alignItems: 'center' },
  recordBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.error, justifyContent: 'center', alignItems: 'center' },
  recordingActive: { backgroundColor: COLORS.primary },
  metronomeBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, paddingVertical: 12, backgroundColor: COLORS.backgroundCard, borderRadius: 12 },
  bpmText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 18 },
  // Edit Mode
  editSection: { paddingHorizontal: 20 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  timelineTitle: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 16 },
  timelineActions: { flexDirection: 'row', gap: 8 },
  timelineBtn: { padding: 8, backgroundColor: COLORS.backgroundCard, borderRadius: 8 },
  timeline: { maxHeight: 200 },
  timelineContent: { gap: 8 },
  trackRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, borderRadius: 8, overflow: 'hidden', height: 44 },
  trackRowSelected: { borderWidth: 1, borderColor: COLORS.primary },
  trackRowMuted: { opacity: 0.5 },
  trackLabel: { width: 60, height: '100%', justifyContent: 'center', alignItems: 'center' },
  trackName: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '600' },
  trackWaveform: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8 },
  waveformBar: { width: 3, borderRadius: 1.5 },
  editTools: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, paddingVertical: 16, backgroundColor: COLORS.backgroundCard, borderRadius: 12 },
  editTool: { alignItems: 'center' },
  editToolText: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
  // Mix Mode
  mixSection: { paddingHorizontal: 20 },
  mixHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  mixTitle: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 16 },
  masterBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  masterText: { color: COLORS.textPrimary, fontWeight: '600', fontSize: 12 },
  mixerChannels: { flexDirection: 'row', gap: 8 },
  channel: { flex: 1, backgroundColor: COLORS.backgroundCard, borderRadius: 12, padding: 12, alignItems: 'center' },
  masterChannel: { backgroundColor: COLORS.backgroundLight },
  channelName: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '600', marginBottom: 8 },
  faderContainer: { flex: 1, width: '100%', alignItems: 'center' },
  faderTrack: { width: 8, height: 100, backgroundColor: COLORS.backgroundLight, borderRadius: 4, justifyContent: 'flex-end' },
  faderFill: { width: '100%', borderRadius: 4 },
  faderControls: { alignItems: 'center', marginTop: 8 },
  volumeText: { color: COLORS.textMuted, fontSize: 10, marginVertical: 4 },
  channelButtons: { flexDirection: 'row', gap: 4, marginTop: 8 },
  channelBtn: { width: 24, height: 24, borderRadius: 4, backgroundColor: COLORS.backgroundLight, justifyContent: 'center', alignItems: 'center' },
  channelBtnActive: { backgroundColor: COLORS.error },
  channelBtnSolo: { backgroundColor: COLORS.gold },
  channelBtnText: { color: COLORS.textPrimary, fontSize: 10, fontWeight: '700' },
  channelIndicator: { width: '100%', height: 4, borderRadius: 2, marginTop: 8 },
  masterMeter: { flexDirection: 'row', gap: 4, marginTop: 8 },
  meterBar: { width: 8, backgroundColor: COLORS.success, borderRadius: 2 },
  effectsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, marginTop: 16 },
  effectsBtnText: { color: COLORS.textPrimary, fontWeight: '600' },
  // Live Mode
  liveSection: { paddingHorizontal: 20 },
  liveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.error },
  liveText: { color: COLORS.error, fontWeight: '700', fontSize: 18 },
  viewerCount: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewerText: { color: COLORS.textPrimary },
  livePreview: { height: 200, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  liveImage: { width: '100%', height: '100%' },
  liveOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
  liveControls: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 },
  liveControlBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.backgroundCard, justifyContent: 'center', alignItems: 'center' },
  endLiveBtn: { backgroundColor: COLORS.error },
  goLiveContainer: { alignItems: 'center', paddingVertical: 40 },
  goLiveTitle: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '700', marginTop: 16 },
  goLiveDesc: { color: COLORS.textMuted, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  goLiveBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.error, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30, marginTop: 24 },
  goLiveBtnText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 16 },
  premiumRequired: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  premiumRequiredText: { color: COLORS.gold, fontSize: 13 },
  // Feature Section
  featureSection: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  artistList: { gap: 12 },
  artistChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 8 },
  artistSelected: { backgroundColor: COLORS.primary },
  artistThumb: { width: 32, height: 32, borderRadius: 16 },
  artistName: { color: COLORS.textPrimary, fontSize: 14 },
  faceTimeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.success, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  faceTimeText: { color: COLORS.textPrimary, fontWeight: '600' },
  qualityNote: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: 'rgba(234,179,8,0.1)', 
    marginHorizontal: 20, 
    padding: 12, 
    borderRadius: 12 
  },
  qualityNoteText: { flex: 1, color: COLORS.gold, fontSize: 12 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  effectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  effectItem: { width: '30%', aspectRatio: 1, backgroundColor: COLORS.backgroundCard, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  effectItemActive: { backgroundColor: COLORS.primary },
  effectName: { color: COLORS.textMuted, fontSize: 12, marginTop: 8 },
  effectNameActive: { color: COLORS.textPrimary },
  applyBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  applyBtnText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
});
