import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { UsersService } from '@/lib/services/users.service'

/**
 * GET /api/tiebreaker
 * Retorna a resposta de desempate do usuário para um bolão específico
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bolaoId = searchParams.get('bolao_id')
    const userId = searchParams.get('user_id')

    // Tenta pegar usuário da sessão, senão usa o user_id do query param
    let currentUser = await UsersService.getCurrentUser()
    
    if (!currentUser && userId) {
      currentUser = await UsersService.getUserById(userId)
    }

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    if (!bolaoId) {
      return NextResponse.json(
        { error: 'bolao_id é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('tiebreaker_answers')
      .select('*')
      .eq('bolao_id', bolaoId)
      .eq('user_id', currentUser.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error
    }

    return NextResponse.json({ answer: data?.answer || null }, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/tiebreaker:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar resposta de desempate' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tiebreaker
 * Salva ou atualiza a resposta de desempate do usuário
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bolao_id, answer } = body

    // Tenta pegar usuário da sessão, senão usa o user_id do body
    let currentUser = await UsersService.getCurrentUser()
    
    if (!currentUser && body.user_id) {
      currentUser = await UsersService.getUserById(body.user_id)
    }

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    if (!bolao_id || !answer) {
      return NextResponse.json(
        { error: 'bolao_id e answer são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Usa upsert para inserir ou atualizar
    const { data, error } = await supabase
      .from('tiebreaker_answers')
      .upsert({
        bolao_id,
        user_id: currentUser.id,
        answer,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'bolao_id,user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ 
      message: 'Resposta de desempate salva com sucesso',
      data 
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error in POST /api/tiebreaker:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao salvar resposta de desempate' },
      { status: 500 }
    )
  }
}
