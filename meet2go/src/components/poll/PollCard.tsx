import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Badge } from '../ui/Badge';
import { colors, spacing, typography } from '@/src/constants/theme';

interface PollCardProps {
  name: string;
  status: 'no_vote' | 'in_progress' | 'complete';
  statusText: string;
  onPress: () => void;
}

export function PollCard({ name, status, statusText, onPress }: PollCardProps) {
  const badgeVariant = status === 'complete' ? 'green' : status === 'in_progress' ? 'orange' : 'red';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.pollName}>{name}</Text>
      <Badge text={statusText} variant={badgeVariant} style={styles.badge} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  pollName: {
    ...typography.headline,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    alignSelf: 'center',
  },
});
