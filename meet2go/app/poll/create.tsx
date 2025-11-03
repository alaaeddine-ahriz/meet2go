import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { usePolls } from '@/src/hooks/usePolls';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { colors, spacing, typography, shadows } from '@/src/constants/theme';

interface PollOption {
  name: string;
  imageUri?: string;
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
  const [currentImage, setCurrentImage] = useState<string | undefined>();

  const handleNext = () => {
    if (!pollName.trim()) {
      Alert.alert('Error', 'Please enter a poll name');
      return;
    }
    setStep('options');
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setCurrentImage(result.assets[0].uri);
    }
  };

  const addOption = () => {
    if (!currentOption.trim()) {
      Alert.alert('Error', 'Please enter an option name');
      return;
    }

    setOptions([...options, { name: currentOption.trim(), imageUri: currentImage }]);
    setCurrentOption('');
    setCurrentImage(undefined);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    // Add current option if there's text
    let finalOptions = [...options];
    if (currentOption.trim()) {
      finalOptions.push({ name: currentOption.trim(), imageUri: currentImage });
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
          imageUrl: option.imageUri,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {step === 'name' ? (
        <View style={styles.content}>
          {/* <Text style={styles.title}>POLL NAME</Text> */}
          <Input
            value={pollName}
            onChangeText={setPollName}
            placeholder="Poll name...?"
            autoFocus
            style={styles.input}
            returnKeyType="next"
            onSubmitEditing={handleNext}
          />
          <Button title="NEXT" onPress={handleNext} style={styles.button} />
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
                  <View key={index} style={styles.optionItem}>
                    <Text style={styles.optionText}>{option.name}</Text>
                    <TouchableOpacity onPress={() => removeOption(index)}>
                      <Ionicons name="close-circle" size={24} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.addOptionContainer}>
              {currentImage && (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: currentImage }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setCurrentImage(undefined)}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.optionInput}
                  value={currentOption}
                  onChangeText={setCurrentOption}
                  placeholder="Option name"
                  placeholderTextColor={colors.textSecondary}
                  returnKeyType="done"
                />
                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                  <Ionicons name="image-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <Button
                title="+ ADD"
                onPress={addOption}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl + 40,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.headline,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  pollNameDisplay: {
    ...typography.headline,
    fontSize: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    width: '100%',
    fontSize: 24,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    marginTop: spacing.xl,
  },
  optionsList: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  addOptionContainer: {
    width: '100%',
    marginBottom: spacing.xl,
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
    marginBottom: spacing.md,
  },
  optionInput: {
    flex: 1,
    ...typography.body,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 12,
    padding: spacing.md,
    color: colors.text,
    marginRight: spacing.sm,
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
    marginBottom: spacing.md,
  },
  createButton: {
    width: '100%',
    marginTop: spacing.lg,
  },
  previousButton: {
    marginTop: spacing.lg,
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
