// app/(tabs)/index.js
import React, { useCallback, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';
import IngredientTag from '../../components/IngredientTag';
import RecipeHistoryCard from '../../components/RecipeHistoryCard';
import { generateRecipeFromText, generateRecipeByName } from '../../services/geminiService';
import { addRecipeToHistory, getRecipeHistory } from '../../utils/recipeHistory';
import { getRecipePreferences } from '../../utils/preferencesStorage';
import { getRecipesByCategory } from '../../services/mealDbService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MEAL_CARD_WIDTH = Dimensions.get('window').width - 40;
const MEAL_CARD_GAP = 14;
const MEAL_CARD_INTERVAL = MEAL_CARD_WIDTH + MEAL_CARD_GAP;

export default function HomeScreen() {
  const router = useRouter();

  const [ingredients, setIngredients] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [mealDbRecipes, setMealDbRecipes] = useState([]);
  const [profileName, setProfileName] = useState('');
  
  const inputRef = useRef(null);
  const mealScrollRef = useRef(null);
  const mealScrollX = useRef(new Animated.Value(0)).current;
  const mealCarouselRecipes = mealDbRecipes.length > 0 ? [...mealDbRecipes, mealDbRecipes[0]] : [];

  useFocusEffect(useCallback(() => {
    const loadHomeData = async () => {
      try {
        setHistory(await getRecipeHistory());
        const meals = await getRecipesByCategory('Vegetarian');
        setMealDbRecipes((meals || []).slice(0, 5));
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
      
      router.push({
        pathname: '/recipe',
        params: { recipeData: JSON.stringify(generatedRecipe) }
      });
    } catch (error) {
      Alert.alert("Generation Failed", error.message || "Please check your Gemini API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRecipeClick = async (recipeName) => {
    setIsGenerating(true);
    try {
      const generatedRecipe = await generateRecipeByName(recipeName);
      if (!generatedRecipe) throw new Error('AI chef could not create the recipe.');

      const updatedHistory = await addRecipeToHistory(generatedRecipe.recipes[0]);
      setHistory(updatedHistory);

      router.push({
        pathname: '/recipe',
        params: { recipeData: JSON.stringify(generatedRecipe) }
      });
    } catch (error) {
      Alert.alert('Generation Failed', error.message || 'Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMealScrollEnd = (event) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / MEAL_CARD_INTERVAL);

    if (nextIndex >= mealDbRecipes.length) {
      requestAnimationFrame(() => {
        mealScrollRef.current?.scrollTo({ x: 0, animated: false });
        mealScrollX.setValue(0);
      });
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
          
          {ingredients.length > 0 && (
            <View style={styles.tagsContainer}>
              {ingredients.map((item, index) => (
                <IngredientTag
                  key={index}
                  label={item}
                  onRemove={() => handleRemoveIngredient(item)}
                />
              ))}
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.addInput}
              placeholder="Type ingredient and Add"
              placeholderTextColor="#999999"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleAddIngredient}
              returnKeyType="done"
            />

            <TouchableOpacity style={styles.addIngredientButton} onPress={handleAddIngredient}>
              <Text style={styles.addIngredientButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

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

        {mealDbRecipes.length > 0 && (
          <View style={styles.mealDbSection}>
            <View style={styles.mealDbHeader}>
              <Text style={styles.mealDbSectionTitle}>Try These Recipes</Text>
              <TouchableOpacity onPress={() => router.push('/recipes')}>
                <Text style={styles.seeAllText}>More</Text>
              </TouchableOpacity>
            </View>
            <Animated.ScrollView
              ref={mealScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={MEAL_CARD_INTERVAL}
              decelerationRate="fast"
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: mealScrollX } } }],
                { useNativeDriver: false }
              )}
              onMomentumScrollEnd={handleMealScrollEnd}
            >
              {mealCarouselRecipes.map((item, index) => (
                <TouchableOpacity
                  key={`${item.idMeal}-${index}`}
                  style={styles.mealDbCard}
                  activeOpacity={0.9}
                  onPress={() => handleRecipeClick(item.strMeal)}
                  disabled={isGenerating}
                >
                  <Image source={{ uri: item.strMealThumb }} style={styles.mealDbImage} />
                  <View style={styles.mealDbTitleOverlay}>
                    <Text style={styles.mealDbTitle} numberOfLines={2}>{item.strMeal}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.ScrollView>
            <View style={styles.mealIndicatorRow}>
              {mealDbRecipes.map((item, index) => {
                const inputRange = index === 0
                  ? [0, MEAL_CARD_INTERVAL, (mealDbRecipes.length - 1) * MEAL_CARD_INTERVAL, mealDbRecipes.length * MEAL_CARD_INTERVAL]
                  : [(index - 1) * MEAL_CARD_INTERVAL, index * MEAL_CARD_INTERVAL, (index + 1) * MEAL_CARD_INTERVAL];
                const outputRange = index === 0 ? [22, 7, 7, 22] : [7, 22, 7];
                const colorOutputRange = index === 0
                  ? [theme.colors.primary, theme.colors.border, theme.colors.border, theme.colors.primary]
                  : [theme.colors.border, theme.colors.primary, theme.colors.border];

                return (
                  <Animated.View
                    key={`indicator-${item.idMeal}`}
                    style={[
                      styles.mealIndicatorDot,
                      {
                        width: mealScrollX.interpolate({
                          inputRange,
                          outputRange,
                          extrapolate: 'clamp',
                        }),
                        backgroundColor: mealScrollX.interpolate({
                          inputRange,
                          outputRange: colorOutputRange,
                          extrapolate: 'clamp',
                        }),
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        )}

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
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#FFFFFF', padding: 15, borderRadius: theme.borderRadius.md, marginBottom: 12, alignItems: 'center', minHeight: 70 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  
  addInput: {
    flex: 1,
    color: theme.colors.textDark,
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    height: 46,
  },
  addIngredientButton: { backgroundColor: theme.colors.primary, height: 46, paddingHorizontal: 18, borderRadius: theme.borderRadius.sm, justifyContent: 'center', alignItems: 'center' },
  addIngredientButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  
  actionRow: { flexDirection: 'row', gap: 12 },
  cameraButton: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  generateButton: { flex: 1, backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 54 },
  generateText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  
  // banner: { backgroundColor: theme.colors.accent, borderRadius: theme.borderRadius.lg, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  // bannerTextContainer: { flex: 1 },
  // bannerSmallText: { color: theme.colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  // bannerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textDark, lineHeight: 24 },

  mealDbSection: { marginBottom: 25 },
  mealDbHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  mealDbSectionTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.textDark },
  mealDbCard: {
    width: MEAL_CARD_WIDTH,
    height: 210,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginRight: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  mealDbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mealDbTitleOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  mealDbTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 23,
  },
  mealIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  mealIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  historyTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.textDark },
  seeAllText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 14 },
  emptyHistoryText: { color: theme.colors.textMuted, fontSize: 14, paddingVertical: 12 }
});
