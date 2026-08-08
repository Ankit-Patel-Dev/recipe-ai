// app/recipe.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
// We add useLocalSearchParams here to read the data sent from the Camera
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mockRecipeResponse } from '../utils/mockData';
import { theme } from '../utils/theme';

export default function RecipeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // If Gemini sent us data, parse it! If not, use the mock data.
  const data = params.recipeData ? JSON.parse(params.recipeData) : mockRecipeResponse;
  
  const [activeTab, setActiveTab] = useState('Ingredients');
  const [servings, setServings] = useState(data.servings || 2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textDark} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.accent, marginRight: 10 }]}>
              <Ionicons name="heart" size={20} color={theme.colors.textDark} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="share-outline" size={20} color={theme.colors.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.heroImageContainer}>
            <Text style={{ fontSize: 80 }}>🍲</Text>
          </View>

          <Text style={styles.title}>{data.recipeName}</Text>
          
          {/* Difficulty and Time Tags */}
          <View style={{flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20}}>
             <Text style={styles.metaBadge}>{data.estimatedTime}</Text>
             <Text style={styles.metaBadge}>{data.difficulty}</Text>
          </View>

          <View style={styles.tabContainer}>
            {['Detail', 'Ingredients', 'Instruction'].map((tab) => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'Ingredients' && (
            <View style={styles.contentContainer}>
              <View style={styles.servingsRow}>
                <TouchableOpacity onPress={() => setServings(Math.max(1, servings - 1))}>
                  <Ionicons name="remove-circle-outline" size={28} color={theme.colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.servingsText}>Serves {servings}</Text>
                <TouchableOpacity onPress={() => setServings(servings + 1)}>
                  <Ionicons name="add-circle-outline" size={28} color={theme.colors.textDark} />
                </TouchableOpacity>
              </View>

              <View style={styles.listContainer}>
                {/* Detected Ingredients */}
                <Text style={styles.sectionHeading}>Found in photo:</Text>
                {data.detectedIngredients?.map((item, index) => (
                  <View key={`detected-${index}`} style={styles.ingredientRow}>
                    <View style={styles.ingredientLeft}>
                      <View style={styles.iconCircle}>
                        <Text style={{ fontSize: 20 }}>{item.icon || "🍽️"}</Text>
                      </View>
                      <Text style={styles.ingredientName}>{item.name}</Text>
                    </View>
                    <Text style={styles.ingredientAmount}>{item.amount}</Text>
                  </View>
                ))}
                
                {/* Missing Ingredients */}
                {data.missingIngredients?.length > 0 && (
                  <>
                    <Text style={[styles.sectionHeading, {marginTop: 20, color: theme.colors.danger}]}>Pantry items needed:</Text>
                    {data.missingIngredients.map((item, index) => (
                      <View key={`missing-${index}`} style={styles.ingredientRow}>
                        <View style={styles.ingredientLeft}>
                          <View style={styles.iconCircle}>
                            <Text style={{ fontSize: 20 }}>{item.icon || "🛒"}</Text>
                          </View>
                          <Text style={styles.ingredientName}>{item.name}</Text>
                        </View>
                        <Text style={styles.ingredientAmount}>{item.amount}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            </View>
          )}

          {activeTab === 'Instruction' && (
            <View style={styles.contentContainer}>
              {data.instructions?.map((step, index) => (
                <View key={index} style={styles.instructionRow}>
                  <View style={styles.stepNumberCircle}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{step}</Text>
                </View>
              ))}
            </View>
          )}

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.regenerateButton}>
            <Text style={styles.regenerateText}>🪄 Regenerate <Text style={{fontWeight: 'normal', fontSize: 12}}>2 Remaining</Text></Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  headerRight: { flexDirection: 'row' },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  heroImageContainer: { alignItems: 'center', marginVertical: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: theme.colors.textDark, textAlign: 'center', paddingHorizontal: 20, marginBottom: 10 },
  metaBadge: { backgroundColor: theme.colors.cardPrimary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.full, fontSize: 12, fontWeight: 'bold', color: theme.colors.textDark },
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: theme.borderRadius.full, padding: 5, marginBottom: 20 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: theme.borderRadius.full },
  activeTabButton: { backgroundColor: theme.colors.cardPrimary },
  tabText: { fontSize: 14, color: theme.colors.textMuted, fontWeight: '500' },
  activeTabText: { color: theme.colors.textDark, fontWeight: 'bold' },
  contentContainer: { backgroundColor: '#FFFFFF', borderRadius: theme.borderRadius.lg, padding: 20 },
  servingsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  servingsText: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 20 },
  sectionHeading: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textMuted, marginBottom: 10, textTransform: 'uppercase' },
  ingredientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  ingredientLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  ingredientName: { fontSize: 16, fontWeight: '500', color: theme.colors.textDark },
  ingredientAmount: { fontSize: 14, color: theme.colors.textMuted },
  instructionRow: { flexDirection: 'row', marginBottom: 20, paddingRight: 20 },
  stepNumberCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15, marginTop: 2 },
  stepNumberText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  instructionText: { fontSize: 15, color: theme.colors.textDark, lineHeight: 22, flex: 1 },
  footer: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  regenerateButton: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: theme.borderRadius.md, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  regenerateText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }
});