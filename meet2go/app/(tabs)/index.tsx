import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuests } from '@/src/hooks/useQuests';
import { Button } from '@/src/components/ui/Button';
import { colors, spacing, typography } from '@/src/constants/theme';
import { Quest } from '@/src/types';

export default function HomeScreen() {
  const router = useRouter();
  const { quests, isLoading, error } = useQuests();
  const [refreshing, setRefreshing] = React.useState(false);

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
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headerTitle}>UPCOMING</Text>

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

        <Button
          title="+ NEW QUEST"
          onPress={handleCreateQuest}
          style={styles.createButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
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
  headerTitle: {
    ...typography.headline,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xl,
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
    marginTop: spacing.xl,
    width: '100%',
  },
});
