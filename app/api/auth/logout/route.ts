import { NextResponse } from 'next/server'

/**
 * POST /api/auth/logout
 * Faz logout do usuário
 */
export async function POST() {
  return NextResponse.json({ error: 'Auth API desativada' }, { status: 410 })
}
