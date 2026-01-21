import { NextRequest, NextResponse } from 'next/server'
import { BoloesService } from '@/lib/services/boloes.service'
import { UsersService } from '@/lib/services/users.service'

/**
 * GET /api/boloes/global
 * Retorna o bolão global "Ranking Geral"
 * Cria automaticamente se não existir
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[API /api/boloes/global] GET - Iniciando busca...')
    
    // Busca ou cria o ranking global
    const globalBolao = await BoloesService.getOrCreateGlobalRanking()

    console.log('[API /api/boloes/global] Resultado:', globalBolao ? 'Sucesso' : 'Null')

    if (!globalBolao) {
      console.error('[API /api/boloes/global] ERRO: getOrCreateGlobalRanking retornou null')
      return NextResponse.json(
        { error: 'Erro ao acessar o Ranking Geral. Verifique se há usuários no sistema.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ bolao: globalBolao }, { status: 200 })
  } catch (error: any) {
    console.error('[API /api/boloes/global] Exception:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar Ranking Geral' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/boloes/global
 * Adiciona o usuário ao Ranking Geral
 */
export async function POST(request: NextRequest) {
  try {
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

    // Adiciona ao ranking global
    await BoloesService.addUserToGlobalRanking(currentUser.id)

    // Busca o bolão atualizado
    const globalBolao = await BoloesService.getOrCreateGlobalRanking()

    return NextResponse.json({ 
      bolao: globalBolao,
      message: 'Você foi adicionado ao Ranking Geral!'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error in POST /api/boloes/global:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao entrar no Ranking Geral' },
      { status: 500 }
    )
  }
}
