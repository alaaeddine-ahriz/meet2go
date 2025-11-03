import { Vote, VoteType } from '@/src/types';

// Scoring algorithm from PRD: Amazing × 3 + Works × 1 + Doesn't Work × -1
export function calculateScore(votes: Vote[]): number {
  return votes.reduce((score, vote) => {
    switch (vote.vote_type) {
      case 'amazing':
        return score + 3;
      case 'works':
        return score + 1;
      case 'doesnt_work':
        return score - 1;
      default:
        return score;
    }
  }, 0);
}

// Get vote counts by type
export function getVoteCounts(votes: Vote[]): {
  amazing: number;
  works: number;
  doesnt_work: number;
} {
  return votes.reduce(
    (counts, vote) => {
      counts[vote.vote_type]++;
      return counts;
    },
    { amazing: 0, works: 0, doesnt_work: 0 }
  );
}

// Sort options by score (with tiebreaker: most "amazing" votes)
export function sortByScore<T extends { votes?: Vote[] }>(options: T[]): T[] {
  return [...options].sort((a, b) => {
    const scoreA = calculateScore(a.votes || []);
    const scoreB = calculateScore(b.votes || []);
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher score first
    }
    
    // Tiebreaker: most "amazing" votes
    const amazingA = (a.votes || []).filter(v => v.vote_type === 'amazing').length;
    const amazingB = (b.votes || []).filter(v => v.vote_type === 'amazing').length;
    
    return amazingB - amazingA;
  });
}

// Get vote type display info
export function getVoteTypeInfo(voteType: VoteType) {
  const voteTypeMap = {
    amazing: { emoji: '😍', color: '#FFD93D', label: 'Amazing', points: 3 },
    works: { emoji: '✅', color: '#4CAF50', label: 'Works', points: 1 },
    doesnt_work: { emoji: '❌', color: '#FF6B6B', label: "Doesn't Work", points: -1 },
  };
  
  return voteTypeMap[voteType];
}


