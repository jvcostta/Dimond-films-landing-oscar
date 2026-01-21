import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerSupabaseClient()
    
    // Troca o code por uma sessão
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redireciona para a página de destino com confirmação de sucesso
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Se houve erro, redireciona para home
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
