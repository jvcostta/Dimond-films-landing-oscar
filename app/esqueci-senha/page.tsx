'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const sanitizedEmail = email.trim().toLowerCase()
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })

      if (error) throw error

      setEmailEnviado(true)
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email de recuperação')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Botão Voltar */}
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o início
        </Link>

        {/* Card Principal */}
        <div className="bg-black/60 backdrop-blur-sm rounded-2xl border border-[#ffcc33]/30 p-8">
          {!emailEnviado ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ffcc33]/10 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-[#ffcc33]" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Esqueceu sua senha?
                </h1>
                <p className="text-white/60 text-sm">
                  Digite seu email e enviaremos um link para redefinir sua senha
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-white/80">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black border border-[#ffcc33] text-white hover:bg-[#ffcc33] hover:text-black transition-all duration-300 shadow-[0_0_6px_rgba(255,204,51,0.6)] hover:shadow-[0_0_12px_rgba(255,204,51,0.8)]"
                >
                  {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Email enviado!
              </h2>
              <p className="text-white/60 text-sm mb-6">
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                Se não encontrar o email, verifique a pasta de spam.
              </p>
              <Link href="/">
                <Button className="w-full bg-black border border-[#ffcc33] text-white hover:bg-[#ffcc33] hover:text-black transition-all duration-300">
                  Voltar para o início
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
