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
   * Se não encontrar, tenta migrar usuário antigo por email
   */
  static async getUserByAuthId(authId: string): Promise<User | null> {
    const supabase = await createServerSupabaseClient()

    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single()

    if (user) {
      return user
    }

    // Fallback: busca por email e atualiza auth_id (migração de usuários antigos)
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser?.email) {
        const { data: oldUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', authUser.email)
          .single()

        if (oldUser && oldUser.auth_id !== authId) {
          const { data: updatedUser } = await supabase
            .from('users')
            .update({ auth_id: authId })
            .eq('id', oldUser.id)
            .select()
            .single()

          return updatedUser || oldUser
        }
      }
    } catch (migrationError) {
      console.error('[getUserByAuthId] Erro na migração automática:', migrationError)
    }

    return null
  }

  /**
   * Busca usuário pelo ID
   * Se não encontrar, tenta buscar por auth_id (fallback para clientes que enviam auth_id como user_id)
   * Se ainda não encontrar, tenta atualizar auth_id de usuários antigos usando email
   */
  static async getUserById(id: string): Promise<User | null> {
    const supabase = await createServerSupabaseClient()

    // Tenta buscar por ID primeiro
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (user) {
      return user
    }
    
    // Fallback: tenta buscar por auth_id (caso o cliente tenha enviado auth_id como user_id)
    const { data: userByAuthId, error: authError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', id)
      .single()

    if (userByAuthId) {
      return userByAuthId
    }

    // Fallback final: tenta encontrar e migrar usuários antigos por email
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser?.email) {
        const { data: oldUser, error: emailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', authUser.email)
          .single()

        if (oldUser) {
          // Atualiza o auth_id do usuário antigo para o novo
          const { data: updatedUser } = await supabase
            .from('users')
            .update({ auth_id: authUser.id })
            .eq('id', oldUser.id)
            .select()
            .single()

          return updatedUser || oldUser
        }
      }
    } catch (migrationError) {
      console.error('[getUserById] Erro na migração automática:', migrationError)
    }

    return null
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
