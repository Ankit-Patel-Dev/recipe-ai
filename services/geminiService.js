const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3.5-flash';

const extractJSON = (rawText) => {
  try {
    return JSON.parse(rawText);
  } catch (error) {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse JSON from AI response.');
    return JSON.parse(match[0]);
  }
};

const preferenceInstructions = (preferences = {}) => {
  const selected = [
    ['maximum cooking time', preferences.time],
    ['dietary requirements', preferences.diets],
    ['allergies to avoid completely', preferences.allergies],
    ['cooking goals', preferences.goals],
    ['requested dish types', preferences.dishTypes],
  ].filter(([, value]) => value?.length);

  if (!selected.length) return 'No additional preferences were selected.';
  return selected.map(([label, value]) => `- ${label}: ${value.join(', ')}`).join('\n');
};

const recipeSchema = `
{
  "recipes": [
    {
      "recipeName": "String",
      "servings": Number,
      "estimatedTime": "String (for example, 25 Min)",
      "difficulty": "String (for example, Easy)",
      "dietaryTags": ["String"],
      "detectedIngredients": [{ "name": "String", "amount": "String", "icon": "emoji" }],
      "missingIngredients": [{ "name": "String", "amount": "String", "icon": "emoji" }],
      "instructions": ["String"]
    }
  ]
}`;

const normaliseRecipes = (result) => {
  const recipes = Array.isArray(result.recipes) ? result.recipes : [result];
  const validRecipes = recipes.filter((recipe) => recipe?.recipeName).slice(0, 5);
  if (!validRecipes.length) throw new Error('The AI did not return a usable recipe. Please try again.');
  return { recipes: validRecipes };
};

const requestRecipes = async (promptText, imageBase64) => {
  if (!GEMINI_API_KEY) throw new Error('Missing Gemini API key. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const parts = [{ text: promptText }];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: imageBase64 } });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Gemini API failed');

  const rawResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawResponse) throw new Error('Gemini returned no recipe. Please try again.');
  return normaliseRecipes(extractJSON(rawResponse));
};

export const generateRecipeFromText = async (ingredients, preferences) => {
  const isLimitedInput = ingredients.length < 3;
  const promptText = `
You are a precise professional chef. The user has these ingredients: ${ingredients.join(', ')}.

Create 1 to 5 genuinely different, practical recipe options. Do not invent ingredients as if the user has them. Every recipe must list the user's supplied ingredients that it uses in detectedIngredients, with realistic amounts. Use as many supplied ingredients as reasonably possible.
${isLimitedInput ? 'The input is limited. For every option, suggest exactly 2 or 3 useful non-pantry ingredients in missingIngredients that would make the dish complete. Do not present a complete fake recipe using only the limited input.' : 'List only genuinely needed extra ingredients in missingIngredients; salt, oil, water, and basic spices may be treated as pantry staples.'}
Respect these filters exactly:\n${preferenceInstructions(preferences)}

Return ONLY valid JSON, with no markdown, using this structure. Return no more than five recipes:
${recipeSchema}`;

  return requestRecipes(promptText);
};

export const generateRecipeFromImage = async (base64Image, preferences) => {
  const promptText = `
You are a precise professional chef. Inspect the image and identify only ingredients you can reasonably see. Create 1 to 5 genuinely different, practical recipe options based on those ingredients.

For every recipe, detectedIngredients must contain the visible ingredients it uses. Do not claim uncertain ingredients are visible. If the visible ingredients are insufficient for a complete recipe, missingIngredients must suggest 2 or 3 useful items to add; otherwise list only genuinely needed extras. Salt, oil, water, and basic spices may be treated as pantry staples.
Respect these filters exactly:\n${preferenceInstructions(preferences)}

Return ONLY valid JSON, with no markdown, using this structure. Return no more than five recipes:
${recipeSchema}`;

  return requestRecipes(promptText, base64Image);
};
export const generateRecipeByName = async (recipeName) => {
  try {
    const prompt = `You are a precise professional chef. Please provide a detailed recipe for "${recipeName}".

Return ONLY valid JSON, with no markdown or extra commentary. Use this structure exactly:
${recipeSchema}`;

    return await requestRecipes(prompt);
  } catch (error) {
    console.error("Network or fetch error generating recipe by name:", error);
    return null;
  }
};