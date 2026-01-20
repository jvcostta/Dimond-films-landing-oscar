import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Bolao, BolaoInsert, BolaoParticipant } from '@/lib/types/database.types'

/**
 * Service para gerenciar operações de bolões
 */
export class BoloesService {
  /**
   * Cria um novo bolão
   */
  static async createBolao(data: BolaoInsert): Promise<Bolao | null> {
    const supabase = await createServerSupabaseClient()

    // Se for bolão em grupo, gera um invite_code
    if (data.type === 'group' && !data.invite_code) {
      const { data: inviteCode } = await supabase.rpc('generate_invite_code')
      data.invite_code = inviteCode
    }

    const { data: bolao, error } = await supabase
      .from('boloes')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('Error creating bolao:', error)
      throw new Error(error.message)
    }

    // Adiciona o criador como participante
    if (bolao) {
      await this.addParticipant(bolao.id, data.creator_id)
    }

    return bolao
  }

  /**
   * Busca bolão por ID
   */
  static async getBolaoById(id: string): Promise<Bolao | null> {
    const supabase = await createServerSupabaseClient()

    const { data: bolao, error } = await supabase
      .from('boloes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching bolao:', error)
      return null
    }

    return bolao
  }

  /**
   * Busca bolão por invite_code
   */
  static async getBolaoByInviteCode(inviteCode: string): Promise<Bolao | null> {
    const supabase = await createServerSupabaseClient()

    const { data: bolao, error } = await supabase
      .from('boloes')
      .select('*')
      .eq('invite_code', inviteCode)
      .single()

    if (error) {
      console.error('Error fetching bolao by invite code:', error)
      return null
    }

    return bolao
  }

  /**
   * Busca todos os bolões de um usuário
   */
  static async getUserBoloes(userId: string): Promise<Bolao[]> {
    const supabase = await createServerSupabaseClient()

    // Primeiro busca os IDs dos bolões
    const { data: participations, error: participationsError } = await supabase
      .from('bolao_participants')
      .select('bolao_id')
      .eq('user_id', userId)

    if (participationsError) {
      console.error('Error fetching user participations:', participationsError)
      return []
    }

    if (!participations || participations.length === 0) {
      return []
    }

    const bolaoIds = participations.map(p => p.bolao_id)

    // Busca os bolões pelos IDs
    const { data: boloes, error } = await supabase
      .from('boloes')
      .select('*')
      .in('id', bolaoIds)

    if (error) {
      console.error('Error fetching user boloes:', error)
      return []
    }

    return boloes || []
  }

  /**
   * Adiciona um participante a um bolão
   */
  static async addParticipant(bolaoId: string, userId: string): Promise<BolaoParticipant | null> {
    const supabase = await createServerSupabaseClient()

    // Verifica se já participa
    const { data: existing } = await supabase
      .from('bolao_participants')
      .select('*')
      .eq('bolao_id', bolaoId)
      .eq('user_id', userId)
      .single()

    if (existing) {
      return existing
    }

    const { data: participant, error } = await supabase
      .from('bolao_participants')
      .insert({ bolao_id: bolaoId, user_id: userId })
      .select()
      .single()

    if (error) {
      console.error('Error adding participant:', error)
      throw new Error(error.message)
    }

    return participant
  }

  /**
   * Remove um participante de um bolão
   */
  static async removeParticipant(bolaoId: string, userId: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('bolao_participants')
      .delete()
      .eq('bolao_id', bolaoId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing participant:', error)
      return false
    }

    return true
  }

  /**
   * Busca todos os participantes de um bolão
   */
  static async getBolaoParticipants(bolaoId: string) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('bolao_participants')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email,
          city,
          state
        )
      `)
      .eq('bolao_id', bolaoId)

    if (error) {
      console.error('Error fetching participants:', error)
      return []
    }

    return data || []
  }

  /**
   * Verifica se um usuário participa de um bolão
   */
  static async isUserParticipant(bolaoId: string, userId: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient()

    // Primeiro verifica se é o criador do bolão
    const { data: bolao } = await supabase
      .from('boloes')
      .select('creator_id')
      .eq('id', bolaoId)
      .single()

    if (bolao?.creator_id === userId) {
      return true
    }

    // Se não é o criador, verifica se está na tabela de participantes
    const { data } = await supabase
      .from('bolao_participants')
      .select('id')
      .eq('bolao_id', bolaoId)
      .eq('user_id', userId)
      .single()

    return !!data
  }

  /**
   * Entrada em bolão via invite_code
   */
  static async joinBolaoByInviteCode(inviteCode: string, userId: string): Promise<Bolao | null> {
    const bolao = await this.getBolaoByInviteCode(inviteCode)

    if (!bolao) {
      throw new Error('Bolão não encontrado')
    }

    await this.addParticipant(bolao.id, userId)
    return bolao
  }

  /**
   * Deleta um bolão
   */
  static async deleteBolao(id: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('boloes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting bolao:', error)
      return false
    }

    return true
  }

  /**
   * Busca ou cria o bolão global "Ranking Geral"
   */
  static async getOrCreateGlobalRanking(): Promise<Bolao | null> {
    const supabase = await createServerSupabaseClient()

    console.log('[getOrCreateGlobalRanking] Iniciando busca pelo Ranking Geral...')

    // Tenta buscar o bolão global existente
    const { data: existingBolao, error: fetchError } = await supabase
      .from('boloes')
      .select('*')
      .eq('name', 'Ranking Geral')
      .eq('type', 'individual')
      .maybeSingle() // Usa maybeSingle em vez de single para não dar erro se não existir

    if (fetchError) {
      console.error('[getOrCreateGlobalRanking] Erro ao buscar:', fetchError)
    }

    if (existingBolao) {
      console.log('[getOrCreateGlobalRanking] Ranking Geral encontrado:', existingBolao.id)
      return existingBolao
    }

    console.log('[getOrCreateGlobalRanking] Ranking Geral não existe, criando...')

    // Se não existe, cria o bolão global
    // Usa o primeiro usuário como criador
    const { data: firstUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (userError || !firstUser) {
      console.error('[getOrCreateGlobalRanking] Erro ao buscar usuário:', userError)
      console.error('[getOrCreateGlobalRanking] Nenhum usuário encontrado para criar bolão global')
      return null
    }

    console.log('[getOrCreateGlobalRanking] Criando com usuário:', firstUser.id)

    const { data: globalBolao, error: createError } = await supabase
      .from('boloes')
      .insert({
        name: 'Ranking Geral',
        type: 'individual',
        creator_id: firstUser.id,
        invite_code: null,
      })
      .select()
      .single()

    if (createError) {
      console.error('[getOrCreateGlobalRanking] Erro ao criar bolão global:', createError)
      return null
    }

    console.log('[getOrCreateGlobalRanking] Ranking Geral criado com sucesso:', globalBolao.id)
    return globalBolao
  }

  /**
   * Adiciona usuário ao bolão global (Ranking Geral)
   */
  static async addUserToGlobalRanking(userId: string): Promise<void> {
    const globalBolao = await this.getOrCreateGlobalRanking()
    
    if (!globalBolao) {
      throw new Error('Não foi possível acessar o Ranking Geral')
    }

    await this.addParticipant(globalBolao.id, userId)
  }

  /**
   * Verifica se usuário tem palpite individual
   */
  static async userHasIndividualPalpite(userId: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient()

    const globalBolao = await this.getOrCreateGlobalRanking()
    if (!globalBolao) {
      return false
    }

    const { data } = await supabase
      .from('palpites')
      .select('id')
      .eq('user_id', userId)
      .eq('bolao_id', globalBolao.id)
      .limit(1)
      .maybeSingle()

    return !!data
  }

  /**
   * Cria bolão em grupo E copia palpites individuais do criador
   */
  static async createGroupBolaoWithPalpites(
    name: string,
    creatorId: string
  ): Promise<{ bolao: Bolao; inviteCode: string }> {
    const supabase = await createServerSupabaseClient()

    console.log(`[createGroupBolaoWithPalpites] Criando bolão "${name}" para usuário ${creatorId}`)

    // Busca o Ranking Geral
    const globalBolao = await this.getOrCreateGlobalRanking()
    if (!globalBolao) {
      throw new Error('Não foi possível acessar o Ranking Geral')
    }

    // Gera invite_code
    const { data: inviteCode, error: inviteError } = await supabase.rpc('generate_invite_code')
    if (inviteError || !inviteCode) {
      throw new Error('Erro ao gerar código de convite')
    }

    console.log(`[createGroupBolaoWithPalpites] Código gerado: ${inviteCode}`)

    // Cria o bolão
    const { data: newBolao, error: bolaoError } = await supabase
      .from('boloes')
      .insert({
        name,
        type: 'group',
        creator_id: creatorId,
        invite_code: inviteCode,
      })
      .select()
      .single()

    if (bolaoError || !newBolao) {
      console.error('[createGroupBolaoWithPalpites] Erro ao criar bolão:', bolaoError)
      throw new Error('Erro ao criar bolão')
    }

    console.log(`[createGroupBolaoWithPalpites] Bolão criado: ${newBolao.id}`)

    // Adiciona o criador como participante
    await this.addParticipant(newBolao.id, creatorId)
    console.log(`[createGroupBolaoWithPalpites] Criador adicionado como participante`)

    // Copia os palpites do Ranking Geral para o novo bolão
    const PalpitesService = (await import('./palpites.service')).PalpitesService
    await PalpitesService.copyPalpitesToBolao(creatorId, globalBolao.id, newBolao.id)

    console.log(`[createGroupBolaoWithPalpites] Palpites copiados com sucesso`)

    // Recalcula ranking do grupo
    const RankingService = (await import('./ranking.service')).RankingService
    await RankingService.recalcularRankingGrupo(newBolao.id)
    console.log(`[createGroupBolaoWithPalpites] Ranking do grupo recalculado`)

    // Recalcula Ranking Geral (inclui 1º colocado do grupo)
    await RankingService.recalcularRankingGeral()
    console.log(`[createGroupBolaoWithPalpites] Ranking Geral atualizado`)

    return { bolao: newBolao, inviteCode }
  }

  /**
   * Adiciona usuário a um bolão E copia seus palpites individuais
   */
  static async joinBolaoWithPalpites(
    inviteCode: string,
    userId: string
  ): Promise<Bolao> {
    const supabase = await createServerSupabaseClient()

    console.log(`[joinBolaoWithPalpites] Usuário ${userId} entrando com código ${inviteCode}`)

    // Busca o bolão pelo código
    const bolao = await this.getBolaoByInviteCode(inviteCode)
    if (!bolao) {
      throw new Error('Bolão não encontrado')
    }

    console.log(`[joinBolaoWithPalpites] Bolão encontrado: ${bolao.id} - ${bolao.name}`)

    // Verifica se usuário já participa
    const { data: existing } = await supabase
      .from('bolao_participants')
      .select('id')
      .eq('bolao_id', bolao.id)
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      throw new Error('Você já participa deste bolão')
    }

    // Busca o Ranking Geral
    const globalBolao = await this.getOrCreateGlobalRanking()
    if (!globalBolao) {
      throw new Error('Não foi possível acessar o Ranking Geral')
    }

    // Adiciona como participante
    await this.addParticipant(bolao.id, userId)
    console.log(`[joinBolaoWithPalpites] Usuário adicionado como participante`)

    // Copia os palpites do Ranking Geral para este bolão
    const PalpitesService = (await import('./palpites.service')).PalpitesService
    await PalpitesService.copyPalpitesToBolao(userId, globalBolao.id, bolao.id)

    console.log(`[joinBolaoWithPalpites] Palpites copiados com sucesso`)

    // Recalcula ranking do grupo
    const RankingService = (await import('./ranking.service')).RankingService
    await RankingService.recalcularRankingGrupo(bolao.id)
    console.log(`[joinBolaoWithPalpites] Ranking do grupo recalculado`)

    // Recalcula Ranking Geral (pode ter novo 1º colocado)
    await RankingService.recalcularRankingGeral()
    console.log(`[joinBolaoWithPalpites] Ranking Geral atualizado`)

    return bolao
  }
}

