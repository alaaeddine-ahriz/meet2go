import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePoll } from '@/src/hooks/usePolls';
import { useQuest } from '@/src/hooks/useQuests';
import { Button } from '@/src/components/ui/Button';
import { colors, spacing, typography } from '@/src/constants/theme';
import PaperBackground from '@/src/components/PaperBackground';
import { calculateScore, getVoteCounts, sortByScore } from '@/src/utils/scoring';
import { RoughNotationWrapper } from '@/src/components/ui/RoughNotationWrapper';

export default function ResultsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { poll, isLoading, hasVoted } = usePoll(id);
  const { quest } = useQuest(poll?.quest_id);

  // Header is part of the static layout; no dynamic top padding needed.

  if (isLoading) {
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

  const options = poll.poll_options || [];
  const optionsWithScores = options.map((option: any) => ({
    ...option,
    score: calculateScore(option.votes || []),
    voteCounts: getVoteCounts(option.votes || []),
  }));

  const sortedOptions = sortByScore(optionsWithScores);

  return (
    <PaperBackground>
      <View style={styles.container}>
        {/* Header */}
        <View
          style={styles.headerContainer}
        >
          <View style={styles.headerCenter}>
            <RoughNotationWrapper type="highlight" color="#98FB98" show={true}>
              <Text style={styles.headerTitle}>{poll.name}</Text>
            </RoughNotationWrapper>
            {!!quest?.name && (
              <Text style={styles.headerSubtitle}>{quest.name}</Text>
            )}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* --- Podium --- */}
            {sortedOptions.length > 0 && (
              <View style={styles.podiumContainer}>
                {/* Second place (left) */}
                {sortedOptions[1] && (
                  <View style={[styles.podiumSlot, { marginTop: 30 }]}>
                    <Text style={styles.optionNameTop} numberOfLines={2}>
                      {sortedOptions[1].name}
                    </Text>
                    <View style={[styles.bar, styles.barSecond]}>
                      <Text style={styles.rankText}>🥈</Text>
                    </View>
                    <Text style={styles.voteCount}>
                      {sortedOptions[1].voteCounts.amazing}😍{' '}
                      {sortedOptions[1].voteCounts.works}✅{' '}
                      {sortedOptions[1].voteCounts.doesnt_work}❌
                    </Text>
                  </View>
                )}

                {/* First place (middle) */}
                {sortedOptions[0] && (
                  <View style={[styles.podiumSlot, { marginHorizontal: 8 }]}>
                    <Text style={[styles.optionNameTop, styles.winnerText]} numberOfLines={2}>
                      {sortedOptions[0].name}
                    </Text>
                    <View style={[styles.bar, styles.barFirst]}>
                      <Text style={styles.rankText}>🏆</Text>
                    </View>
                    <Text style={styles.voteCount}>
                      {sortedOptions[0].voteCounts.amazing}😍{' '}
                      {sortedOptions[0].voteCounts.works}✅{' '}
                      {sortedOptions[0].voteCounts.doesnt_work}❌
                    </Text>
                  </View>
                )}

                {/* Third place (right) */}
                {sortedOptions[2] && (
                  <View style={[styles.podiumSlot, { marginTop: 45 }]}>
                    <Text style={styles.optionNameTop} numberOfLines={2}>
                      {sortedOptions[2].name}
                    </Text>
                    <View style={[styles.bar, styles.barThird]}>
                      <Text style={styles.rankText}>🥉</Text>
                    </View>
                    <Text style={styles.voteCount}>
                      {sortedOptions[2].voteCounts.amazing}😍{' '}
                      {sortedOptions[2].voteCounts.works}✅{' '}
                      {sortedOptions[2].voteCounts.doesnt_work}❌
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* --- Remaining list --- */}
            {sortedOptions.length > 3 && (
              <View style={styles.resultsList}>
                {sortedOptions.slice(3).map((option: any, index: number) => (
                  <View key={option.id} style={styles.resultCard}>
                    <Text style={styles.resultBadgeText}>{index + 4}.</Text>
                    <View style={styles.resultTextWrap}>
                      <Text style={styles.resultName} numberOfLines={1}>
                        {option.name}
                      </Text>
                      <Text style={styles.resultCounts}>
                        {option.voteCounts.amazing}😍 {option.voteCounts.works}✅{' '}
                        {option.voteCounts.doesnt_work}❌
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="+ ADD OPTION"
            onPress={() => router.push(`/poll/${id}/add-option`)}
            style={styles.addButton}
          />
        </View>
      </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
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
    paddingBottom: 140,
  },
  headerContainer: {
    width: '100%',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl + 40,
  },
  headerTitle: {
    ...typography.headline,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerCenter: {
    width: '100%',
    alignItems: 'center',
  },
  headerSubtitle: {
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
  },

  // --- Podium ---
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: spacing.md,
    marginBottom: spacing.xl,
    alignSelf: 'center',
    width: '90%', // slightly narrower than before
  },
  podiumSlot: {
    alignItems: 'center',
    width: '25%', // fixed column width ensures balanced bars
  },
  bar: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barFirst: { height: 150, backgroundColor: '#FFD700' }, // Gold
  barSecond: { height: 115, backgroundColor: '#C0C0C0' }, // Silver
  barThird: { height: 95, backgroundColor: '#CD7F32' }, // Bronze
  rankText: { fontSize: 26 },
  optionNameTop: {
    ...typography.body,
    fontWeight: '700',
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  winnerText: { fontSize: 18 },
  voteCount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // --- Remaining list ---
  resultsList: {
    width: '85%', // identical to podium width
    alignSelf: 'center',
    marginTop: spacing.lg,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: '#000',
  },

  resultBadgeText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    marginRight: spacing.md,
  },
  resultTextWrap: { flex: 1 },
  resultName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  resultCounts: { ...typography.caption, color: colors.textSecondary },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  addButton: { marginTop: spacing.sm, width: '100%' },
  lockedText: {
    ...typography.headline,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  errorText: { ...typography.body, color: colors.error },
  voteButton: { minWidth: 200 },
});
