import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuests } from '@/src/hooks/useQuests';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { colors, spacing, typography } from '@/src/constants/theme';
import PaperBackground from '@/src/components/PaperBackground';
import { Quest } from '@/src/types';

export default function HomeScreen() {
  const router = useRouter();
  const { quests, isLoading, error, joinQuest, isJoining } = useQuests();
  const [refreshing, setRefreshing] = React.useState(false);
  const [joinCode, setJoinCode] = React.useState('');
  const [showJoinInput, setShowJoinInput] = React.useState(false);

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

  const handleJoinQuest = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a quest code');
      return;
    }

    try {
      const quest = await joinQuest(joinCode.trim().toUpperCase());
      setJoinCode('');
      setShowJoinInput(false);
      
      Alert.alert(
        'Success!',
        `You joined "${quest.name}"`,
        [
          {
            text: 'View Quest',
            onPress: () => router.push(`/quest/${quest.id}`),
          },
          {
            text: 'OK',
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to join quest. Please check the code and try again.'
      );
    }
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  const renderQuestItem = ({ item }: { item: Quest }) => {
    const endDate = new Date(item.end_date);
    const formattedDate = endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <TouchableOpacity 
        style={styles.questItem} 
        onPress={() => handleQuestPress(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.questName}>{item.name}</Text>
        <Text style={styles.questDate}>{formattedDate}</Text>
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
          <Text style={styles.headerTitle}>UPCOMING</Text>
          <TouchableOpacity
            onPress={handleProfilePress}
            style={styles.profileButton}
            activeOpacity={0.7}
          >
            <Ionicons name="person-circle-outline" size={32} color={colors.text} />
          </TouchableOpacity>
        </View>

        {quests && quests.length > 0 ? (
          <FlatList
            data={quests}
            renderItem={renderQuestItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
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

        {!showJoinInput && (
          <Button
            title="JOIN QUEST BY CODE"
            onPress={() => setShowJoinInput(true)}
            variant="secondary"
            style={styles.joinButton}
          />
        )}

        {showJoinInput && (
          <View style={styles.joinContainer}>
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
                  setShowJoinInput(false);
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
        )}

        <Button
          title="+ NEW QUEST"
          onPress={handleCreateQuest}
          style={styles.createButton}
        />
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  headerTitle: {
    ...typography.headline,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  profileButton: {
    padding: spacing.xs,
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
    marginBottom: spacing.md,
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
  },
  questName: {
    ...typography.headline,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  questDate: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
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
});
