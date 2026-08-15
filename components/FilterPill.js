// components/FilterPill.js
import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../utils/theme';

export default function FilterPill({ label, isActive, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.pill,
        isActive ? styles.activePill : styles.inactivePill
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.text,
        isActive ? styles.activeText : styles.inactiveText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    marginRight: 8,
    marginBottom: 10,
  },
  activePill: {
    backgroundColor: theme.colors.accent,
  },
  inactivePill: {
    backgroundColor: theme.colors.background,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeText: {
    color: theme.colors.textDark,
  },
  inactiveText: {
    color: theme.colors.textMuted,
  }
});