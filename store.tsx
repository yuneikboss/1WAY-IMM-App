import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { IMAGES } from './constants/images';
import { TRACKS } from './data/tracks';
import { ARTISTS } from './data/artists';
import BottomNav from './components/BottomNav';
import { useApp } from './context/AppContext';

const STORE_ITEMS = TRACKS.map((t, i) => ({
  id: t.id,
  title: t.title,
  artist: t.artist,
  artistId: t.artistId,
  type: i % 3 === 0 ? 'video' : 'music',
  price: t.price,
  coverUrl: t.albumArt,
  sales: Math.floor(Math.random() * 5000),
}));

export default function StoreScreen() {
  const router = useRouter();
  const { wallet, updateWallet, addTransaction } = useApp();
  const [filter, setFilter] = useState('all');

  const filteredItems = filter === 'all' ? STORE_ITEMS : STORE_ITEMS.filter(i => i.type === filter);

  const handlePurchase = (item: typeof STORE_ITEMS[0]) => {
    if (wallet.frozen) {
      Alert.alert('Account Frozen', 'Pay off your credit to make purchases');
      return;
    }
    if (wallet.balance < item.price) {
      Alert.alert('Insufficient Funds', 'Add funds to your wallet');
      return;
    }
    const fee = item.price * 0.20;
    const artistEarnings = item.price - fee;
    updateWallet(-item.price);
    addTransaction({ type: 'purchase', amount: item.price, fee, description: `Purchased ${item.title}` });
    Alert.alert('Purchase Complete!', `You bought "${item.title}" for $${item.price.toFixed(2)}\nArtist receives: $${artistEarnings.toFixed(2)}\n1Way fee: $${fee.toFixed(2)}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>1Way Music Store</Text>
        <TouchableOpacity onPress={() => router.push('/wallet')}>
          <Ionicons name="wallet" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <Image source={{ uri: IMAGES.store }} style={styles.banner} />

      <View style={styles.filters}>
        {['all', 'music', 'video'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.balanceText}>Balance: ${wallet.balance.toFixed(2)}</Text>

      <FlatList
        data={filteredItems}
        numColumns={2}
        contentContainerStyle={styles.grid}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.coverUrl }} style={styles.cover} />
            <View style={styles.typeTag}>
              <Ionicons name={item.type === 'video' ? 'videocam' : 'musical-note'} size={12} color={COLORS.textPrimary} />
            </View>
            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.itemArtist}>{item.artist}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <TouchableOpacity style={styles.buyBtn} onPress={() => handlePurchase(item)}>
                <Text style={styles.buyText}>Buy</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  banner: { width: '100%', height: 120, resizeMode: 'cover' },
  filters: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.backgroundCard },
  filterActive: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.textMuted, fontWeight: '600' },
  filterTextActive: { color: COLORS.textPrimary },
  balanceText: { color: COLORS.success, fontSize: 14, fontWeight: '600', paddingHorizontal: 20, marginBottom: 8 },
  grid: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { flex: 1, backgroundColor: COLORS.backgroundCard, margin: 4, borderRadius: 12, overflow: 'hidden' },
  cover: { width: '100%', aspectRatio: 1 },
  typeTag: { position: 'absolute', top: 8, right: 8, backgroundColor: COLORS.primary, padding: 4, borderRadius: 8 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, paddingHorizontal: 10, marginTop: 8 },
  itemArtist: { fontSize: 12, color: COLORS.textMuted, paddingHorizontal: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
  price: { fontSize: 16, fontWeight: '700', color: COLORS.success },
  buyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  buyText: { color: COLORS.textPrimary, fontWeight: '600', fontSize: 12 },
});
