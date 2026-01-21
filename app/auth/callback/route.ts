import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

  const supabase = await createServerSupabaseClient()

  if (code) {
    // Fluxo OAuth/magic link com code
    await supabase.auth.exchangeCodeForSession(code)
  } else if (tokenHash && (type === 'signup' || type === 'email_change' || type === 'recovery')) {

  }

  // Faz logout completo e limpa cookies independente do fluxo
  await supabase.auth.signOut()
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  allCookies.forEach(cookie => {
    if (cookie.name.includes('supabase') || cookie.name.includes('auth')) {
      cookieStore.delete(cookie.name)
    }
  })

  // Redireciona para home com parâmetro de confirmação
  return NextResponse.redirect(new URL('/?confirmed=true', requestUrl.origin))
}
