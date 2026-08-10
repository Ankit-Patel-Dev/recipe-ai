import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import RecipeHistoryCard from '../components/RecipeHistoryCard';
import { theme } from '../utils/theme';
import { getRecipeHistory } from '../utils/recipeHistory';

export default function HistoryScreen() {
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const [history, setHistory] = useState([]);

  useFocusEffect(useCallback(() => {
    const loadHistory = async () => {
      try {
        setHistory(await getRecipeHistory());
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      } catch (error) {
        console.error('Failed to load recipe history', error);
      }
    };

    loadHistory();
  }, []));

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
  emptyText: { color: theme.colors.textMuted, fontSize: 14, paddingVertical: 12 },
});
