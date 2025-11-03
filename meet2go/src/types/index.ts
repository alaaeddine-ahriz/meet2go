export * from './database.types';

// App-specific types

export type VoteTypeDisplay = {
  amazing: {
    emoji: '😍';
    color: string;
    label: 'Amazing';
    points: 3;
  };
  works: {
    emoji: '✅';
    color: string;
    label: 'Works';
    points: 1;
  };
  doesnt_work: {
    emoji: '❌';
    color: string;
    label: "Doesn't Work";
    points: -1;
  };
};

export type PollStatus = 'no_vote' | 'in_progress' | 'complete';

export interface QuestWithMembers extends Quest {
  memberCount?: number;
  members?: UserProfile[];
}

export interface PollWithOptions extends Poll {
  options?: PollOption[];
  optionCount?: number;
}

export interface PollOptionWithVotes extends PollOption {
  votes?: Vote[];
  voteCount?: number;
  score?: number;
}

export interface VoteBreakdown {
  amazing: UserProfile[];
  works: UserProfile[];
  doesnt_work: UserProfile[];
}

export type { Quest, Poll, PollOption, Vote, UserProfile, VoteType };


