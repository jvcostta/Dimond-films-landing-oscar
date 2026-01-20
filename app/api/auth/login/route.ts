import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { UsersService } from '@/lib/services/users.service'

/**
 * POST /api/auth/login
 * Faz login com email e senha
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erro ao fazer login' },
        { status: 500 }
      )
    }

    // Busca dados completos do usuário
    const user = await UsersService.getUserByAuthId(authData.user.id)

    return NextResponse.json({
      user: {
        ...user,
        email_confirmed_at: authData.user.email_confirmed_at || null
      },
      session: authData.session,
      message: 'Login realizado com sucesso'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error in POST /api/auth/login:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
