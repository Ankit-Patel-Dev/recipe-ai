import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Share, StyleSheet, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mockRecipeResponse } from '../utils/mockData';
import { theme } from '../utils/theme';
import { isRecipeSaved, toggleSavedRecipe } from '../utils/savedRecipes';

export default function RecipeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const response = useMemo(() => {
    try {
      return params.recipeData ? JSON.parse(params.recipeData) : { recipes: [mockRecipeResponse] };
    } catch {
      return { recipes: [mockRecipeResponse] };
    }
  }, [params.recipeData]);
  const recipes = (Array.isArray(response.recipes) ? response.recipes : [response]).slice(0, 5);
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('Recipes');
  const [isSaved, setIsSaved] = useState(false);
  const data = recipes[selectedRecipeIndex] || mockRecipeResponse;
  const baseServings = data.servings || 2;
  const [servings, setServings] = useState(data.servings || 2);

  useEffect(() => {
    setServings(baseServings);
    isRecipeSaved(data).then(setIsSaved).catch(() => setIsSaved(false));
  }, [data]);

  const handleSave = async () => {
    try {
      const saved = await toggleSavedRecipe(data);
      setIsSaved(saved);
      Alert.alert(saved ? 'Recipe saved' : 'Recipe removed', saved ? 'It is available in Saved Recipes.' : 'It was removed from Saved Recipes.');
    } catch {
      Alert.alert('Save failed', 'Could not update your saved recipes.');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${data.recipeName}\n\nTime: ${data.estimatedTime} • ${data.difficulty}\n\nIngredients:\n${data.detectedIngredients?.map((item) => `• ${item.amount} ${item.name}`).join('\n') || 'See recipe in RecipeAI'}\n\nInstructions:\n${data.instructions?.map((step, index) => `${index + 1}. ${step}`).join('\n') || ''}`,
      });
    } catch {
      Alert.alert('Share failed', 'Could not open the sharing options.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textDark} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleSave} style={[styles.iconButton, { backgroundColor: theme.colors.accent, marginRight: 10 }]}>
              <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={theme.colors.textDark} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
              <Ionicons name="share-outline" size={20} color={theme.colors.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroImageContainer}><Text style={{ fontSize: 80 }}>🍲</Text></View>
          <Text style={styles.title}>{data.recipeName}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaBadge}>{data.estimatedTime}</Text>
            <Text style={styles.metaBadge}>{data.difficulty}</Text>
          </View>

          <View style={styles.tabContainer}>
            {['Recipes', 'Ingredients', 'Instructions'].map((tab) => (
              <TouchableOpacity key={tab} style={[styles.tabButton, activeTab === tab && styles.activeTabButton]} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'Recipes' && (
            <View style={styles.contentContainer}>
              <Text style={styles.sectionHeading}>Choose a recipe</Text>
              {recipes.map((recipe, index) => (
                <TouchableOpacity
                  key={`${recipe.recipeName}-${index}`}
                  style={[styles.recipeOption, selectedRecipeIndex === index && styles.selectedRecipeOption]}
                  onPress={() => {
                    setSelectedRecipeIndex(index);
                    setActiveTab('Ingredients');
                  }}
                >
                  <View style={styles.recipeOptionText}>
                    <Text style={styles.recipeOptionTitle}>{recipe.recipeName}</Text>
                    <Text style={styles.recipeOptionMeta}>{recipe.estimatedTime} • {recipe.difficulty}</Text>
                  </View>
                  <Ionicons name={selectedRecipeIndex === index ? 'checkmark-circle' : 'chevron-forward'} size={22} color={theme.colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'Ingredients' && (
            <View style={styles.contentContainer}>
              <View style={styles.servingsRow}>
                <TouchableOpacity onPress={() => setServings(Math.max(1, servings - 1))}><Ionicons name="remove-circle-outline" size={28} color={theme.colors.textDark} /></TouchableOpacity>
                <Text style={styles.servingsText}>Serves {servings}</Text>
                <TouchableOpacity onPress={() => setServings(servings + 1)}><Ionicons name="add-circle-outline" size={28} color={theme.colors.textDark} /></TouchableOpacity>
              </View>
              <Text style={styles.sectionHeading}>Your ingredients used</Text>
              {data.detectedIngredients?.map((item, index) => <IngredientRow key={`detected-${index}`} item={item} scale={servings / baseServings} />)}
              {!!data.missingIngredients?.length && <>
                <Text style={[styles.sectionHeading, styles.missingHeading]}>Suggested ingredients to add</Text>
                {data.missingIngredients.map((item, index) => <IngredientRow key={`missing-${index}`} item={item} fallbackIcon="🛒" scale={servings / baseServings} />)}
              </>}
            </View>
          )}

          {activeTab === 'Instructions' && (
            <View style={styles.contentContainer}>
              {data.instructions?.map((step, index) => (
                <View key={`${step}-${index}`} style={styles.instructionRow}>
                  <View style={styles.stepNumberCircle}><Text style={styles.stepNumberText}>{index + 1}</Text></View>
                  <Text style={styles.instructionText}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function IngredientRow({ item, fallbackIcon = '🍽️', scale = 1 }) {
  return <View style={styles.ingredientRow}>
    <View style={styles.ingredientLeft}>
      <View style={styles.iconCircle}><Text style={{ fontSize: 20 }}>{item.icon || fallbackIcon}</Text></View>
      <Text style={styles.ingredientName}>{item.name}</Text>
    </View>
    <Text style={styles.ingredientAmount}>{scaleIngredientAmount(item.amount, scale)}</Text>
  </View>;
}

function scaleIngredientAmount(amount, scale) {
  if (!amount || scale === 1) return amount;

  const match = String(amount).match(/^(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+)(.*)$/);
  if (!match) return amount;

  const numericAmount = parseFraction(match[1]);
  if (Number.isNaN(numericAmount)) return amount;

  const scaledAmount = Math.round(numericAmount * scale * 100) / 100;
  return `${formatAmount(scaledAmount)}${match[2]}`;
}

function parseFraction(value) {
  return value.split(' ').reduce((total, part) => {
    if (part.includes('/')) {
      const [numerator, denominator] = part.split('/').map(Number);
      return total + numerator / denominator;
    }
    return total + Number(part);
  }, 0);
}

function formatAmount(value) {
  if (Number.isInteger(value)) return String(value);
  const fractions = { 0.25: '¼', 0.33: '⅓', 0.5: '½', 0.67: '⅔', 0.75: '¾' };
  const whole = Math.floor(value);
  const decimal = Math.round((value - whole) * 100) / 100;
  const fraction = fractions[decimal];
  if (fraction) return whole ? `${whole} ${fraction}` : fraction;
  return String(value);
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background }, container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 }, headerRight: { flexDirection: 'row' },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 }, heroImageContainer: { alignItems: 'center', marginVertical: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: theme.colors.textDark, textAlign: 'center', marginBottom: 10 }, metaRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  metaBadge: { backgroundColor: theme.colors.cardPrimary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.full, fontSize: 12, fontWeight: 'bold', color: theme.colors.textDark },
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: theme.borderRadius.full, padding: 5, marginBottom: 20 }, tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: theme.borderRadius.full }, activeTabButton: { backgroundColor: theme.colors.cardPrimary }, tabText: { fontSize: 13, color: theme.colors.textMuted, fontWeight: '500' }, activeTabText: { color: theme.colors.textDark, fontWeight: 'bold' },
  contentContainer: { backgroundColor: '#FFFFFF', borderRadius: theme.borderRadius.lg, padding: 20 }, sectionHeading: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textMuted, marginBottom: 10, textTransform: 'uppercase' },
  recipeOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, marginBottom: 10 }, selectedRecipeOption: { borderColor: theme.colors.primary, backgroundColor: theme.colors.cardPrimary }, recipeOptionText: { flex: 1, paddingRight: 8 }, recipeOptionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textDark, marginBottom: 4 }, recipeOptionMeta: { fontSize: 13, color: theme.colors.textMuted },
  servingsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }, servingsText: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 20 },
  ingredientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }, ingredientLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 }, iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', marginRight: 15 }, ingredientName: { fontSize: 16, fontWeight: '500', color: theme.colors.textDark, flex: 1 }, ingredientAmount: { fontSize: 14, color: theme.colors.textMuted, marginLeft: 8 }, missingHeading: { marginTop: 20, color: theme.colors.danger },
  instructionRow: { flexDirection: 'row', marginBottom: 20, paddingRight: 8 }, stepNumberCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15, marginTop: 2 }, stepNumberText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }, instructionText: { fontSize: 15, color: theme.colors.textDark, lineHeight: 22, flex: 1 },
});
