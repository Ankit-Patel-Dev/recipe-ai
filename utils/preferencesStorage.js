import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERENCES_KEY = '@recipe_preferences';

export const DEFAULT_PREFERENCES = {
  time: [],
  diets: [],
  allergies: [],
  goals: [],
  dishTypes: [],
};

export const getRecipePreferences = async () => {
  const savedPreferences = await AsyncStorage.getItem(PREFERENCES_KEY);
  return savedPreferences ? { ...DEFAULT_PREFERENCES, ...JSON.parse(savedPreferences) } : DEFAULT_PREFERENCES;
};

export const saveRecipePreferences = (preferences) =>
  AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
