// app/(tabs)/index.js
import React, { useCallback, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';
import IngredientTag from '../../components/IngredientTag';
import RecipeHistoryCard from '../../components/RecipeHistoryCard';
import { generateRecipeFromText } from '../../services/geminiService';
import { addRecipeToHistory, getRecipeHistory } from '../../utils/recipeHistory';
import { getRecipePreferences } from '../../utils/preferencesStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const router = useRouter();

  const [ingredients, setIngredients] = useState(['Chicken', 'Egg', 'Onion']);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [profileName, setProfileName] = useState('');
  
  const inputRef = useRef(null);

  useFocusEffect(useCallback(() => {
    const loadHomeData = async () => {
      try {
        setHistory(await getRecipeHistory());
        const savedProfile = await AsyncStorage.getItem('@user_profile');
        setProfileName(savedProfile ? JSON.parse(savedProfile).name?.trim() || '' : '');
      } catch (error) {
        console.error('Failed to load home data', error);
      }
    };

    loadHomeData();
  }, []));

  const handleAddIngredient = () => {
    const trimmedText = inputText.trim();
    if (trimmedText.length > 0 && !ingredients.includes(trimmedText)) {
      setIngredients([...ingredients, trimmedText]);
      setInputText('');
    }
  };

  const handleRemoveIngredient = (itemToRemove) => {
    setIngredients(ingredients.filter(item => item !== itemToRemove));
  };

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      Alert.alert("No Ingredients", "Please add at least one ingredient first!");
      return;
    }

    setIsGenerating(true);
    try {
      const preferences = await getRecipePreferences();
      const generatedRecipe = await generateRecipeFromText(ingredients, preferences);
      const updatedHistory = await addRecipeToHistory(generatedRecipe.recipes[0]);
      setHistory(updatedHistory);
      setIsGenerating(false);
      
      router.push({
        pathname: '/recipe',
        params: { recipeData: JSON.stringify(generatedRecipe) }
      });
    } catch (error) {
      setIsGenerating(false);
      Alert.alert("Generation Failed", error.message || "Please check your Gemini API key.");
    }
  };

  return (
    <SafeAreaView  style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{profileName ? `Hey ${profileName},` : 'Hey,'}</Text>
            <Text style={styles.mainTitle}>Not sure what to{"\n"}cook tonight?</Text>
          </View>
          
          <TouchableOpacity onPress={() => router.push('/preferences')} style={styles.filterIcon}>
            <Ionicons name="options-outline" size={24} color={theme.colors.textDark} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* INGREDIENT INPUT CARD */}
        <View style={styles.ingredientCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="sparkles" size={16} color={theme.colors.textMuted} style={{marginRight: 6}} />
            <Text style={styles.cardSubtitle}>We'll conjure a recipe from your ingredients</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.tagsContainer} 
            activeOpacity={1} 
            onPress={() => inputRef.current?.focus()}
          >
            {ingredients.map((item, index) => (
              <IngredientTag 
                key={index} 
                label={item} 
                onRemove={() => handleRemoveIngredient(item)} 
              />
            ))}
            
            <TextInput
              ref={inputRef}
              style={styles.addInput}
              placeholder="Type ingredient & press enter..."
              placeholderTextColor="#999999"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleAddIngredient}
              returnKeyType="done"
            />
          </TouchableOpacity>

          {/* ACTION BUTTONS */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cameraButton} onPress={() => router.push('/camera')}>
              <Ionicons name="camera" size={24} color={theme.colors.textDark} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.generateButton, isGenerating && { opacity: 0.7 }]} 
              onPress={handleGenerateRecipe}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" style={{marginRight: 8}} />
                  <Text style={styles.generateText}>Generate Recipe</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* UNLIMITED RECIPE BANNER */}
        {/* <View style={styles.banner}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerSmallText}>Start from $10/month</Text>
            <Text style={styles.bannerTitle}>Generate Unlimited{"\n"}Recipe!</Text>
          </View>
          <Text style={{fontSize: 50}}>🍳</Text>
        </View> */}

        {/* HISTORY SECTION */}
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>History</Text>
          <TouchableOpacity onPress={() => router.push('/history')}>
            <Text style={styles.seeAllText}>See All</Text>
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
          />
        ))}

        {history.length === 0 && (
          <Text style={styles.emptyHistoryText}>Your generated recipes will appear here.</Text>
        )}
        
        <View style={{height: 100}} /> 
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  greeting: { fontSize: 16, color: theme.colors.textMuted, marginBottom: 6, fontWeight: '500' },
  mainTitle: { fontSize: 32, fontWeight: 'bold', color: theme.colors.textDark, lineHeight: 38 },
  filterIcon: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  notificationDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, backgroundColor: theme.colors.danger, borderRadius: 4 },
  
  ingredientCard: { backgroundColor: theme.colors.cardPrimary, padding: 20, borderRadius: theme.borderRadius.lg, marginBottom: 25 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  cardSubtitle: { color: theme.colors.textMuted, fontSize: 14, fontWeight: '500' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#FFFFFF', padding: 15, borderRadius: theme.borderRadius.md, marginBottom: 15, alignItems: 'center', minHeight: 70 },
  
  addInput: {
    flexBasis: '100%',
    color: theme.colors.textDark,
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    height: 46,
    marginTop: 4,
  },
  
  actionRow: { flexDirection: 'row', gap: 12 },
  cameraButton: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  generateButton: { flex: 1, backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 54 },
  generateText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  
  // banner: { backgroundColor: theme.colors.accent, borderRadius: theme.borderRadius.lg, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  // bannerTextContainer: { flex: 1 },
  // bannerSmallText: { color: theme.colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  // bannerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textDark, lineHeight: 24 },
  
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  historyTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.textDark },
  seeAllText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 14 },
  emptyHistoryText: { color: theme.colors.textMuted, fontSize: 14, paddingVertical: 12 }
});
