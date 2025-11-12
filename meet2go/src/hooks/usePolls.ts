import { supabase } from '@/src/lib/supabase';
import { Vote } from '@/src/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

// Get polls for a quest
export function usePolls(questId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: polls, isLoading, error } = useQuery({
    queryKey: ['polls', questId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options(
            id,
            name,
            image_url,
            votes(*)
          )
        `)
        .eq('quest_id', questId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!questId,
  });

  // Create poll mutation
  const createPollMutation = useMutation({
    mutationFn: async ({
      questId,
      name,
      deadline,
    }: {
      questId: string;
      name: string;
      deadline?: string;
    }) => {
      const { data, error } = await supabase
        .from('polls')
        .insert({
          quest_id: questId,
          name,
          deadline,
          created_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['polls', variables.questId] });
    },
  });

  // Add poll option mutation
  const addPollOptionMutation = useMutation({
    mutationFn: async ({
      pollId,
      name,
      imageUrl,
    }: {
      pollId: string;
      name: string;
      imageUrl?: string;
    }) => {
      const { data, error } = await supabase
        .from('poll_options')
        .insert({
          poll_id: pollId,
          name,
          image_url: imageUrl,
          created_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['poll', data.poll_id] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });

  return {
    polls,
    isLoading,
    error,
    createPoll: createPollMutation.mutateAsync,
    addPollOption: addPollOptionMutation.mutateAsync,
    isCreatingPoll: createPollMutation.isPending,
    isAddingOption: addPollOptionMutation.isPending,
  };
}

// Get single poll with options
export function usePoll(pollId?: string) {
  const { user } = useAuth();

  const { data: poll, isLoading, error } = useQuery({
    queryKey: ['poll', pollId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options(
            *,
            votes(*)
          )
        `)
        .eq('id', pollId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!pollId,
  });

  // Check if current user has voted
  const hasVoted = poll?.poll_options?.some((option: any) =>
    option.votes?.some((vote: Vote) => vote.user_id === user?.id)
  ) ?? false;

  return { poll, isLoading, error, hasVoted };
}
