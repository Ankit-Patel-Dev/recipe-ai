const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Fetch recipes by a specific category (e.g., 'Vegetarian')
export const getRecipesByCategory = async (category = 'Vegetarian') => {
  try {
    const timestamp = new Date().getTime(); // 👈 Forces a fresh request
    const response = await fetch(`${BASE_URL}/filter.php?c=${category}&t=${timestamp}`);
    const data = await response.json();
    return data.meals || []; 
  } catch (error) {
    console.error("Error fetching recipes by category:", error);
    return [];
  }
};

// Search for a recipe by its name directly from the API
export const searchRecipesByName = async (query) => {
  try {
    const timestamp = new Date().getTime(); // 👈 Forces a fresh request
    const response = await fetch(`${BASE_URL}/search.php?s=${query}&t=${timestamp}`);
    const data = await response.json();
    return data.meals || []; 
  } catch (error) {
    console.error("Error searching recipes:", error);
    return [];
  }
};

// Filter recipes by country/area (e.g., Indian, Italian)
export const getRecipesByArea = async (area) => {
  try {
    const timestamp = new Date().getTime(); // 👈 Forces a fresh request
    const response = await fetch(`${BASE_URL}/filter.php?a=${area}&t=${timestamp}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error("Error fetching recipes by area:", error);
    return [];
  }
};