import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  Image,
  Keyboard,
} from 'react-native';
import PaperBackground from '@/src/components/PaperBackground';
// Swipe disabled; using double-tap to delete instead
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePolls } from '@/src/hooks/usePolls';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { colors, spacing, typography, shadows } from '@/src/constants/theme';

interface PollOption {
  name: string;
}

type Step = 'name' | 'options';

export default function CreatePollScreen() {
  const router = useRouter();
  const { questId } = useLocalSearchParams<{ questId: string }>();
  const { createPoll, addPollOption, isCreatingPoll, isAddingOption } = usePolls(questId);
  
  const [step, setStep] = useState<Step>('name');
  const [pollName, setPollName] = useState('');
  const [options, setOptions] = useState<PollOption[]>([]);
  const [currentOption, setCurrentOption] = useState('');
  const optionInputRef = useRef<TextInput>(null);
  const lastTapRef = useRef<number>(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  

  const handleNext = () => {
    if (!pollName.trim()) {
      Alert.alert('Error', 'Please enter a poll name');
      return;
    }
    setStep('options');
  };

  // Images are out of scope for now

  const addOption = () => {
    if (!currentOption.trim()) {
      Alert.alert('Error', 'Please enter an option name');
      return;
    }

    setOptions([...options, { name: currentOption.trim() }]);
    setCurrentOption('');
    // Keep keyboard active and focus in the input for fast entry
    requestAnimationFrame(() => {
      optionInputRef.current?.focus();
    });
  };

  const handleAddButtonPress = () => {
    // If collapsed (has options and keyboard hidden) or no text yet → open input
    if ((options.length > 0 && !keyboardVisible) || currentOption.trim().length === 0) {
      // Pre-expand the input row and then focus to avoid immediate collapse
      setKeyboardVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          optionInputRef.current?.focus();
        });
      });
      return;
    }
    addOption();
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    // Add current option if there's text
    let finalOptions = [...options];
    if (currentOption.trim()) {
      finalOptions.push({ name: currentOption.trim() });
    }

    if (finalOptions.length === 0) {
      Alert.alert('Error', 'Please add at least one option');
      return;
    }

    try {
      // Create poll
      const poll = await createPoll({
        questId: questId!,
        name: pollName.trim(),
      });

      // Add all options
      for (const option of finalOptions) {
        await addPollOption({
          pollId: poll.id,
          name: option.name,
        });
      }

      Alert.alert('Success', 'Poll created!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create poll');
    }
  };

  return (
    <PaperBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
      {step === 'name' ? (
        <View style={styles.content}>
          {/* <Text style={styles.title}>POLL NAME</Text> */}
          <TextInput
            style={styles.input}
            value={pollName}
            onChangeText={setPollName}
            placeholder="Poll name..."
            placeholderTextColor={colors.textSecondary}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={handleNext}
          />
          {/* NEXT removed - keyboard submit advances */}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>ADD OPTIONS</Text>
            <Text style={styles.pollNameDisplay}>{pollName}</Text>

            {options.length > 0 && (
              <View style={styles.optionsList}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={`${option.name}-${index}`}
                    activeOpacity={0.7}
                    onPress={() => {
                      const now = Date.now();
                      if (now - lastTapRef.current < 300) {
                        removeOption(index);
                      }
                      lastTapRef.current = now;
                    }}
                  >
                    <View style={styles.optionItem}>
                      <Text style={styles.optionTextCenter}>{option.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.addOptionContainer}>
            {/* Image selection removed (out of scope) */}

              <View
                style={[
                  styles.inputRow,
                  (options.length > 0 && !keyboardVisible) && styles.collapsedRow,
                ]}
                pointerEvents={(options.length > 0 && !keyboardVisible) ? 'none' : 'auto'}
              >
                <TextInput
                  ref={optionInputRef}
                  style={[
                    styles.optionInput,
                    (options.length > 0 && !keyboardVisible) && styles.collapsedInput,
                  ]}
                  value={currentOption}
                  onChangeText={setCurrentOption}
                  placeholder={(options.length === 0 || keyboardVisible) ? 'Option name...' : ''}
                  placeholderTextColor={colors.textSecondary}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  onSubmitEditing={addOption}
                />
                {/* Image button removed */}
              </View>

              <Button
                title="+ ADD"
                onPress={handleAddButtonPress}
                variant="secondary"
                style={styles.addButton}
              />
            </View>

            <Button
              title="CREATE"
              onPress={handleCreate}
              loading={isCreatingPoll || isAddingOption}
              style={styles.createButton}
            />

            <TouchableOpacity onPress={() => setStep('name')} style={styles.previousButton}>
              <Text style={styles.previousText}>← PREVIOUS</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={24} color={colors.text} />
      </TouchableOpacity>
      </KeyboardAvoidingView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl + 40,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.headline,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  pollNameDisplay: {
    ...typography.headline,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  input: {
    width: '100%',
    fontSize: 38,
    lineHeight: 46,
    textAlign: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    fontFamily: 'Komikask',
  },
  button: {
    width: '100%',
    marginTop: spacing.xl,
  },
  optionsList: {
    width: '100%',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  optionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    width: '100%',
  },
  optionText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  optionTextCenter: {
    ...typography.headline,
    fontSize: 30,
    color: colors.text,
    textAlign: 'center',
  },
  addOptionContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },
  previewContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  collapsedRow: {
    height: 0,
    marginBottom: 0,
    overflow: 'hidden',
  },
  optionInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 28,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    color: colors.text,
    marginRight: spacing.sm,
    textAlign: 'center',
    fontSize: 32,
    lineHeight: 38,
    fontFamily: 'Komikask',
  },
  collapsedInput: {
    height: 0,
    paddingVertical: 0,
  },
  imageButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
  },
  addButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: spacing.sm,
  },
  createButton: {
    width: '100%',
    marginTop: spacing.md,
  },
  previousButton: {
    marginTop: spacing.md,
  },
  previousText: {
    ...typography.button,
    color: colors.primary,
  },
  backButton: {
    position: 'absolute',
    top: spacing.xxl + 40,
    right: spacing.xl,
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
