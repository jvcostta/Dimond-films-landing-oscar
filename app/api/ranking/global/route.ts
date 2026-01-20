import { NextRequest, NextResponse } from 'next/server'
import { RankingService } from '@/lib/services/ranking.service'

/**
 * GET /api/ranking/global
 * Retorna o ranking global (soma de todos os bolões)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')

    const ranking = await RankingService.getGlobalRanking(
      limit ? parseInt(limit) : 100
    )

    return NextResponse.json({ ranking }, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/ranking/global:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar ranking global' },
      { status: 500 }
    )
  }
}
