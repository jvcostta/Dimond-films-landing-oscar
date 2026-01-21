import { NextRequest, NextResponse } from 'next/server'
import { BoloesService } from '@/lib/services/boloes.service'
import { UsersService } from '@/lib/services/users.service'
import { RankingService } from '@/lib/services/ranking.service'

/**
 * GET /api/boloes
 * Retorna todos os bolões do usuário autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdFromQuery = searchParams.get('userId')

    // Prioriza userId da query, depois tenta sessão do servidor
    let currentUser = null
    if (userIdFromQuery) {
      currentUser = await UsersService.getUserById(userIdFromQuery)
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

    const boloes = await BoloesService.getUserBoloes(currentUser.id)

    return NextResponse.json({ boloes }, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/boloes:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar bolões' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/boloes
 * Cria um novo bolão (individual ou em grupo)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Nome e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    if (!['individual', 'group'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Tipo deve ser "individual" ou "group"' },
        { status: 400 }
      )
    }

    // Prioriza creator_id ou user_id do body, depois tenta sessão do servidor
    let currentUser = null
    const userId = body.creator_id || body.user_id
    
    if (userId) {
      currentUser = await UsersService.getUserById(userId)
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

    // Para bolão individual, redireciona para o Ranking Geral
    if (body.type === 'individual') {
      // Verifica se usuário já tem palpites
      const hasIndividualPalpite = await BoloesService.userHasIndividualPalpite(currentUser.id)
      
      if (hasIndividualPalpite) {
        // Se já tem palpite, apenas retorna o Ranking Geral existente
        const globalBolao = await BoloesService.getOrCreateGlobalRanking()
        
        if (!globalBolao) {
          return NextResponse.json(
            { error: 'Erro ao acessar o Ranking Geral' },
            { status: 500 }
          )
        }
        
        // Garante que está no ranking global
        await BoloesService.addUserToGlobalRanking(currentUser.id)
        
        return NextResponse.json({ 
          bolao: globalBolao,
          message: 'Você já está no Ranking Geral. Use este para fazer seus palpites!'
        }, { status: 200 })
      } else {
        // Se não tem palpite, retorna o Ranking Geral para ele começar
        const globalBolao = await BoloesService.getOrCreateGlobalRanking()
        
        if (!globalBolao) {
          return NextResponse.json(
            { error: 'Erro ao criar o Ranking Geral' },
            { status: 500 }
          )
        }
        
        return NextResponse.json({ 
          bolao: globalBolao,
          message: 'Faça seus palpites no Ranking Geral!'
        }, { status: 200 })
      }
    }

    // Para bolão em grupo, verifica se usuário já tem palpite individual
    if (body.type === 'group') {
      const hasIndividualPalpite = await BoloesService.userHasIndividualPalpite(currentUser.id)
      
      if (!hasIndividualPalpite) {
        return NextResponse.json(
          { error: 'Você precisa fazer seu palpite individual primeiro antes de criar um bolão em grupo' },
          { status: 403 }
        )
      }

      // Cria bolão e copia palpites automaticamente
      const { bolao, inviteCode } = await BoloesService.createGroupBolaoWithPalpites(
        body.name,
        currentUser.id
      )

      // Recalcula o ranking do novo bolão
      try {
        await RankingService.calculateRanking(bolao.id)
        console.log(`Ranking inicial calculado para bolão ${bolao.id}`)
      } catch (error) {
        console.error('Erro ao calcular ranking inicial:', error)
      }

      return NextResponse.json({ 
        bolao, 
        inviteCode,
        message: `Bolão criado! Código: ${inviteCode}` 
      }, { status: 201 })
    }

    // Se chegou aqui, é tipo inválido
    return NextResponse.json(
      { error: 'Tipo de bolão inválido' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error in POST /api/boloes:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar bolão' },
      { status: 500 }
    )
  }
}
