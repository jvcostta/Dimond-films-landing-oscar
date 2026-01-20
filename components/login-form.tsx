'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-black/60 backdrop-blur-sm rounded-2xl border border-white/10">
      <h2 className="text-2xl font-bold text-center mb-6 text-[#ffffff]">
        Login
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-white/80">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/10 border-white/20 text-white"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="password" className="text-white/80">Senha</Label>
            <a 
              href="/esqueci-senha" 
              className="text-xs text-[#ffcc33] hover:text-[#ffcc33]/80 transition-colors"
            >
              Esqueceu a senha?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/10 border-white/20 text-white"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black border border-[#ffcc33] text-[#ffffff] hover:bg-[#ffcc33] hover:text-black transition-all duration-300 shadow-[0_0_6px_rgba(255,204,51,0.6)] hover:shadow-[0_0_12px_rgba(255,204,51,0.8)]"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </div>
  )
}
