import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';

export default function LiveTourScreen() {
  const router = useRouter();
  const { wallet, updateWallet, useCredit, addTransaction } = useApp();
  const { profile } = useAuth();
  const [tourType, setTourType] = useState<'virtual' | 'studio'>('virtual');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [useCredits, setUseCredits] = useState(false);

  const isPremium = profile?.isPremium;
  const TOUR_PRICE = 100;

  useEffect(() => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Live Screen Tours are available for Premium members only.',
        [
          { text: 'Go Back', onPress: () => router.back() },
          { text: 'Upgrade', onPress: () => router.push('/premium') }
        ]
      );
    }
  }, [isPremium]);

  const handleBook = () => {
    if (!date.trim()) {
      Alert.alert('Select Date', 'Please enter your preferred date');
      return;
    }

    if (wallet.frozen) {
      Alert.alert('Account Frozen', 'Pay off your credit balance first');
      return;
    }

    if (useCredits) {
      useCredit(TOUR_PRICE);
      addTransaction({ type: 'tour', amount: TOUR_PRICE, fee: TOUR_PRICE * 0.20, description: `Live ${tourType === 'virtual' ? 'Screen' : 'Studio'} Tour (Credit)` });
      Alert.alert(
        'Tour Booked on Credit!',
        `Your live tour is confirmed.\n\nCredit: $${TOUR_PRICE}\nYour account will be frozen until paid.\n\nType: ${tourType === 'virtual' ? 'Virtual Screen Tour' : 'Studio Tour'}\nDate: ${date}\n\nStreaming in Crystal Clear HD`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      if (wallet.balance < TOUR_PRICE) {
        Alert.alert(
          'Insufficient Funds',
          `You need $${TOUR_PRICE} for a live tour.\n\nWould you like to use credit instead?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Use Credit', onPress: () => setUseCredits(true) }
          ]
        );
        return;
      }

      updateWallet(-TOUR_PRICE);
      addTransaction({ type: 'tour', amount: TOUR_PRICE, fee: TOUR_PRICE * 0.20, description: `Live ${tourType === 'virtual' ? 'Screen' : 'Studio'} Tour` });
      Alert.alert(
        'Tour Booked!',
        `Your live tour is confirmed.\n\nPaid: $${TOUR_PRICE}\n1Way fee: $${(TOUR_PRICE * 0.20).toFixed(2)}\n\nType: ${tourType === 'virtual' ? 'Virtual Screen Tour' : 'Studio Tour'}\nDate: ${date}\n\nStreaming in Crystal Clear HD`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  if (!isPremium) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Live Screen Tour</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.premiumRequired}>
          <Ionicons name="diamond" size={64} color={COLORS.gold} />
          <Text style={styles.premiumTitle}>Premium Feature</Text>
          <Text style={styles.premiumDesc}>
            Live Screen Tours are available for Premium members only.
            Upgrade to stream your creative process to fans worldwide.
          </Text>
          <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/premium')}>
            <Text style={styles.upgradeBtnText}>Upgrade to Premium - $12/year</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Live Screen Tour</Text>
        <View style={styles.premiumBadge}>
          <Ionicons name="diamond" size={16} color={COLORS.gold} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.priceCard}>
          <Ionicons name="videocam" size={40} color={COLORS.secondary} />
          <Text style={styles.priceAmount}>${TOUR_PRICE}</Text>
          <Text style={styles.priceLabel}>Live Tour Session</Text>
          <Text style={styles.priceDesc}>Stream your creative process to fans</Text>
          <View style={styles.qualityBadge}>
            <Ionicons name="sparkles" size={14} color={COLORS.gold} />
            <Text style={styles.qualityText}>Crystal Clear HD Streaming</Text>
          </View>
        </View>

        <View style={styles.feeInfo}>
          <Ionicons name="information-circle" size={16} color={COLORS.textMuted} />
          <Text style={styles.feeText}>20% fee applies ($20 goes to 1Way)</Text>
        </View>

        <Text style={styles.label}>Tour Type</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity style={[styles.typeBtn, tourType === 'virtual' && styles.typeActive]} onPress={() => setTourType('virtual')}>
            <Ionicons name="desktop" size={24} color={tourType === 'virtual' ? COLORS.textPrimary : COLORS.textMuted} />
            <Text style={[styles.typeText, tourType === 'virtual' && styles.typeTextActive]}>Screen Tour</Text>
            <Text style={styles.typeDesc}>Share your screen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, tourType === 'studio' && styles.typeActive]} onPress={() => setTourType('studio')}>
            <Ionicons name="business" size={24} color={tourType === 'studio' ? COLORS.textPrimary : COLORS.textMuted} />
            <Text style={[styles.typeText, tourType === 'studio' && styles.typeTextActive]}>Studio Tour</Text>
            <Text style={styles.typeDesc}>Show your setup</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Preferred Date</Text>
        <TextInput style={styles.input} placeholder="e.g., Dec 15, 2025 at 3PM" placeholderTextColor={COLORS.textMuted} value={date} onChangeText={setDate} />

        <Text style={styles.label}>Additional Notes</Text>
        <TextInput style={styles.notesInput} placeholder="What will you showcase?" placeholderTextColor={COLORS.textMuted} value={notes} onChangeText={setNotes} multiline />

        <View style={styles.includes}>
          <Text style={styles.includesTitle}>Tour Includes:</Text>
          {[
            '1-hour live stream in Crystal Clear HD',
            'Fan Q&A session',
            'Recording for replay',
            'Promotional support',
            'Unlimited viewers',
            'Real-time chat with fans'
          ].map((item, i) => (
            <View key={i} style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.includeText}>{item}</Text>
            </View>
          ))}
        </View>

        {wallet.balance < TOUR_PRICE && !useCredits && (
          <TouchableOpacity style={styles.creditOption} onPress={() => setUseCredits(true)}>
            <Ionicons name="card" size={20} color={COLORS.gold} />
            <View style={styles.creditInfo}>
              <Text style={styles.creditTitle}>Don't have $100?</Text>
              <Text style={styles.creditDesc}>Use credit - account frozen until paid</Text>
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
          <Ionicons name="radio" size={20} color={COLORS.textPrimary} />
          <Text style={styles.bookText}>{useCredits ? 'Book with Credit' : 'Book Live Tour'}</Text>
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
  premiumBadge: { backgroundColor: 'rgba(234,179,8,0.2)', padding: 8, borderRadius: 12 },
  premiumRequired: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  premiumTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginTop: 20 },
  premiumDesc: { color: COLORS.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 22 },
  upgradeBtn: { backgroundColor: COLORS.gold, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 24 },
  upgradeBtnText: { color: COLORS.background, fontWeight: '700', fontSize: 16 },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  priceCard: { alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 24, borderRadius: 20 },
  priceAmount: { fontSize: 48, fontWeight: '800', color: COLORS.textPrimary, marginTop: 12 },
  priceLabel: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary },
  priceDesc: { fontSize: 14, color: COLORS.textMuted, marginTop: 8, textAlign: 'center' },
  qualityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(234,179,8,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 12 },
  qualityText: { color: COLORS.gold, fontSize: 12, fontWeight: '600' },
  feeInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 },
  feeText: { color: COLORS.textMuted, fontSize: 12 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginTop: 24, marginBottom: 8 },
  typeSelector: { flexDirection: 'row', gap: 12 },
  typeBtn: { flex: 1, alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12 },
  typeActive: { backgroundColor: COLORS.secondary },
  typeText: { color: COLORS.textMuted, fontWeight: '600', marginTop: 8 },
  typeTextActive: { color: COLORS.textPrimary },
  typeDesc: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
  input: { backgroundColor: COLORS.backgroundCard, borderRadius: 12, padding: 16, color: COLORS.textPrimary, fontSize: 16 },
  notesInput: { backgroundColor: COLORS.backgroundCard, borderRadius: 12, padding: 16, color: COLORS.textPrimary, minHeight: 80, textAlignVertical: 'top' },
  includes: { backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12, marginTop: 24 },
  includesTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 },
  includeItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  includeText: { color: COLORS.textSecondary, fontSize: 14 },
  creditOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12, marginTop: 16, borderWidth: 1, borderColor: COLORS.gold },
  creditInfo: { flex: 1, marginLeft: 12 },
  creditTitle: { color: COLORS.gold, fontWeight: '600' },
  creditDesc: { color: COLORS.textMuted, fontSize: 12 },
  creditWarning: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(245,158,11,0.2)', padding: 12, borderRadius: 12, marginTop: 12 },
  creditWarningText: { flex: 1, color: COLORS.gold, fontSize: 12 },
  bookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.secondary, paddingVertical: 16, borderRadius: 12, marginTop: 24 },
  bookText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  balanceText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 16 },
});
