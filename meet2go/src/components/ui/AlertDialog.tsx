import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography, shadows } from '@/src/constants/theme';

export interface AlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertDialogProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  onDismiss: () => void;
}

export function AlertDialog({ visible, title, message, buttons, onDismiss }: AlertDialogProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onDismiss}
      >
        <View style={styles.dialog} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  buttons.length > 1 && styles.multiButton,
                  button.style === 'cancel' && styles.cancelButton,
                  button.style === 'destructive' && styles.destructiveButton,
                ]}
                onPress={() => {
                  button.onPress();
                  onDismiss();
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'cancel' && styles.cancelButtonText,
                    button.style === 'destructive' && styles.destructiveButtonText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...shadows.medium,
  },
  title: {
    ...typography.headline,
    fontSize: 20,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.primary,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  multiButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  destructiveButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    ...typography.button,
    color: colors.surface,
    fontSize: 16,
  },
  cancelButtonText: {
    color: colors.textSecondary,
  },
  destructiveButtonText: {
    color: colors.surface,
  },
});

