import { supabase } from '@/src/lib/supabase';
import { Quest } from '@/src/types';
import { generateInviteCode } from '@/src/utils/inviteCodeGenerator';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export function useQuests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's quests - simplified query to avoid RLS recursion
  const { data: quests, isLoading, error } = useQuery({
    queryKey: ['quests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First, get quest IDs for this user
      const { data: memberData, error: memberError } = await supabase
        .from('quest_members')
        .select('quest_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;
      if (!memberData || memberData.length === 0) return [];

      const questIds = memberData.map(m => m.quest_id);

      // Then fetch the actual quests
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .in('id', questIds)
        .order('end_date', { ascending: true });

      if (error) throw error;
      return data as Quest[];
    },
    enabled: !!user,
  });

  // Create quest mutation
  const createQuestMutation = useMutation({
    mutationFn: async ({ name, endDate }: { name: string; endDate: string }) => {
      if (!user?.id) {
        throw new Error('You must be signed in to create quests.');
      }
      const inviteCode = generateInviteCode();

      const { data, error } = await supabase
        .from('quests')
        .insert({
          name,
          end_date: endDate,
          invite_code: inviteCode,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    },
  });

  // Join quest by invite code
  const joinQuestMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!user?.id) {
        throw new Error('You must be signed in to join quests.');
      }
      // Find quest by invite code
      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (questError) throw questError;
      if (!quest) throw new Error('Quest not found');

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('quest_members')
        .select('*')
        .eq('quest_id', quest.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        return quest; // Already a member, return quest
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from('quest_members')
        .insert({
          quest_id: quest.id,
          user_id: user.id,
        });

      if (memberError) throw memberError;
      return quest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    },
  });

  return {
    quests,
    isLoading,
    error,
    createQuest: createQuestMutation.mutateAsync,
    joinQuest: joinQuestMutation.mutateAsync,
    isCreating: createQuestMutation.isPending,
    isJoining: joinQuestMutation.isPending,
  };
}

// Get single quest with details
export function useQuest(questId?: string) {
  const { data: quest, isLoading, error } = useQuery({
    queryKey: ['quest', questId],
    queryFn: async () => {
      if (!questId) {
        console.log('useQuest: No questId provided');
        return null;
      }

      console.log('useQuest: Fetching quest:', questId);

      // Get quest details
      const { data: questData, error: questError } = await supabase
        .from('quests')
        .select('*')
        .eq('id', questId)
        .single();

      if (questError) {
        console.error('useQuest: Error fetching quest:', questError);
        throw questError;
      }

      if (!questData) {
        console.log('useQuest: No quest data returned');
        return null;
      }

      console.log('useQuest: Quest data:', questData);

      // Get members separately
      const { data: membersData, error: membersError } = await supabase
        .from('quest_members')
        .select('user_id')
        .eq('quest_id', questId);

      if (membersError) {
        console.error('useQuest: Error fetching members:', membersError);
        // Don't throw, just continue without members
      }

      console.log('useQuest: Members data:', membersData);

      // Fetch member profiles (id, display_name, avatar_url)
      let membersProfiles: any[] = [];
      const memberIds = (membersData || []).map((m: any) => m.user_id);
      if (memberIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, display_name, avatar_url')
          .in('id', memberIds);
        if (profilesError) {
          console.error('useQuest: Error fetching member profiles:', profilesError);
        } else {
          membersProfiles = profiles || [];
          console.log('useQuest: Member profiles:', membersProfiles);
        }
      }

      return {
        ...questData,
        quest_members: membersData || [],
        members_profiles: membersProfiles,
      };
    },
    enabled: !!questId,
    retry: 1,
  });

  if (error) {
    console.error('useQuest: Query error:', error);
  }

  return { quest, isLoading, error };
}
