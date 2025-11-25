import PaperBackground from '@/src/components/PaperBackground';
import { Button } from '@/src/components/ui/Button';
import { RoughNotationWrapper } from '@/src/components/ui/RoughNotationWrapper';
import { colors, spacing, typography } from '@/src/constants/theme';
import { usePolls } from '@/src/hooks/usePolls';
import { useVotes } from '@/src/hooks/useVotes';
import { showAlert } from '@/src/utils/alert';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddOptionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addPollOption, isAddingOption } = usePolls();
  const { castVote } = useVotes();

  const [options, setOptions] = useState<string[]>(['']);
  const optionInputRefs = useRef<Array<TextInput | null>>([]);
  const [pendingFocusIndex, setPendingFocusIndex] = useState<number | null>(0);

  optionInputRefs.current = optionInputRefs.current.slice(0, options.length);

  useEffect(() => {
    if (pendingFocusIndex === null) return;
    requestAnimationFrame(() => {
      optionInputRefs.current[pendingFocusIndex]?.focus();
    });
    setPendingFocusIndex(null);
  }, [pendingFocusIndex, options.length]);

  const addLocalOption = () => {
    setOptions(prev => {
      const next = [...prev, ''];
      setPendingFocusIndex(next.length - 1);
      return next;
    });
  };

  const updateLocalOption = (index: number, value: string) => {
    setOptions(prev => prev.map((item, i) => (i === index ? value : item)));
  };

  const removeLocalOption = (index: number) => {
    setOptions(prev => {
      if (prev.length === 1) {
        setPendingFocusIndex(0);
        return [''];
      }
      const next = prev.filter((_, i) => i !== index);
      setPendingFocusIndex(Math.min(index, next.length - 1));
      return next;
    });
  };

  const submitAll = async () => {
    const items = options.map(item => item.trim()).filter(Boolean);
    if (items.length === 0) {
      showAlert('Error', 'Please add at least one option');
      return;
    }
    try {
      for (const name of items) {
        const option = await addPollOption({ pollId: id!, name });
        // Consider adding as an automatic 'amazing' vote by the author
        if (option?.id) {
          await castVote({ optionId: option.id, voteType: 'amazing' });
        }
      }
      showAlert('Success', 'Options added!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to add options');
    }
  };

  return (
    <PaperBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <RoughNotationWrapper type="highlight" color="#FFE4B5" show={true}>
              <Text style={styles.title}>ADD OPTIONS</Text>
            </RoughNotationWrapper>
          </View>

          <View style={styles.form}>
            <View style={styles.optionsList}>
              {options.map((value, index) => (
                <View key={`option-${index}`} style={styles.optionRow}>
                  <TextInput
                    ref={ref => {
                      optionInputRefs.current[index] = ref;
                    }}
                    style={styles.optionInput}
                    value={value}
                    onChangeText={text => updateLocalOption(index, text)}
                    placeholder={`Option ${index + 1}...`}
                    placeholderTextColor={colors.textSecondary}
                    returnKeyType={index === options.length - 1 ? 'done' : 'next'}
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      if (index === options.length - 1) {
                        addLocalOption();
                      } else {
                        setPendingFocusIndex(index + 1);
                      }
                    }}
                    autoFocus={options.length === 1 && index === 0}
                  />
                  {options.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeLocalOption(index)}
                      accessibilityLabel={`Remove option ${index + 1}`}
                    >
                      <Ionicons name="trash-outline" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <Button
              title="+ ADD"
              onPress={addLocalOption}
              variant="secondary"
              style={styles.addButton}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.previousButton}>
            <Text style={styles.previousText}>← PREVIOUS</Text>
          </TouchableOpacity>
          <Button
            title="ADD ALL"
            onPress={submitAll}
            loading={isAddingOption}
            style={styles.addAllButton}
          />
        </View>
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
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxl + 40,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.headline,
    color: colors.text,
    textAlign: 'center',
  },
  form: {
    padding: spacing.xl,
  },
  optionsList: {
    width: '100%',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.sm,
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
  removeButton: {
    marginLeft: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  addButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: spacing.sm,
  },
  addAllButton: {
    marginTop: spacing.sm,
    width: '100%',
  },
  previousButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  previousText: {
    ...typography.button,
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
});
