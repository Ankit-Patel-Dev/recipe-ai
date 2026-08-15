# 🍳 RecipeAI — Smart AI-Powered Recipe Generator

> **🏆 Winning Submission / Hackathon Project**

RecipeAI is an intelligent mobile application built with React Native and Expo that turns whatever ingredients you have on hand into delicious, custom recipes using the power of Google's Gemini AI.

---

## ✨ Features

- **AI-Powered Recipe Generation:** Leverages Google Gemini API to craft unique recipes instantly.
- **Smart Ingredient Input:** Type or select your available ingredients to get cooking recommendations.
- **Dietary Preferences:** Tailor recipes to specific dietary needs, restrictions, or cuisine styles.
- **Saved Recipes & History:** Keep track of your favorite culinary creations and past meals.

---

## 🛠️ Tech Stack

- **Frontend/Mobile:** React Native, Expo, Expo Router
- **AI Integration:** Google Gemini API
- **Styling:** Custom StyleSheet / Theme
- **Deployment:** EAS Build (Expo Application Services) & Vercel (Web)

---

## 🚀 Getting Started Locally

Follow these steps to run the project on your local machine:

### 1. Clone the Repository
```bash
git clone [https://github.com/Ankit-Patel-Dev/recipe-ai.git](https://github.com/Ankit-Patel-Dev/recipe-ai.git)
cd RecipeAI


2. Install Dependencies
Install all required project packages:

Bash
npm install

3. profile setup process
fill your name, favourite food , and diet 

Go to Google AI Studio at aistudio.google.com.

Click on Get API Key on the left pane.

Click the Create API Key button to generate your new key copy the key and paste in the profile setup page 

click on key --> click on  API key documentation. --> scroll to Provide the API key explicitly in code--> check the the model inside js code 
e.g.
                                                import { GoogleGenAI } from "@google/genai";

                                                    const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY" });

                                                    async function main() {
                                                             const interaction = await ai.interactions.create({
                                                                  model: "gemini-3.6-flash",
                                                        input: "Explain how AI works in a few words",
                                                            });
                                                                    console.log(interaction.output_text);
                                                                                    }     

                                                                                main();                                            


fill the model ex. gemini-3.6-flash 

C
Bash
npx expo start
