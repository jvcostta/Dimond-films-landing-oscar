import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    
    // Troca o code por uma sessão apenas para confirmar o email
    await supabase.auth.exchangeCodeForSession(code)
    
    // Faz logout completo
    await supabase.auth.signOut()
    
    // Limpa todos os cookies de autenticação
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    // Remove todos os cookies do Supabase
    allCookies.forEach(cookie => {
      if (cookie.name.includes('supabase') || cookie.name.includes('auth')) {
        cookieStore.delete(cookie.name)
      }
    })
  }

  // Redireciona para home com parâmetro de confirmação
  return NextResponse.redirect(new URL('/?confirmed=true', requestUrl.origin))
}
