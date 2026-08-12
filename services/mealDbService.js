const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Fetch recipes by a specific category (e.g., 'Vegetarian')
export const getRecipesByCategory = async (category = 'Vegetarian') => {
  try {
    const response = await fetch(`${BASE_URL}/filter.php?c=${category}`);
    const data = await response.json();
    
    // TheMealDB returns an array of meals inside the "meals" object
    return data.meals; 
  } catch (error) {
    console.error("Error fetching recipes from TheMealDB:", error);
    return [];
  }
};
