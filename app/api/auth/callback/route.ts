import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/auth/callback
 * Fallback que redireciona para a rota de página correta (/auth/callback)
 * Preserva query params para compatibilidade com links de confirmação.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const target = new URL(`/auth/callback${url.search}`, url.origin)
  return NextResponse.redirect(target, { status: 307 })
}
