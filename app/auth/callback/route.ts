import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    
    // Troca o code por uma sessão apenas para confirmar o email
    await supabase.auth.exchangeCodeForSession(code)
    
    // Sempre faz logout para forçar login manual
    await supabase.auth.signOut()
  }

  // Redireciona para home com parâmetro de confirmação
  return NextResponse.redirect(new URL('/?confirmed=true', requestUrl.origin))
}
