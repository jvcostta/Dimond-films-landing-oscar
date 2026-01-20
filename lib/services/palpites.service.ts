import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Palpite, PalpiteInsert, PalpiteUpdate, Category, Nominee } from '@/lib/types/database.types'

/**
 * Service para gerenciar palpites
 * 
 * MODELO:
 * - Cada bolão tem seus próprios palpites
 * - Palpites únicos por user_id + category_id + bolao_id
 * - Ao criar grupo, palpites individuais são copiados para o novo bolão
 */
export class PalpitesService {
  /**
   * Cria ou atualiza um palpite
   */
  static async upsertPalpite(data: PalpiteInsert): Promise<Palpite | null> {
    const supabase = await createServerSupabaseClient()

    const { data: palpite, error } = await supabase
      .from('palpites')
      .upsert(data, {
        onConflict: 'user_id,category_id,bolao_id',
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting palpite:', error)
      throw new Error(error.message)
    }

    return palpite
  }

  /**
   * Cria múltiplos palpites de uma vez
   */
  static async createMultiplePalpites(palpites: PalpiteInsert[]): Promise<Palpite[]> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('palpites')
      .upsert(palpites, {
        onConflict: 'user_id,category_id,bolao_id',
      })
      .select()

    if (error) {
      console.error('Error creating multiple palpites:', error)
      throw new Error(error.message)
    }

    return data || []
  }

  /**
   * Copia palpites de um bolão para outro
   * Usado ao criar grupo ou entrar em grupo
   */
  static async copyPalpitesToBolao(
    userId: string,
    fromBolaoId: string,
    toBolaoId: string
  ): Promise<Palpite[]> {
    const supabase = await createServerSupabaseClient()

    console.log(`[copyPalpitesToBolao] Copiando palpites de ${fromBolaoId} para ${toBolaoId} para usuário ${userId}`)

    // Busca palpites do bolão origem
    const { data: sourcePalpites, error: fetchError } = await supabase
      .from('palpites')
      .select('*')
      .eq('user_id', userId)
      .eq('bolao_id', fromBolaoId)

    if (fetchError) {
      console.error('[copyPalpitesToBolao] Erro ao buscar palpites origem:', fetchError)
      throw new Error('Erro ao buscar palpites para copiar')
    }

    if (!sourcePalpites || sourcePalpites.length === 0) {
      console.log('[copyPalpitesToBolao] Nenhum palpite encontrado para copiar')
      return []
    }

    console.log(`[copyPalpitesToBolao] Encontrados ${sourcePalpites.length} palpites para copiar`)

    // Cria cópias para o novo bolão
    const newPalpites: PalpiteInsert[] = sourcePalpites.map(palpite => ({
      user_id: palpite.user_id,
      bolao_id: toBolaoId,
      category_id: palpite.category_id,
      nominee_id: palpite.nominee_id,
    }))

    const copiedPalpites = await this.createMultiplePalpites(newPalpites)
    console.log(`[copyPalpitesToBolao] ${copiedPalpites.length} palpites copiados com sucesso`)

    return copiedPalpites
  }

  /**
   * Busca palpites de um usuário em um bolão específico
   */
  static async getUserPalpitesInBolao(bolaoId: string, userId: string) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('palpites')
      .select(`
        *,
        category:category_id (
          id,
          name,
          display_order
        ),
        nominee:nominee_id (
          id,
          name,
          movie,
          is_winner
        )
      `)
      .eq('user_id', userId)
      .eq('bolao_id', bolaoId)

    if (error) {
      console.error('Error fetching user palpites in bolao:', error)
      return []
    }

    // Ordena os palpites por display_order da categoria
    const sortedData = data?.sort((a: any, b: any) => {
      return (a.category?.display_order || 0) - (b.category?.display_order || 0)
    })

    return sortedData || []
  }

  /**
   * Busca palpites individuais de um usuário (do Ranking Geral)
   */
  static async getUserIndividualPalpites(userId: string) {
    const supabase = await createServerSupabaseClient()

    // Busca o Ranking Geral
    const { data: rankingGeral } = await supabase
      .from('boloes')
      .select('id')
      .eq('name', 'Ranking Geral')
      .eq('type', 'individual')
      .maybeSingle()

    if (!rankingGeral) {
      return []
    }

    return this.getUserPalpitesInBolao(rankingGeral.id, userId)
  }

  /**
   * Busca todos os palpites de participantes de um bolão
   */
  static async getBolaoPalpites(bolaoId: string) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('palpites')
      .select(`
        *,
        user:user_id (
          id,
          name
        ),
        category:category_id (
          id,
          name
        ),
        nominee:nominee_id (
          id,
          name,
          movie,
          is_winner
        )
      `)
      .eq('bolao_id', bolaoId)

    if (error) {
      console.error('Error fetching bolao palpites:', error)
      return []
    }

    return data || []
  }

  /**
   * Busca um palpite específico
   */
  static async getPalpite(
    userId: string,
    bolaoId: string,
    categoryId: string
  ): Promise<Palpite | null> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('palpites')
      .select('*')
      .eq('user_id', userId)
      .eq('bolao_id', bolaoId)
      .eq('category_id', categoryId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching palpite:', error)
      return null
    }

    return data
  }

  /**
   * Atualiza um palpite
   */
  static async updatePalpite(id: string, data: PalpiteUpdate): Promise<Palpite | null> {
    const supabase = await createServerSupabaseClient()

    const { data: palpite, error } = await supabase
      .from('palpites')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating palpite:', error)
      throw new Error(error.message)
    }

    return palpite
  }

  /**
   * Deleta um palpite
   */
  static async deletePalpite(id: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('palpites')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting palpite:', error)
      return false
    }

    return true
  }

  /**
   * Verifica se o usuário já completou os palpites no Ranking Geral
   */
  static async hasCompletedIndividualPalpites(userId: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient()

    // Busca o Ranking Geral
    const { data: rankingGeral } = await supabase
      .from('boloes')
      .select('id')
      .eq('name', 'Ranking Geral')
      .eq('type', 'individual')
      .maybeSingle()

    if (!rankingGeral) {
      return false
    }

    // Conta total de categorias
    const { count: totalCategories } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })

    // Conta palpites do usuário no Ranking Geral
    const { count: userPalpites } = await supabase
      .from('palpites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('bolao_id', rankingGeral.id)

    return (totalCategories || 0) === (userPalpites || 0)
  }

  /**
   * Busca todas as categorias
   */
  static async getAllCategories(): Promise<Category[]> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data || []
  }

  /**
   * Busca todos os indicados de uma categoria
   */
  static async getCategoryNominees(categoryId: string): Promise<Nominee[]> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('nominees')
      .select('*')
      .eq('category_id', categoryId)

    if (error) {
      console.error('Error fetching nominees:', error)
      return []
    }

    return data || []
  }

  /**
   * Busca categorias com seus indicados
   */
  static async getCategoriesWithNominees() {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        nominees (
          id,
          name,
          movie,
          is_winner
        )
      `)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching categories with nominees:', error)
      return []
    }

    return data || []
  }
}
