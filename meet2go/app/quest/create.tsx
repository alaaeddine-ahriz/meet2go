import PaperBackground from '@/src/components/PaperBackground';
import { Button } from '@/src/components/ui/Button';
import { colors, shadows, spacing, typography } from '@/src/constants/theme';
import { useQuests } from '@/src/hooks/useQuests';
import { showAlert } from '@/src/utils/alert';
import { useShareHandler } from '@/src/utils/share';
import { Ionicons } from '@expo/vector-icons';
// import { RoughNotationWrapper } from '@/src/components/ui/RoughNotationWrapper';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  // Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function CreateQuestScreen() {
  const router = useRouter();
  const { createQuest, isCreating } = useQuests();
  const shareHandler = useShareHandler();
  const [questName, setQuestName] = useState('');
  /*
  const [step, setStep] = useState<'name' | 'date'>('name');
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);
  const endDateIso = useMemo(() => endDate.toISOString().split('T')[0], [endDate]);
  const webDateInputStyles = useMemo<React.CSSProperties>(
    () => ({
      width: '70%',
      padding: `${spacing.lg}px`,
      fontSize: '18px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: colors.border,
      borderRadius: '24px',
      backgroundColor: colors.surface,
      color: colors.text,
      fontFamily: typography.body.fontFamily || 'system-ui',
      boxSizing: 'border-box',
      outline: 'none',
      textAlign: 'center',
    }),
    []
  );

  const handleNext = () => {
    if (!questName.trim()) {
      showAlert('Error', 'Please enter a quest name');
      return;
    }
    setStep('date');
  };
  */
  /*
  const [step, setStep] = useState<'name' | 'date'>('name');
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);
  const endDateIso = useMemo(() => endDate.toISOString().split('T')[0], [endDate]);
  const webDateInputStyles = useMemo<React.CSSProperties>(
    () => ({
      width: '70%',
      padding: `${spacing.lg}px`,
      fontSize: '18px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: colors.border,
      borderRadius: '24px',
      backgroundColor: colors.surface,
      color: colors.text,
      fontFamily: typography.body.fontFamily || 'system-ui',
      boxSizing: 'border-box',
      outline: 'none',
      textAlign: 'center',
    }),
    []
  );

  const handleNext = () => {
    if (!questName.trim()) {
      showAlert('Error', 'Please enter a quest name');
      return;
    }
    setStep('date');
  };
  */

  const handleCreate = async () => {
    if (!questName.trim()) {
      showAlert('Error', 'Please enter a quest name');
      return;
    }

    try {
      const defaultEndDate = new Date();
      defaultEndDate.setDate(defaultEndDate.getDate() + 30);

      const quest = await createQuest({
        name: questName.trim(),
        endDate: defaultEndDate.toISOString(),
      });

      showAlert(
        'Quest Created!',
        'Would you like to share the invite link?',
        [
          {
            text: 'Share',
            onPress: () => shareHandler(quest.name, quest.invite_code),
          },
          {
            text: 'Later',
            onPress: () => router.replace(`/quest/${quest.id}`),
            style: 'cancel',
          },
        ]
      );
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to create quest');
    }
  };

  return (
    <PaperBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>QUEST NAME</Text>
          <TextInput
            style={styles.input}
            value={questName}
            onChangeText={setQuestName}
            placeholder="Quest name..."
            placeholderTextColor={colors.textSecondary}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
          <Button
            title="CREATE"
            onPress={handleCreate}
            loading={isCreating}
            style={styles.button}
          />

          {/*
            Original multi-step UI with expiry picker (temporarily disabled):

            {step === 'name' ? (
              <>
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
              </>
            ) : (
              <>
                <RoughNotationWrapper type="highlight" color="#F0E68C" show={true}>
                  <Text style={styles.title}>{questName}</Text>
                </RoughNotationWrapper>
                <Text style={styles.questNameDisplay}>END DATE</Text>
                {Platform.OS === 'web' ? (
                  <View style={styles.webDateContainer}>
                    <input
                      type="date"
                      value={endDateIso}
                      min={todayIso}
                      onChange={(e: any) => {
                        if (e.target?.value) {
                          setEndDate(new Date(e.target.value));
                        }
                      }}
                      style={webDateInputStyles}
                    />
                  </View>
                ) : (
                  <>
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

                    <Modal
                      transparent
                      visible={showDatePicker}
                      animationType="fade"
                      onRequestClose={() => setShowDatePicker(false)}
                    >
                      <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                          <Text style={styles.modalTitle}>Select Date</Text>
                          
                          <View style={styles.datePickerContainer}>
                            <DateTimePicker
                              value={endDate}
                              mode="date"
                              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                              onChange={(event, selectedDate) => {
                                if (Platform.OS === 'android') {
                                  setShowDatePicker(false);
                                }
                                if (selectedDate) {
                                  setEndDate(selectedDate);
                                }
                              }}
                              minimumDate={new Date()}
                              style={styles.datePicker}
                            />
                          </View>
                          
                          <View style={styles.modalButtons}>
                            {Platform.OS === 'ios' && (
                              <>
                                <TouchableOpacity
                                  style={[styles.modalButton, styles.modalButtonCancel]}
                                  onPress={() => setShowDatePicker(false)}
                                >
                                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[styles.modalButton, styles.modalButtonConfirm]}
                                  onPress={() => setShowDatePicker(false)}
                                >
                                  <Text style={styles.modalButtonTextConfirm}>Done</Text>
                                </TouchableOpacity>
                              </>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  </>
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
          */}
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

/*
  Original expiry-date step (temporarily disabled):
  
      <View style={styles.content}>
        {step === 'name' ? (
          <>
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
          </>
        ) : (
          <>
            <RoughNotationWrapper type="highlight" color="#F0E68C" show={true}>
              <Text style={styles.title}>{questName}</Text>
            </RoughNotationWrapper>
            <Text style={styles.questNameDisplay}>END DATE</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.webDateContainer}>
                <input
                  type="date"
                  value={endDateIso}
                  min={todayIso}
                  onChange={(e: any) => {
                    if (e.target?.value) {
                      setEndDate(new Date(e.target.value));
                    }
                  }}
                  style={webDateInputStyles}
                />
              </View>
            ) : (
              <>
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

                <Modal
                  transparent
                  visible={showDatePicker}
                  animationType="fade"
                  onRequestClose={() => setShowDatePicker(false)}
                >
                  <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                      <Text style={styles.modalTitle}>Select Date</Text>
                      
                      <View style={styles.datePickerContainer}>
                        <DateTimePicker
                          value={endDate}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(event, selectedDate) => {
                            if (Platform.OS === 'android') {
                              setShowDatePicker(false);
                            }
                            if (selectedDate) {
                              setEndDate(selectedDate);
                            }
                          }}
                          minimumDate={new Date()}
                          style={styles.datePicker}
                        />
                      </View>
                      
                      <View style={styles.modalButtons}>
                        {Platform.OS === 'ios' && (
                          <>
                            <TouchableOpacity
                              style={[styles.modalButton, styles.modalButtonCancel]}
                              onPress={() => setShowDatePicker(false)}
                            >
                              <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.modalButton, styles.modalButtonConfirm]}
                              onPress={() => setShowDatePicker(false)}
                            >
                              <Text style={styles.modalButtonTextConfirm}>Done</Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Modal>
              </>
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

*/

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
    fontSize: 48,
    lineHeight: 56,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  questNameDisplay: {
    ...typography.headline,
    fontSize: 24,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
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
  /*
  previousButton: {
    marginTop: spacing.lg,
  },
  previousText: {
    ...typography.button,
    color: colors.primary,
  },
  */
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

// const alertStyles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: spacing.xl,
//   },
//   dialog: {
//     backgroundColor: colors.background,
//     borderRadius: 16,
//     padding: spacing.xl,
//     width: '100%',
//     maxWidth: 400,
//     ...shadows.medium,
//   },
//   title: {
//     ...typography.headline,
//     fontSize: 20,
//     color: colors.text,
//     marginBottom: spacing.md,
//     textAlign: 'center',
//   },
//   message: {
//     ...typography.body,
//     color: colors.textSecondary,
//     marginBottom: spacing.xl,
//     textAlign: 'center',
//     lineHeight: 22,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     gap: spacing.md,
//   },
//   button: {
//     paddingVertical: spacing.md,
//     paddingHorizontal: spacing.lg,
//     borderRadius: 8,
//     backgroundColor: colors.primary,
//     minWidth: 80,
//     alignItems: 'center',
//   },
//   cancelButton: {
//     backgroundColor: 'transparent',
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   buttonText: {
//     ...typography.button,
//     color: colors.background,
//     fontSize: 16,
//   },
//   cancelButtonText: {
//     color: colors.textSecondary,
//   },
// });
