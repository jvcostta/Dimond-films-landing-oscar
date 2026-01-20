import { NextResponse } from 'next/server'
import { BoloesService } from '@/lib/services/boloes.service'

/**
 * GET /api/boloes/[id]/participants
 * Lista todos os participantes de um bolão
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const participants = await BoloesService.getBolaoParticipants(params.id)

    return NextResponse.json({ participants }, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/boloes/[id]/participants:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar participantes' },
      { status: 500 }
    )
  }
}
