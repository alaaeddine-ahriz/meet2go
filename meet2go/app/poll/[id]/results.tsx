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
import { Ionicons } from '@expo/vector-icons';
import { usePoll } from '@/src/hooks/usePolls';
import { Button } from '@/src/components/ui/Button';
import { colors, spacing, typography, shadows } from '@/src/constants/theme';
import PaperBackground from '@/src/components/PaperBackground';
import { calculateScore, getVoteCounts, sortByScore } from '@/src/utils/scoring';

export default function ResultsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { poll, isLoading, hasVoted } = usePoll(id);

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

  // Check if user has voted (or is poll creator)
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.pollName}>{poll.name}</Text>

          <View style={styles.resultsList}>
            {sortedOptions.map((option: any, index: number) => {
              const isWinner = index === 0;

              return (
                <View key={option.id} style={styles.resultItem}>
                  {isWinner && <Text style={styles.trophy}>🏆</Text>}
                  
                  <Text style={[styles.optionName, isWinner && styles.winnerText]}>
                    {option.name}
                  </Text>
                  
                  <Text style={styles.voteCount}>
                    {option.voteCounts.amazing}😍 {option.voteCounts.works}✅ {option.voteCounts.doesnt_work}❌
                  </Text>
                  
                  {/* <Text style={styles.score}>Score: {option.score}</Text> */}
                </View>
              );
            })}
          </View>

          <Button
            title="+ ADD OPTION"
            onPress={() => router.push(`/poll/${id}/add-option`)}
            style={styles.addButton}
          />
        </View>
      </ScrollView>

      {/* Simple round buttons */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity
          style={styles.glassButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.glassButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="home-outline" size={24} color={colors.text} />
        </TouchableOpacity>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
  pollName: {
    ...typography.headline,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  resultsList: {
    width: '100%',
    alignItems: 'center',
  },
  resultItem: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    width: '100%',
  },
  trophy: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  optionName: {
    ...typography.headline,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  winnerText: {
    color: colors.text,
    fontWeight: '800',
  },
  voteCount: {
    ...typography.body,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  score: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  lockedText: {
    ...typography.headline,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
  voteButton: {
    minWidth: 200,
  },
  addButton: {
    marginTop: spacing.xxl,
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
