'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [senhaRedefinida, setSenhaRedefinida] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)

  useEffect(() => {
    // Verifica se há uma sessão válida (usuário veio do link do email)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsValidSession(true)
      } else {
        // Tenta obter session do hash/query params
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search)
        
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token')
        const type = hashParams.get('type') || queryParams.get('type')
        
        if (accessToken && type === 'recovery') {
          setIsValidSession(true)
        } else {
          setError('Link inválido ou expirado. Por favor, solicite um novo link de recuperação.')
        }
      }
    }

    checkSession()
  }, [])

  const handleRedefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validações
    if (novaSenha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      })

      if (error) throw error

      setSenhaRedefinida(true)

      // Redireciona após 3 segundos
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidSession && !error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Verificando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-black/60 backdrop-blur-sm rounded-2xl border border-[#ffcc33]/30 p-8">
          {!senhaRedefinida ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ffcc33]/10 rounded-full mb-4">
                  <Lock className="w-8 h-8 text-[#ffcc33]" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Redefinir Senha
                </h1>
                <p className="text-white/60 text-sm">
                  Digite sua nova senha
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                  {error.includes('inválido') && (
                    <div className="mt-2">
                      <Link href="/esqueci-senha" className="underline">
                        Solicitar novo link
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {isValidSession && (
                <form onSubmit={handleRedefinirSenha} className="space-y-4">
                  <div>
                    <Label htmlFor="novaSenha" className="text-white/80">
                      Nova Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="novaSenha"
                        type={showPassword ? 'text' : 'password'}
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        required
                        placeholder="Mínimo 6 caracteres"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmarSenha" className="text-white/80">
                      Confirmar Nova Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmarSenha"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        required
                        placeholder="Digite a senha novamente"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black border border-[#ffcc33] text-white hover:bg-[#ffcc33] hover:text-black transition-all duration-300 shadow-[0_0_6px_rgba(255,204,51,0.6)] hover:shadow-[0_0_12px_rgba(255,204,51,0.8)]"
                  >
                    {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
                  </Button>
                </form>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Senha redefinida com sucesso!
              </h2>
              <p className="text-white/60 text-sm mb-6">
                Você será redirecionado para a página inicial em alguns segundos...
              </p>
              <Link href="/">
                <Button className="w-full bg-black border border-[#ffcc33] text-white hover:bg-[#ffcc33] hover:text-black transition-all duration-300">
                  Ir para o início agora
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
