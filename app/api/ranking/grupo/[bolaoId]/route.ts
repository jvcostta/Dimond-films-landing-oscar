import { NextRequest, NextResponse } from 'next/server'
import { RankingService } from '@/lib/services/ranking.service'

/**
 * GET /api/ranking/grupo/:bolaoId
 * Busca o ranking interno de um grupo
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bolaoId: string }> }
) {
  try {
    const { bolaoId } = await params

    if (!bolaoId) {
      return NextResponse.json(
        { error: 'ID do bolão é obrigatório' },
        { status: 400 }
      )
    }

    const ranking = await RankingService.getRankingGrupo(bolaoId)

    return NextResponse.json({
      success: true,
      ranking,
      total: ranking.length
    })
  } catch (error: any) {
    console.error('❌ Erro ao buscar ranking do grupo:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar ranking do grupo' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ranking/grupo/:bolaoId
 * Recalcula o ranking de um grupo
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bolaoId: string }> }
) {
  try {
    const { bolaoId } = await params

    if (!bolaoId) {
      return NextResponse.json(
        { error: 'ID do bolão é obrigatório' },
        { status: 400 }
      )
    }

    await RankingService.recalcularRankingGrupo(bolaoId)

    // Busca ranking atualizado
    const ranking = await RankingService.getRankingGrupo(bolaoId)

    return NextResponse.json({
      success: true,
      message: 'Ranking do grupo recalculado com sucesso',
      ranking,
      total: ranking.length
    })
  } catch (error: any) {
    console.error('❌ Erro ao recalcular ranking do grupo:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao recalcular ranking do grupo' },
      { status: 500 }
    )
  }
}
