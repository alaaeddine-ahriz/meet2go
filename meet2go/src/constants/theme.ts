// Design system from PRD and Figma mockups

export const colors = {
  // Primary
  primary: '#5B6FED',
  
  // Vote types
  success: '#4CAF50', // green - "Works"
  error: '#FF6B6B', // red - "Doesn't Work"
  gold: '#FFD93D', // yellow - "Amazing"
  
  // Status badges
  orange: '#FF9500', // in progress
  green: '#4CAF50', // results available
  red: '#FF3B30', // no vote
  
  // Neutrals
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  
  // Glass effect
  glassBackground: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24, // pill-shaped buttons
  full: 9999,
};

export const typography = {
  title: {
    fontSize: 48,
    fontWeight: '700' as const,
    lineHeight: 56,
    fontFamily: 'Komikask',
  },
  headline: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    fontFamily: 'Komikask',
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: 'Komikask',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    fontFamily: 'Komikask',
  },
  button: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
    fontFamily: 'Komikask',
  },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: '#5B6FED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
};

// Gesture thresholds from PRD
export const gestures = {
  SWIPE_THRESHOLD: 100, // pixels
  SWIPE_VELOCITY: 0.5, // units/ms
  CARD_ROTATION: 15, // degrees max
};
