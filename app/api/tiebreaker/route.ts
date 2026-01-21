// ROTA DESABILITADA - TIEBREAKER FOI REMOVIDO DO SISTEMA
// Mantido aqui apenas para referência histórica
// Não é mais utilizado no fluxo da aplicação

import { NextResponse } from 'next/server'

/**
 * Esta rota foi desabilitada pois o critério de desempate por frase foi removido.
 * Agora o desempate é feito apenas por:
 * 1. Acerto da categoria "Melhor Filme"
 * 2. Data/hora de envio (quem enviou primeiro)
 */

export async function GET() {
  return NextResponse.json(
    { error: 'Esta rota foi desabilitada' },
    { status: 410 } // 410 Gone
  )
}

export async function POST() {
  return NextResponse.json(
    { error: 'Esta rota foi desabilitada' },
    { status: 410 } // 410 Gone
  )
}
