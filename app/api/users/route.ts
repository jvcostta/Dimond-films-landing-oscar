import { NextRequest, NextResponse } from 'next/server'

// Authentication endpoints disabled while refactoring auth.
export async function GET() {
  return NextResponse.json({ error: 'Auth/users API desativada' }, { status: 410 })
}

export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: 'Auth/users API desativada' }, { status: 410 })
}

export async function PATCH(_request: NextRequest) {
  return NextResponse.json({ error: 'Auth/users API desativada' }, { status: 410 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Auth/users API desativada' }, { status: 410 })
}
