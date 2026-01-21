import { NextRequest, NextResponse } from 'next/server'
import { BoloesService } from '@/lib/services/boloes.service'
import { UsersService } from '@/lib/services/users.service'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * POST /api/boloes/[id]/join
 * Entrada em um bolão via ID ou invite_code
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()

    // Prioriza user_id do body, depois tenta sessão do servidor
    let currentUser = null
    if (body.user_id) {
      currentUser = await UsersService.getUserById(body.user_id)
    }
    
    if (!currentUser) {
      currentUser = await UsersService.getCurrentUser()
    }

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    let bolao

    // Se vier invite_code no body, busca por ele
    if (body.invite_code) {
      bolao = await BoloesService.getBolaoByInviteCode(body.invite_code)
    } else {
      // Senão busca por ID
      bolao = await BoloesService.getBolaoById(id)
    }

    if (!bolao) {
      return NextResponse.json(
        { error: 'Bolão não encontrado' },
        { status: 404 }
      )
    }

    // Verifica se é bolão em grupo
    if (bolao.type !== 'group') {
      return NextResponse.json(
        { error: 'Apenas bolões em grupo aceitam novos participantes' },
        { status: 400 }
      )
    }

    // Verifica se já participa
    const isParticipant = await BoloesService.isUserParticipant(bolao.id, currentUser.id)
    if (isParticipant) {
      return NextResponse.json(
        { error: 'Usuário já participa deste bolão', bolao },
        { status: 409 }
      )
    }

    // Adiciona participante
    await BoloesService.addParticipant(bolao.id, currentUser.id)

    return NextResponse.json(
      {
        message: 'Entrada realizada com sucesso',
        bolao,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error in POST /api/boloes/[id]/join:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao entrar no bolão' },
      { status: 500 }
    )
  }
}
