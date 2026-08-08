// app/(tabs)/profile.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
      const profileData = { name, email };
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
              placeholder="e.g., Ankit Patel"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., ankit@recipeai.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
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
  
  clearButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', padding: 16, borderRadius: theme.borderRadius.md },
  clearButtonText: { color: theme.colors.danger, fontWeight: 'bold', fontSize: 16 }
});