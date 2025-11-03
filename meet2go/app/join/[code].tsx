import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuests } from '@/src/hooks/useQuests';
import { colors, spacing, typography } from '@/src/constants/theme';

export default function JoinQuestScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { joinQuest, isJoining } = useQuests();

  useEffect(() => {
    if (code) {
      handleJoinQuest();
    }
  }, [code]);

  const handleJoinQuest = async () => {
    try {
      const quest = await joinQuest(code!);
      
      Alert.alert(
        'Success!',
        `You joined "${quest.name}"`,
        [
          {
            text: 'View Quest',
            onPress: () => router.replace(`/quest/${quest.id}`),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to join quest',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Joining quest...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});


