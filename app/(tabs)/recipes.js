import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, RefreshControl, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router'; 
import { getRecipesByCategory, searchRecipesByName, getRecipesByArea } from '../../services/mealDbService'; 
import { generateRecipeByName } from '../../services/geminiService'; 
import { addRecipeToHistory } from '../../utils/recipeHistory';
import { theme } from '../../utils/theme';
import { getLikedRecipes, toggleLikedRecipe } from '../../utils/likedRecipes';

export default function RecipesScreen() {
    const [recipes, setRecipes] = useState([]);
    const [likedRecipeIds, setLikedRecipeIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false); 
    const [searchQuery, setSearchQuery] = useState('');
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const abortControllerRef = useRef(null);
    
    // 🌟 Filter & Modal States
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [expandedSection, setExpandedSection] = useState('categories'); 
    const [currentFilterLabel, setCurrentFilterLabel] = useState('Popular Dishes');
    
    // 🌟 Track active selections
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);

    const router = useRouter();

    const categoriesList = ['Vegetarian', 'Chicken', 'Seafood', 'Pasta', 'Dessert', 'Breakfast', 'Beef', 'Miscellaneous'];
    const countriesList = ['Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai'];

    // 🌟 DEFAULT LOAD: "Popular Dishes"
    const fetchPopularDishes = async () => {
        const randomCategory = categoriesList[Math.floor(Math.random() * categoriesList.length)];
        const data = await getRecipesByCategory(randomCategory);
        
        if (data) {
            const shuffledRecipes = data.sort(() => 0.5 - Math.random());
            setRecipes(shuffledRecipes);
            setCurrentFilterLabel('Popular Dishes');
            // Reset active filters when returning to default
            setSelectedCategory(null);
            setSelectedCountry(null);
        }
    };

    const loadLiked = async () => {
        const liked = await getLikedRecipes();
        setLikedRecipeIds(liked.map((item) => String(item.idMeal)));
    };

    useEffect(() => {
        const initialLoad = async () => {
            await fetchPopularDishes();
            await loadLiked();
            setLoading(false);
        };
        initialLoad();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadLiked();
        }, [])
    );

    const handleToggleLike = (item) => {
        const id = String(item.idMeal);
        setLikedRecipeIds((prev) => {
            const isLiked = prev.includes(id);
            if (isLiked) {
                return prev.filter((i) => i !== id);
            } else {
                return [...prev, id];
            }
        });
        toggleLikedRecipe(item).catch((err) => console.error('Error toggling like in background:', err));
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setSearchQuery('');
        await fetchPopularDishes(); // Dragging down always returns to Popular Dishes
        setRefreshing(false);
    };

    // SEARCH BAR
    const handleApiSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        
        const results = await searchRecipesByName(searchQuery.trim());
        setRecipes(results);
        setCurrentFilterLabel(`Search: "${searchQuery}"`);
        
        setSelectedCategory(null);
        setSelectedCountry(null);
        setLoading(false);
    };

    // 🌟 THE NEW COMBINED FILTER LOGIC
    const applyFilters = async () => {
        setFilterModalVisible(false);
        setLoading(true);
        setSearchQuery(''); 

        if (selectedCategory && selectedCountry) {
            // If both are selected, we must fetch both and find the matches (intersection)
            const [categoryData, countryData] = await Promise.all([
                getRecipesByCategory(selectedCategory),
                getRecipesByArea(selectedCountry)
            ]);

            if (categoryData && countryData) {
                // Find recipes that exist in BOTH lists
                const countryIds = new Set(countryData.map(meal => meal.idMeal));
                const combinedMatches = categoryData.filter(meal => countryIds.has(meal.idMeal));
                
                setRecipes(combinedMatches);
                setCurrentFilterLabel(`${selectedCountry} ${selectedCategory}`);
            } else {
                setRecipes([]);
                setCurrentFilterLabel(`${selectedCountry} ${selectedCategory}`);
            }
        } else if (selectedCategory) {
            // Only Category selected
            const data = await getRecipesByCategory(selectedCategory);
            setRecipes(data || []);
            setCurrentFilterLabel(`${selectedCategory} Dishes`);
        } else if (selectedCountry) {
            // Only Country selected
            const data = await getRecipesByArea(selectedCountry);
            setRecipes(data || []);
            setCurrentFilterLabel(`${selectedCountry} Cuisine`);
        } else {
            // Neither selected
            await fetchPopularDishes();
        }
        
        setLoading(false);
    };

    const clearFilters = () => {
        setSelectedCategory(null);
        setSelectedCountry(null);
    };

    const toggleCategory = (cat) => {
        setSelectedCategory(selectedCategory === cat ? null : cat);
    };

    const toggleCountry = (country) => {
        setSelectedCountry(selectedCountry === country ? null : country);
    };

    const handleRecipeClick = async (recipeName) => {
        setIsGeneratingAI(true); 
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const aiGeneratedRecipe = await generateRecipeByName(recipeName, controller.signal);
        
        if (aiGeneratedRecipe) {
            await addRecipeToHistory(aiGeneratedRecipe.recipes[0]);
            router.push({
                pathname: '/recipe', 
                params: { recipeData: JSON.stringify(aiGeneratedRecipe) } 
            });
        } else {
            if (!controller.signal.aborted) {
                alert("Oops! The AI Chef is busy. Try again.");
            }
        }
        
        setIsGeneratingAI(false); 
    };

    const handleCancelGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setIsGeneratingAI(false);
    };

    const renderRecipeCard = ({ item }) => {
        const isLiked = likedRecipeIds.includes(String(item.idMeal));
        return (
            <TouchableOpacity 
                style={styles.card}
                onPress={() => handleRecipeClick(item.strMeal)}
                disabled={isGeneratingAI} 
            >
                <Image source={{ uri: item.strMealThumb }} style={styles.image} />
                
                <TouchableOpacity
                    style={styles.likeButtonAbsolute}
                    onPress={() => handleToggleLike(item)}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={isLiked ? 'heart' : 'heart-outline'}
                        size={25}
                        color={isLiked ? '#fa6579' : '#000000'}
                        style={!isLiked ? {
                            textShadowColor: 'rgba(255, 255, 255, 0.8)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 3,
                        } : undefined}
                    />
                </TouchableOpacity>

                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={2}>{item.strMeal}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading || isGeneratingAI) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ff6b6b" />
                    {isGeneratingAI ? (
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ marginTop: 15, fontSize: 16, marginBottom: 20 }}>AI Chef is writing your recipe...</Text>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelGeneration}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                {/* Header and Search Bar */}
                <View style={styles.headerContainer}>
                    <View style={styles.searchRow}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search all recipes..."
                                placeholderTextColor="#888"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={handleApiSearch}
                                returnKeyType="search"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => { setSearchQuery(''); onRefresh(); }}>
                                    <Ionicons name="close-circle" size={20} color="#888" />
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
                            <Ionicons name="options-outline" size={22} color="#00005" />
                            {/* Show a dot if any filter is active */}
                            {(selectedCategory || selectedCountry) && <View style={styles.activeFilterDot} />}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{currentFilterLabel}</Text>
                    </View>
                </View>

                {/* Recipe Grid */}
                {recipes.length > 0 ? (
                    <FlatList
                        data={recipes}
                        keyExtractor={(item) => item.idMeal}
                        renderItem={renderRecipeCard}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.list}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#ff6b6b"]} tintColor="#ff6b6b" />
                        }
                    />
                ) : (
                    <ScrollView 
                        contentContainerStyle={styles.emptyState}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    >
                        <Ionicons name="fast-food-outline" size={60} color="#ccc" style={{marginBottom: 15}} />
                        <Text style={styles.emptyStateTitle}>No Recipes Found</Text>
                        <Text style={styles.emptyStateText}>Try adjusting your filters or search term.</Text>
                    </ScrollView>
                )}
            </View>

            {/* 🌟 FILTER BOTTOM SHEET MODAL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={filterModalVisible}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter Recipes</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Categories */}
                            <TouchableOpacity 
                                style={styles.expandableHeader} 
                                onPress={() => setExpandedSection(expandedSection === 'categories' ? null : 'categories')}
                            >
                                <Text style={styles.expandableTitle}>By Category</Text>
                                <Ionicons name={expandedSection === 'categories' ? 'chevron-up' : 'chevron-down'} size={20} color="#333" />
                            </TouchableOpacity>
                            
                            {expandedSection === 'categories' && (
                                <View style={styles.filterChipContainer}>
                                    {categoriesList.map((cat) => {
                                        const isActive = selectedCategory === cat;
                                        return (
                                            <TouchableOpacity 
                                                key={cat} 
                                                style={[styles.filterChip, isActive && styles.filterChipActive]} 
                                                onPress={() => toggleCategory(cat)}
                                            >
                                                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{cat}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}

                            {/* Countries */}
                            <TouchableOpacity 
                                style={styles.expandableHeader} 
                                onPress={() => setExpandedSection(expandedSection === 'countries' ? null : 'countries')}
                            >
                                <Text style={styles.expandableTitle}>By Country / Region</Text>
                                <Ionicons name={expandedSection === 'countries' ? 'chevron-up' : 'chevron-down'} size={20} color="#333" />
                            </TouchableOpacity>
                            
                            {expandedSection === 'countries' && (
                                <View style={styles.filterChipContainer}>
                                    {countriesList.map((country) => {
                                        const isActive = selectedCountry === country;
                                        return (
                                            <TouchableOpacity 
                                                key={country} 
                                                style={[styles.filterChip, isActive && styles.filterChipActive]} 
                                                onPress={() => toggleCountry(country)}
                                            >
                                                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{country}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                            <View style={{height: 20}}/>
                        </ScrollView>

                        {/* Modal Footer Actions */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                                <Text style={styles.clearButtonText}>Clear All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                                <Text style={styles.applyButtonText}>Show Recipes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { flex: 1, backgroundColor: theme.colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    headerContainer: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 5 },
    searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, gap: 10 },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 50,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16, color: '#333' },
    filterButton: {
        backgroundColor: '#fff',
        height: 45,
        width: 45,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    activeFilterDot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 6,
        height: 6,
        borderRadius: 4,
        backgroundColor: '#ff6b6b'
    },
    
    sectionHeader: { marginBottom: 15 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.textDark || '#333' },
    
    list: { paddingBottom: 20 },
    row: { justifyContent: 'space-between', paddingHorizontal: 15 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 15,
        width: '48%',
        overflow: 'hidden',
        elevation: 3, 
        shadowColor: '#000', 
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    image: { width: '100%', height: 120, resizeMode: 'cover' },
    likeButtonAbsolute: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    cancelButton: {
        backgroundColor: '#FEE2E2',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    cancelButtonText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: 'bold',
    },
    textContainer: { padding: 12, height: 60 },
    title: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyStateTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    emptyStateText: { fontSize: 14, color: '#888' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    expandableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    expandableTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    filterChipContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 15, paddingBottom: 5, gap: 10 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f0f0f0', borderRadius: 20 },
    filterChipActive: { backgroundColor: theme.colors.primary },
    filterChipText: { fontSize: 14, color: '#333', fontWeight: '500' },
    filterChipTextActive: { color: '#fff' },
    
    modalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderColor: '#eee' },
    clearButton: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#f0f0f0' },
    clearButtonText: { fontSize: 16, fontWeight: 'bold', color: '#555' },
    applyButton: { flex: 1, marginLeft: 15, paddingVertical: 14, borderRadius: 12, backgroundColor: theme.colors.primary, alignItems: 'center' },
    applyButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});