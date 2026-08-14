// app/liked.js
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getLikedRecipes, toggleLikedRecipe } from '../utils/likedRecipes';
import { generateRecipeByName } from '../services/geminiService';
import { addRecipeToHistory } from '../utils/recipeHistory';
import { theme } from '../utils/theme';

export default function LikedRecipesScreen() {
  const router = useRouter();
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const loadLiked = async () => {
    const data = await getLikedRecipes();
    setLikedRecipes(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadLiked();
    }, [])
  );

  const handleToggleLike = (item) => {
    const id = String(item.idMeal);
    setLikedRecipes((prev) => prev.filter((i) => String(i.idMeal) !== id));
    toggleLikedRecipe(item).catch((err) => console.error('Error toggling like in background:', err));
  };

  const handleRecipeClick = async (recipeName) => {
    setIsGeneratingAI(true);
    const aiGeneratedRecipe = await generateRecipeByName(recipeName);

    if (aiGeneratedRecipe) {
      await addRecipeToHistory(aiGeneratedRecipe.recipes[0]);
      router.push({
        pathname: '/recipe',
        params: { recipeData: JSON.stringify(aiGeneratedRecipe) }
      });
    } else {
      alert("Oops! The AI Chef is busy. Try again.");
    }

    setIsGeneratingAI(false);
  };

  const renderRecipeCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleRecipeClick(item.strMeal)}
        disabled={isGeneratingAI}
      >
        <Image source={{ uri: item.strMealThumb }} style={styles.image} />
        
        <TouchableOpacity
          style={styles.likeButtonAbsolute}
          onPress={() => handleToggleLike(item)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="heart"
            size={25}
            color="#fa6579"
            style={{
              textShadowColor: 'rgba(255, 255, 255, 0.8)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          />
        </TouchableOpacity>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>{item.strMeal}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading || isGeneratingAI) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          {isGeneratingAI && <Text style={styles.generatingText}>AI Chef is writing your recipe...</Text>}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liked Recipes</Text>
        <View style={styles.backButton} />
      </View>

      {likedRecipes.length > 0 ? (
        <FlatList
          data={likedRecipes}
          keyExtractor={(item) => String(item.idMeal)}
          renderItem={renderRecipeCard}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.emptyState}>
          <Ionicons name="heart-outline" size={60} color="#ccc" style={{ marginBottom: 15 }} />
          <Text style={styles.emptyStateTitle}>No Liked Recipes</Text>
          <Text style={styles.emptyStateText}>Meals you like will appear here.</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  generatingText: { marginTop: 15, fontSize: 16, color: theme.colors.textDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: theme.colors.textDark, fontSize: 20, fontWeight: 'bold' },
  list: { paddingBottom: 20, paddingHorizontal: 10 },
  row: { justifyContent: 'space-between', paddingHorizontal: 10 },
  cardContainer: {
    width: '48%',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: { width: '100%', height: 120, resizeMode: 'cover' },
  likeButtonAbsolute: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  textContainer: { padding: 12, height: 60 },
  title: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 150 },
  emptyStateTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: '#888' },
});
