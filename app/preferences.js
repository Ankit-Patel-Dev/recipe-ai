// app/preferences.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FilterPill from '../components/FilterPill';
import { theme } from '../utils/theme';
import { DEFAULT_PREFERENCES, getRecipePreferences, saveRecipePreferences } from '../utils/preferencesStorage';

// The data for all our filter sections
const FILTER_DATA = {
  time: ['Under 15 min', 'Under 30 min', 'Under 60 min'],
  diets: ['Pescatarian', 'Keto', 'Paleo', 'Low-Carb'],
  allergies: ['Gluten', 'Dairy', 'Egg', 'Soy', 'Fish', 'Peanut', 'Tree Nut', 'Shellfish'],
  goals: ['Eat Healthy', 'Budget-Friendly', 'Plan Better', 'Learn to Cook', 'Quick & Easy'],
  dishTypes: ['Breakfast', 'Brunch', 'Lunch', 'Appetizers', 'Snack', 'Dessert', 'Dinner', 'Drinks']
};

export default function PreferencesModal() {
  const router = useRouter();

  const [selectedTime, setSelectedTime] = useState(DEFAULT_PREFERENCES.time);
  const [selectedDiets, setSelectedDiets] = useState(DEFAULT_PREFERENCES.diets);
  const [selectedAllergies, setSelectedAllergies] = useState(DEFAULT_PREFERENCES.allergies);
  const [selectedGoals, setSelectedGoals] = useState(DEFAULT_PREFERENCES.goals);
  const [selectedDishes, setSelectedDishes] = useState(DEFAULT_PREFERENCES.dishTypes);

  useEffect(() => {
    const loadPreferences = async () => {
      const preferences = await getRecipePreferences();
      setSelectedTime(preferences.time);
      setSelectedDiets(preferences.diets);
      setSelectedAllergies(preferences.allergies);
      setSelectedGoals(preferences.goals);
      setSelectedDishes(preferences.dishTypes);
    };

    loadPreferences();
  }, []);

  // Helper function to toggle a selection in an array
  const toggleSelection = (item, selectedArray, setFunction) => {
    if (selectedArray.includes(item)) {
      setFunction(selectedArray.filter(i => i !== item));
    } else {
      setFunction([...selectedArray, item]);
    }
  };

  // Reusable Section Renderer
  const renderSection = (title, data, selectedState, setFunction) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.pillContainer}>
        {data.map((item) => (
          <FilterPill
            key={item}
            label={item}
            isActive={selectedState.includes(item)}
            onPress={() => toggleSelection(item, selectedState, setFunction)}
          />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      
        
        {/* MODAL HEADER */}
        <View style={styles.header}>
          <View style={{ width: 24 }} /> {/* Spacer for centering */}
          <Text style={styles.headerTitle}>Recipe Preferences</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* SCROLLABLE FILTER CONTENT */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderSection('Time', FILTER_DATA.time, selectedTime, setSelectedTime)}
          {renderSection('Do you follow any of the following diets?', FILTER_DATA.diets, selectedDiets, setSelectedDiets)}
          {renderSection('Any ingredients allergies or intolerance?', FILTER_DATA.allergies, selectedAllergies, setSelectedAllergies)}
          {renderSection('What is your goal?', FILTER_DATA.goals, selectedGoals, setSelectedGoals)}
          {renderSection('Dish Type', FILTER_DATA.dishTypes, selectedDishes, setSelectedDishes)}
          
          <View style={{ height: 100 }} /> {/* Bottom padding so scroll doesn't hide behind buttons */}
        </ScrollView>

        {/* BOTTOM ACTION BAR */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearButton} onPress={() => {
            setSelectedTime([]); setSelectedDiets([]); setSelectedAllergies([]); setSelectedGoals([]); setSelectedDishes([]);
          }}>
            <Ionicons name="close" size={16} color={theme.colors.danger} />
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={async () => {
              await saveRecipePreferences({
                time: selectedTime,
                diets: selectedDiets,
                allergies: selectedAllergies,
                goals: selectedGoals,
                dishTypes: selectedDishes,
              });
              router.back();
            }}
          >
            <Text style={styles.applyText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>

      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textDark },
  
  scrollView: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  
  sectionContainer: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textDark, marginBottom: 12 },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingBottom: 30, paddingTop: 15, borderTopWidth: 1, borderTopColor: theme.colors.border, alignItems: 'center' },
  clearButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  clearText: { color: theme.colors.danger, fontWeight: 'bold', marginLeft: 4, fontSize: 16 },
  applyButton: { backgroundColor: theme.colors.primary, width: '100%', paddingVertical: 16, borderRadius: theme.borderRadius.md, alignItems: 'center' },
  applyText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }
});
