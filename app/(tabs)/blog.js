// app/(tabs)/blog.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';

export default function BlogScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Chef Blog</Text>
        <Text style={styles.subtitle}>Tips, tricks, and smart cooking guides</Text>

        {/* Blog Post Card 1 */}
        <View style={styles.blogCard}>
          <Text style={styles.blogTag}>AI COOKING TIPS</Text>
          <Text style={styles.blogTitle}>How to Turn Leftover Veggies into a Gourmet Meal</Text>
          <Text style={styles.blogSnippet}>Don't throw away that half-used onion or extra rice. Here is how Gemini helps you optimize pantry ingredients...</Text>
        </View>

        {/* Blog Post Card 2 */}
        <View style={styles.blogCard}>
          <Text style={styles.blogTag}>COMMUNITY</Text>
          <Text style={styles.blogTitle}>Top 10 Smart Kitchen Hacks for Students</Text>
          <Text style={styles.blogSnippet}>Quick meal prep strategies designed for busy schedules and tight budgets...</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: theme.colors.textDark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 20 },
  blogCard: { backgroundColor: theme.colors.cardSecondary, padding: 20, borderRadius: theme.borderRadius.lg, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  blogTag: { fontSize: 11, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 8, letterSpacing: 1 },
  blogTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textDark, marginBottom: 8, lineHeight: 24 },
  blogSnippet: { fontSize: 14, color: theme.colors.textMuted, lineHeight: 20 }
});
