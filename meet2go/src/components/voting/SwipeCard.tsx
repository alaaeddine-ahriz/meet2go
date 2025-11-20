import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Platform, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '@/src/constants/theme';
import { SWIPE_THRESHOLD, CARD_ROTATION } from '@/src/constants/gestures';
import { VoteType } from '@/src/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_MAX_WIDTH = 520;
const CARD_MAX_HEIGHT = 520;

const CARD_OFFSET = 10; // Vertical offset between stacked cards
const CARD_SCALE_FACTOR = 0.05; // Scale reduction per card in stack

interface SwipeCardProps {
  optionName: string;
  imageUrl?: string;
  onSwipe: (voteType: VoteType) => void;
  index: number;
  stackPosition: number; // 0 = top card, 1 = second card, etc.
  isActive: boolean; // Only the top card is active for swiping
}

export function SwipeCard({ optionName, imageUrl, onSwipe, index, stackPosition, isActive }: SwipeCardProps) {
  const { width, height } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const stackScale = useSharedValue(1 - stackPosition * CARD_SCALE_FACTOR);
  const stackOffset = useSharedValue(stackPosition * CARD_OFFSET);

  // Animate cards moving up in the stack
  useEffect(() => {
    stackScale.value = withTiming(1 - stackPosition * CARD_SCALE_FACTOR, { duration: 200 });
    stackOffset.value = withTiming(stackPosition * CARD_OFFSET, { duration: 200 });
  }, [stackPosition]);

  const handleSwipeEnd = (voteType: VoteType) => {
    'worklet';
    runOnJS(onSwipe)(voteType);
  };

  const panGesture = Gesture.Pan()
    .enabled(isActive)
    .onBegin(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const { translationX, translationY, velocityX, velocityY } = event;

      // Determine vote type based on translation
      let voteType: VoteType | null = null;

      // Check vertical swipe first (up for "amazing")
      if (translationY < -SWIPE_THRESHOLD && Math.abs(velocityY) > 300) {
        voteType = 'amazing';
        // Trigger callback immediately, don't wait for animation
        handleSwipeEnd(voteType);
        translateY.value = withSpring(-SCREEN_HEIGHT, { damping: 20, stiffness: 90 });
        translateX.value = withSpring(0, { damping: 20, stiffness: 90 });
      }
      // Check horizontal swipes
      else if (translationX > SWIPE_THRESHOLD && velocityX > 0) {
        voteType = 'works';
        // Trigger callback immediately, don't wait for animation
        handleSwipeEnd(voteType);
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, { damping: 20, stiffness: 90 });
        translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      } else if (translationX < -SWIPE_THRESHOLD && velocityX < 0) {
        voteType = 'doesnt_work';
        // Trigger callback immediately, don't wait for animation
        handleSwipeEnd(voteType);
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { damping: 20, stiffness: 90 });
        translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      } else {
        // Snap back if threshold not met
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }

      isDragging.value = false;
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-CARD_ROTATION, 0, CARD_ROTATION]
    );

    const dragScale = isDragging.value ? 0.98 : 1;
    const finalScale = stackScale.value * dragScale;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + stackOffset.value },
        { rotate: `${rotation}deg` },
        { scale: finalScale },
      ],
      zIndex: 100 - stackPosition,
    };
  });

  const animatedOverlayStyle = useAnimatedStyle(() => {
    const opacity = Math.abs(translateX.value) / SWIPE_THRESHOLD;
    
    // Determine overlay color
    let backgroundColor = 'transparent';
    if (translateY.value < -SWIPE_THRESHOLD / 2) {
      backgroundColor = colors.gold; // Amazing
    } else if (translateX.value > SWIPE_THRESHOLD / 2) {
      backgroundColor = colors.success; // Works
    } else if (translateX.value < -SWIPE_THRESHOLD / 2) {
      backgroundColor = colors.error; // Doesn't work
    }

    return {
      backgroundColor,
      opacity: Math.min(opacity * 0.6, 0.6),
    };
  });

  const animatedEmojiStyle = useAnimatedStyle(() => {
    const show = Math.abs(translateX.value) > SWIPE_THRESHOLD / 2 || 
                 translateY.value < -SWIPE_THRESHOLD / 2;
    
    return {
      opacity: show ? 1 : 0,
      transform: [{ scale: show ? 1 : 0.5 }],
    };
  });

  const getEmoji = () => {
    'worklet';
    if (translateY.value < -SWIPE_THRESHOLD / 2) return '😍';
    if (translateX.value > SWIPE_THRESHOLD / 2) return '✅';
    if (translateX.value < -SWIPE_THRESHOLD / 2) return '❌';
    return '';
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.card,
          {
            width: Math.min(width - spacing.xl * 2, CARD_MAX_WIDTH),
            height: Math.min(height * 0.6, CARD_MAX_HEIGHT),
          },
          animatedCardStyle,
        ]}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        
        {isActive && <Animated.View style={[styles.overlay, animatedOverlayStyle]} />}
        
        <View style={styles.textContainer}>
          <Text style={styles.optionName}>{optionName}</Text>
        </View>

        {isActive && (
        <Animated.Text style={[styles.emoji, animatedEmojiStyle]}>
          {getEmoji()}
        </Animated.Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    ...(Platform.OS === 'web'
      ? {
          // Improve gesture reliability on web by disabling native scrolling/selecting during drag
          touchAction: 'none' as unknown as undefined,
          userSelect: 'none' as unknown as undefined,
          cursor: 'grab' as unknown as undefined,
        }
      : {}),
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: colors.border,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  optionName: {
    ...typography.title,
    fontSize: 36,
    color: colors.surface,
    textAlign: 'center',
  },
  emoji: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -50,
    marginTop: -50,
    fontSize: 100,
    textAlign: 'center',
  },
});


