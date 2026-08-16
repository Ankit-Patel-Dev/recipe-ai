
# 🍳 RecipeAI — Smart AI-Powered Recipe Generator

> 🏆 **Hackathon Winning Project**

RecipeAI is an AI-powered recipe generator built with **React Native, Expo, and Google Gemini**. It transforms the ingredients you already have into practical, personalized recipes using text input or camera scanning, while also providing recipe discovery through TheMealDB.

🌐 **Live Web App:** https://recipe-ai-coral.vercel.app/

---

## ✨ Features

### 🤖 AI Recipe Generation

- Generate **1–5 recipes** from available ingredients.
- Enter ingredients manually using text.
- Scan ingredients using the camera.
- Google Gemini analyzes the provided ingredients and generates structured recipes.
- AI generation considers user preferences such as:
  - Dietary preferences
  - Allergies
  - Cooking time
  - Health goals
  - Dish type

### 📷 Camera Ingredient Scanner

- Capture an image of available ingredients.
- Gemini Vision analyzes the image.
- Detected ingredients are used to generate recipes.
- Camera scanning works on both **Android and Web**.

### 🍽️ Recipe Discovery

- Browse recipes using **TheMealDB**.
- Search recipes by name.
- Browse recipes by category and region.
- Use TheMealDB as a recipe discovery/fallback service.
- Send selected MealDB recipes to Gemini for AI-generated recipe details.

### 📖 Recipe History

- Automatically saves generated recipes locally.
- If Gemini generates multiple recipes from one request, the **complete generated recipe set is saved**.
- History supports recipes generated through:
  - Text ingredients
  - Camera scanning
  - MealDB → Gemini generation

### ❤️ Saved & Liked Recipes

- Bookmark AI-generated recipes.
- Save liked MealDB recipes.
- Manage saved and liked recipes locally.

### ⚙️ Personalization

Users can configure:

- Name
- Favourite food
- Dietary preferences
- Cooking time
- Allergies
- Health goals
- Dish types

These preferences are included in Gemini recipe-generation prompts.

### 🔐 API Key Security

- Users provide their own Gemini API key through the Setup/Profile screen.
- Native platforms use **Expo SecureStore** for API-key storage.
- Web uses **AsyncStorage**.
- Gemini API keys are not hard-coded into the application source code.

### 🌐 Web Support

- Full Expo Web support.
- Production deployment through Vercel.
- Browser camera scanning support.
- Production builds generated using Expo Web export.

---

# 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React Native** | Mobile application |
| **Expo SDK 54** | App framework and native tooling |
| **Expo Router** | File-based navigation |
| **Google Gemini API** | AI recipe generation and image analysis |
| **TheMealDB API** | Recipe discovery and fallback data |
| **Expo Camera** | Ingredient image capture |
| **Expo SecureStore** | Secure native API-key storage |
| **AsyncStorage** | Local data persistence |
| **Vercel** | Web deployment |
| **EAS Build** | Android/iOS application builds |

---

# 📁 Project Structure

```text
RecipeAi/
│
├── app/
│   ├── _layout.js
│   ├── setup.js
│   ├── camera.js
│   ├── recipe.js
│   ├── history.js
│   ├── liked.js
│   ├── preferences.js
│   │
│   └── (tabs)/
│       ├── _layout.js
│       ├── index.js
│       ├── recipes.js
│       ├── saved.js
│       └── profile.js
│
├── components/
│   ├── FilterPill.js
│   ├── IngredientTag.js
│   └── RecipeHistoryCard.js
│
├── services/
│   ├── geminiService.js
│   └── mealDbService.js
│
├── utils/
│   ├── likedRecipes.js
│   ├── mockData.js
│   ├── preferencesStorage.js
│   ├── profileContext.js
│   ├── recipeHistory.js
│   ├── savedRecipes.js
│   └── theme.js
│
├── assets/
│   ├── recipeai.png
│   └── recipeai_splash.png
│
├── app.json
├── eas.json
├── vercel.json
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
````

---

# 🔄 Application Flow

## 📝 Text Ingredients → Gemini → Recipes

```text
User enters ingredients
        ↓
Home Screen
        ↓
generateRecipeFromText()
        ↓
services/geminiService.js
        ↓
Google Gemini API
        ↓
JSON response
        ↓
Recipe normalization
        ↓
Recipe Screen
        ↓
Complete recipe set saved to History
```

Gemini is instructed to return **only valid JSON**.

The Gemini service also handles JSON extraction when the model returns additional text and normalizes the generated recipe structure.

---

## 📷 Camera → Gemini Vision → Recipes

```text
Camera
   ↓
app/camera.js
   ↓
Capture image
   ↓
Normalize image/base64 data
   ↓
generateRecipeFromImage()
   ↓
services/geminiService.js
   ↓
Gemini Vision
   ↓
Ingredient analysis
   ↓
1–5 generated recipes
   ↓
Recipe Screen
   ↓
Complete recipe set → History
```

The camera flow handles both native and Web image data and supports `data:` and `blob:` image sources.

---

## 🍽️ MealDB → Gemini → Recipe

```text
Recipes Tab
    ↓
TheMealDB
    ↓
Search / Category / Region
    ↓
User selects recipe
    ↓
generateRecipeByName()
    ↓
Google Gemini
    ↓
AI-generated recipe
    ↓
Recipe Screen
    ↓
