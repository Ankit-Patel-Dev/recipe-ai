// app/setup.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile, saveGeminiKey, saveGeminiModel } from '../utils/profileContext';
import { theme } from '../utils/theme';

export default function SetupScreen() {
  const { checkProfile } = useProfile();
  const [name, setName] = useState('');
  const [favoriteFood, setFavoriteFood] = useState('');
  const [diet, setDiet] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter your name before continuing.');
      return;
    }
    
    if (!apiKey.trim()) {
      Alert.alert('Missing API Key', 'A Gemini API Key is required to use this app. Please enter it below.');
      return;
    }

    try {
      const profileData = {
        name: name.trim(),
        favoriteFood: favoriteFood.trim(),
        diet: diet.trim(),
      };
      
      await AsyncStorage.setItem('@user_profile', JSON.stringify(profileData));
      await saveGeminiKey(apiKey.trim());
      if (model.trim()) await saveGeminiModel(model.trim());

      // Ensure profile check runs immediately (web Alert callbacks may not fire)
      await checkProfile();

      Alert.alert('Success', 'Profile and API Key saved successfully!', [
        {
          text: 'Get Started'
        }
      ]);
    } catch (error) {
      console.error('Failed to save profile during onboarding', error);
      Alert.alert('Error', 'Could not save profile.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Text style={styles.appTitle}>RecipeAI 🍳</Text>
            <Text style={styles.appSubtitle}>Your personal AI-powered chef</Text>
          </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Set Up Your Profile</Text>
          <Text style={styles.formSubtitle}>Please add your details and Gemini API Key to get started.</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. AetherMind " 
            placeholderTextColor="#999" 
            value={name} 
            onChangeText={setName} 
          />

          <Text style={styles.label}>Favorite Food</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Pizza, Sushi, Tacos" 
            placeholderTextColor="#999" 
            value={favoriteFood} 
            onChangeText={setFavoriteFood} 
          />

          <Text style={styles.label}>Diet</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g., Keto, low-carb, vegetarian" 
            placeholderTextColor="#999" 
            value={diet} 
            onChangeText={setDiet} 
          />

          <Text style={styles.label}>Custom Gemini API Key (Required)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="AIzaSy..." 
            placeholderTextColor="#999" 
            value={apiKey} 
            onChangeText={setApiKey} 
            secureTextEntry={true} 
            autoCapitalize="none" 
          />

          <Text style={styles.label}>Gemini Model (Optional)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. gemini-3.6-flash" 
            placeholderTextColor="#999" 
            value={model} 
            onChangeText={setModel} 
            autoCapitalize="none" 
          />

          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveButtonText}>Save & Get Started</Text>
          </TouchableOpacity>
        </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  headerContainer: { alignItems: 'center', marginVertical: 20 },
  appTitle: { fontSize: 32, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 4 },
  appSubtitle: { fontSize: 16, color: theme.colors.textMuted },
  formCard: { backgroundColor: theme.colors.cardSecondary, padding: 20, borderRadius: theme.borderRadius.lg, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textDark, marginBottom: 4 },
  formSubtitle: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textDark, marginBottom: 6 },
  input: { backgroundColor: theme.colors.background, padding: 14, borderRadius: theme.borderRadius.md, marginBottom: 16, fontSize: 16, color: theme.colors.textDark, borderWidth: 1, borderColor: theme.colors.border },
  saveButton: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }
});
