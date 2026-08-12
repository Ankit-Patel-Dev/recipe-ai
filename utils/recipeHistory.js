import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@recipe_history';
const MAX_HISTORY_ITEMS = 50;

export const getRecipeHistory = async () => {
  const savedHistory = await AsyncStorage.getItem(HISTORY_KEY);

  if (!savedHistory) {
    return [];
  }

  const history = JSON.parse(savedHistory);
  return Array.isArray(history) ? history : [];
};

export const addRecipeToHistory = async (recipe) => {
  const existingHistory = await getRecipeHistory();
  const now = new Date();
  const historyItem = {
    id: `${now.getTime()}`,
    title: recipe.recipeName || 'Untitled recipe',
    time: recipe.estimatedTime || '—',
    ingredientCount: recipe.detectedIngredients?.length || 0,
    date: now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    recipe,
  };

  const updatedHistory = [historyItem, ...existingHistory].slice(0, MAX_HISTORY_ITEMS);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

  return updatedHistory;
};

export const removeRecipeHistoryItems = async (ids = []) => {
  const existingHistory = await getRecipeHistory();
  const updatedHistory = existingHistory.filter((item) => !ids.includes(item.id));
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  return updatedHistory;
};
