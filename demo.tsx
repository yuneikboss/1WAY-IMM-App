import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { useApp } from './context/AppContext';

export default function DemoScreen() {
  const router = useRouter();
  const { wallet, updateWallet, useCredit, addTransaction } = useApp();
  const [genre, setGenre] = useState('');
  const [notes, setNotes] = useState('');
  const [useCredits, setUseCredits] = useState(false);

  const DEMO_PRICE = 100;

  const handleBook = () => {
    if (!genre.trim()) {
      Alert.alert('Select Genre', 'Please enter your preferred genre');
      return;
    }

    if (wallet.frozen) {
      Alert.alert('Account Frozen', 'Pay off your credit balance first');
      return;
    }

    if (useCredits) {
      useCredit(DEMO_PRICE);
      addTransaction({ type: 'demo', amount: DEMO_PRICE, fee: DEMO_PRICE * 0.20, description: 'Demo Session (Credit)' });
      Alert.alert(
        'Demo Booked on Credit!',
        `Your demo session is confirmed.\n\nCredit: $${DEMO_PRICE}\nYour account will be frozen until paid.\n\nGenre: ${genre}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      if (wallet.balance < DEMO_PRICE) {
        Alert.alert(
          'Insufficient Funds',
          `You need $${DEMO_PRICE} for a demo session.\n\nWould you like to use credit instead?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Use Credit', onPress: () => setUseCredits(true) }
          ]
        );
        return;
      }

      updateWallet(-DEMO_PRICE);
      addTransaction({ type: 'demo', amount: DEMO_PRICE, fee: DEMO_PRICE * 0.20, description: 'Demo Session' });
      Alert.alert(
        'Demo Booked!',
        `Your demo session is confirmed.\n\nPaid: $${DEMO_PRICE}\n1Way fee: $${(DEMO_PRICE * 0.20).toFixed(2)}\n\nGenre: ${genre}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Book Demo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.priceCard}>
          <Ionicons name="mic" size={40} color={COLORS.primary} />
          <Text style={styles.priceAmount}>${DEMO_PRICE}</Text>
          <Text style={styles.priceLabel}>Demo Session</Text>
          <Text style={styles.priceDesc}>Professional recording session with our team</Text>
        </View>

        <View style={styles.feeInfo}>
          <Ionicons name="information-circle" size={16} color={COLORS.textMuted} />
          <Text style={styles.feeText}>20% fee applies ($20 goes to 1Way)</Text>
        </View>

        <Text style={styles.label}>Preferred Genre</Text>
        <TextInput style={styles.input} placeholder="e.g., Hip-Hop, R&B, Pop..." placeholderTextColor={COLORS.textMuted} value={genre} onChangeText={setGenre} />

        <Text style={styles.label}>Additional Notes</Text>
        <TextInput style={styles.notesInput} placeholder="Tell us about your vision..." placeholderTextColor={COLORS.textMuted} value={notes} onChangeText={setNotes} multiline />

        <View style={styles.includes}>
          <Text style={styles.includesTitle}>Session Includes:</Text>
          {['2-hour studio time', 'Professional engineer', 'Basic mixing', 'Digital file delivery'].map((item, i) => (
            <View key={i} style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.includeText}>{item}</Text>
            </View>
          ))}
        </View>

        {wallet.balance < DEMO_PRICE && !useCredits && (
          <TouchableOpacity style={styles.creditOption} onPress={() => setUseCredits(true)}>
            <Ionicons name="card" size={20} color={COLORS.gold} />
            <View style={styles.creditInfo}>
              <Text style={styles.creditTitle}>Don't have $100?</Text>
              <Text style={styles.creditDesc}>Use credit - account frozen until paid</Text>
            </View>
            <View style={[styles.checkbox, useCredits && styles.checkboxActive]}>
              {useCredits && <Ionicons name="checkmark" size={14} color={COLORS.textPrimary} />}
            </View>
          </TouchableOpacity>
        )}

        {useCredits && (
          <View style={styles.creditWarning}>
            <Ionicons name="warning" size={20} color={COLORS.gold} />
            <Text style={styles.creditWarningText}>Your account will be frozen until you pay back the $100 credit</Text>
          </View>
        )}

        <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
          <Ionicons name="calendar" size={20} color={COLORS.textPrimary} />
          <Text style={styles.bookText}>{useCredits ? 'Book with Credit' : 'Book Now'}</Text>
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
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  priceCard: { alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 24, borderRadius: 20 },
  priceAmount: { fontSize: 48, fontWeight: '800', color: COLORS.textPrimary, marginTop: 12 },
  priceLabel: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary },
  priceDesc: { fontSize: 14, color: COLORS.textMuted, marginTop: 8, textAlign: 'center' },
  feeInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 },
  feeText: { color: COLORS.textMuted, fontSize: 12 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginTop: 24, marginBottom: 8 },
  input: { backgroundColor: COLORS.backgroundCard, borderRadius: 12, padding: 16, color: COLORS.textPrimary, fontSize: 16 },
  notesInput: { backgroundColor: COLORS.backgroundCard, borderRadius: 12, padding: 16, color: COLORS.textPrimary, minHeight: 100, textAlignVertical: 'top' },
  includes: { backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12, marginTop: 24 },
  includesTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 },
  includeItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  includeText: { color: COLORS.textSecondary, fontSize: 14 },
  creditOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12, marginTop: 16, borderWidth: 1, borderColor: COLORS.gold },
  creditInfo: { flex: 1, marginLeft: 12 },
  creditTitle: { color: COLORS.gold, fontWeight: '600' },
  creditDesc: { color: COLORS.textMuted, fontSize: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: COLORS.gold },
  creditWarning: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(245,158,11,0.2)', padding: 12, borderRadius: 12, marginTop: 12 },
  creditWarningText: { flex: 1, color: COLORS.gold, fontSize: 12 },
  bookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, marginTop: 24 },
  bookText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  balanceText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 16 },
});
