import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { COLORS } from '../constants/colors';

const tabs = [
  { name: 'Home', icon: 'home', route: '/' },
  { name: 'Charts', icon: 'trending-up', route: '/charts' },
  { name: 'Artists', icon: 'people', route: '/artists' },
  { name: 'Wallet', icon: 'wallet', route: '/wallet' },
  { name: 'Profile', icon: 'person', route: '/profile' },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.route || (tab.route === '/' && pathname === '/index');
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, isActive && styles.activeIcon]}>
              <Ionicons
                name={isActive ? (tab.icon as any) : (`${tab.icon}-outline` as any)}
                size={24}
                color={isActive ? COLORS.primary : COLORS.textMuted}
              />
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundCard,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 12,
  },
  activeIcon: {
    backgroundColor: `${COLORS.primary}20`,
  },
  label: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  activeLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
