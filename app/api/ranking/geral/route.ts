import { NextRequest, NextResponse } from 'next/server'
import { RankingService } from '@/lib/services/ranking.service'

/**
 * GET /api/ranking/geral
 * Busca o Ranking Geral (usuários individuais + 1º de cada grupo)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    const ranking = await RankingService.getRankingGeral(limit)

    return NextResponse.json({
      success: true,
      ranking,
      total: ranking.length
    })
  } catch (error: any) {
    console.error('❌ Erro ao buscar Ranking Geral:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar Ranking Geral' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ranking/geral
 * Recalcula o Ranking Geral
 */
export async function POST() {
  try {
    await RankingService.recalcularRankingGeral()

    // Busca ranking atualizado
    const ranking = await RankingService.getRankingGeral()

    return NextResponse.json({
      success: true,
      message: 'Ranking Geral recalculado com sucesso',
      ranking,
      total: ranking.length
    })
  } catch (error: any) {
    console.error('❌ Erro ao recalcular Ranking Geral:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao recalcular Ranking Geral' },
      { status: 500 }
    )
  }
}
