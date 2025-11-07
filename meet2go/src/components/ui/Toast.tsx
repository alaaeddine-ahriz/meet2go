import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/src/constants/theme';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss(toast.id);
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const backgroundColor = 
    toast.type === 'error' ? colors.error :
    toast.type === 'success' ? colors.success :
    colors.primary;

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.message}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    minWidth: 200,
    maxWidth: '90%',
    ...shadows.card,
  },
  message: {
    ...typography.body,
    color: colors.surface,
    textAlign: 'center',
  },
});

