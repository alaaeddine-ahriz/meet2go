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
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePolls } from '@/src/hooks/usePolls';
import { useVotes } from '@/src/hooks/useVotes';
import { Button } from '@/src/components/ui/Button';
import { colors, spacing, typography } from '@/src/constants/theme';
import PaperBackground from '@/src/components/PaperBackground';
import { RoughNotationWrapper } from '@/src/components/ui/RoughNotationWrapper';

export default function AddOptionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addPollOption, isAddingOption } = usePolls();
  const { castVote } = useVotes();

  const [options, setOptions] = useState<string[]>([]);
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

  const addLocalOption = () => {
    if (!currentOption.trim()) return;
    setOptions(prev => [...prev, currentOption.trim()]);
    setCurrentOption('');
    requestAnimationFrame(() => optionInputRef.current?.focus());
  };

  const removeLocalOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const submitAll = async () => {
    const items = [...options];
    if (currentOption.trim()) items.push(currentOption.trim());
    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one option');
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
      Alert.alert('Success', 'Options added!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add options');
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
            {options.length > 0 && (
              <View style={styles.optionsList}>
                {options.map((name, index) => (
                  <TouchableOpacity
                    key={`${name}-${index}`}
                    activeOpacity={0.7}
                    onPress={() => {
                      const now = Date.now();
                      if (now - lastTapRef.current < 300) removeLocalOption(index);
                      lastTapRef.current = now;
                    }}
                  >
                    <View style={styles.optionItem}>
                      <Text style={styles.optionTextCenter}>{name}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

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
                onSubmitEditing={addLocalOption}
                autoFocus
              />
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
  optionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    width: '100%',
  },
  optionTextCenter: {
    ...typography.headline,
    fontSize: 30,
    color: colors.text,
    textAlign: 'center',
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
    width: '100%',
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
  addButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: spacing.sm,
  },
  addAllButton: {
    marginTop: spacing.md,
    width: '100%',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
});
