import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { useAuth } from './context/AuthContext';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';

const PREMIUM_FEATURES = [
  { icon: 'videocam', title: 'Live Tours', desc: 'Stream live tours and connect with fans worldwide' },
  { icon: 'mic', title: 'Demo Sales', desc: 'Sell your demos and beats directly to buyers' },
  { icon: 'infinite', title: '1Way Infinite Money', desc: 'Unlimited earnings potential with no caps' },
  { icon: 'cloud-upload', title: '100GB Storage', desc: 'Store all your music, videos, and content' },
  { icon: 'trophy', title: 'Contest Priority', desc: 'Get featured placement in contests' },
  { icon: 'sparkles', title: '1WAY AI Access', desc: 'Full access to AI music assistant' },
  { icon: 'headset', title: 'Priority Support', desc: '24/7 premium customer support' },
  { icon: 'shield-checkmark', title: 'Verified Badge', desc: 'Stand out with a verified artist badge' },
];

const FREE_FEATURES = [
  { available: true, text: 'Basic music uploads' },
  { available: true, text: 'Profile customization' },
  { available: true, text: 'Basic microphone' },
  { available: true, text: '5GB storage' },
  { available: false, text: 'Live Tours' },
  { available: false, text: 'Demo Sales' },
  { available: false, text: '1Way Infinite Money' },
  { available: false, text: 'Premium Microphones' },
];

export default function PremiumScreen() {
  const router = useRouter();
  const { profile, purchasePremium, paymentMethods } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (paymentMethods.length === 0) {
      Alert.alert(
        'Add Payment Method',
        'Please add a payment method to continue',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Payment', onPress: () => router.push('/payment-methods') }
        ]
      );
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      '1WAY Premium - $12/year\n\nYou will be charged $12.00 for a 1-year subscription.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Subscribe', 
          onPress: async () => {
            setLoading(true);
            try {
              const success = await purchasePremium();
              if (success) {
                Alert.alert('Welcome to Premium!', 'You now have access to all premium features.');
              }
            } catch (error) {
              Alert.alert('Error', 'Payment failed. Please try again.');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const isPremium = profile?.isPremium;
  const expiryDate = profile?.premiumExpiry 
    ? new Date(profile.premiumExpiry).toLocaleDateString() 
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Premium</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isPremium ? (
          <View style={styles.activeCard}>
            <View style={styles.activeBadge}>
              <Ionicons name="diamond" size={24} color={COLORS.gold} />
              <Text style={styles.activeText}>Premium Active</Text>
            </View>
            <Text style={styles.expiryText}>Valid until {expiryDate}</Text>
          </View>
        ) : (
          <View style={styles.promoCard}>
            <Ionicons name="diamond" size={48} color={COLORS.gold} />
            <Text style={styles.promoTitle}>1WAY Premium</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>$12</Text>
              <Text style={styles.pricePeriod}>/year</Text>
            </View>
            <Text style={styles.promoDesc}>
              Unlock all features and take your music career to the next level
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Premium Features</Text>
        <View style={styles.featuresGrid}>
          {PREMIUM_FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon as any} size={24} color={COLORS.gold} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Free vs Premium</Text>
        <View style={styles.comparisonCard}>
          {FREE_FEATURES.map((item, index) => (
            <View key={index} style={styles.comparisonRow}>
              <Ionicons 
                name={item.available ? 'checkmark-circle' : 'close-circle'} 
                size={20} 
                color={item.available ? COLORS.success : COLORS.error} 
              />
              <Text style={[styles.comparisonText, !item.available && styles.comparisonUnavailable]}>
                {item.text}
              </Text>
              {!item.available && (
                <View style={styles.premiumTag}>
                  <Text style={styles.premiumTagText}>PREMIUM</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.guaranteeBox}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />
          <View style={styles.guaranteeContent}>
            <Text style={styles.guaranteeTitle}>30-Day Money Back Guarantee</Text>
            <Text style={styles.guaranteeDesc}>
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </Text>
          </View>
        </View>
      </ScrollView>

      {!isPremium && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.purchaseBtn} 
            onPress={handlePurchase}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textPrimary} />
            ) : (
              <>
                <Ionicons name="diamond" size={20} color={COLORS.textPrimary} />
                <Text style={styles.purchaseText}>Get Premium - $12/year</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

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
  contentContainer: { padding: 20, paddingBottom: 250 },
  activeCard: { 
    backgroundColor: 'rgba(234,179,8,0.15)', 
    padding: 24, 
    borderRadius: 16, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeText: { fontSize: 20, fontWeight: '700', color: COLORS.gold },
  expiryText: { color: COLORS.textMuted, marginTop: 8 },
  promoCard: { 
    backgroundColor: COLORS.backgroundCard, 
    padding: 32, 
    borderRadius: 20, 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  promoTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, marginTop: 16 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8 },
  price: { fontSize: 48, fontWeight: '800', color: COLORS.gold },
  pricePeriod: { fontSize: 18, color: COLORS.textMuted, marginLeft: 4 },
  promoDesc: { color: COLORS.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 22 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginTop: 32, marginBottom: 16 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCard: { 
    width: '48%', 
    backgroundColor: COLORS.backgroundCard, 
    padding: 16, 
    borderRadius: 12 
  },
  featureIcon: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: 'rgba(234,179,8,0.15)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  featureTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginTop: 12 },
  featureDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  comparisonCard: { backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12 },
  comparisonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  comparisonText: { flex: 1, color: COLORS.textPrimary, marginLeft: 12 },
  comparisonUnavailable: { color: COLORS.textMuted },
  premiumTag: { backgroundColor: COLORS.gold, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  premiumTagText: { color: COLORS.background, fontSize: 10, fontWeight: '700' },
  guaranteeBox: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(34,197,94,0.1)', 
    padding: 16, 
    borderRadius: 12, 
    marginTop: 24,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  guaranteeContent: { flex: 1, marginLeft: 12 },
  guaranteeTitle: { fontSize: 14, fontWeight: '700', color: COLORS.success },
  guaranteeDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  footer: { 
    position: 'absolute', 
    bottom: 140, 
    left: 0, 
    right: 0, 
    padding: 20, 
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundCard,
  },
  purchaseBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    backgroundColor: COLORS.gold, 
    paddingVertical: 16, 
    borderRadius: 12 
  },
  purchaseText: { color: COLORS.background, fontSize: 18, fontWeight: '700' },
});
