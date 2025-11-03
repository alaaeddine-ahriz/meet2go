export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      quests: {
        Row: {
          id: string
          name: string
          end_date: string
          invite_code: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          end_date: string
          invite_code: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          end_date?: string
          invite_code?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      quest_members: {
        Row: {
          quest_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          quest_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          quest_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      polls: {
        Row: {
          id: string
          quest_id: string
          name: string
          deadline: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quest_id: string
          name: string
          deadline?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quest_id?: string
          name?: string
          deadline?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      poll_options: {
        Row: {
          id: string
          poll_id: string
          name: string
          image_url: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          name: string
          image_url?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          name?: string
          image_url?: string | null
          created_by?: string
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          poll_option_id: string
          user_id: string
          vote_type: 'amazing' | 'works' | 'doesnt_work'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          poll_option_id: string
          user_id: string
          vote_type: 'amazing' | 'works' | 'doesnt_work'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          poll_option_id?: string
          user_id?: string
          vote_type?: 'amazing' | 'works' | 'doesnt_work'
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Quest = Database['public']['Tables']['quests']['Row']
export type Poll = Database['public']['Tables']['polls']['Row']
export type PollOption = Database['public']['Tables']['poll_options']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type VoteType = 'amazing' | 'works' | 'doesnt_work'


