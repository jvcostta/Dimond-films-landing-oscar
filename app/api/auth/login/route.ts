import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/login
 * Faz login com email e senha
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: 'Auth API desativada' }, { status: 410 })
}
