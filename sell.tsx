import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';

export default function SellScreen() {
  const router = useRouter();
  const [contentType, setContentType] = useState<'music' | 'video' | 'beat'>('music');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your content');
      return;
    }
    const numPrice = parseFloat(price);
    if (!numPrice || numPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }

    const fee = numPrice * 0.20;
    const earnings = numPrice - fee;

    Alert.alert(
      'Content Published!',
      `Your ${contentType} "${title}" is now for sale at $${numPrice.toFixed(2)}\n\nPer sale:\nYou earn: $${earnings.toFixed(2)}\n1Way fee: $${fee.toFixed(2)} (20%)`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Sell Your Music</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.feeInfo}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.feeText}>20¢ per $1 goes to 1Way on each sale</Text>
        </View>

        <Text style={styles.label}>Content Type</Text>
        <View style={styles.typeSelector}>
          {(['music', 'video', 'beat'] as const).map(type => (
            <TouchableOpacity key={type} style={[styles.typeBtn, contentType === type && styles.typeActive]} onPress={() => setContentType(type)}>
              <Ionicons name={type === 'music' ? 'musical-note' : type === 'video' ? 'videocam' : 'disc'} size={20} color={contentType === type ? COLORS.textPrimary : COLORS.textMuted} />
              <Text style={[styles.typeText, contentType === type && styles.typeTextActive]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} placeholder="Enter title..." placeholderTextColor={COLORS.textMuted} value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Price</Text>
        <View style={styles.priceInput}>
          <Text style={styles.currency}>$</Text>
          <TextInput style={styles.priceField} placeholder="0.00" placeholderTextColor={COLORS.textMuted} keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
        </View>

        {price && parseFloat(price) > 0 && (
          <View style={styles.earningsPreview}>
            <Text style={styles.earningsLabel}>Your earnings per sale:</Text>
            <Text style={styles.earningsAmount}>${(parseFloat(price) * 0.80).toFixed(2)}</Text>
          </View>
        )}

        <Text style={styles.label}>Description</Text>
        <TextInput style={styles.descInput} placeholder="Describe your content..." placeholderTextColor={COLORS.textMuted} value={description} onChangeText={setDescription} multiline />

        <TouchableOpacity style={styles.uploadBtn}>
          <Ionicons name="cloud-upload" size={24} color={COLORS.primary} />
          <Text style={styles.uploadText}>Upload File</Text>
          <Text style={styles.uploadHint}>MP3, MP4, WAV supported</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.coverBtn}>
          <Ionicons name="image" size={24} color={COLORS.textMuted} />
          <Text style={styles.coverText}>Add Cover Art</Text>
        </TouchableOpacity>

        <View style={styles.certInfo}>
          <Text style={styles.certTitle}>Certification Goals</Text>
          <View style={styles.certRow}>
            <Ionicons name="disc" size={16} color={COLORS.gold} />
            <Text style={styles.certText}>Gold: 5,000 sales</Text>
          </View>
          <View style={styles.certRow}>
            <Ionicons name="disc" size={16} color="#C0C0C0" />
            <Text style={styles.certText}>Platinum: 7,000 sales</Text>
          </View>
          <View style={styles.certRow}>
            <Ionicons name="diamond" size={16} color="#B9F2FF" />
            <Text style={styles.certText}>Diamond: 10,000 sales</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.publishBtn} onPress={handlePublish}>
          <Ionicons name="rocket" size={20} color={COLORS.textPrimary} />
          <Text style={styles.publishText}>Publish to Store</Text>
        </TouchableOpacity>
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
  feeInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.backgroundCard, padding: 12, borderRadius: 12 },
  feeText: { color: COLORS.textSecondary, fontSize: 14 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginTop: 20, marginBottom: 8 },
  typeSelector: { flexDirection: 'row', gap: 12 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: COLORS.backgroundCard, borderRadius: 12 },
  typeActive: { backgroundColor: COLORS.primary },
  typeText: { color: COLORS.textMuted, fontWeight: '600' },
  typeTextActive: { color: COLORS.textPrimary },
  input: { backgroundColor: COLORS.backgroundCard, borderRadius: 12, padding: 16, color: COLORS.textPrimary, fontSize: 16 },
  priceInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, borderRadius: 12, paddingHorizontal: 16 },
  currency: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  priceField: { flex: 1, fontSize: 20, color: COLORS.textPrimary, paddingVertical: 14, marginLeft: 8 },
  earningsPreview: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.success + '20', padding: 12, borderRadius: 12, marginTop: 12 },
  earningsLabel: { color: COLORS.success, fontSize: 14 },
  earningsAmount: { color: COLORS.success, fontSize: 18, fontWeight: '700' },
  descInput: { backgroundColor: COLORS.backgroundCard, borderRadius: 12, padding: 16, color: COLORS.textPrimary, minHeight: 100, textAlignVertical: 'top' },
  uploadBtn: { alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 24, borderRadius: 12, marginTop: 20, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed' },
  uploadText: { color: COLORS.primary, fontSize: 16, fontWeight: '600', marginTop: 8 },
  uploadHint: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  coverBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12, marginTop: 12 },
  coverText: { color: COLORS.textMuted },
  certInfo: { backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12, marginTop: 20 },
  certTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 12 },
  certRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  certText: { color: COLORS.textSecondary, fontSize: 13 },
  publishBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, marginTop: 24 },
  publishText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
});
