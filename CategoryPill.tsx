import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export default function CategoryPill({ label, isActive, onPress }: Props) {
  return (
    <TouchableOpacity 
      style={[styles.container, isActive ? styles.active : styles.inactive]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  active: {
    backgroundColor: COLORS.primary,
  },
  inactive: {
    backgroundColor: COLORS.backgroundCard,
    borderWidth: 1,
    borderColor: COLORS.backgroundLight,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeLabel: {
    color: COLORS.textPrimary,
  },
});
