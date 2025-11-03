import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/src/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'quest' | 'poll';
}

export function Card({ children, style, onPress, variant = 'default' }: CardProps) {
  const cardStyles = [
    styles.card,
    variant === 'quest' && styles.questCard,
    variant === 'poll' && styles.pollCard,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  questCard: {
    marginBottom: spacing.md,
  },
  pollCard: {
    marginBottom: spacing.sm,
  },
});


