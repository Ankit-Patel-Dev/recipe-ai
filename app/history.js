import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import RecipeHistoryCard from '../components/RecipeHistoryCard';
import { theme } from '../utils/theme';
import { getRecipeHistory, removeRecipeHistoryItems } from '../utils/recipeHistory';

export default function HistoryScreen() {
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useFocusEffect(useCallback(() => {
    const loadHistory = async () => {
      try {
        setHistory(await getRecipeHistory());
        setSelectedIds([]);
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      } catch (error) {
        console.error('Failed to load recipe history', error);
      }
    };

    loadHistory();
  }, []));

  const toggleSelectAll = () => {
    if (selectedIds.length === history.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(history.map((item) => item.id));
  };

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    try {
      const updatedHistory = await removeRecipeHistoryItems(selectedIds);
      setHistory(updatedHistory);
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to delete selected history items', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>Recipe History</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>All your AI-generated recipes</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={toggleSelectAll}>
            <Text style={styles.actionButtonText}>
              {selectedIds.length === history.length && history.length > 0 ? 'Unselect all' : 'Select all'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteButton, selectedIds.length === 0 && styles.disabledButton]}
            onPress={handleDeleteSelected}
            disabled={selectedIds.length === 0}
          >
            <Text style={[styles.deleteButtonText, selectedIds.length === 0 && styles.disabledButtonText]}>
              Delete{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {history.map((item) => (
          <RecipeHistoryCard
            key={item.id}
            title={item.title}
            time={item.time}
            ingredientCount={item.ingredientCount}
            date={item.date}
            onPress={() => router.push({
              pathname: '/recipe',
              params: { recipeData: JSON.stringify(item.recipe) },
            })}
            onSelectPress={() => toggleSelection(item.id)}
            selected={selectedIds.includes(item.id)}
          />
        ))}

        {history.length === 0 && (
          <Text style={styles.emptyText}>Generate a recipe and it will appear here.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: theme.colors.textDark, fontSize: 20, fontWeight: 'bold' },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  subtitle: { color: theme.colors.textMuted, fontSize: 14, marginBottom: 20 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  actionButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.cardSecondary },
  actionButtonText: { color: theme.colors.textDark, fontWeight: 'bold' },
  deleteButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.danger },
  deleteButtonText: { color: '#fff', fontWeight: 'bold' },
  disabledButton: { backgroundColor: theme.colors.border },
  disabledButtonText: { color: theme.colors.textMuted },
  emptyText: { color: theme.colors.textMuted, fontSize: 14, paddingVertical: 12 },
});
