// components/IngredientTag.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function IngredientTag({ label, onRemove }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.text}>{label}</Text>
      <TouchableOpacity onPress={onRemove} style={styles.iconWrapper}>
        <Ionicons name="close" size={14} color={theme.colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: theme.colors.textDark,
    marginRight: 6,
  },
  iconWrapper: {
    padding: 2, // Gives the icon a slightly larger tap area
  }
});