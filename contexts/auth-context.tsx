'use client'

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

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao fazer login')
      }

      const data = await response.json()
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
    } catch (error: any) {
      throw error
    }
  }

  const signup = async (userData: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar conta')
      }

      const data = await response.json()
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
    } catch (error: any) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
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

      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
      } else {
        // Se a API falhou mas há sessão, limpa tudo
        setUser(null)
        localStorage.removeItem('user')
      }
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
