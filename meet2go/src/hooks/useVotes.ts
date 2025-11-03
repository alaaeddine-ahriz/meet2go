import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { VoteType } from '@/src/types';
import { useAuth } from './useAuth';

export function useVotes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Cast vote mutation
  const castVoteMutation = useMutation({
    mutationFn: async ({
      optionId,
      voteType,
    }: {
      optionId: string;
      voteType: VoteType;
    }) => {
      // Upsert vote (insert or update if exists)
      const { data, error } = await supabase
        .from('votes')
        .upsert({
          poll_option_id: optionId,
          user_id: user!.id,
          vote_type: voteType,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all poll-related queries
      queryClient.invalidateQueries({ queryKey: ['poll'] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });

  // Delete vote mutation
  const deleteVoteMutation = useMutation({
    mutationFn: async (optionId: string) => {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('poll_option_id', optionId)
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll'] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });

  return {
    castVote: castVoteMutation.mutateAsync,
    deleteVote: deleteVoteMutation.mutateAsync,
    isVoting: castVoteMutation.isPending,
    isDeleting: deleteVoteMutation.isPending,
  };
}


