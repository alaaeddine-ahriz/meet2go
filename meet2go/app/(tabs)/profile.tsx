import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import PaperBackground from '@/src/components/PaperBackground';
import { useAuth } from '@/src/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/Button';
import { colors, spacing, typography } from '@/src/constants/theme';
import { RoughNotationWrapper } from '@/src/components/ui/RoughNotationWrapper';

export default function ProfileScreen() {
  const { user, signOut, loading: authLoading } = useAuth();

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch stats: quests where user is a member
  const { data: questsCount } = useQuery({
    queryKey: ['userQuestsCount', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { count, error } = await supabase
        .from('quest_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch stats: polls in quests where user is a member
  const { data: pollsCount } = useQuery({
    queryKey: ['userPollsCount', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      // First get all quest IDs where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('quest_members')
        .select('quest_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;
      if (!memberData || memberData.length === 0) return 0;

      const questIds = memberData.map(m => m.quest_id);

      // Then count polls in those quests
      const { count, error } = await supabase
        .from('polls')
        .select('*', { count: 'exact', head: true })
        .in('quest_id', questIds);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      // On web, use browser confirm for better compatibility
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (confirmed) {
        signOut().catch((error: any) => {
          window.alert(error.message || 'Failed to sign out');
        });
      }
    } else {
      // On native, use Alert
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut();
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to sign out');
              }
            },
          },
        ]
      );
    }
  };

  if (authLoading || profileLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';

  return (
    <PaperBackground>
      <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <RoughNotationWrapper type="highlight" color="#DDA0DD" show={true}>
            <Text style={styles.headerTitle}>PROFILE</Text>
          </RoughNotationWrapper>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{questsCount ?? 0}</Text>
              <Text style={styles.statLabel}>QUESTS</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{pollsCount ?? 0}</Text>
              <Text style={styles.statLabel}>POLLS</Text>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Display Name</Text>
            <Text style={styles.value}>{displayName}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{email}</Text>
          </View>
        </View>

        <Button
          title="SIGN OUT"
          onPress={handleSignOut}
          variant="danger"
          style={styles.signOutButton}
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
  },
  content: {
    flex: 1,
    paddingTop: spacing.xxl + 40,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  headerTitle: {
    ...typography.headline,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  profileSection: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarText: {
    ...typography.title,
    color: colors.surface,
    fontSize: 48,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: spacing.xl,
    gap: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.headline,
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  infoContainer: {
    width: '100%',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    ...typography.body,
    color: colors.text,
    fontSize: 18,
  },
  signOutButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
});

