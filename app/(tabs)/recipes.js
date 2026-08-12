import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Added for navigation
import { getRecipesByCategory } from '../../services/mealDbService';
import { generateRecipeByName } from '../../services/geminiService'; // Added AI function
import { addRecipeToHistory } from '../../utils/recipeHistory';
import { theme } from '../../utils/theme';

export default function RecipesScreen() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isGeneratingAI, setIsGeneratingAI] = useState(false); // New state for AI loading
    const router = useRouter();

    useEffect(() => {
        const loadRecipes = async () => {
            const data = await getRecipesByCategory('Vegetarian');
            setRecipes(data);
            setLoading(false);
        };

        loadRecipes();
    }, []);

    // 🌟 THE AI CLICK HANDLER
    const handleRecipeClick = async (recipeName) => {
        setIsGeneratingAI(true); // Show loading spinner
        
        // Send the recipe name to Gemini
        const aiGeneratedRecipe = await generateRecipeByName(recipeName);
        
        if (aiGeneratedRecipe) {
            await addRecipeToHistory(aiGeneratedRecipe.recipes[0]);
            // Send the AI result to the existing recipe screen
            router.push({
                pathname: '/recipe', 
                params: { recipeData: JSON.stringify(aiGeneratedRecipe) } 
            });
        } else {
            alert("Oops! The AI Chef is busy. Try again.");
        }
        
        setIsGeneratingAI(false); // Hide loading spinner
    };

    // Individual recipe card design (Updated to be Touchable)
    const renderRecipeCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => handleRecipeClick(item.strMeal)} // Trigger AI on click
            disabled={isGeneratingAI} // Prevent clicking multiple times
        >
            <Image source={{ uri: item.strMealThumb }} style={styles.image} />
            <View style={styles.textContainer}>
                {/* numberOfLines={2} prevents long titles from breaking the grid height */}
                <Text style={styles.title} numberOfLines={2}>{item.strMeal}</Text>
            </View>
        </TouchableOpacity>
    );

    // Show loading spinner for initial load OR AI generation
    if (loading || isGeneratingAI) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ff6b6b" />
                    {isGeneratingAI && <Text style={{marginTop: 15, fontSize: 16}}>AI Chef is writing your recipe...</Text>}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                {/* Header and Search Bar */}
                <View style={styles.headerContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Find your favorite recipe"
                            placeholderTextColor="#888"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Popular Dishes</Text>
                    </View>
                </View>

                {/* Recipe Grid */}
                <FlatList
                    data={recipes}
                    keyExtractor={(item) => item.idMeal}
                    renderItem={renderRecipeCard}
                    // These 3 lines create the 2-column grid:
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.list}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: theme.colors.background 
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // --- Header & Search Bar Styles ---
    headerContainer: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 5,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 25,
        // Shadow for the search bar
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    sectionHeader: {
        marginBottom: 15,
    },
    sectionTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: theme.colors.textDark || '#333'
    },
    // --- Grid & Card Styles ---
    list: {
        paddingBottom: 20,
    },
    row: {
        justifyContent: 'space-between', // Spaces the 2 columns evenly
        paddingHorizontal: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 15,
        width: '48%', // Allows exactly 2 cards per row
        overflow: 'hidden',
        elevation: 3, 
        shadowColor: '#000', 
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    image: {
        width: '100%',
        height: 120, // Reduced height so they look like squares in a grid
        resizeMode: 'cover',
    },
    textContainer: {
        padding: 12,
        height: 60, // Fixed height to keep grid aligned perfectly
    },
    title: {
        fontSize: 14, // Slightly smaller font for the grid cards
        fontWeight: 'bold',
        color: '#333',
    },
});