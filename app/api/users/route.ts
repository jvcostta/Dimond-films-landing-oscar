import { NextRequest, NextResponse } from 'next/server'
import { UsersService } from '@/lib/services/users.service'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/users
 * Retorna o usuário autenticado atual
 */
export async function GET() {
  try {
    const user = await UsersService.getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar usuário' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/users
 * Cria um novo usuário fazendo signup no Supabase Auth e criando registro no banco
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação básica
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // 1. Primeiro cria o usuário no Supabase Auth (signup)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      // Trata erro de email duplicado
      if (authError.message?.includes('already registered') || authError.message?.includes('User already registered')) {
        return NextResponse.json(
          { error: 'Este email já está sendo usado por outro usuário' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário no Auth' },
        { status: 500 }
      )
    }

    // 2. Cria o registro na tabela users usando admin client (bypassa RLS)
    const adminClient = createAdminClient()
    const { data: user, error: dbError } = await adminClient
      .from('users')
      .insert({
        auth_id: authData.user.id,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        state: body.state || null,
        city: body.city || null,
        birth_date: body.birth_date || null,
        favorite_genre: body.favorite_genre || null,
        cinema_network: body.cinema_network || null,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      // Se falhar ao criar no DB, limpa o auth user
      await adminClient.auth.admin.deleteUser(authData.user.id)
      
      // Trata erro de chave duplicada
      if (dbError.message?.includes('duplicate key') || dbError.code === '23505') {
        return NextResponse.json(
          { error: 'Este email já está sendo usado por outro usuário' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      user: {
        ...user,
        email_confirmed_at: authData.user.email_confirmed_at || null
      },
      message: 'Usuário criado com sucesso'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/users:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/users
 * Atualiza dados do usuário autenticado
 */
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await UsersService.getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Remove campos que não devem ser atualizados
    const { id, auth_id, created_at, ...updateData } = body

    const updatedUser = await UsersService.updateUser(currentUser.id, updateData)

    return NextResponse.json({ user: updatedUser }, { status: 200 })
  } catch (error: any) {
    console.error('Error in PATCH /api/users:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar usuário' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/users
 * Deleta o usuário autenticado
 */
export async function DELETE() {
  try {
    const currentUser = await UsersService.getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const success = await UsersService.deleteUser(currentUser.id)

    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao deletar usuário' },
        { status: 500 }
      )
    }

    // Também deleta do Supabase Auth
    const supabase = await createServerSupabaseClient()
    await supabase.auth.admin.deleteUser(currentUser.auth_id)

    return NextResponse.json(
      { message: 'Usuário deletado com sucesso' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error in DELETE /api/users:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar usuário' },
      { status: 500 }
    )
  }
}
