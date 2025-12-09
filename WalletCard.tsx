import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface WalletCardProps {
  balance: number;
  credits: number;
  frozen: boolean;
}

export default function WalletCard({ balance, credits, frozen }: WalletCardProps) {
  return (
    <LinearGradient
      colors={frozen ? [COLORS.error, '#991b1b'] : [COLORS.primary, COLORS.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.label}>1Way Wallet</Text>
        {frozen && (
          <View style={styles.frozenBadge}>
            <Ionicons name="lock-closed" size={12} color={COLORS.textPrimary} />
            <Text style={styles.frozenText}>FROZEN</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.balance}>${balance.toFixed(2)}</Text>
      <Text style={styles.balanceLabel}>Available Balance</Text>
      
      {credits > 0 && (
        <View style={styles.creditSection}>
          <Ionicons name="warning" size={14} color={COLORS.gold} />
          <Text style={styles.creditText}>Credit Owed: ${credits.toFixed(2)}</Text>
        </View>
      )}
      
      <View style={styles.cardNumber}>
        <Text style={styles.cardNumberText}>**** **** **** 1WAY</Text>
        <Ionicons name="card" size={24} color="rgba(255,255,255,0.5)" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    minHeight: 180,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  frozenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  frozenText: {
    fontSize: 10,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  balance: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  balanceLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  creditSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  creditText: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: '600',
  },
  cardNumber: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 16,
  },
  cardNumberText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
  },
});
