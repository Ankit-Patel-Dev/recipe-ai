// utils/mockData.js

export const mockRecipeResponse = {
  recipeName: "Vegetarian Indonesian Nasi Liwet",
  servings: 2,
  estimatedTime: "25 Min",
  difficulty: "Easy",
  dietaryTags: ["Vegetarian", "Budget-Friendly"],
  detectedIngredients: [
    { name: "Rice", amount: "500gr", icon: "🍚" },
    { name: "Onion", amount: "2", icon: "🧅" },
    { name: "Garlic", amount: "2 cloves", icon: "🧄" }
  ],
  missingIngredients: [
    { name: "Coconut Milk", amount: "200ml", icon: "🥥" },
    { name: "Lemongrass", amount: "1 stalk", icon: "🌿" }
  ],
  instructions: [
    "Wash the rice thoroughly and drain the water.",
    "Thinly slice the onion and crush the garlic cloves.",
    "In a rice cooker, combine the washed rice..."
  ],
  // 👇 Make sure this history array is here!
  history: [
    {
      id: "1",
      title: "Javanese Tomato Fried Rice",
      time: "25 Min",
      ingredientCount: 6,
      date: "24 Mar"
    },
    {
      id: "2",
      title: "Indonesian Original Nasi Liwet",
      time: "15 Min",
      ingredientCount: 4,
      date: "17 Mar"
    }
  ]
};