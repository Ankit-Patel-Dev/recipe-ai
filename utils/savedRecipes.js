import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_RECIPES_KEY = '@saved_recipes';

const recipeKey = (recipe) => recipe.recipeName?.trim().toLowerCase() || '';

export const getSavedRecipes = async () => {
  const savedRecipes = await AsyncStorage.getItem(SAVED_RECIPES_KEY);
  return savedRecipes ? JSON.parse(savedRecipes) : [];
};

export const isRecipeSaved = async (recipe) => {
  const savedRecipes = await getSavedRecipes();
  return savedRecipes.some((item) => recipeKey(item.recipe) === recipeKey(recipe));
};

export const toggleSavedRecipe = async (recipe) => {
  const savedRecipes = await getSavedRecipes();
  const existingIndex = savedRecipes.findIndex((item) => recipeKey(item.recipe) === recipeKey(recipe));

  if (existingIndex >= 0) {
    savedRecipes.splice(existingIndex, 1);
    await AsyncStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(savedRecipes));
    return false;
  }

  const now = new Date();
  const savedItem = {
    id: `${now.getTime()}`,
    title: recipe.recipeName || 'Untitled recipe',
    time: recipe.estimatedTime || '—',
    ingredientCount: recipe.detectedIngredients?.length || 0,
    date: now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    recipe,
  };
  await AsyncStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify([savedItem, ...savedRecipes]));
  return true;
};
