import { NextResponse } from 'next/server'

/**
 * GET /api/auth/me
 * Retorna os dados atualizados do usuário autenticado
 */
export async function GET() {
  return NextResponse.json({ error: 'Auth API desativada' }, { status: 410 })
}
