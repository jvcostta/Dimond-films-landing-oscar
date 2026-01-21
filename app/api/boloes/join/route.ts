import { NextRequest, NextResponse } from 'next/server'
import { BoloesService } from '@/lib/services/boloes.service'
import { UsersService } from '@/lib/services/users.service'
import { RankingService } from '@/lib/services/ranking.service'

/**
 * POST /api/boloes/join
 * Entra em um bolão usando invite_code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('POST /api/boloes/join - Body:', body)

    if (!body.invite_code) {
      return NextResponse.json(
        { error: 'Código do bolão é obrigatório' },
        { status: 400 }
      )
    }

    // Prioriza user_id do body, depois tenta sessão do servidor
    let currentUser = null
    if (body.user_id) {
      console.log('Trying user_id from body:', body.user_id)
      currentUser = await UsersService.getUserById(body.user_id)
      console.log('getUserById result:', currentUser ? 'found' : 'null')
    }
    
    if (!currentUser) {
      console.log('Falling back to getCurrentUser')
      currentUser = await UsersService.getCurrentUser()
      console.log('getCurrentUser result:', currentUser ? 'found' : 'null')
    }

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    console.log('User authenticated:', currentUser.id)

    // Verifica se o usuário tem palpite individual antes de entrar no grupo
    const hasIndividualPalpite = await BoloesService.userHasIndividualPalpite(currentUser.id)
    
    if (!hasIndividualPalpite) {
      return NextResponse.json(
        { error: 'Você precisa fazer seu palpite individual primeiro antes de entrar em um bolão em grupo' },
        { status: 403 }
      )
    }

    // Entra no bolão e copia palpites automaticamente
    const bolao = await BoloesService.joinBolaoWithPalpites(
      body.invite_code,
      currentUser.id
    )

    // Recalcula o ranking do bolão após novo participante
    try {
      await RankingService.calculateRanking(bolao.id)
      console.log(`Ranking recalculado após ${currentUser.name} entrar no bolão ${bolao.id}`)
    } catch (error) {
      console.error('Erro ao recalcular ranking:', error)
    }

    return NextResponse.json({ 
      bolao,
      message: `Você entrou no bolão "${bolao.name}"!` 
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error in POST /api/boloes/join:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao entrar no bolão' },
      { status: 500 }
    )
  }
}
