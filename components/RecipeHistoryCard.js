// components/RecipeHistoryCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function RecipeHistoryCard({ title, time, ingredientCount, date, onPress, onSelectPress, selected }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
      {onSelectPress ? (
        <TouchableOpacity style={styles.checkboxButton} onPress={onSelectPress}>
          <Ionicons
            name={selected ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={selected ? theme.colors.primary : theme.colors.textMuted}
          />
        </TouchableOpacity>
      ) : null}

      {/* Fake Image Placeholder - in a real app, this would be an <Image> */}
      <View style={styles.imageCircle}>
        <Text style={{ fontSize: 24 }}>🍲</Text>
      </View>
      
      <View style={styles.infoContainer}>
        {/* The top row of small text (e.g., 25 Min • 6 Ingredients • 24 Mar) */}
        <Text style={styles.metaText}>
          <Text style={styles.highlightText}>{time}</Text> • {ingredientCount} Ingredients • {date}
        </Text>
        
        {/* The bold recipe title */}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.cardSecondary,
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 12,
    alignItems: 'center',
    // Subtle shadow to make it pop off the background
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2, 
  },
  imageCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  highlightText: {
    color: theme.colors.danger,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textDark,
  }
});