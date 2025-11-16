import { ReturnIcon } from '@/src/components/icons';
import PaperBackground from '@/src/components/PaperBackground';
import { Button } from '@/src/components/ui/Button';
import { RoughNotationWrapper } from '@/src/components/ui/RoughNotationWrapper';
import { colors, spacing, typography } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { usePolls } from '@/src/hooks/usePolls';
import { useQuest } from '@/src/hooks/useQuests';
import { Vote } from '@/src/types';
import { useShareHandler } from '@/src/utils/share';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function QuestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { quest, isLoading: questLoading, error: questError } = useQuest(id);
  const { polls, isLoading: pollsLoading } = usePolls(id);
  const shareHandler = useShareHandler();

  // Ensure hooks are declared before any early returns
  // Header is part of the static layout (non-scrolling),
  // so content below does not need dynamic top padding.

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
    <PaperBackground>
      <View style={styles.container}>
      <View
        style={styles.headerContainer}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.7}
        >
          <ReturnIcon size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <RoughNotationWrapper type="highlight" color="#FFB6C1" show={true}>
            <Text style={styles.headerTitle}>{quest.name}</Text>
          </RoughNotationWrapper>
          <Text style={styles.headerDate}>{formattedDate}</Text>
          {!!quest?.members_profiles?.length && (
            <View style={styles.avatarRow}>
              {quest.members_profiles.slice(0, 6).map((p: any, i: number) => (
                <View key={p.id} style={[styles.avatarWrap, { marginLeft: i === 0 ? 0 : -12 }]}> 
                  {p.avatar_url ? (
                    <Image source={{ uri: p.avatar_url }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Text style={styles.avatarInitial}>
                        {(p.display_name || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
              {quest.members_profiles.length > 6 && (
                <View style={[styles.avatar, styles.moreAvatar, { marginLeft: -12 }]}>
                  <Text style={styles.moreText}>+{quest.members_profiles.length - 6}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

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
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="SHARE INVITE" onPress={() => shareHandler(quest.name, quest.invite_code)} variant="secondary" style={styles.shareButton} />
        <Button title="+ NEW POLL" onPress={handleCreatePoll} style={styles.createButton} />
      </View>

      {/* Nav buttons moved into header */}
      </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: spacing.xl,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  headerContainer: {
    width: '100%',
    marginBottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl + 40,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    top: spacing.xxl + 40,
    zIndex: 10,
    padding: spacing.xs,
  },
  headerCenter: {
    width: '100%',
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarFallback: {
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  moreAvatar: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
  },
  headerTitle: {
    ...typography.headline,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerDate: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    paddingHorizontal: spacing.xl,
  },
  
  pollsList: {
    width: '100%',
    alignItems: 'center',
  },
  pollItem: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    width: '100%',
  },
  pollName: {
    ...typography.headline,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.xs,
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
    paddingVertical: 0,
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
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  shareButton: {
    marginTop: spacing.sm,
    width: '100%',
  },
  createButton: {
    marginTop: spacing.sm,
    width: '100%',
  },
});
