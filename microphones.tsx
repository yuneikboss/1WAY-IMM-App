import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';

const MICROPHONES = [
  {
    id: 'basic',
    name: 'Basic Mic',
    price: 0,
    image: 'https://d64gsuwffb70l.cloudfront.net/692bf8fe6f6012747066995c_1764997716815_5d4cb78c.png',
    quality: 'Standard',
    features: ['Basic recording', 'Mono audio', 'Standard compression'],
    description: 'Perfect for beginners. Get started with basic recording capabilities.',
    tier: 1,
  },
  {
    id: 'silver',
    name: 'Silver Mic',
    price: 5,
    image: 'https://d64gsuwffb70l.cloudfront.net/692bf8fe6f6012747066995c_1764997716562_82537033.png',
    quality: 'Enhanced',
    features: ['Enhanced clarity', 'Stereo audio', 'Noise reduction', 'Basic EQ'],
    description: 'Step up your game with enhanced audio quality and noise reduction.',
    tier: 2,
  },
  {
    id: 'gold',
    name: 'Gold Mic',
    price: 10,
    image: 'https://d64gsuwffb70l.cloudfront.net/692bf8fe6f6012747066995c_1764997721864_5946d9d8.png',
    quality: 'Professional',
    features: ['Studio quality', 'Multi-track', 'Advanced EQ', 'Reverb effects', 'Auto-tune lite'],
    description: 'Professional-grade recording with studio-quality output.',
    tier: 3,
  },
  {
    id: 'platinum',
    name: 'Platinum Mic',
    price: 15,
    image: 'https://d64gsuwffb70l.cloudfront.net/692bf8fe6f6012747066995c_1764997716758_23d9d633.jpg',
    quality: 'Premium',
    features: ['Crystal clear audio', 'Unlimited tracks', 'Full effect suite', 'Auto-tune pro', 'Vocal isolation'],
    description: 'Premium recording experience with full professional features.',
    tier: 4,
  },
  {
    id: 'diamond',
    name: 'Diamond Mic',
    price: 20,
    image: 'https://d64gsuwffb70l.cloudfront.net/692bf8fe6f6012747066995c_1764997716815_5d4cb78c.png',
    quality: 'Ultimate',
    features: ['Broadcast quality', 'AI enhancement', 'Real-time mastering', 'Spatial audio', 'Voice cloning', 'Unlimited storage'],
    description: 'The ultimate recording experience. Industry-leading technology.',
    tier: 5,
  },
];

