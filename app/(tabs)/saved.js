// app/(tabs)/saved.js
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { theme } from '../../utils/theme';
import RecipeHistoryCard from '../../components/RecipeHistoryCard';
import { getSavedRecipes } from '../../utils/savedRecipes';

export default function SavedScreen() {
  const router = useRouter();
  const [savedRecipes, setSavedRecipes] = useState([]);

  useFocusEffect(useCallback(() => {
    getSavedRecipes().then(setSavedRecipes).catch((error) => console.error('Failed to load saved recipes', error));
  }, []));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Saved Generated Recipes</Text>
        <Text style={styles.subtitle}>Your favorite AI-generated creations</Text>

        {savedRecipes.map((item) => (
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

        {savedRecipes.length === 0 && (
          <Text style={styles.emptyText}>Tap the heart on a recipe to save it here.</Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: theme.colors.textDark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 20 },
  emptyText: { fontSize: 14, color: theme.colors.textMuted, paddingVertical: 12 }
});
