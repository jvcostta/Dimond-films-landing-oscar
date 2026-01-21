import { NextRequest, NextResponse } from 'next/server'
import { PalpitesService } from '@/lib/services/palpites.service'
import { BoloesService } from '@/lib/services/boloes.service'
import { UsersService } from '@/lib/services/users.service'
import { RankingService } from '@/lib/services/ranking.service'

/**
 * GET /api/palpites
 * Retorna palpites individuais do usuário (do Ranking Geral)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    // Prioriza user_id da query, depois tenta sessão do servidor
    let currentUser = null
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

    const palpites = await PalpitesService.getUserIndividualPalpites(currentUser.id)

    return NextResponse.json({ palpites }, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/palpites:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar palpites' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/palpites
 * Cria palpites no Ranking Geral (palpites individuais)
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

    // Busca o Ranking Geral
    const globalBolao = await BoloesService.getOrCreateGlobalRanking()
    if (!globalBolao) {
      return NextResponse.json(
        { error: 'Erro ao acessar o Ranking Geral' },
        { status: 500 }
      )
    }

    // Verifica se o usuário já completou os palpites individuais
    const hasCompletedPalpites = await PalpitesService.hasCompletedIndividualPalpites(currentUser.id)
    
    if (hasCompletedPalpites) {
      return NextResponse.json(
        { error: 'Você já completou todos os seus palpites. Para alterar, edite os palpites existentes.' },
        { status: 403 }
      )
    }

    // Aceita tanto um único palpite quanto array de palpites
    const palpitesData = Array.isArray(body) ? body : [body]

    // Validação
    for (const palpite of palpitesData) {
      if (!palpite.category_id || !palpite.nominee_id) {
        return NextResponse.json(
          { error: 'category_id e nominee_id são obrigatórios' },
          { status: 400 }
        )
      }
    }

    // Adiciona user_id e bolao_id (Ranking Geral) a todos os palpites
    const palpitesWithUser = palpitesData.map(p => ({
      category_id: p.category_id,
      nominee_id: p.nominee_id,
      user_id: currentUser.id,
      bolao_id: globalBolao.id,
    }))

    // Salva palpites
    const palpites = await PalpitesService.createMultiplePalpites(palpitesWithUser)

    // Adiciona usuário ao Ranking Geral automaticamente
    try {
      await BoloesService.addUserToGlobalRanking(currentUser.id)
      console.log(`Usuário ${currentUser.id} adicionado ao Ranking Geral`)
    } catch (globalError: any) {
      console.error('Erro ao adicionar ao Ranking Geral:', globalError)
    }

    // Recalcula rankings de todos os bolões do usuário (incluindo global)
    try {
      const userBoloes = await BoloesService.getUserBoloes(currentUser.id)
      
      // Recalcula o ranking de cada bolão do usuário
      await Promise.all(
        userBoloes.map(bolao => RankingService.calculateRanking(bolao.id))
      )
      
      console.log(`Rankings recalculados para ${userBoloes.length} bolões do usuário ${currentUser.id}`)
    } catch (rankingError: any) {
      console.error('Erro ao recalcular rankings:', rankingError)
      // Não falha a requisição se o ranking falhar, apenas loga o erro
    }

    return NextResponse.json({ palpites }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/palpites:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar palpites' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/palpites/:id
 * Atualiza um palpite específico
 */
export async function PATCH(request: NextRequest) {
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

    if (!body.id || !body.nominee_id) {
      return NextResponse.json(
        { error: 'id e nominee_id são obrigatórios' },
        { status: 400 }
      )
    }

    const palpite = await PalpitesService.updatePalpite(body.id, {
      nominee_id: body.nominee_id,
    })

    // Recalcula rankings de todos os bolões do usuário
    try {
      const userBoloes = await BoloesService.getUserBoloes(currentUser.id)
      await Promise.all(
        userBoloes.map(bolao => RankingService.calculateRanking(bolao.id))
      )
      console.log(`Rankings recalculados após atualização de palpite`)
    } catch (rankingError: any) {
      console.error('Erro ao recalcular rankings:', rankingError)
    }

    return NextResponse.json({ palpite }, { status: 200 })
  } catch (error: any) {
    console.error('Error in PATCH /api/palpites:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar palpite' },
      { status: 500 }
    )
  }
}