export default function MicrophonesScreen() {
  const router = useRouter();
  const { profile, purchaseMic, paymentMethods } = useAuth();
  const { wallet, updateWallet } = useApp();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedMic, setSelectedMic] = useState<string | null>(null);

  const ownedMics = profile?.ownedMics || ['basic'];
  const activeMic = profile?.activeMic || 'basic';

  const handlePurchase = async (mic: typeof MICROPHONES[0]) => {
    if (mic.price === 0) return;

    if (ownedMics.includes(mic.id)) {
      // Already owned, just activate
      Alert.alert('Mic Activated', `${mic.name} is now your active microphone!`);
      return;
    }

    if (wallet.balance < mic.price) {
      Alert.alert(
        'Insufficient Funds',
        `You need $${mic.price} to purchase this mic. Your balance: $${wallet.balance.toFixed(2)}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Funds', onPress: () => router.push('/wallet') }
        ]
      );
      return;
    }

    Alert.alert(
      'Purchase Microphone',
      `${mic.name} - $${mic.price}\n\nThis will be deducted from your wallet balance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            setLoading(mic.id);
            try {
              updateWallet(-mic.price);
              await purchaseMic(mic.id, mic.price);
              Alert.alert('Success!', `${mic.name} has been added to your collection!`);
            } catch (error) {
              Alert.alert('Error', 'Purchase failed. Please try again.');
            }
            setLoading(null);
          }
        }
      ]
    );
  };

  const getStatusBadge = (mic: typeof MICROPHONES[0]) => {
    if (activeMic === mic.id) return { text: 'ACTIVE', color: COLORS.success };
    if (ownedMics.includes(mic.id)) return { text: 'OWNED', color: COLORS.primary };
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Virtual Mics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.infoCard}>
          <Ionicons name="mic" size={24} color={COLORS.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Upgrade Your Sound</Text>
            <Text style={styles.infoDesc}>
              Better microphones = better recording quality. Choose the right mic for your style.
            </Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Wallet Balance</Text>
          <Text style={styles.balanceValue}>${wallet.balance.toFixed(2)}</Text>
        </View>

        {MICROPHONES.map((mic) => {
          const status = getStatusBadge(mic);
          const isOwned = ownedMics.includes(mic.id);
          
          return (
            <TouchableOpacity 
              key={mic.id} 
              style={[
                styles.micCard, 
                selectedMic === mic.id && styles.micCardSelected,
                activeMic === mic.id && styles.micCardActive,
              ]}
              onPress={() => setSelectedMic(selectedMic === mic.id ? null : mic.id)}
            >
              <View style={styles.micHeader}>
                <Image source={{ uri: mic.image }} style={styles.micImage} />
                <View style={styles.micInfo}>
                  <View style={styles.micTitleRow}>
                    <Text style={styles.micName}>{mic.name}</Text>
                    {status && (
                      <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                        <Text style={styles.statusText}>{status.text}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.micQuality}>{mic.quality} Quality</Text>
                  <View style={styles.tierIndicator}>
                    {[1, 2, 3, 4, 5].map(t => (
                      <View 
                        key={t} 
                        style={[
                          styles.tierDot, 
                          t <= mic.tier && styles.tierDotActive
                        ]} 
                      />
                    ))}
                  </View>
                </View>
                <View style={styles.priceTag}>
                  {mic.price === 0 ? (
                    <Text style={styles.freeText}>FREE</Text>
                  ) : (
                    <Text style={styles.priceText}>${mic.price}</Text>
                  )}
                </View>
              </View>

              {selectedMic === mic.id && (
                <View style={styles.micDetails}>
                  <Text style={styles.micDesc}>{mic.description}</Text>
                  <View style={styles.featuresList}>
                    {mic.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  
                  {!isOwned && mic.price > 0 && (
                    <TouchableOpacity 
                      style={styles.purchaseBtn}
                      onPress={() => handlePurchase(mic)}
                      disabled={loading === mic.id}
                    >
                      {loading === mic.id ? (
                        <ActivityIndicator color={COLORS.textPrimary} />
                      ) : (
                        <>
                          <Ionicons name="cart" size={20} color={COLORS.textPrimary} />
                          <Text style={styles.purchaseBtnText}>Purchase for ${mic.price}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                  
                  {isOwned && activeMic !== mic.id && (
                    <TouchableOpacity 
                      style={[styles.purchaseBtn, styles.activateBtn]}
                      onPress={() => handlePurchase(mic)}
                    >
                      <Ionicons name="mic" size={20} color={COLORS.textPrimary} />
                      <Text style={styles.purchaseBtnText}>Set as Active</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={styles.noteCard}>
          <Ionicons name="information-circle" size={20} color={COLORS.textMuted} />
          <Text style={styles.noteText}>
            Microphone purchases are one-time. Once purchased, you own it forever and can switch between mics anytime.
          </Text>
        </View>
      </ScrollView>

      <MiniPlayer />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 16 
  },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 180 },
  infoCard: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.backgroundCard, 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 16 
  },
  infoContent: { flex: 1, marginLeft: 12 },
  infoTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  infoDesc: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  balanceCard: { 
    backgroundColor: COLORS.primary, 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: { color: COLORS.textSecondary, fontSize: 12 },
  balanceValue: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800' },
  micCard: { 
    backgroundColor: COLORS.backgroundCard, 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  micCardSelected: { borderColor: COLORS.primary },
  micCardActive: { borderColor: COLORS.success },
  micHeader: { flexDirection: 'row', alignItems: 'center' },
  micImage: { width: 70, height: 70, borderRadius: 12 },
  micInfo: { flex: 1, marginLeft: 12 },
  micTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  micName: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { color: COLORS.textPrimary, fontSize: 10, fontWeight: '700' },
  micQuality: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  tierIndicator: { flexDirection: 'row', gap: 4, marginTop: 8 },
  tierDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.backgroundLight },
  tierDotActive: { backgroundColor: COLORS.gold },
  priceTag: { backgroundColor: COLORS.backgroundLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  freeText: { color: COLORS.success, fontWeight: '700' },
  priceText: { color: COLORS.gold, fontWeight: '700', fontSize: 16 },
  micDetails: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.backgroundLight },
  micDesc: { color: COLORS.textSecondary, lineHeight: 20 },
  featuresList: { marginTop: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  featureText: { color: COLORS.textPrimary, fontSize: 14 },
  purchaseBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    backgroundColor: COLORS.primary, 
    paddingVertical: 14, 
    borderRadius: 12, 
    marginTop: 16 
  },
  activateBtn: { backgroundColor: COLORS.success },
  purchaseBtnText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  noteCard: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.backgroundCard, 
    padding: 16, 
    borderRadius: 12, 
    marginTop: 8,
    gap: 12,
  },
  noteText: { flex: 1, color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },
});
