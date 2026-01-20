import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { UsersService } from '@/lib/services/users.service'

/**
 * GET /api/auth/me
 * Retorna os dados atualizados do usuário autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Busca o usuário autenticado
    const dbUser = await UsersService.getCurrentUser()

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Busca email_confirmed_at do Supabase Auth
    const { data: { user: authUser } } = await supabase.auth.getUser()

    // Retorna o usuário com email_confirmed_at do Supabase Auth
    return NextResponse.json({
      user: {
        ...dbUser,
        email_confirmed_at: authUser?.email_confirmed_at || null
      }
    })
  } catch (error: any) {
    console.error('Error in GET /api/auth/me:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar usuário' },
      { status: 500 }
    )
  }
}
