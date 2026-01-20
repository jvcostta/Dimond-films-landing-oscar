import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Ranking } from '@/lib/types/database.types'

interface RankingGrupoItem {
  id: string
  user_id: string
  bolao_id: string
  points: number
  position: number
  user?: {
    name: string
    email: string
  }
}

/**
 * Service para gerenciar rankings
 */
export class RankingService {
  /**
   * RECALCULA RANKING DE UM GRUPO ESPECÍFICO
   * Calcula pontos de cada membro e atualiza posições
   */
  static async recalcularRankingGrupo(bolaoId: string): Promise<void> {
    const supabase = await createServerSupabaseClient()
    console.log(`🔄 Recalculando ranking do grupo ${bolaoId}...`)
    
    const { error } = await supabase.rpc('recalculate_group_ranking', {
      p_bolao_id: bolaoId
    })
    
    if (error) {
      console.error('❌ Erro ao recalcular ranking do grupo:', error)
      throw new Error(`Erro ao recalcular ranking do grupo: ${error.message}`)
    }
    
    console.log('✅ Ranking do grupo recalculado com sucesso')
  }

  /**
   * RECALCULA RANKING GERAL
   * Inclui usuários individuais + 1º colocado de cada grupo
   */
  static async recalcularRankingGeral(): Promise<void> {
    const supabase = await createServerSupabaseClient()
    console.log('🔄 Recalculando Ranking Geral...')
    
    const { error } = await supabase.rpc('recalculate_global_ranking')
    
    if (error) {
      console.error('❌ Erro ao recalcular Ranking Geral:', error)
      throw new Error(`Erro ao recalcular Ranking Geral: ${error.message}`)
    }
    
    console.log('✅ Ranking Geral recalculado com sucesso')
  }

  /**
   * BUSCA RANKING INTERNO DE UM GRUPO
   * Retorna todos os membros do grupo ordenados por pontos
   */
  static async getRankingGrupo(bolaoId: string): Promise<RankingGrupoItem[]> {
    const supabase = await createServerSupabaseClient()
    console.log(`📊 Buscando ranking do grupo ${bolaoId}...`)
    
    const { data, error } = await supabase
      .from('group_rankings')
      .select(`
        id,
        user_id,
        bolao_id,
        points,
        position,
        user:users (
          name,
          email
        )
      `)
      .eq('bolao_id', bolaoId)
      .order('position', { ascending: true })
    
    if (error) {
      console.error('❌ Erro ao buscar ranking do grupo:', error)
      throw new Error(`Erro ao buscar ranking do grupo: ${error.message}`)
    }
    
    console.log(`✅ Ranking do grupo: ${data?.length || 0} participantes`)
    return data as RankingGrupoItem[]
  }

