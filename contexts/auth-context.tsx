"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

type User = {
  id: string
  name: string
  email: string
  city?: string
  state?: string
  email_confirmed_at?: string | null
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (data: any) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verifica se há usuário logado no localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // Verifica se há sessão ativa no Supabase
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Se há sessão no Supabase mas não no localStorage, sincroniza
        if (!storedUser) {
          await refreshUser()
        }
      }
      setIsLoading(false)
    }

    checkSession()

    // Escuta mudanças na autenticação do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Usuário fez login ou token foi renovado
        await refreshUser()
        try {
          const started = localStorage.getItem('auth_login_start')
          const dest = localStorage.getItem('auth_login_dest')
          if (started === 'true') {
            localStorage.removeItem('auth_login_start')
            localStorage.removeItem('auth_login_dest')
            if (dest) {
              // Rola para a seção desejada após autenticação
              const hash = dest.startsWith('#') ? dest : `#${dest}`
              // Defer to ensure DOM is ready
              setTimeout(() => {
                try {
                  if (typeof window !== 'undefined') {
                    if (!window.location.hash || window.location.hash !== hash) {
                      window.location.hash = hash
                    }
                    const el = document.getElementById(hash.replace('#', ''))
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                } catch {}
              }, 50)
            }
          }
        } catch {}
      } else if (event === 'SIGNED_OUT') {
        // Usuário fez logout
        setUser(null)
        localStorage.removeItem('user')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (_email: string, _password: string) => {
    // Marca início do fluxo para pós-login rolar até a seção
    localStorage.setItem('auth_login_start', 'true')
    localStorage.setItem('auth_login_dest', 'meu-palpite')

    const email = _email.trim().toLowerCase()
    const password = _password
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    if (data?.user) {
      await refreshUser()
    }
  }

  const signup = async (_data: any) => {
    // Marca início do fluxo para pós-confirmação rolar até a seção
    localStorage.setItem('auth_login_start', 'true')
    localStorage.setItem('auth_login_dest', 'meu-palpite')

    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const emailRedirectTo = origin ? `${origin}/auth/callback?dest=%23meu-palpite` : undefined

    const sanitizedEmail = (_data.email || '').trim().toLowerCase()
    const { error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password: _data.password,
      options: {
        emailRedirectTo,
        data: {
          name: _data.name,
          phone: _data.phone,
          state: _data.state,
          city: _data.city,
          birth_date: _data.birth_date,
          favorite_genre: _data.favorite_genre,
          cinema_network: _data.cinema_network,
        },
      },
    })
    if (error) throw new Error(error.message)
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('user')
    }
  }

  const refreshUser = async () => {
    try {
      // Verifica se há sessão ativa no Supabase
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setUser(null)
        localStorage.removeItem('user')
        return
      }

      // Mapeia usuário diretamente do Supabase
      const supaUser = session.user
      const mapped: User = {
        id: supaUser.id,
        name: (supaUser.user_metadata?.name as string) || supaUser.email?.split('@')[0] || 'Usuário',
        email: supaUser.email || '',
        city: supaUser.user_metadata?.city,
        state: supaUser.user_metadata?.state,
        email_confirmed_at: (supaUser.email_confirmed_at as string | null) || null,
      }
      setUser(mapped)
      localStorage.setItem('user', JSON.stringify(mapped))

      // Garante que exista registro correspondente na tabela 'users'
      try {
        await fetch('/api/users/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_id: mapped.id,
            name: mapped.name,
            email: mapped.email,
            state: mapped.state ?? null,
            city: mapped.city ?? null,
          }),
        })
      } catch {}
    } catch (error) {
      console.error('Erro ao recarregar usuário:', error)
      setUser(null)
      localStorage.removeItem('user')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
