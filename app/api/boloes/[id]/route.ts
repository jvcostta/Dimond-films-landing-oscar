import { NextRequest, NextResponse } from 'next/server'
import { BoloesService } from '@/lib/services/boloes.service'
import { UsersService } from '@/lib/services/users.service'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/boloes/[id]
 * Retorna informações de um bolão específico
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await UsersService.getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { id } = params

    // Verifica se usuário participa do bolão
    const isParticipant = await BoloesService.isUserParticipant(id, currentUser.id)
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Usuário não participa deste bolão' },
        { status: 403 }
      )
    }

    const bolao = await BoloesService.getBolaoById(id)

    if (!bolao) {
      return NextResponse.json(
        { error: 'Bolão não encontrado' },
        { status: 404 }
      )
    }

    // Busca participantes
    const participants = await BoloesService.getBolaoParticipants(id)

    return NextResponse.json(
      { bolao, participants },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error in GET /api/boloes/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar bolão' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/boloes/[id]
 * Deleta um bolão (apenas o criador pode deletar)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await UsersService.getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { id } = params

    const bolao = await BoloesService.getBolaoById(id)

    if (!bolao) {
      return NextResponse.json(
        { error: 'Bolão não encontrado' },
        { status: 404 }
      )
    }

    // Verifica se é o criador
    if (bolao.creator_id !== currentUser.id) {
      return NextResponse.json(
        { error: 'Apenas o criador pode deletar o bolão' },
        { status: 403 }
      )
    }

    const success = await BoloesService.deleteBolao(id)

    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao deletar bolão' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Bolão deletado com sucesso' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error in DELETE /api/boloes/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar bolão' },
      { status: 500 }
    )
  }
}
