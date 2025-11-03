import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/src/constants/theme';

type BadgeVariant = 'orange' | 'green' | 'red';

interface BadgeProps {
  text: string;
  variant: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ text, variant, style }: BadgeProps) {
  const badgeStyles = [
    styles.badge,
    variant === 'orange' && styles.orangeBadge,
    variant === 'green' && styles.greenBadge,
    variant === 'red' && styles.redBadge,
    style,
  ];

  return (
    <View style={badgeStyles}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
    alignSelf: 'flex-start',
  },
  orangeBadge: {
    backgroundColor: colors.orange,
  },
  greenBadge: {
    backgroundColor: colors.green,
  },
  redBadge: {
    backgroundColor: colors.red,
  },
  text: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});


