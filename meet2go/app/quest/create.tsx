import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Share,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuests } from '@/src/hooks/useQuests';
import { Button } from '@/src/components/ui/Button';
import { colors, spacing, typography, shadows } from '@/src/constants/theme';
import PaperBackground from '@/src/components/PaperBackground';
import { Ionicons } from '@expo/vector-icons';
import { RoughNotationWrapper } from '@/src/components/ui/RoughNotationWrapper';

export default function CreateQuestScreen() {
  const router = useRouter();
  const { createQuest, isCreating } = useQuests();
  const [step, setStep] = useState<'name' | 'date'>('name');
  const [questName, setQuestName] = useState('');
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleNext = () => {
    if (!questName.trim()) {
      Alert.alert('Error', 'Please enter a quest name');
      return;
    }
    setStep('date');
  };

  const handleCreate = async () => {
    try {
      const quest = await createQuest({
        name: questName.trim(),
        endDate: endDate.toISOString(),
      });

      Alert.alert(
        'Quest Created!',
        'Would you like to share the invite link?',
        [
          {
            text: 'Share',
            onPress: () => handleShare(quest.name, quest.invite_code),
          },
          {
            text: 'Later',
            onPress: () => router.replace(`/quest/${quest.id}`),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create quest');
    }
  };

  const handleShare = async (name: string, inviteCode: string) => {
    try {
      await Share.share({
        message: `Join my quest "${name}" on Meet2Go!\nLink: meet2go://quest/${inviteCode}`,
      });
      router.back();
    } catch (error) {
      console.error('Error sharing:', error);
      router.back();
    }
  };

  return (
    <PaperBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
      <View style={styles.content}>
        {step === 'name' ? (
          <>
            {/* <Text style={styles.title}>QUEST NAME</Text> */}
            <TextInput
              style={styles.input}
              value={questName}
              onChangeText={setQuestName}
              placeholder="Quest name..."
              placeholderTextColor={colors.textSecondary}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={handleNext}
            />
            {/* NEXT removed - keyboard submit advances */}
          </>
        ) : (
          <>
            <RoughNotationWrapper type="highlight" color="#F0E68C" show={true}>
              <Text style={styles.title}>END DATE</Text>
            </RoughNotationWrapper>
            <Text style={styles.questNameDisplay}>{questName}</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {endDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
              <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setEndDate(selectedDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}

            <Button
              title="CREATE"
              onPress={handleCreate}
              loading={isCreating}
              style={styles.button}
            />
            
            <TouchableOpacity onPress={() => setStep('name')} style={styles.previousButton}>
              <Text style={styles.previousText}>← PREVIOUS</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.headline,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  questNameDisplay: {
    ...typography.headline,
    fontSize: 24,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    width: '100%',
    lineHeight: 46,
    fontSize: 38,
    textAlign: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    fontFamily: 'Komikask',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    width: '100%',
  },
  dateText: {
    ...typography.body,
    fontSize: 18,
    color: colors.text,
  },
  button: {
    width: '100%',
    marginTop: spacing.xl,
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
