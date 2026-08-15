// utils/profileContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const ProfileContext = createContext();

export const saveGeminiKey = async (key) => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem('@user_gemini_key_web', key);
    } else {
      await SecureStore.setItemAsync('user_gemini_key', key);
    }
    return true;
  } catch (error) {
    console.error('Failed to save gemini key securely', error);
    return false;
  }
};

export const getGeminiKey = async () => {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem('@user_gemini_key_web');
    } else {
      return await SecureStore.getItemAsync('user_gemini_key');
    }
  } catch (error) {
    console.error('Failed to get gemini key safely', error);
    return null;
  }
};

export const deleteGeminiKey = async () => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem('@user_gemini_key_web');
    } else {
      await SecureStore.deleteItemAsync('user_gemini_key');
    }
    return true;
  } catch (error) {
    console.error('Failed to delete gemini key safely', error);
    return false;
  }
};

// Store a non-secret selected Gemini model name (e.g., "gemini-3.6-flash")
export const saveGeminiModel = async (model) => {
  try {
    await AsyncStorage.setItem('@user_gemini_model', model);
    return true;
  } catch (error) {
    console.error('Failed to save gemini model', error);
    return false;
  }
};

export const getGeminiModel = async () => {
  try {
    return await AsyncStorage.getItem('@user_gemini_model');
  } catch (error) {
    console.error('Failed to get gemini model', error);
    return null;
  }
};

export const deleteGeminiModel = async () => {
  try {
    await AsyncStorage.removeItem('@user_gemini_model');
    return true;
  } catch (error) {
    console.error('Failed to delete gemini model', error);
    return false;
  }
};

export function ProfileProvider({ children }) {
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('@user_profile');
      const savedKey = await getGeminiKey();
      if (savedProfile && savedKey) {
        const profile = JSON.parse(savedProfile);
        if (profile.name && profile.name.trim() && savedKey.trim()) {
          setHasProfile(true);
          return;
        }
      }
      setHasProfile(false);
    } catch (error) {
      console.error('Error checking profile state:', error);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ hasProfile, loading, checkProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
