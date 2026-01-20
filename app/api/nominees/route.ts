import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * GET /api/nominees
 * Lista todos os nominees ou filtra por categoria
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('nominees')
      .select(`
        *,
        category:category_id (
          id,
          name,
          display_order
        )
      `)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data: nominees, error } = await query.order('name', { ascending: true })

    if (error) {
      console.error('Error fetching nominees:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ nominees }, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/nominees:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar nominees' },
      { status: 500 }
    )
  }
}
