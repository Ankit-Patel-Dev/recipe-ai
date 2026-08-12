// utils/theme.js

export const theme = {
  colors: {
    background: '#F9F6F0',      // The warm cream background of the app
    cardPrimary: '#F2E8D5',     // The tan/beige color for the main input card
    cardSecondary: '#FFFFFF',   // White for tags and secondary cards
    primary: '#4A5D4E',         // The dark sage green for main buttons
    accent: '#F9D857',          // The bright yellow for the 'Unlimited Recipe' banner & active pills
    textDark: '#1A1A1A',        // Main headings
    textMuted: '#6B604A',       // Subtitles and placeholders
    border: '#E5E5E5',          // Light borders for tags
    danger: '#D9534F',          // Red for the "Clear All" text and "X" icons
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 30,
  },
  borderRadius: {
    sm: 8,
    md: 15, // Used for buttons and tags
    lg: 20, // Used for the large cards
    full: 999, // Used for circular elements
  }
};