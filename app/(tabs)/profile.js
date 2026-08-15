// app/(tabs)/profile.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';
import { useProfile, getGeminiKey, saveGeminiKey, deleteGeminiKey, getGeminiModel, saveGeminiModel, deleteGeminiModel } from '../../utils/profileContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { checkProfile } = useProfile();
  const [name, setName] = useState('');
  const [favoriteFood, setFavoriteFood] = useState('');
  const [diet, setDiet] = useState('');
  const [apiKey, setApiKey] = useState(''); 
  const [model, setModel] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('@user_profile');
      const savedKey = await getGeminiKey(); 
      const savedModel = await getGeminiModel();
      
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setName(profileData.name);
        setFavoriteFood(profileData.favoriteFood || '');
        setDiet(profileData.diet || '');
        setIsSaved(true);
      }
      
        if (savedKey) {
          setApiKey(savedKey);
        }
        if (savedModel) {
          setModel(savedModel);
        }
    } catch (error) {
      console.error('Failed to load profile', error);
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter your name before continuing.');
      return;
    }
    
    // 👈 STRICT CHECK: Force the user to enter an API key
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
      
      // Save the API key securely
      await saveGeminiKey(apiKey.trim());
      if (model.trim()) await saveGeminiModel(model.trim());

      setIsSaved(true);
      await checkProfile();
      Alert.alert('Success', 'Profile and API Key saved successfully!');
    } catch (error) {
      console.error('Failed to save profile', error);
      Alert.alert('Error', 'Could not save profile.');
    }
  };

  const clearProfile = async () => {
    try {
      await AsyncStorage.removeItem('@user_profile');
      await deleteGeminiKey(); 
      await deleteGeminiModel();
      setName('');
      setFavoriteFood('');
      setDiet('');
      setApiKey('');
      setModel('');
      setIsSaved(false);
      await checkProfile();
    } catch (error) {
      console.error('Failed to clear profile', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.headerTitle}>Account Profile</Text>

        {!isSaved ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Set Up Your Profile</Text>
            <Text style={styles.formSubtitle}>Please add your details to get started.</Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} placeholder="e.g., Your Name" placeholderTextColor="#999" value={name} onChangeText={setName} />

            <Text style={styles.label}>Favorite Food</Text>
            <TextInput style={styles.input} placeholder="e.g., Pasta" placeholderTextColor="#999" value={favoriteFood} onChangeText={setFavoriteFood} />

            <Text style={styles.label}>Diet</Text>
            <TextInput style={styles.input} placeholder="e.g., Keto, low-carb, no preference" placeholderTextColor="#999" value={diet} onChangeText={setDiet} />

            <Text style={styles.label}>Custom Gemini API Key (Required)</Text>
            <TextInput style={styles.input} placeholder="AIzaSy..." placeholderTextColor="#999" value={apiKey} onChangeText={setApiKey} secureTextEntry={true} autoCapitalize="none" />

            <Text style={styles.label}>Gemini Model (Optional)</Text>
            <TextInput style={styles.input} placeholder="e.g., gemini-3.6-flash" placeholderTextColor="#999" value={model} onChangeText={setModel} autoCapitalize="none" />

            <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
              <Text style={styles.saveButtonText}>Save & Continue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.profileCard}>
              <View style={styles.avatarCircle}>
                <Text style={{ fontSize: 32 }}>👨‍💻</Text>
              </View>
              <View>
                <Text style={styles.userName}>{name}</Text>
                <Text style={styles.userEmail}>Chef / Recipe Explorer</Text>
              </View>
            </View>

            <View style={styles.detailsCard}>
              <ProfileDetail label="Favorite food" value={favoriteFood} />
              <ProfileDetail label="Diet" value={diet} />
              <ProfileDetail label="API Key" value={apiKey ? '••••••••••••' + apiKey.slice(-4) : 'Not Set'} />
              <ProfileDetail label="Model" value={model || 'Not Set'} />
            </View>

            <TouchableOpacity style={styles.likedOptionRow} onPress={() => router.push('/liked')}>
              <Ionicons name="heart-outline" size={20} color={theme.colors.textDark} style={{ marginRight: 10 }} />
              <Text style={styles.likedOptionText}>Liked Recipes</Text>
              <Ionicons name="chevron-forward" size={18} color="#999999" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={clearProfile}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.danger} style={{ marginRight: 8 }} />
              <Text style={styles.clearButtonText}>Edit / Reset Profile</Text>
            </TouchableOpacity>
          </View>
        )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ProfileDetail({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'Not provided'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: theme.colors.textDark, marginBottom: 20 },
  formCard: { backgroundColor: theme.colors.cardSecondary, padding: 20, borderRadius: theme.borderRadius.lg, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textDark, marginBottom: 4 },
  formSubtitle: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textDark, marginBottom: 6 },
  input: { backgroundColor: theme.colors.background, padding: 14, borderRadius: theme.borderRadius.md, marginBottom: 16, fontSize: 16, color: theme.colors.textDark, borderWidth: 1, borderColor: theme.colors.border },
  saveButton: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.cardPrimary, padding: 20, borderRadius: theme.borderRadius.lg, marginBottom: 20 },
  avatarCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  userName: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textDark, marginBottom: 4 },
  userEmail: { fontSize: 14, color: theme.colors.textMuted },
  detailsCard: { backgroundColor: theme.colors.cardSecondary, borderRadius: theme.borderRadius.lg, padding: 20, marginBottom: 20 },
  detailRow: { marginBottom: 16 },
  detailLabel: { color: theme.colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase' },
  detailValue: { color: theme.colors.textDark, fontSize: 16 },
  likedOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  likedOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textDark,
  },
  clearButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', padding: 16, borderRadius: theme.borderRadius.md },
  clearButtonText: { color: theme.colors.danger, fontWeight: 'bold', fontSize: 16 }
});
