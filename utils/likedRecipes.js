// utils/likedRecipes.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const LIKED_RECIPES_KEY = '@liked_recipes';

export const getLikedRecipes = async () => {
  try {
    const saved = await AsyncStorage.getItem(LIKED_RECIPES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error getting liked recipes', error);
    return [];
  }
};

export const isRecipeLiked = async (idMeal) => {
  if (!idMeal) return false;
  const liked = await getLikedRecipes();
  return liked.some((item) => String(item.idMeal) === String(idMeal));
};

export const toggleLikedRecipe = async (recipe) => {
  try {
    if (!recipe || !recipe.idMeal) return false;
    const liked = await getLikedRecipes();
    const existingIndex = liked.findIndex((item) => String(item.idMeal) === String(recipe.idMeal));

    if (existingIndex >= 0) {
      liked.splice(existingIndex, 1);
      await AsyncStorage.setItem(LIKED_RECIPES_KEY, JSON.stringify(liked));
      return false; // unliked
    }

    const newItem = {
      idMeal: recipe.idMeal,
      strMeal: recipe.strMeal,
      strMealThumb: recipe.strMealThumb,
    };
    await AsyncStorage.setItem(LIKED_RECIPES_KEY, JSON.stringify([newItem, ...liked]));
    return true; // liked
  } catch (error) {
    console.error('Error toggling liked recipe', error);
    return false;
  }
};
