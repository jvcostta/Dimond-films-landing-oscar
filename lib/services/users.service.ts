import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { UserInsert, UserUpdate, User } from '@/lib/types/database.types'

/**
 * Service para gerenciar operações de usuários
 */
export class UsersService {
  /**
   * Cria um novo usuário no banco após o cadastro no Supabase Auth
   */
  static async createUser(data: UserInsert): Promise<User | null> {
    const supabase = await createServerSupabaseClient()

    const { data: user, error } = await supabase
      .from('users')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      throw new Error(error.message)
    }

    return user
  }

  /**
   * Busca usuário pelo ID do Supabase Auth
   */
  static async getUserByAuthId(authId: string): Promise<User | null> {
    const supabase = await createServerSupabaseClient()

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return user
  }

  /**
   * Busca usuário pelo ID
   */
  static async getUserById(id: string): Promise<User | null> {
    const supabase = await createServerSupabaseClient()

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return user
  }

  /**
   * Busca usuário pelo email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const supabase = await createServerSupabaseClient()

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error fetching user by email:', error)
      return null
    }

    return user
  }

  /**
   * Atualiza dados do usuário
   */
  static async updateUser(id: string, data: UserUpdate): Promise<User | null> {
    const supabase = await createServerSupabaseClient()

    const { data: user, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      throw new Error(error.message)
    }

    return user
  }

  /**
   * Verifica se o usuário autenticado tem acesso
   */
  static async getCurrentUser(): Promise<User | null> {
    const supabase = await createServerSupabaseClient()

    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return null
    }

    return this.getUserByAuthId(authUser.id)
  }

  /**
   * Deleta um usuário
   */
  static async deleteUser(id: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting user:', error)
      return false
    }

    return true
  }
}
