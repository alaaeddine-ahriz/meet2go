import { ProfileIcon } from '@/src/components/icons/ProfileIcon';
import PaperBackground from '@/src/components/PaperBackground';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { RoughNotationWrapper } from '@/src/components/ui/RoughNotationWrapper';
import { colors, spacing, typography } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useQuests } from '@/src/hooks/useQuests';
import { Quest } from '@/src/types';
import { showAlert } from '@/src/utils/alert';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { quests, isLoading, error, joinQuest, isJoining, leaveQuest } = useQuests();
  const [refreshing, setRefreshing] = React.useState(false);
  const [joinCode, setJoinCode] = React.useState('');
  const [showJoinModal, setShowJoinModal] = React.useState(false);
  const [hideMode, setHideMode] = React.useState(false);
  const [hidingQuestId, setHidingQuestId] = React.useState<string | null>(null);
  const hiddenStorageKey = user ? `hiddenQuests:${user.id}` : null;
  const [hiddenQuestIds, setHiddenQuestIds] = React.useState<string[]>([]);

  const hiddenQuestSet = React.useMemo(() => new Set(hiddenQuestIds), [hiddenQuestIds]);
  const visibleQuests = React.useMemo(
    () => (quests || []).filter(quest => !hiddenQuestSet.has(quest.id)),
    [quests, hiddenQuestSet]
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleCreateQuest = () => {
    router.push('/quest/create');
  };

  const handleQuestPress = (questId: string) => {
    router.push(`/quest/${questId}`);
  };

  React.useEffect(() => {
    if (!hiddenStorageKey) {
      setHiddenQuestIds([]);
      return;
    }
    let isMounted = true;
    AsyncStorage.getItem(hiddenStorageKey)
      .then(stored => {
        if (!isMounted) return;
        if (!stored) {
          setHiddenQuestIds([]);
          return;
        }
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setHiddenQuestIds(parsed);
          } else {
            setHiddenQuestIds([]);
          }
        } catch {
          setHiddenQuestIds([]);
        }
      })
      .catch(() => {
        if (isMounted) setHiddenQuestIds([]);
      });
    return () => {
      isMounted = false;
    };
  }, [hiddenStorageKey]);

  const persistHiddenIds = React.useCallback(
    async (ids: string[]) => {
      if (!hiddenStorageKey) return;
      try {
        await AsyncStorage.setItem(hiddenStorageKey, JSON.stringify(ids));
      } catch {
        // Ignore storage errors; hiding still functions for current session
      }
    },
    [hiddenStorageKey]
  );

  const addHiddenQuest = React.useCallback(
    (questId: string) => {
      setHiddenQuestIds(prev => {
        if (prev.includes(questId)) return prev;
        const next = [...prev, questId];
        persistHiddenIds(next);
        return next;
      });
    },
    [persistHiddenIds]
  );

  const removeHiddenQuest = React.useCallback(
    (questId: string) => {
      setHiddenQuestIds(prev => {
        if (!prev.includes(questId)) return prev;
        const next = prev.filter(id => id !== questId);
        persistHiddenIds(next);
        return next;
      });
    },
    [persistHiddenIds]
  );

  const toggleHideMode = () => {
    if (!visibleQuests || visibleQuests.length === 0) {
      showAlert('Nothing to hide', 'You have no quests to hide yet.');
      return;
    }
    setHideMode(prev => !prev);
  };

  const handleQuestItemPress = (quest: Quest) => {
    if (hideMode) {
      confirmHideQuest(quest);
      return;
    }
    handleQuestPress(quest.id);
  };

  const handleHideQuest = async (quest: Quest) => {
    try {
      addHiddenQuest(quest.id);
      setHidingQuestId(quest.id);
      await leaveQuest(quest.id);
      showAlert('Hidden', `"${quest.name}" was removed from list. Rejoin any time with its code.`);
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to hide quest.');
    } finally {
      setHidingQuestId(null);
    }
  };

  const confirmHideQuest = (quest: Quest) => {
    showAlert(
      'Remove quest?',
      `This will remove "${quest.name}" from your list. Other members will not be affected. You can rejoin later using its quest code.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        { text: 'Remove', style: 'destructive', onPress: () => handleHideQuest(quest) },
      ]
    );
  };

  React.useEffect(() => {
    if (hideMode && visibleQuests.length === 0) {
      setHideMode(false);
    }
  }, [visibleQuests, hideMode]);

  const handleJoinQuest = async () => {
    if (!joinCode.trim()) {
      showAlert('Error', 'Please enter a quest code');
      return;
    }

    try {
      const quest = await joinQuest(joinCode.trim().toUpperCase());
      setJoinCode('');
      setShowJoinModal(false);
      removeHiddenQuest(quest.id);
      
      showAlert(
        'Success!',
        `You joined "${quest.name}"`,
        [
          {
            text: 'View Quest',
            onPress: () => router.push(`/quest/${quest.id}`),
          },
          {
            text: 'OK',
            onPress: () => router.push(`/`),
          },
        ]
      );
    } catch (error: any) {
      showAlert(
        'Error',
        error.message || 'Failed to join quest. Please check the code and try again.'
      );
    }
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  const renderQuestItem = ({ item }: { item: Quest }) => {
    const isPendingHide = hidingQuestId === item.id;

    return (
      <TouchableOpacity 
        style={[
          styles.questItem,
          hideMode && styles.questItemHideMode,
          isPendingHide && styles.questItemDisabled,
        ]} 
        onPress={() => handleQuestItemPress(item)}
        activeOpacity={hideMode ? 0.9 : 0.7}
        disabled={isPendingHide && hideMode}
      >
        <Text style={styles.questName}>{item.name}</Text>
        {hideMode && (
          <View style={styles.hideIndicator}>
            {isPendingHide ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            )}
          </View>
        )}
        {/* <Text style={styles.questDate}>{formattedDate}</Text> */}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading quests</Text>
        <Button
          title="Try Again"
          onPress={onRefresh}
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <PaperBackground>
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={toggleHideMode}
            style={[styles.editQuest, hideMode && styles.editQuestActive]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={hideMode ? 'close' : 'trash-outline'}
              size={28}
              color={hideMode ? colors.error : colors.text}
            />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <RoughNotationWrapper type="highlight" color="#FFD700" show={true}>
              <Text style={styles.headerTitle}>UPCOMING</Text>
            </RoughNotationWrapper>
          </View>
          <TouchableOpacity
            onPress={handleProfilePress}
            style={styles.profileLink}
            activeOpacity={0.7}
          >
            <ProfileIcon size={32} color={colors.text} />
          </TouchableOpacity>
        </View>

        {hideMode && visibleQuests && visibleQuests.length > 0 && (
          <Text style={styles.hideModeText}>Tap a quest to remove it</Text>
        )}

        {visibleQuests && visibleQuests.length > 0 ? (
          <FlatList
            data={visibleQuests}
            renderItem={renderQuestItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            extraData={{ hideMode, hidingQuestId, hiddenQuestIds }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No quests yet</Text>
          </View>
        )}

        {!showJoinModal && (
          <Button
            title="JOIN QUEST BY CODE"
            onPress={() => setShowJoinModal(true)}
            variant="secondary"
            style={styles.joinButton}
          />
        )}

        <Button
          title="+ NEW QUEST"
          onPress={handleCreateQuest}
          style={styles.createButton}
        />
      </View>

      <Modal visible={showJoinModal} transparent animationType="fade" onRequestClose={() => setShowJoinModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {
            setShowJoinModal(false);
            setJoinCode('');
            Keyboard.dismiss();
          }}>
            <View style={styles.modalOverlayTouchable} />
          </TouchableWithoutFeedback>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContentContainer}>
            <View style={styles.modalCard}>
              <RoughNotationWrapper type="highlight" color="#87CEEB" show={true}>
                <Text style={[typography.headline, { textAlign: 'center', color: colors.text, marginBottom: spacing.sm }]}>JOIN QUEST</Text>
              </RoughNotationWrapper>
              <Input
                placeholder="Enter quest code"
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="characters"
                maxLength={10}
                style={styles.joinInput}
              />
              <View style={styles.joinButtonRow}>
                <Button
                  title="CANCEL"
                  onPress={() => {
                    setShowJoinModal(false);
                    setJoinCode('');
                  }}
                  variant="secondary"
                  style={styles.joinActionButton}
                  fullWidth={false}
                />
                <Button
                  title="JOIN"
                  onPress={handleJoinQuest}
                  disabled={isJoining || !joinCode.trim()}
                  loading={isJoining}
                  style={styles.joinActionButton}
                  fullWidth={false}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl + 40,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  headerContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.headline,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  profileLink: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: spacing.xs,
    opacity: 0.5,
  },
  editQuest: {
    position: 'absolute',
    left: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: spacing.xs,
    opacity: 0.5,
  },
  editQuestActive: {
    opacity: 1,
  },
  joinButton: {
    marginBottom: spacing.sm,
    width: '100%',
  },
  joinContainer: {
    width: '100%',
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  joinInput: {
    marginBottom: spacing.xs,
  },
  joinButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  joinActionButton: {
    flex: 1,
    marginTop: 0,
    marginHorizontal: spacing.xs,
  },
  cancelButton: {
    marginRight: spacing.xs,
  },
  listContent: {
    alignItems: 'center',
    width: '100%',
  },
  questItem: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  questItemHideMode: {
    justifyContent: 'space-between',
  },
  questItemDisabled: {
    opacity: 0.5,
  },
  questName: {
    ...typography.headline,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
    flex: 1,
  },
  questDate: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  hideIndicator: {
    marginLeft: spacing.sm,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.headline,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    ...typography.headline,
    color: colors.error,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 200,
  },
  createButton: {
    marginTop: spacing.sm,
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    position: 'relative',
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContentContainer: {
    width: '100%',
    zIndex: 1,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hideModeText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
