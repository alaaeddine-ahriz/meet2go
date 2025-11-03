import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuest } from '@/src/hooks/useQuests';
import { usePolls } from '@/src/hooks/usePolls';
import { useAuth } from '@/src/hooks/useAuth';
import { Button } from '@/src/components/ui/Button';
import { colors, spacing, typography, shadows } from '@/src/constants/theme';
import { Vote } from '@/src/types';

export default function QuestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { quest, isLoading: questLoading, error: questError } = useQuest(id);
  const { polls, isLoading: pollsLoading } = usePolls(id);

  const handleShare = async () => {
    if (!quest) return;

    try {
      await Share.share({
        message: `Join my quest "${quest.name}" on Meet2Go!\nLink: meet2go://quest/${quest.invite_code}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCreatePoll = () => {
    router.push(`/poll/create?questId=${id}`);
  };

  const handlePollPress = (pollId: string, hasVoted: boolean) => {
    if (hasVoted) {
      router.push(`/poll/${pollId}/results`);
    } else {
      router.push(`/poll/${pollId}/vote`);
    }
  };

  const getPollStatus = (poll: any): { status: 'no_vote' | 'in_progress' | 'complete'; text: string } => {
    const userVotes = poll.poll_options?.flatMap((opt: any) =>
      opt.votes?.filter((v: Vote) => v.user_id === user?.id) || []
    ) || [];

    const hasUserVoted = userVotes.length > 0;
    const totalVotes = poll.poll_options?.reduce(
      (sum: number, opt: any) => sum + (opt.votes?.length || 0),
      0
    ) || 0;
    const totalOptions = poll.poll_options?.length || 0;

    if (!hasUserVoted) {
      return { status: 'no_vote', text: 'NO VOTE' };
    } else if (totalVotes < totalOptions) {
      return { status: 'in_progress', text: `${totalVotes}/${totalOptions} ANSWERS` };
    } else {
      return { status: 'complete', text: 'RESULTS AVAILABLE!' };
    }
  };

  const getStatusColor = (status: 'no_vote' | 'in_progress' | 'complete') => {
    switch (status) {
      case 'complete': return colors.green;
      case 'in_progress': return colors.orange;
      case 'no_vote': return colors.red;
    }
  };

  if (questLoading || pollsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (questError || !quest) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Quest not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const endDate = new Date(quest.end_date);
  const formattedDate = endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.questName}>{quest.name}</Text>
          <Text style={styles.questDate}>{formattedDate}</Text>

          {polls && polls.length > 0 ? (
            <View style={styles.pollsList}>
              {polls.map((poll) => {
                const { status, text } = getPollStatus(poll);
                const hasVoted = status !== 'no_vote';
                return (
                  <TouchableOpacity
                    key={poll.id}
                    style={styles.pollItem}
                    onPress={() => handlePollPress(poll.id, hasVoted)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pollName}>{poll.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                      <Text style={styles.statusText}>{text}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No polls yet</Text>
            </View>
          )}

          <Button title="+ NEW POLL" onPress={handleCreatePoll} style={styles.createButton} />
        </View>
      </ScrollView>

      {/* Glassmorphism Buttons */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity onPress={handleShare} style={styles.glassButton}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.glassButton}>
          <Ionicons name="home-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl + 40,
    paddingHorizontal: spacing.xl,
  },
  questName: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  questDate: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  pollsList: {
    width: '100%',
    alignItems: 'center',
  },
  pollItem: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    width: '100%',
  },
  pollName: {
    ...typography.headline,
    fontSize: 24,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xl,
  },
  statusText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Komikask',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.headline,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    ...typography.headline,
    color: colors.error,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  createButton: {
    marginTop: spacing.xl,
    width: '100%',
  },
  floatingButtons: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  glassButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glass,
  },
});