History
```

TheMealDB provides public recipe data and acts as a recipe discovery/fallback service.

---

# 🧠 Gemini AI Service

The main AI logic is located at:

```text
services/geminiService.js
```

It handles:

* Text-based recipe generation
* Image-based ingredient analysis
* Recipe generation by name
* User preference integration
* Gemini API requests
* JSON extraction
* Recipe normalization
* AbortController cancellation
* Error handling

Gemini prompts can include:

```text
Available ingredients
Diet
Allergies
Cooking time
Health goals
Dish type
```

The service expects structured JSON from Gemini rather than normal conversational text.

---

# 🍽️ TheMealDB Service

Located at:

```text
services/mealDbService.js
```

It handles public MealDB requests for:

* Recipe search
* Categories
* Regions/areas
* Recipe discovery
* Fallback recipe data

TheMealDB does not require a Gemini API key.

---

# 💾 Local Storage

RecipeAI stores application data locally.

### Profile

```text
utils/profileContext.js
```

Manages profile information and Gemini API-key availability.

### Preferences

```text
utils/preferencesStorage.js
```

Stores recipe-generation preferences.

### Recipe History

```text
utils/recipeHistory.js
```

Stores generated AI recipes.

Multiple recipes generated from the same request are stored together as a complete generation result.

### Saved Recipes

```text
utils/savedRecipes.js
```

Stores bookmarked AI-generated recipes.

### Liked Recipes

```text
utils/likedRecipes.js
```

Stores liked MealDB recipes.

---

# 🔐 Gemini API Key Setup

RecipeAI requires the user to provide a Gemini API key.

## 1. Get a Gemini API Key

Go to:

**Google AI Studio**

[https://aistudio.google.com/](https://aistudio.google.com/)

Sign in and create an API key.

## 2. Start RecipeAI

```bash
npx expo start
```

Open the application in Expo Go or Web.

## 3. Complete Profile Setup

Enter:

* Your name
* Favourite food
* Dietary preferences

## 4. Add Gemini API Key

Paste your Gemini API key into the API Key field in the Setup/Profile screen.

## 5. Add the Gemini Model

Enter the Gemini model available to your API account.

Example:

```text
gemini-3.6-flash
```

> **Note:** Gemini model names and availability can change. Use a model currently available to your Google AI Studio/API account.

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/Ankit-Patel-Dev/recipe-ai.git
cd recipe-ai
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Start the Application

```bash
npx expo start
```

You can then open RecipeAI using:

* **Expo Go** on Android
* **Web browser** for Expo Web

---

# 🌐 Web Development

Start the Expo development server:

```bash
npx expo start
```

Then press:

```text
w
```

to open the Web version.

---

# 📦 Production Web Build

To create a production Web build locally:

```bash
npx expo export -p web
```

Expo generates:

```text
dist/
```

The `dist/` directory is a generated deployment folder and should **not** be committed to Git.

---

# ☁️ Vercel Deployment

RecipeAI is deployed as an Expo Web application using Vercel.

## 🌐 Live Application

**[https://recipe-ai-coral.vercel.app/](https://recipe-ai-coral.vercel.app/)**

The project includes:

```text
vercel.json
```

The Web build uses:

```bash
npx expo export -p web
```

and outputs the production files to:

```text
dist/
```

### Deployment Flow

```text
GitHub Repository
       ↓
     Vercel
       ↓
   npm install
       ↓
npx expo export -p web
       ↓
     dist/
       ↓
RecipeAI Web Application
```

After connecting the GitHub repository to Vercel, future pushes to the configured production branch can automatically trigger new deployments.

---

# 📱 Android Build

RecipeAI can be built for Android using Expo Application Services.

For an APK build:

```bash
eas build -p android --profile preview
```

For Google Play distribution, an Android App Bundle (`.aab`) is generally preferred.

---

# 🔒 Git & Security

The following local/generated files should not be committed:

```text
node_modules/
.expo/
.vscode/
.claude/
.idea/
.DS_Store
dist/
expo-env.d.ts
```

Never commit your real Gemini API key to GitHub.

RecipeAI is designed so users provide their own Gemini API key through the application setup/profile flow.

---

# 📌 Version

## RecipeAI v2.1.0

### What's New

* 🌐 Improved Web support
* 📷 Improved Web camera/scanning experience
* 🤖 Improved Gemini recipe generation
* 📖 Recipe History now saves the complete set of generated recipes
* 🍳 Multiple recipes generated from text or camera are preserved together
* 🔄 Improved consistency between Web and Expo Go
* ☁️ Added Vercel Web deployment support
* 🧹 Cleaned the GitHub repository
* 🗑️ Removed unnecessary Expo starter files

---

# 🏆 Hackathon Project

RecipeAI was developed as an AI-powered hackathon project focused on solving a simple everyday problem:

> **What can I cook with the ingredients I already have?**

Instead of searching through recipes one by one, RecipeAI uses AI to understand the ingredients available to the user and generate practical recipes based on their preferences.

---

# 👨‍💻 Developer

**Ankit Patel**

GitHub:
[https://github.com/Ankit-Patel-Dev](https://github.com/Ankit-Patel-Dev)

Repository:
[https://github.com/Ankit-Patel-Dev/recipe-ai](https://github.com/Ankit-Patel-Dev/recipe-ai)

Live Web App:
[https://recipe-ai-coral.vercel.app/](https://recipe-ai-coral.vercel.app/)

```
```
