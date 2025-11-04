import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePoll } from '@/src/hooks/usePolls';
import { useVotes } from '@/src/hooks/useVotes';
import { SwipeCard } from '@/src/components/voting/SwipeCard';
import { Button } from '@/src/components/ui/Button';
import { colors, spacing, typography } from '@/src/constants/theme';
import PaperBackground from '@/src/components/PaperBackground';
import { VoteType, PollOption } from '@/src/types';
import { RoughNotationWrapper } from '@/src/components/ui/RoughNotationWrapper';

export default function VoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { poll, isLoading } = usePoll(id);
  const { castVote } = useVotes();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votedOptions, setVotedOptions] = useState<Map<string, VoteType>>(new Map());

  const options = poll?.poll_options || [];

  const handleSwipe = useCallback((voteType: VoteType) => {
    if (currentIndex >= options.length) return;

    const currentOption = options[currentIndex];

    // Optimistic UI update - move to next card immediately
      setVotedOptions(prev => new Map(prev).set(currentOption.id, voteType));
        setCurrentIndex(prev => prev + 1);
    
    // Cast vote in background without blocking UI
    castVote({ optionId: currentOption.id, voteType }).catch((error) => {
      console.error('Error voting:', error);
      // Optionally: show a toast notification for failed votes
    });
  }, [currentIndex, options, castVote]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleSeeResults = () => {
    router.replace(`/poll/${id}/results`);
  };

  const handleAddOption = () => {
    router.push(`/poll/${id}/add-option`);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!poll || options.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No options yet. Add one!</Text>
        <Button title="+ ADD OPTION" onPress={handleAddOption} />
      </View>
    );
  }

  // All cards voted
  if (currentIndex >= options.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.completionTitle}>YOU'RE SET!</Text>
        <Text style={styles.completionEmoji}>🚀</Text>
        
        <TouchableOpacity onPress={handleSeeResults} style={styles.resultsLink}>
          <Text style={styles.resultsLinkText}>SEE RESULTS</Text>
        </TouchableOpacity>

        <Button
          title="+ ADD OPTION"
          onPress={handleAddOption}
          variant="primary"
          style={styles.addOptionButton}
        />
      </View>
    );
  }

  // Render cards in stack: current + next 2 cards
  const CARDS_IN_STACK = 3;
  const visibleCards = options.slice(currentIndex, currentIndex + CARDS_IN_STACK);

  return (
    <PaperBackground>
    <View style={styles.container}>
      <View style={styles.header}>
        <RoughNotationWrapper type="highlight" color="#B0E0E6" show={true}>
          <Text style={styles.pollName}>{poll.name}</Text>
        </RoughNotationWrapper>
        <Text style={styles.progress}>
          {currentIndex + 1}/{options.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        {visibleCards.map((option, stackIndex) => {
          const globalIndex = currentIndex + stackIndex;
          return (
        <SwipeCard
              key={option.id}
              optionName={option.name}
              imageUrl={option.image_url || undefined}
          onSwipe={handleSwipe}
              index={globalIndex}
              stackPosition={stackIndex}
              isActive={stackIndex === 0}
        />
          );
        }).reverse()}
      </View>

      <View style={styles.footer}>
        {currentIndex > 0 && (
          <TouchableOpacity
            style={styles.previousButton}
            onPress={handlePrevious}
          >
            <Text style={styles.previousText}>← PREVIOUS</Text>
          </TouchableOpacity>
        )}

        <View style={styles.hints}>
          <Text style={styles.hintText}>← Doesn't Work | Works → | Amazing ↑</Text>
        </View>
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
  header: {
    paddingTop: spacing.xxl + 40,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  pollName: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  progress: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl + 40,
    alignItems: 'center',
  },
  previousButton: {
    marginBottom: spacing.lg,
  },
  previousText: {
    ...typography.button,
    color: colors.primary,
  },
  hints: {
    alignItems: 'center',
  },
  hintText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.headline,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  completionTitle: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.md,
  },
  completionEmoji: {
    fontSize: 80,
    marginBottom: spacing.xxl,
  },
  resultsLink: {
    marginBottom: spacing.lg,
  },
  resultsLinkText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 20,
  },
  addOptionButton: {
    marginBottom: spacing.xxl,
    minWidth: 250,
  },
});


