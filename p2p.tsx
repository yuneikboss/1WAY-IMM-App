import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { ARTISTS } from './data/artists';
import { useApp } from './context/AppContext';

export default function P2PScreen() {
  const router = useRouter();
  const { wallet, updateWallet, addTransaction, following } = useApp();
  const [mode, setMode] = useState<'send' | 'request'>('send');
  const [amount, setAmount] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const followedArtists = ARTISTS.filter(a => following.includes(a.id));

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    if (!selectedArtist) {
      Alert.alert('Select Artist', 'Please select an artist');
      return;
    }

    const artist = ARTISTS.find(a => a.id === selectedArtist);
    if (!artist) return;

    if (mode === 'send') {
      if (wallet.frozen) {
        Alert.alert('Account Frozen', 'Pay off your credit to send money');
        return;
      }
      if (wallet.balance < numAmount) {
        Alert.alert('Insufficient Funds', 'You don\'t have enough balance');
        return;
      }
      updateWallet(-numAmount);
      addTransaction({ type: 'send', amount: numAmount, fee: 0, toId: selectedArtist, description: `Sent to ${artist.name}${note ? `: ${note}` : ''}` });
      Alert.alert('Money Sent!', `$${numAmount.toFixed(2)} sent to ${artist.name}\nNo fees charged!`);
    } else {
      addTransaction({ type: 'receive', amount: 0, fee: 0, fromId: selectedArtist, description: `Requested $${numAmount.toFixed(2)} from ${artist.name}` });
      Alert.alert('Request Sent!', `Payment request of $${numAmount.toFixed(2)} sent to ${artist.name}`);
    }

    setAmount('');
    setSelectedArtist(null);
    setNote('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>P2P Transfer</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.modeSelector}>
        <TouchableOpacity style={[styles.modeBtn, mode === 'send' && styles.modeActive]} onPress={() => setMode('send')}>
          <Ionicons name="send" size={20} color={mode === 'send' ? COLORS.textPrimary : COLORS.textMuted} />
          <Text style={[styles.modeText, mode === 'send' && styles.modeTextActive]}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeBtn, mode === 'request' && styles.modeActive]} onPress={() => setMode('request')}>
          <Ionicons name="download" size={20} color={mode === 'request' ? COLORS.textPrimary : COLORS.textMuted} />
          <Text style={[styles.modeText, mode === 'request' && styles.modeTextActive]}>Request</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.freeTag}>
        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
        <Text style={styles.freeText}>P2P transfers are FREE - No fees!</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.label}>Amount</Text>
        <View style={styles.amountInput}>
          <Text style={styles.currency}>$</Text>
          <TextInput style={styles.amountField} placeholder="0.00" placeholderTextColor={COLORS.textMuted} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
        </View>

        <Text style={styles.label}>Select Artist</Text>
        {followedArtists.length === 0 ? (
          <View style={styles.emptyArtists}>
            <Text style={styles.emptyText}>Follow artists to send/request money</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/artists')}>
              <Text style={styles.browseBtnText}>Browse Artists</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.artistList}>
            {followedArtists.map(artist => (
              <TouchableOpacity key={artist.id} style={[styles.artistChip, selectedArtist === artist.id && styles.artistSelected]} onPress={() => setSelectedArtist(artist.id)}>
                <Image source={{ uri: artist.image }} style={styles.artistThumb} />
                <Text style={styles.artistName}>{artist.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={styles.label}>Note (Optional)</Text>
        <TextInput style={styles.noteInput} placeholder="Add a note..." placeholderTextColor={COLORS.textMuted} value={note} onChangeText={setNote} multiline />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Ionicons name={mode === 'send' ? 'send' : 'download'} size={20} color={COLORS.textPrimary} />
          <Text style={styles.submitText}>{mode === 'send' ? 'Send Money' : 'Request Money'}</Text>
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
  modeSelector: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: COLORS.backgroundCard, borderRadius: 12, padding: 4 },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 10 },
  modeActive: { backgroundColor: COLORS.primary },
  modeText: { color: COLORS.textMuted, fontWeight: '600' },
  modeTextActive: { color: COLORS.textPrimary },
  freeTag: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  freeText: { color: COLORS.success, fontSize: 14, fontWeight: '600' },
  content: { flex: 1 },
  contentContainer: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginTop: 20, marginBottom: 8 },
  amountInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, borderRadius: 12, paddingHorizontal: 16 },
  currency: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  amountField: { flex: 1, fontSize: 32, fontWeight: '700', color: COLORS.textPrimary, paddingVertical: 16, marginLeft: 8 },
  emptyArtists: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { color: COLORS.textMuted },
  browseBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16, marginTop: 12 },
  browseBtnText: { color: COLORS.textPrimary, fontWeight: '600' },
  artistList: { gap: 12 },
  artistChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 8 },
  artistSelected: { backgroundColor: COLORS.primary },
  artistThumb: { width: 32, height: 32, borderRadius: 16 },
  artistName: { color: COLORS.textPrimary, fontSize: 14 },
  noteInput: { backgroundColor: COLORS.backgroundCard, borderRadius: 12, padding: 16, color: COLORS.textPrimary, minHeight: 80, textAlignVertical: 'top' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, marginTop: 24 },
  submitText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  balanceText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 16 },
});
