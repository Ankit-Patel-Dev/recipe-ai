// app/(tabs)/saved.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../utils/theme';
import RecipeHistoryCard from '../../components/RecipeHistoryCard';
import { mockRecipeResponse } from '../../utils/mockData';

export default function SavedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Saved Recipes</Text>
        <Text style={styles.subtitle}>Your favorite AI-generated creations</Text>

        {/* Map through mock saved items */}
        {mockRecipeResponse?.history?.map((item) => (
          <RecipeHistoryCard 
            key={item.id}
            title={item.title}
            time={item.time}
            ingredientCount={item.ingredientCount}
            date={item.date}
            onPress={() => router.push('/recipe')}
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: theme.colors.textDark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 20 }
});