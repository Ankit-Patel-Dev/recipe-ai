// services/geminiService.js

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const extractJSON = (rawText) => {
  try {
    return JSON.parse(rawText);
  } catch (e) {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Could not parse JSON from AI response.");
  }
};

// 1. Image Generation Service (Using Gemini 3.5 Flash)
export const generateRecipeFromImage = async (base64Image) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const promptText = `
    You are a professional chef AI. Look at the provided image of ingredients.
    Identify what you see and create a highly delicious, practical recipe.
    
    You MUST return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json. 
    Use this exact JSON structure:
    {
      "recipeName": "String",
      "servings": Number,
      "estimatedTime": "String (e.g., 25 Min)",
      "difficulty": "String (e.g., Easy)",
      "dietaryTags": ["String", "String"],
      "detectedIngredients": [
        { "name": "String", "amount": "String", "icon": "emoji" }
      ],
      "missingIngredients": [
        { "name": "String (pantry staples needed)", "amount": "String", "icon": "emoji" }
      ],
      "instructions": [
        "String (Step 1)",
        "String (Step 2)"
      ]
    }
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ]
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error Response:", result);
      throw new Error(result.error?.message || "Gemini API failed");
    }

    const rawAiResponse = result.candidates[0].content.parts[0].text;
    return extractJSON(rawAiResponse);

  } catch (error) {
    console.error("Gemini Image API Error:", error);
    throw error;
  }
};

// 2. Text Generation Service (Using Gemini 3.5 Flash)
export const generateRecipeFromText = async (ingredientsArray) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const ingredientsString = ingredientsArray.join(', ');

  const promptText = `
    You are a professional chef AI. The user has the following ingredients available: ${ingredientsString}.
    Create a highly delicious, practical recipe using these ingredients (you can assume basic pantry staples like salt, oil, and water are available).
    
    You MUST return ONLY a valid JSON object. Do not include any conversational filler text. 
    Use this exact JSON structure:
    {
      "recipeName": "String",
      "servings": Number,
      "estimatedTime": "String (e.g., 25 Min)",
      "difficulty": "String (e.g., Easy)",
      "dietaryTags": ["String", "String"],
      "detectedIngredients": [
        { "name": "String", "amount": "String", "icon": "emoji" }
      ],
      "missingIngredients": [
        { "name": "String (pantry staples needed)", "amount": "String", "icon": "emoji" }
      ],
      "instructions": [
        "String (Step 1)",
        "String (Step 2)"
      ]
    }
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error Response:", result);
      throw new Error(result.error?.message || "Gemini API failed");
    }

    const rawAiResponse = result.candidates[0].content.parts[0].text;
    return extractJSON(rawAiResponse);

  } catch (error) {
    console.error("Gemini Text API Error:", error);
    throw error;
  }
};