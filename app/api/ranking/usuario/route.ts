import { NextRequest, NextResponse } from 'next/server'
import { RankingService } from '@/lib/services/ranking.service'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * GET /api/ranking/usuario
 * Busca posição do usuário no Ranking Geral + posição no grupo (se tiver)
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Busca usuário logado do Supabase Auth
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Busca o usuário na tabela users pelo auth_id
    const { data: dbUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', authUser.id)
      .single()

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado no banco' },
        { status: 404 }
      )
    }

    // Busca posição no Ranking Geral usando o user_id correto
    const posicaoGeral = await RankingService.getPosicaoUsuarioRankingGeral(dbUser.id)

    // Busca grupos do usuário usando o user_id correto
    const { data: grupos, error: gruposError } = await supabase
      .from('bolao_participants')
      .select(`
        bolao_id,
        bolao:boloes (
          id,
          name,
          type
        )
      `)
      .eq('user_id', dbUser.id)

    if (gruposError) {
      console.error('❌ Erro ao buscar grupos:', gruposError)
    }

    // Busca posição em cada grupo
    const posicoesGrupos = []
    if (grupos) {
      for (const participacao of grupos) {
        if (participacao.bolao?.type === 'group') {
          const posicaoGrupo = await RankingService.getPosicaoUsuarioNoGrupo(
            participacao.bolao_id,
            dbUser.id
          )
          
          const posicaoGrupoRankingGeral = await RankingService.getPosicaoGrupoRankingGeral(
            participacao.bolao_id
          )

          posicoesGrupos.push({
            bolao: participacao.bolao,
            posicaoNoGrupo: posicaoGrupo,
            posicaoGrupoNoRankingGeral: posicaoGrupoRankingGeral
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      rankingGeral: posicaoGeral,
      grupos: posicoesGrupos
    })
  } catch (error: any) {
    console.error('❌ Erro ao buscar posições do usuário:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar posições do usuário' },
      { status: 500 }
    )
  }
}
