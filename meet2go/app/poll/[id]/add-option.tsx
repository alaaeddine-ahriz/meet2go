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
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { usePolls } from '@/src/hooks/usePolls';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { colors, spacing, typography } from '@/src/constants/theme';

export default function AddOptionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addPollOption, isAddingOption } = usePolls();
  
  const [optionName, setOptionName] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAdd = async () => {
    if (!optionName.trim()) {
      Alert.alert('Error', 'Please enter an option name');
      return;
    }

    try {
      await addPollOption({
        pollId: id!,
        name: optionName.trim(),
        imageUrl: imageUri,
      });

      Alert.alert('Success', 'Option added!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add option');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>ADD OPTION</Text>
        </View>

        <View style={styles.form}>
          {imageUri && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImageUri(undefined)}
              >
                <Ionicons name="close-circle" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}

          <Input
            label="Option Name"
            value={optionName}
            onChangeText={setOptionName}
            placeholder="e.g., Karaoke, Beach"
            autoFocus
          />

          <Button
            title="📷 Add Image (Optional)"
            onPress={pickImage}
            variant="secondary"
            style={styles.imageButton}
          />

          <Button
            title="ADD OPTION"
            onPress={handleAdd}
            loading={isAddingOption}
            style={styles.addButton}
          />
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xxl + 40,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  backButton: {
    marginRight: spacing.md,
  },
  title: {
    ...typography.headline,
    color: colors.text,
  },
  form: {
    padding: spacing.xl,
  },
  previewContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  imageButton: {
    marginBottom: spacing.md,
  },
  addButton: {
    marginTop: spacing.lg,
  },
});