  /**
   * BUSCA POSIÇÃO DO USUÁRIO NO RANKING DE UM GRUPO
   */
  static async getPosicaoUsuarioNoGrupo(
    bolaoId: string,
    userId: string
  ): Promise<RankingGrupoItem | null> {
    const supabase = await createServerSupabaseClient()
    console.log(`🔍 Buscando posição do usuário ${userId} no grupo ${bolaoId}...`)
    
    const { data, error } = await supabase
      .from('group_rankings')
      .select(`
        id,
        user_id,
        bolao_id,
        points,
        position,
        user:users (
          name,
          email
        )
      `)
      .eq('bolao_id', bolaoId)
      .eq('user_id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️ Usuário não encontrado no ranking do grupo')
        return null
      }
      console.error('❌ Erro ao buscar posição do usuário:', error)
      throw new Error(`Erro ao buscar posição: ${error.message}`)
    }
    
    console.log(`✅ Posição encontrada: ${data.position}º lugar com ${data.points} pontos`)
    return data as RankingGrupoItem
  }

  /**
   * BUSCA POSIÇÃO DO GRUPO NO RANKING GERAL
   * (Representado pelo 1º colocado do grupo)
   */
  static async getPosicaoGrupoRankingGeral(
    bolaoId: string
  ): Promise<{ posicao: number; pontos: number; primeiroColocado: string } | null> {
    const supabase = await createServerSupabaseClient()
    console.log(`🔍 Buscando posição do grupo ${bolaoId} no Ranking Geral...`)
    
    // Busca 1º colocado do grupo
    const { data: primeiroColocado } = await supabase
      .from('group_rankings')
      .select(`
        user_id,
        points,
        user:users (
          name
        )
      `)
      .eq('bolao_id', bolaoId)
      .eq('position', 1)
      .single()
    
    if (!primeiroColocado) {
      console.log('⚠️ Grupo não tem 1º colocado ainda')
      return null
    }
    
    // Busca ID do Ranking Geral
    const { data: rankingGeralBolao } = await supabase
      .from('boloes')
      .select('id')
      .eq('name', 'Ranking Geral')
      .eq('type', 'individual')
      .single()
    
    if (!rankingGeralBolao) {
      throw new Error('Ranking Geral não encontrado')
    }
    
    // Busca posição desse usuário no Ranking Geral
    const { data: posicaoGeral } = await supabase
      .from('ranking')
      .select('position, points')
      .eq('bolao_id', rankingGeralBolao.id)
      .eq('user_id', primeiroColocado.user_id)
      .single()
    
    if (!posicaoGeral) {
      console.log('⚠️ 1º colocado do grupo não está no Ranking Geral')
      return null
    }
    
    console.log(
      `✅ Grupo está em ${posicaoGeral.position}º lugar no Ranking Geral ` +
      `(representado por ${primeiroColocado.user?.name})`
    )
    
    return {
      posicao: posicaoGeral.position,
      pontos: posicaoGeral.points,
      primeiroColocado: primeiroColocado.user?.name || 'Desconhecido'
    }
  }

  /**
   * Calcula e atualiza o ranking de um bolão
   * ⚠️ IMPORTANTE: Detecta o tipo do bolão e chama a função correta
   * - Se for grupo: Atualiza group_rankings + Ranking Geral
   * - Se for individual: Atualiza apenas Ranking Geral
   */
  static async calculateRanking(bolaoId: string): Promise<void> {
    const supabase = await createServerSupabaseClient()

    console.log(`[calculateRanking] Recalculando ranking para bolão: ${bolaoId}`)

    // Busca informações do bolão
    const { data: bolao, error: bolaoError } = await supabase
      .from('boloes')
      .select('id, name, type')
      .eq('id', bolaoId)
      .single()

    if (bolaoError || !bolao) {
      console.error('[calculateRanking] Erro ao buscar bolão:', bolaoError)
      return
    }

    console.log(`[calculateRanking] Bolão encontrado: ${bolao.name} (type: ${bolao.type})`)

    if (bolao.type === 'group') {
      // É um grupo: atualiza group_rankings + Ranking Geral
      console.log('[calculateRanking] Tipo: GRUPO → Atualizando group_rankings')
      await this.recalcularRankingGrupo(bolaoId)
      
      console.log('[calculateRanking] Atualizando Ranking Geral após mudança no grupo')
      await this.recalcularRankingGeral()
    } else {
      // É individual (Ranking Geral): atualiza apenas Ranking Geral
      console.log('[calculateRanking] Tipo: INDIVIDUAL → Atualizando Ranking Geral')
      await this.recalcularRankingGeral()
    }

    console.log('[calculateRanking] Ranking recalculado com sucesso!')
  }

  /**
   * Busca o ranking completo de um bolão
   */
  static async getBolaoRanking(bolaoId: string) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('ranking')
      .select(`
        *,
        user:user_id (
          id,
          name,
          city,
          state
        )
      `)
      .eq('bolao_id', bolaoId)
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching ranking:', error)
      return []
    }

    return data || []
  }

  /**
   * BUSCA RANKING GERAL COMPLETO
   * Inclui usuários individuais + 1º de cada grupo
   */
  static async getRankingGeral(limit: number = 100) {
    const supabase = await createServerSupabaseClient()
    console.log('📊 Buscando Ranking Geral...')
    
    // Busca ID do Ranking Geral
    const { data: rankingGeralBolao } = await supabase
      .from('boloes')
      .select('id')
      .eq('name', 'Ranking Geral')
      .eq('type', 'individual')
      .single()
    
    if (!rankingGeralBolao) {
      throw new Error('Ranking Geral não encontrado')
    }
    
    const { data, error } = await supabase
      .from('ranking')
      .select(`
        id,
        user_id,
        bolao_id,
        points,
        position,
        user:users (
          id,
          name,
          email,
          city,
          state
        )
      `)
      .eq('bolao_id', rankingGeralBolao.id)
      .order('position', { ascending: true })
      .limit(limit)
    
    if (error) {
      console.error('❌ Erro ao buscar Ranking Geral:', error)
      throw new Error(`Erro ao buscar Ranking Geral: ${error.message}`)
    }
    
    console.log(`✅ Ranking Geral: ${data?.length || 0} participantes`)
    return data || []
  }

  /**
   * BUSCA POSIÇÃO DO USUÁRIO NO RANKING GERAL
   */
  static async getPosicaoUsuarioRankingGeral(userId: string) {
    const supabase = await createServerSupabaseClient()
    console.log(`🔍 Buscando posição do usuário ${userId} no Ranking Geral...`)
    
    // Busca ID do Ranking Geral
    const { data: rankingGeralBolao } = await supabase
      .from('boloes')
      .select('id')
      .eq('name', 'Ranking Geral')
      .eq('type', 'individual')
      .single()
    
    if (!rankingGeralBolao) {
      throw new Error('Ranking Geral não encontrado')
    }
    
    const { data, error } = await supabase
      .from('ranking')
      .select(`
        id,
        user_id,
        bolao_id,
        points,
        position,
        user:users (
          id,
          name,
          email
        )
      `)
      .eq('bolao_id', rankingGeralBolao.id)
      .eq('user_id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️ Usuário não encontrado no Ranking Geral')
        return null
      }
      console.error('❌ Erro ao buscar posição do usuário:', error)
      throw new Error(`Erro ao buscar posição: ${error.message}`)
    }
    
    console.log(`✅ Posição encontrada: ${data.position}º lugar com ${data.points} pontos`)
    return data
  }

  /**
   * RECALCULA TODOS OS RANKINGS
   * Útil após atualizar vencedores de categorias
   */
  static async recalcularTodos(): Promise<void> {
    const supabase = await createServerSupabaseClient()
    console.log('🔄 Recalculando TODOS os rankings...')
    
    // 1. Busca todos os bolões em grupo
    const { data: grupos } = await supabase
      .from('boloes')
      .select('id')
      .eq('type', 'group')
    
    // 2. Recalcula ranking de cada grupo
    if (grupos && grupos.length > 0) {
      for (const grupo of grupos) {
        await this.recalcularRankingGrupo(grupo.id)
      }
    }
    
    // 3. Recalcula Ranking Geral (inclui 1º de cada grupo)
    await this.recalcularRankingGeral()
    
    console.log('✅ Todos os rankings recalculados com sucesso')
  }

  /**
   * Busca a posição de um usuário específico no ranking
   */
  static async getUserRanking(bolaoId: string, userId: string): Promise<Ranking | null> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('ranking')
      .select('*')
      .eq('bolao_id', bolaoId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user ranking:', error)
      return null
    }

    return data
  }

  /**
   * Busca o top N do ranking
   */
  static async getTopRanking(bolaoId: string, limit: number = 10) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('ranking')
      .select(`
        *,
        user:user_id (
          id,
          name,
          city,
          state
        )
      `)
      .eq('bolao_id', bolaoId)
      .order('position', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching top ranking:', error)
      return []
    }

    return data || []
  }

  /**
   * Busca estatísticas gerais do ranking
   */
  static async getRankingStats(bolaoId: string) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('ranking')
      .select('points')
      .eq('bolao_id', bolaoId)

    if (error || !data) {
      return {
        totalParticipants: 0,
        averagePoints: 0,
        maxPoints: 0,
        minPoints: 0,
      }
    }

    const points = data.map(r => r.points)
    const totalParticipants = points.length
    const sum = points.reduce((acc, p) => acc + p, 0)
    const averagePoints = totalParticipants > 0 ? sum / totalParticipants : 0
    const maxPoints = Math.max(...points, 0)
    const minPoints = Math.min(...points, 0)

    return {
      totalParticipants,
      averagePoints: Math.round(averagePoints * 100) / 100,
      maxPoints,
      minPoints,
    }
  }

  /**
   * Busca ranking global (do bolão "Ranking Geral")
   */
  static async getGlobalRanking(limit: number = 100) {
    const supabase = await createServerSupabaseClient()

    // Busca o bolão "Ranking Geral"
    const { data: globalBolao } = await supabase
      .from('boloes')
      .select('id')
      .eq('name', 'Ranking Geral')
      .eq('type', 'individual')
      .single()

    if (!globalBolao) {
      console.log('Bolão "Ranking Geral" não encontrado')
      return []
    }

    // Busca ranking do bolão global
    const { data, error } = await supabase
      .from('ranking')
      .select(`
        *,
        user:user_id (
          id,
          name,
          city,
          state
        )
      `)
      .eq('bolao_id', globalBolao.id)
      .order('position', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching global ranking:', error)
      return []
    }

    return data || []
  }

  /**
   * Atualiza rankings de todos os bolões ativos
   */
  static async updateAllRankings(): Promise<void> {
    const supabase = await createServerSupabaseClient()

    // Busca todos os bolões
    const { data: boloes, error } = await supabase
      .from('boloes')
      .select('id')

    if (error || !boloes) {
      console.error('Error fetching boloes for ranking update:', error)
      return
    }

    // Atualiza ranking de cada bolão
    for (const bolao of boloes) {
      try {
        await this.calculateRanking(bolao.id)
      } catch (error) {
        console.error(`Error updating ranking for bolao ${bolao.id}:`, error)
      }
    }
  }
}
