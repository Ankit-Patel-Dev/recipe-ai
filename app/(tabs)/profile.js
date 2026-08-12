// app/(tabs)/profile.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [favoriteFood, setFavoriteFood] = useState('');
  const [diet, setDiet] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Load profile data when the screen opens
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('@user_profile');
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setName(profileData.name);
        setEmail(profileData.email);
        setHobbies(profileData.hobbies || '');
        setFavoriteFood(profileData.favoriteFood || '');
        setDiet(profileData.diet || '');
        setIsSaved(true);
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

    try {
      const profileData = {
        name: name.trim(),
        email: email.trim(),
        hobbies: hobbies.trim(),
        favoriteFood: favoriteFood.trim(),
        diet: diet.trim(),
      };
      await AsyncStorage.setItem('@user_profile', JSON.stringify(profileData));
      setIsSaved(true);
      Alert.alert('Success', 'Profile created and saved!');
    } catch (error) {
      console.error('Failed to save profile', error);
      Alert.alert('Error', 'Could not save profile.');
    }
  };

  const clearProfile = async () => {
    try {
      await AsyncStorage.removeItem('@user_profile');
      setName('');
      setEmail('');
      setHobbies('');
      setFavoriteFood('');
      setDiet('');
      setIsSaved(false);
    } catch (error) {
      console.error('Failed to clear profile', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Account Profile</Text>

        {!isSaved ? (
          /* STATE 1: NO PROFILE YET -> SHOW FORM */
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Set Up Your Profile</Text>
            <Text style={styles.formSubtitle}>Please add your details to get started.</Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Your Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., example@example.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Hobbies</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Cooking, reading, travel"
              placeholderTextColor="#999"
              value={hobbies}
              onChangeText={setHobbies}
            />

            <Text style={styles.label}>Favorite Food</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Pasta"
              placeholderTextColor="#999"
              value={favoriteFood}
              onChangeText={setFavoriteFood}
            />

            <Text style={styles.label}>Diet</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Keto, low-carb, no preference"
              placeholderTextColor="#999"
              value={diet}
              onChangeText={setDiet}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
              <Text style={styles.saveButtonText}>Save & Continue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* STATE 2: PROFILE EXISTS -> SHOW DETAILS */
          <View>
            <View style={styles.profileCard}>
              <View style={styles.avatarCircle}>
                <Text style={{ fontSize: 32 }}>👨‍💻</Text>
              </View>
              <View>
                <Text style={styles.userName}>{name}</Text>
                <Text style={styles.userEmail}>{email || 'No email provided'}</Text>
              </View>
            </View>

            <View style={styles.detailsCard}>
              <ProfileDetail label="Hobbies" value={hobbies} />
              <ProfileDetail label="Favorite food" value={favoriteFood} />
              <ProfileDetail label="Diet" value={diet} />
            </View>

            <TouchableOpacity style={styles.clearButton} onPress={clearProfile}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.danger} style={{ marginRight: 8 }} />
              <Text style={styles.clearButtonText}>Reset / Delete Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
  
  clearButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', padding: 16, borderRadius: theme.borderRadius.md },
  clearButtonText: { color: theme.colors.danger, fontWeight: 'bold', fontSize: 16 }
});
