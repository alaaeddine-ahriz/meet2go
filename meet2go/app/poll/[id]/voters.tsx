import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PaperBackground from '@/src/components/PaperBackground';
import { HomeIcon } from '@/src/components/icons';
import { Button } from '@/src/components/ui/Button';
import { RoughNotationWrapper } from '@/src/components/ui/RoughNotationWrapper';
import { colors, spacing, typography } from '@/src/constants/theme';
import { usePoll } from '@/src/hooks/usePolls';
import { useQuest } from '@/src/hooks/useQuests';
import { Vote } from '@/src/types';
import { calculateScore, getVoteCounts, sortByScore } from '@/src/utils/scoring';

const voteTypeOrder: Vote['vote_type'][] = ['amazing', 'works', 'doesnt_work'];

const voteTypeDisplay: Record<
  Vote['vote_type'],
  { emoji: string; label: 'Super' | 'Yay' | 'Nay' }
> = {
  amazing: { emoji: '😍', label: 'Super' },
  works: { emoji: '✅', label: 'Yay' },
  doesnt_work: { emoji: '❌', label: 'Nay' },
};

export default function PollVotersScreen() {
  const router = useRouter();
  const { id, optionId } = useLocalSearchParams<{ id: string; optionId?: string }>();
  const { poll, isLoading, hasVoted } = usePoll(id);
  const { quest, isLoading: questLoading } = useQuest(poll?.quest_id);

  const options = poll?.poll_options || [];
  const optionsWithScores = React.useMemo(
    () =>
      options.map((option: any) => ({
        ...option,
        score: calculateScore(option.votes || []),
        voteCounts: getVoteCounts(option.votes || []),
      })),
    [options]
  );

  const sortedOptions = React.useMemo(
    () => sortByScore(optionsWithScores),
    [optionsWithScores]
  );

  const [activeOptionIndex, setActiveOptionIndex] = React.useState(0);
  const [activeVoteType, setActiveVoteType] = React.useState<Vote['vote_type']>('amazing');

  const memberProfilesMap = React.useMemo(() => {
    const map = new Map<string, any>();
    (quest?.members_profiles || []).forEach((member: any) => {
      if (member?.id) {
        map.set(member.id, member);
      }
    });
    return map;
  }, [quest?.members_profiles]);

  React.useEffect(() => {
    if (!sortedOptions.length) {
      setActiveOptionIndex(0);
      return;
    }

    if (optionId && typeof optionId === 'string') {
      const foundIndex = sortedOptions.findIndex((opt: any) => opt.id === optionId);
      if (foundIndex !== -1) {
        setActiveOptionIndex((current) =>
          current === foundIndex ? current : foundIndex
        );
        return;
      }
    }

    setActiveOptionIndex((current) =>
      Math.min(current, Math.max(sortedOptions.length - 1, 0))
    );
  }, [optionId, sortedOptions]);

  React.useEffect(() => {
    const option = sortedOptions[activeOptionIndex];
    if (!option) return;

    const fallbackType =
      voteTypeOrder.find((type) =>
        option.votes?.some((vote: Vote) => vote.vote_type === type)
      ) || 'amazing';

    setActiveVoteType((previousType) => {
      if (option.votes?.some((vote: Vote) => vote.vote_type === previousType)) {
        return previousType;
      }
      return fallbackType;
    });
  }, [activeOptionIndex, sortedOptions]);

  const activeOption = sortedOptions[activeOptionIndex];
  const voteCounts = activeOption?.voteCounts || { amazing: 0, works: 0, doesnt_work: 0 };

  const votesForType = React.useMemo(() => {
    if (!activeOption) return [];
    return (activeOption.votes || [])
      .filter((vote: Vote) => vote.vote_type === activeVoteType)
      .map((vote: Vote) => {
        const memberName = memberProfilesMap.get(vote.user_id)?.display_name;
        return {
          id: vote.id,
          displayName: memberName || 'Unknown voter',
        };
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [activeOption, activeVoteType, memberProfilesMap]);

  const handleGoToQuest = () => {
    if (poll?.quest_id) {
      router.push(`/quest/${poll.quest_id}`);
    }
  };

  const handleCycleOption = (direction: number) => {
    if (!sortedOptions.length) return;
    setActiveOptionIndex((prev) => {
      const total = sortedOptions.length;
      return (prev + direction + total) % total;
    });
  };

  if (isLoading || questLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!poll) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Poll not found</Text>
        <Button title="RESULTS" onPress={() => router.replace(`/poll/${id}/results`)} />
      </View>
    );
  }

  if (!hasVoted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.lockedText}>Vote first to see results!</Text>
        <Button
          title="GO VOTE"
          onPress={() => router.replace(`/poll/${id}/vote`)}
          style={styles.voteButton}
        />
      </View>
    );
  }

  if (!sortedOptions.length || !activeOption) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No options yet.</Text>
        <Button title="+ ADD OPTION" onPress={() => router.push(`/poll/${id}/add-option`)} />
      </View>
    );
  }

  return (
    <PaperBackground>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleGoToQuest}
            activeOpacity={0.7}
          >
            <HomeIcon size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <RoughNotationWrapper type="highlight" color="#FFED8F" show={true}>
              <Text style={styles.headerTitle}>{activeOption.name}</Text>
            </RoughNotationWrapper>
            {!!poll.name && (
              <Text style={styles.headerSubtitle}>{poll.name}</Text>
            )}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentCard}>
            <View style={styles.optionSwitcher}>
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={() => handleCycleOption(-1)}
                disabled={sortedOptions.length <= 1}
                activeOpacity={0.8}
              >
                <Text style={styles.arrowSymbol}>‹</Text>
              </TouchableOpacity>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>CHOICE #{activeOptionIndex + 1}</Text>
                <Text style={styles.optionName}>{activeOption.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={() => handleCycleOption(1)}
                disabled={sortedOptions.length <= 1}
                activeOpacity={0.8}
              >
                <Text style={styles.arrowSymbol}>›</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.countsText}>
              {voteCounts.amazing}😍 {voteCounts.works}✅ {voteCounts.doesnt_work}❌
            </Text>

            <View style={styles.voteTypeSelector}>
              {voteTypeOrder.map((type) => {
                const meta = voteTypeDisplay[type];
                const isActive = type === activeVoteType;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.voteChip, isActive && styles.voteChipActive]}
                    onPress={() => setActiveVoteType(type)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.voteChipEmoji}>{meta.emoji}</Text>
                    <Text
                      style={[
                        styles.voteChipLabel,
                        isActive && styles.voteChipLabelActive,
                      ]}
                    >
                      {meta.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.voterCard}>
              {votesForType.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nobody voted "{voteTypeDisplay[activeVoteType].label}" yet.
                </Text>
              ) : (
                votesForType.map((vote) => (
                  <Text key={vote.id} style={styles.voterName}>
                    {vote.displayName.toUpperCase()}
                  </Text>
                ))
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="‹ RESULTS"
            variant="secondary"
            onPress={() => router.replace(`/poll/${id}/results`)}
            style={styles.footerButton}
          />
          <Button
            title="+ ADD OPTION"
            onPress={() => router.push(`/poll/${id}/add-option`)}
            style={styles.footerButton}
          />
        </View>
      </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerContainer: {
    width: '100%',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl + 32,
    position: 'relative',
  },
  homeButton: {
    position: 'absolute',
    left: spacing.md,
    top: spacing.xxl + 32,
    zIndex: 10,
    padding: spacing.xs,
  },
  headerCenter: {
    width: '100%',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.headline,
    color: colors.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  contentCard: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 20,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  optionSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  arrowSymbol: {
    ...typography.headline,
    color: colors.text,
    lineHeight: 32,
  },
  optionInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  optionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  optionName: {
    ...typography.headline,
    fontSize: 28,
    textAlign: 'center',
    color: colors.text,
  },
  countsText: {
    ...typography.body,
    textAlign: 'center',
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  voteTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  voteChip: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 16,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs / 2,
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
  },
  voteChipActive: {
    backgroundColor: '#FFF4C7',
  },
  voteChipEmoji: {
    fontSize: 24,
  },
  voteChipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  voteChipLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  voterCard: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 18,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    minHeight: 220,
    justifyContent: 'center',
  },
  voterName: {
    ...typography.headline,
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  footerButton: {
    marginBottom: spacing.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: spacing.xl,
  },
  lockedText: {
    ...typography.headline,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  voteButton: { minWidth: 200 },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
