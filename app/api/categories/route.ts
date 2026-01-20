import { NextRequest, NextResponse } from 'next/server'
import { PalpitesService } from '@/lib/services/palpites.service'

/**
 * GET /api/categories
 * Retorna todas as categorias com seus indicados
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const withNominees = searchParams.get('nominees') === 'true'

    let data

    if (withNominees) {
      data = await PalpitesService.getCategoriesWithNominees()
    } else {
      data = await PalpitesService.getAllCategories()
    }

    return NextResponse.json({ categories: data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/categories:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar categorias' },
      { status: 500 }
    )
  }
}
