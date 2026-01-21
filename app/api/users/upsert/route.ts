import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'

type Payload = {
  auth_id: string
  name: string
  email: string
  phone?: string | null
  state?: string | null
  city?: string | null
  birth_date?: string | null
  favorite_genre?: string | null
  cinema_network?: string | null
}

export async function POST(req: Request) {
  // Try to use provided payload from client first
  let body: Partial<Payload> | null = null
  try {
    body = await req.json()
  } catch {}

  const hasBody = body && typeof body === 'object' && !!body.auth_id && !!body.email && !!body.name

  // Prefer admin client to bypass cookie/session issues (safe if route is protected by unique constraints)
  const admin = createAdminClient()

  if (hasBody) {
    const safePayload: Payload = {
      auth_id: String(body!.auth_id),
      name: String(body!.name),
      email: String(body!.email).toLowerCase(),
      phone: body!.phone ?? null,
      state: body!.state ?? null,
      city: body!.city ?? null,
      birth_date: body!.birth_date ?? null,
      favorite_genre: body!.favorite_genre ?? null,
      cinema_network: body!.cinema_network ?? null,
    }
    const { error } = await admin
      .from('users')
      .upsert(safePayload, { onConflict: 'auth_id' })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  // Fallback: use server client session when available
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const u = session.user
  const meta = u.user_metadata || {}
  const payload: Payload = {
    auth_id: u.id,
    name: (meta.name as string) || (u.email?.split('@')[0] || 'Usuário'),
    email: u.email!,
    phone: (meta.phone as string) || null,
    state: (meta.state as string) || null,
    city: (meta.city as string) || null,
    birth_date: (meta.birth_date as string) ? new Date(meta.birth_date as string).toISOString().slice(0, 10) : null,
    favorite_genre: (meta.favorite_genre as string) || null,
    cinema_network: (meta.cinema_network as string) || null,
  }

  const { error } = await admin
    .from('users')
    .upsert(payload, { onConflict: 'auth_id' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
