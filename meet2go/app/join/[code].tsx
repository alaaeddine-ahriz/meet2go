import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PaperBackground from '@/src/components/PaperBackground';
import { useQuests } from '@/src/hooks/useQuests';
import { colors, spacing, typography } from '@/src/constants/theme';
import { showAlert } from '@/src/utils/alert';
import { useAuth } from '@/src/hooks/useAuth';

export default function JoinQuestScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { joinQuest, isJoining } = useQuests();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!code || loading) {
      return;
    }

    if (!user) {
      showAlert(
        'Sign In Required',
        'Please sign in to join quests.',
        [
          {
            text: 'Go to Sign In',
            onPress: () => router.replace('/(auth)/sign-in'),
          },
        ]
      );
      return;
    }

    handleJoinQuest(code);
  }, [code, user, loading, router]);

  const handleJoinQuest = async (inviteCode: string) => {
    try {
      const quest = await joinQuest(inviteCode);
      
      showAlert(
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
      showAlert(
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
    <PaperBackground>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.text}>Joining quest...</Text>
      </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
