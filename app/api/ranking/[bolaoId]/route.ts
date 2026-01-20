import { NextRequest, NextResponse } from 'next/server'
import { RankingService } from '@/lib/services/ranking.service'
import { BoloesService } from '@/lib/services/boloes.service'
import { UsersService } from '@/lib/services/users.service'

interface RouteParams {
  params: {
    bolaoId: string
  }
}

/**
 * GET /api/ranking/[bolaoId]
 * Retorna o ranking completo de um bolão
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('userId')
    
    let currentUser = await UsersService.getCurrentUser()

    // Fallback: tenta buscar pelo userId passado como parâmetro (desenvolvimento)
    if (!currentUser && userIdParam) {
      currentUser = await UsersService.getUserById(userIdParam)
    }

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { bolaoId } = await params

    // Verifica se usuário participa do bolão
    const isParticipant = await BoloesService.isUserParticipant(bolaoId, currentUser.id)
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Usuário não participa deste bolão' },
        { status: 403 }
      )
    }

    const limit = searchParams.get('limit')

    let ranking

    if (limit) {
      ranking = await RankingService.getTopRanking(bolaoId, parseInt(limit))
    } else {
      ranking = await RankingService.getBolaoRanking(bolaoId)
    }

    // Busca estatísticas
    const stats = await RankingService.getRankingStats(bolaoId)

    // Busca posição do usuário atual
    const userRanking = await RankingService.getUserRanking(bolaoId, currentUser.id)

    return NextResponse.json(
      {
        ranking,
        stats,
        userRanking,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error in GET /api/ranking/[bolaoId]:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar ranking' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ranking/[bolaoId]
 * Recalcula o ranking de um bolão
 * (Apenas para testes ou quando os vencedores são definidos)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await UsersService.getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { bolaoId } = params

    // Verifica se usuário participa do bolão
    const isParticipant = await BoloesService.isUserParticipant(bolaoId, currentUser.id)
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Usuário não participa deste bolão' },
        { status: 403 }
      )
    }

    // Recalcula ranking
    await RankingService.calculateRanking(bolaoId)

    // Busca ranking atualizado
    const ranking = await RankingService.getBolaoRanking(bolaoId)

    return NextResponse.json(
      {
        message: 'Ranking recalculado com sucesso',
        ranking,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error in POST /api/ranking/[bolaoId]:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao recalcular ranking' },
      { status: 500 }
    )
  }
}
