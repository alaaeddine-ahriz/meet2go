import { HomeIcon } from '@/src/components/icons';
import PaperBackground from '@/src/components/PaperBackground';
import { Button } from '@/src/components/ui/Button';
import { RoughNotationWrapper } from '@/src/components/ui/RoughNotationWrapper';
import { SwipeCard } from '@/src/components/voting/SwipeCard';
import { colors, spacing, typography } from '@/src/constants/theme';
import { usePoll } from '@/src/hooks/usePolls';
import { useVotes } from '@/src/hooks/useVotes';
import { useAuth } from '@/src/hooks/useAuth';
import { VoteType } from '@/src/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function VoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { poll, isLoading } = usePoll(id);
  const { castVotesBatch, isBatchVoting } = useVotes();
  const { user } = useAuth();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votedOptions, setVotedOptions] = useState<Map<string, VoteType>>(new Map());
  const [pendingVotes, setPendingVotes] = useState<Array<{ optionId: string; voteType: VoteType }>>([]);
  const [hasAlignedIndex, setHasAlignedIndex] = useState(false);

  const options = poll?.poll_options || [];

  // Jump directly to the first option the user hasn't voted on yet.
  useEffect(() => {
    if (hasAlignedIndex) return;
    if (!options.length || !user?.id) return;

    const firstUnvotedIndex = options.findIndex(
      option => !(option.votes || []).some(vote => vote.user_id === user.id)
    );

    setCurrentIndex(firstUnvotedIndex === -1 ? options.length : firstUnvotedIndex);
    setHasAlignedIndex(true);
  }, [options, user?.id, hasAlignedIndex]);

  // 🔥 Stores JPG URLs received from API
  const [loadedImages, setLoadedImages] = useState<Map<string, string>>(new Map());

  // 🔥 1. Fetch JPG images from your backend
  useEffect(() => {
    if (!options || options.length === 0) return;
  
    async function fetchImages() {
      for (const option of options) {
        if (!loadedImages.has(option.id)) {
          console.log("FETCHING IMAGE FOR:", option.name);
  
          try {
            const response = await fetch("https://image.a1s.kz/image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ word: option.name }),
            });
  
            const blob = await response.blob();
  
            // Convert Blob → usable local URL
            const localUrl = URL.createObjectURL(blob);
  
            console.log("IMAGE READY:", localUrl);
  
            setLoadedImages(prev => {
              const next = new Map(prev);
              next.set(option.id, localUrl);
              return next;
            });
  
          } catch (err) {
            console.error("Image fetch error:", err);
          }
        }
      }
    }
  
    fetchImages();
  }, [options]);
  

  // ------------- Swipe logic -------------
  const handleSwipe = useCallback((voteType: VoteType) => {
    if (currentIndex >= options.length) return;

    const currentOption = options[currentIndex];

    setVotedOptions(prev => new Map(prev).set(currentOption.id, voteType));
    setPendingVotes(prev => [...prev, { optionId: currentOption.id, voteType }]);

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    if (nextIndex >= options.length) {
      const votesToSubmit = [...pendingVotes, { optionId: currentOption.id, voteType }];
      castVotesBatch(votesToSubmit).catch((error) => {
        console.error('Error submitting votes:', error);
      });
    }
  }, [currentIndex, options, pendingVotes, castVotesBatch]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  }, [currentIndex]);

  const handleSeeResults = () => router.replace(`/poll/${id}/results`);
  const handleAddOption = () => router.push(`/poll/${id}/add-option`);
  const handleGoToQuest = () => poll?.quest_id && router.push(`/quest/${poll.quest_id}`);

  // ------------- Loading states -------------
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

  // ------------- All voted -------------
  if (currentIndex >= options.length) {
    return (
      <PaperBackground>
        <View style={styles.centerContainer}>
          <TouchableOpacity
            style={styles.completionHomeButton}
            onPress={handleGoToQuest}
            activeOpacity={0.7}
          >
            <HomeIcon size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.completionTitle}>YOU'RE SET!</Text>
          <Text style={styles.completionEmoji}>🚀</Text>

          {isBatchVoting && <ActivityIndicator size="small" color={colors.primary} />}

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
      </PaperBackground>
    );
  }

  // ------------- Visible cards -------------
  const CARDS_IN_STACK = 3;
  const visibleCards = options.slice(currentIndex, currentIndex + CARDS_IN_STACK);

  return (
    <PaperBackground>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleGoToQuest}
            activeOpacity={0.7}
          >
            <HomeIcon size={28} color={colors.text} />
          </TouchableOpacity>

          <RoughNotationWrapper type="highlight" color="#B0E0E6" show={true}>
            <Text style={styles.pollName}>{poll.name}</Text>
          </RoughNotationWrapper>

          <Text style={styles.progress}>
            {currentIndex + 1}/{options.length}
          </Text>
        </View>

        {/* Cards */}
        <View style={styles.cardContainer}>
          {visibleCards.map((option, stackIndex) => {
            const globalIndex = currentIndex + stackIndex;

            return (
              <SwipeCard
                key={option.id}
                optionName={option.name}
                imageUrl={loadedImages.get(option.id)}   // 🔥 HERE WE USE JPG
                onSwipe={handleSwipe}
                index={globalIndex}
                stackPosition={stackIndex}
                isActive={stackIndex === 0}
              />
            );
          }).reverse()}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {currentIndex > 0 && (
            <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
              <Text style={styles.previousText}>← PREVIOUS</Text>
            </TouchableOpacity>
          )}

          <View style={styles.hints}>
            <Text style={styles.hintText}>
              ← Doesn't Work | Works → | Amazing ↑
            </Text>
          </View>
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
    position: 'relative',
  },
  completionHomeButton: {
    position: 'absolute',
    left: spacing.xl,
    top: spacing.xxl + 40,
    zIndex: 10,
    padding: spacing.xs,
  },
  header: {
    paddingTop: spacing.xxl + 40,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    position: 'relative',
  },
  homeButton: {
    position: 'absolute',
    left: spacing.xl,
    top: spacing.xxl + 40,
    zIndex: 10,
    padding: spacing.xs,
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
  hints: { alignItems: 'center' },
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
  completionEmoji: { fontSize: 80, marginBottom: spacing.xxl },
  resultsLink: { marginBottom: spacing.lg },
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
