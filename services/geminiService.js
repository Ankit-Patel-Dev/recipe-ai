import { getGeminiKey, getGeminiModel } from '../utils/profileContext';

const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash'; 

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

const requestRecipes = async (promptText, imageBase64, signal) => {
  // 👈 Fetch Key Dynamically: ONLY try Secure Store. No .env allowed.
  const activeApiKey = await getGeminiKey();

  // Read model selection (non-secret) and fall back to default
  const selectedModel = (await getGeminiModel()) || DEFAULT_GEMINI_MODEL;

  // 👈 Strict Check: If no key is found, throw an error instructing the user
  if (!activeApiKey) {
    throw new Error('Missing API key. Please enter your Gemini API Key in the Profile tab.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${activeApiKey}`;
  const parts = [{ text: promptText }];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: imageBase64 } });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
      signal,
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || 'Gemini API failed');

    const rawResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawResponse) throw new Error('Gemini returned no recipe. Please try again.');
    return normaliseRecipes(extractJSON(rawResponse));
  } catch (error) {
    // If the request was aborted, return null so callers can handle cancellation quietly
    if (error.name === 'AbortError') return null;
    // Re-throw other errors for higher level handling/logging
    throw error;
  }
};

export const generateRecipeFromText = async (ingredients, preferences, signal) => {
  const isLimitedInput = ingredients.length < 3;
  const promptText = `
You are a precise professional chef. The user has these ingredients: ${ingredients.join(', ')}.

Create 1 to 5 genuinely different, practical recipe options. Do not invent ingredients as if the user has them. Every recipe must list the user's supplied ingredients that it uses in detectedIngredients, with realistic amounts. Use as many supplied ingredients as reasonably possible.
${isLimitedInput ? 'The input is limited. For every option, suggest exactly 2 or 3 useful non-pantry ingredients in missingIngredients that would make the dish complete. Do not present a complete fake recipe using only the limited input.' : 'List only genuinely needed extra ingredients in missingIngredients; salt, oil, water, and basic spices may be treated as pantry staples.'}
Respect these filters exactly:\n${preferenceInstructions(preferences)}

Return ONLY valid JSON, with no markdown, using this structure. Return no more than five recipes:
${recipeSchema}`;

  try {
    return await requestRecipes(promptText, null, signal);
  } catch (error) {
    if (error?.name === 'AbortError') return null;
    console.error('Error generating recipe from text:', error);
    return null;
  }
};

export const generateRecipeFromImage = async (base64Image, preferences, signal) => {
  const promptText = `
You are a precise professional chef. Inspect the image and identify only ingredients you can reasonably see. Create 1 to 5 genuinely different, practical recipe options based on those ingredients.

For every recipe, detectedIngredients must contain the visible ingredients it uses. Do not claim uncertain ingredients are visible. If the visible ingredients are insufficient for a complete recipe, missingIngredients must suggest 2 or 3 useful items to add; otherwise list only genuinely needed extras. Salt, oil, water, and basic spices may be treated as pantry staples.
Respect these filters exactly:\n${preferenceInstructions(preferences)}

Return ONLY valid JSON, with no markdown, using this structure. Return no more than five recipes:
${recipeSchema}`;

  try {
    return await requestRecipes(promptText, base64Image, signal);
  } catch (error) {
    if (error?.name === 'AbortError') return null;
    console.error('Error generating recipe from image:', error);
    return null;
  }
};

export const generateRecipeByName = async (recipeName, signal) => {
  try {
    const prompt = `You are a precise professional chef. Please provide a detailed recipe for "${recipeName}".

Return ONLY valid JSON, with no markdown or extra commentary. Use this structure exactly:
${recipeSchema}`;

    return await requestRecipes(prompt, null, signal);
  } catch (error) {
    console.error("Network or fetch error generating recipe by name:", error);
    return null;
  }
};
