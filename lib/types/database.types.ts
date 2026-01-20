/**
 * Tipos gerados a partir do schema do Supabase
 * Representa a estrutura do banco de dados
 */

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
      users: {
        Row: {
          id: string
          auth_id: string
          name: string
          email: string
          phone: string | null
          state: string | null
          city: string | null
          birth_date: string | null
          favorite_genre: string | null
          cinema_network: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id: string
          name: string
          email: string
          phone?: string | null
          state?: string | null
          city?: string | null
          birth_date?: string | null
          favorite_genre?: string | null
          cinema_network?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string
          name?: string
          email?: string
          phone?: string | null
          state?: string | null
          city?: string | null
          birth_date?: string | null
          favorite_genre?: string | null
          cinema_network?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      boloes: {
        Row: {
          id: string
          name: string
          type: 'individual' | 'group'
          invite_code: string | null
          creator_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'individual' | 'group'
          invite_code?: string | null
          creator_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'individual' | 'group'
          invite_code?: string | null
          creator_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      bolao_participants: {
        Row: {
          id: string
          bolao_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          bolao_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          bolao_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_order?: number
          created_at?: string
        }
      }
      nominees: {
        Row: {
          id: string
          category_id: string
          name: string
          movie: string | null
          is_winner: boolean
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          movie?: string | null
          is_winner?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          movie?: string | null
          is_winner?: boolean
          created_at?: string
        }
      }
      palpites: {
        Row: {
          id: string
          user_id: string
          bolao_id: string
          category_id: string
          nominee_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bolao_id: string
          category_id: string
          nominee_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bolao_id?: string
          category_id?: string
          nominee_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      ranking: {
        Row: {
          id: string
          bolao_id: string
          user_id: string
          points: number
          position: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          bolao_id: string
          user_id: string
          points?: number
          position?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          bolao_id?: string
          user_id?: string
          points?: number
          position?: number | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invite_code: {
        Args: Record<string, never>
        Returns: string
      }
      calculate_ranking: {
        Args: { p_bolao_id: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Tipos auxiliares para facilitar o uso
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Bolao = Database['public']['Tables']['boloes']['Row']
export type BolaoInsert = Database['public']['Tables']['boloes']['Insert']
export type BolaoUpdate = Database['public']['Tables']['boloes']['Update']

export type BolaoParticipant = Database['public']['Tables']['bolao_participants']['Row']
export type BolaoParticipantInsert = Database['public']['Tables']['bolao_participants']['Insert']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']

export type Nominee = Database['public']['Tables']['nominees']['Row']
export type NomineeInsert = Database['public']['Tables']['nominees']['Insert']

export type Palpite = Database['public']['Tables']['palpites']['Row']
export type PalpiteInsert = Database['public']['Tables']['palpites']['Insert']
export type PalpiteUpdate = Database['public']['Tables']['palpites']['Update']

export type Ranking = Database['public']['Tables']['ranking']['Row']
export type RankingInsert = Database['public']['Tables']['ranking']['Insert']
