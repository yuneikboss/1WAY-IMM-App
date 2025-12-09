import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { ARTISTS } from './data/artists';
import { useApp } from './context/AppContext';

const SPONSOR_TIERS = [
  { id: '1', name: 'Bronze', amount: 10, perks: ['Shoutout', 'Badge'] },
  { id: '2', name: 'Silver', amount: 25, perks: ['Shoutout', 'Badge', 'Early Access'] },
  { id: '3', name: 'Gold', amount: 50, perks: ['Shoutout', 'Badge', 'Early Access', 'Exclusive Content'] },
  { id: '4', name: 'Platinum', amount: 100, perks: ['All Perks', 'Direct Message', 'Video Call'] },
];

export default function SponsorScreen() {
  const router = useRouter();
  const { wallet, updateWallet, addTransaction } = useApp();
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const handleSponsor = () => {
    if (!selectedArtist) {
      Alert.alert('Select Artist', 'Please select an artist to sponsor');
      return;
    }

    const tier = SPONSOR_TIERS.find(t => t.id === selectedTier);
    const amount = tier ? tier.amount : parseFloat(customAmount);

    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please select a tier or enter a custom amount');
      return;
    }

    if (wallet.frozen) {
      Alert.alert('Account Frozen', 'Pay off your credit to sponsor artists');
      return;
    }

    if (wallet.balance < amount) {
      Alert.alert('Insufficient Funds', 'Add funds to your wallet');
      return;
    }

    const artist = ARTISTS.find(a => a.id === selectedArtist);
    if (!artist) return;

    updateWallet(-amount);
    addTransaction({ type: 'sponsor', amount, fee: 0, toId: selectedArtist, description: `Sponsored ${artist.name}${tier ? ` (${tier.name})` : ''}` });
    Alert.alert('Sponsorship Complete!', `You sponsored ${artist.name} with $${amount.toFixed(2)}\nNo fees charged - 100% goes to the artist!`);
    
    setSelectedArtist(null);
    setSelectedTier(null);
    setCustomAmount('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Sponsor Artist</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.freeTag}>
        <Ionicons name="gift" size={16} color={COLORS.gold} />
        <Text style={styles.freeText}>Sponsoring is FREE - No fees!</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.label}>Select Artist</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.artistList}>
          {ARTISTS.slice(0, 8).map(artist => (
            <TouchableOpacity key={artist.id} style={[styles.artistCard, selectedArtist === artist.id && styles.artistSelected]} onPress={() => setSelectedArtist(artist.id)}>
              <Image source={{ uri: artist.image }} style={styles.artistImage} />
              <Text style={styles.artistName} numberOfLines={1}>{artist.name}</Text>
              {artist.verified && <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} style={styles.verifiedBadge} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Select Tier</Text>
        <View style={styles.tierGrid}>
          {SPONSOR_TIERS.map(tier => (
            <TouchableOpacity key={tier.id} style={[styles.tierCard, selectedTier === tier.id && styles.tierSelected]} onPress={() => { setSelectedTier(tier.id); setCustomAmount(''); }}>
              <Text style={styles.tierName}>{tier.name}</Text>
              <Text style={styles.tierAmount}>${tier.amount}</Text>
              <View style={styles.perksList}>
                {tier.perks.slice(0, 2).map((perk, i) => (
                  <Text key={i} style={styles.perkText}>{perk}</Text>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Or Custom Amount</Text>
        <View style={styles.customInput}>
          <Text style={styles.currency}>$</Text>
          <TextInput style={styles.customField} placeholder="Enter amount" placeholderTextColor={COLORS.textMuted} keyboardType="decimal-pad" value={customAmount} onChangeText={(v) => { setCustomAmount(v); setSelectedTier(null); }} />
        </View>

        <TouchableOpacity style={styles.sponsorBtn} onPress={handleSponsor}>
          <Ionicons name="gift" size={20} color={COLORS.textPrimary} />
          <Text style={styles.sponsorText}>Sponsor Now</Text>
        </TouchableOpacity>

        <Text style={styles.balanceText}>Your Balance: ${wallet.balance.toFixed(2)}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  freeTag: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 },
  freeText: { color: COLORS.gold, fontSize: 14, fontWeight: '600' },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginTop: 20, marginBottom: 12 },
  artistList: { gap: 12 },
  artistCard: { alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 12, borderRadius: 16, width: 90 },
  artistSelected: { backgroundColor: COLORS.primary },
  artistImage: { width: 50, height: 50, borderRadius: 25 },
  artistName: { color: COLORS.textPrimary, fontSize: 12, marginTop: 8, textAlign: 'center' },
  verifiedBadge: { position: 'absolute', top: 8, right: 8 },
  tierGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tierCard: { width: '47%', backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  tierSelected: { borderColor: COLORS.gold },
  tierName: { fontSize: 16, fontWeight: '700', color: COLORS.gold },
  tierAmount: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginTop: 4 },
  perksList: { marginTop: 8 },
  perkText: { fontSize: 11, color: COLORS.textMuted },
  customInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, borderRadius: 12, paddingHorizontal: 16 },
  currency: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  customField: { flex: 1, fontSize: 20, color: COLORS.textPrimary, paddingVertical: 14, marginLeft: 8 },
  sponsorBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.gold, paddingVertical: 16, borderRadius: 12, marginTop: 24 },
  sponsorText: { color: COLORS.background, fontSize: 16, fontWeight: '700' },
  balanceText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 16 },
});
