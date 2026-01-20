"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Users, Home, Bell, Trophy, UsersRound, X, Mail } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface GameModeSelectorProps {
  onSelect: (mode: "individual" | "group", bolaoId: string, link?: string) => void
  onBack: () => void
}

export function GameModeSelector({ onSelect, onBack }: GameModeSelectorProps) {
  const { user, refreshUser } = useAuth()
  const [selectedMode, setSelectedMode] = useState<"individual" | "group" | null>(null)
  const [groupAction, setGroupAction] = useState<"create" | "join" | null>(null)
  const [groupName, setGroupName] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showRankingAlert, setShowRankingAlert] = useState(false)
  const [showEmailAlert, setShowEmailAlert] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  const handleCheckEmailConfirmation = async () => {
    setIsCheckingEmail(true)
    setError("")
    try {
      await refreshUser()
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        if (data.user.email_confirmed_at) {
          setShowEmailAlert(false)
          // Força atualização do contexto
          setTimeout(() => window.location.reload(), 500)
        } else {
          setError('Email ainda não foi confirmado. Verifique sua caixa de entrada.')
        }
      } else {
        setError('Erro ao verificar confirmação. Tente novamente.')
      }
    } catch (err) {
      console.error('Erro ao verificar email:', err)
      setError('Erro ao verificar confirmação')
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const handleContinue = async () => {
    if (!user) {
      setError("Você precisa estar logado para continuar")
      return
    }

    // Verificar email confirmado apenas para modo individual
    if (selectedMode === "individual" && !user.email_confirmed_at) {
      setShowEmailAlert(true)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      if (selectedMode === "individual" || (selectedMode === "group" && groupAction === "create")) {
        // Criar novo bolão
        const response = await fetch('/api/boloes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: selectedMode === "individual" ? `Bolão de ${user.name}` : groupName,
            type: selectedMode,
            creator_id: user.id,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao criar bolão')
        }
        
        if (selectedMode === "individual") {
          onSelect("individual", data.bolao.id)
        } else if (selectedMode === "group") {
          onSelect("group", data.bolao.id, data.bolao.invite_code)
        }
      } else if (selectedMode === "group" && groupAction === "join") {
        // Entrar em um bolão existente usando invite_code
        const response = await fetch(`/api/boloes/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invite_code: inviteCode.trim(),
            user_id: user.id,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao entrar no bolão')
        }

        onSelect("group", data.bolao.id)
      }
    } catch (err: any) {
      console.error('Erro ao processar bolão:', err)
      setError(err.message || "Erro ao processar bolão")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-4xl">
        {/* Back to home button */}
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-8 text-white/60 hover:text-white hover:bg-white/5"
        >
          <Home className="w-4 h-4 mr-2" />
          Voltar para início
        </Button>
        
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60 uppercase tracking-widest">Etapa 2 de 4</span>
            <span className="text-sm text-white/60">50%</span>
          </div>
          <div className="w-full h-px bg-white/10">
            <div className="h-full w-1/2 bg-gradient-to-r from-amber-400/50 to-amber-400" />
          </div>
        </div>

        <div className="space-y-12">
          <div className="text-center space-y-6">
            {/* Decorative line above */}
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-[0.08em] text-white drop-shadow-2xl leading-[1.15] uppercase">
                Escolha seu Modo de Jogo
              </h2>
              <p className="text-lg md:text-xl font-light text-white/70 tracking-wide">Como você quer participar?</p>
              
              {error && (
                <div className="max-w-md mx-auto p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}
            </div>
            
            {/* Decorative line below */}
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Individual Mode */}
            <button
              onClick={() => setSelectedMode("individual")}
              className={`group relative p-8 border rounded-sm transition-all duration-300 text-left ${
                selectedMode === "individual"
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
              }`}
            >
              <div className="space-y-6">
                <div
                  className={`w-16 h-16 rounded-sm border flex items-center justify-center transition-colors ${
                    selectedMode === "individual" ? "border-amber-400 bg-amber-400/20" : "border-white/20 bg-white/5"
                  }`}
                >
                  <User className="w-8 h-8" strokeWidth={1.5} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-light tracking-wide">Jogar Individualmente</h3>
                  <p className="text-white/70 leading-relaxed font-light">
                    Participa automaticamente do ranking geral e disputa contra todos os participantes.
                  </p>
                </div>
              </div>

              {selectedMode === "individual" && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                  <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>

            {/* Group Mode */}
            <button
              onClick={() => setSelectedMode("group")}
              className={`group relative p-8 border rounded-sm transition-all duration-300 text-left ${
                selectedMode === "group"
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
              }`}
            >
              <div className="space-y-6">
                <div
                  className={`w-16 h-16 rounded-sm border flex items-center justify-center transition-colors ${
                    selectedMode === "group" ? "border-amber-400 bg-amber-400/20" : "border-white/20 bg-white/5"
                  }`}
                >
                  <Users className="w-8 h-8" strokeWidth={1.5} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-light tracking-wide">Bolão em Grupo</h3>
                  <p className="text-white/70 leading-relaxed font-light">
                    Cria um bolão personalizado com ranking interno do grupo + ranking geral.
                  </p>
                </div>
              </div>

              {selectedMode === "group" && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                  <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Group name input */}
          {selectedMode === "group" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Escolher ação: criar ou entrar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setGroupAction("create")
                    setInviteCode("")
                    setShowRankingAlert(true)
                  }}
                  className={`p-6 border rounded-sm transition-all duration-300 text-left ${
                    groupAction === "create"
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-white/20 bg-white/5 hover:border-white/40"
                  }`}
                >
                  <h4 className="text-lg font-medium mb-2">Iniciar Palpite</h4>
                  <p className="text-sm text-white/60">Crie um novo bolão e compartilhe o código</p>
                </button>

                <button
                  onClick={() => {
                    setGroupAction("join")
                    setGroupName("")
                    setShowRankingAlert(true)
                  }}
                  className={`p-6 border rounded-sm transition-all duration-300 text-left ${
                    groupAction === "join"
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-white/20 bg-white/5 hover:border-white/40"
                  }`}
                >
                  <h4 className="text-lg font-medium mb-2">Entrar em um Bolão</h4>
                  <p className="text-sm text-white/60">Use o código de um bolão existente</p>
                </button>
              </div>

              {/* Campo para nome do bolão (criar) */}
              {groupAction === "create" && (
                <div className="p-6 border border-white/20 bg-white/5 rounded-sm space-y-4">
                  <Label htmlFor="groupName" className="text-white/80 text-lg">
                    Nome do seu Bolão
                  </Label>
                  <Input
                    id="groupName"
                    type="text"
                    required
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400/50 rounded-sm text-lg py-6"
                    placeholder="Ex: Cinéfilos de Plantão, Time do Cinema..."
                  />
                  <p className="text-sm text-white/50">
                    Você receberá um código exclusivo para compartilhar com seus amigos.
                  </p>
                </div>
              )}

              {/* Campo para código do bolão (entrar) */}
              {groupAction === "join" && (
                <div className="p-6 border border-white/20 bg-white/5 rounded-sm space-y-4">
                  <Label htmlFor="inviteCode" className="text-white/80 text-lg">
                    Cole aqui o código do seu grupo
                  </Label>
                  <Input
                    id="inviteCode"
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400/50 rounded-sm text-lg py-6 font-mono"
                    placeholder="Ex: ABC123"
                  />
                  <p className="text-sm text-white/50">
                    Digite o código compartilhado pelo criador do bolão.
                  </p>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleContinue}
            disabled={
              !selectedMode || 
              (selectedMode === "group" && !groupAction) ||
              (selectedMode === "group" && groupAction === "create" && !groupName) ||
              (selectedMode === "group" && groupAction === "join" && !inviteCode) ||
              isLoading
            }
            className="w-full bg-white text-black hover:bg-white/90 font-semibold py-6 text-lg rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processando...' : 'Continuar'}
          </Button>
        </div>

        {/* Modal de Alerta sobre Rankings */}
        {showRankingAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-amber-400/30 rounded-sm max-w-lg w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              {/* Close button */}
              <button
                onClick={() => setShowRankingAlert(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-amber-400" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-center text-white mb-6">
                Atenção:
              </h3>

              {/* Content */}
              <div className="space-y-6 text-white/90">
                <p className="text-lg font-medium text-center">
                  Você participará de dois rankings:
                </p>

                {/* Ranking Geral */}
                <div className="bg-white/5 border border-white/10 rounded-sm p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-amber-400">Ranking Geral:</h4>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    onde estão todos os participantes e vale prêmio.
                  </p>
                </div>

                {/* Ranking do Grupo */}
                <div className="bg-white/5 border border-white/10 rounded-sm p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <UsersRound className="w-5 h-5 text-blue-400" />
                    <h4 className="font-bold text-blue-400">Ranking do Grupo:</h4>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    apenas para comparação entre os membros do grupo, sem premiação.
                  </p>
                </div>

                {/* Prize info */}
                <div className="bg-amber-400/10 border border-amber-400/30 rounded-sm p-4">
                  <p className="text-center text-sm font-medium">
                    🎯 Os prêmios são concedidos somente ao 1º colocado do <span className="text-amber-400 font-bold">Ranking Geral</span>.
                  </p>
                </div>
              </div>

              {/* Close button */}
              <Button
                onClick={() => setShowRankingAlert(false)}
                className="w-full mt-6 bg-amber-400 text-black hover:bg-amber-500 font-semibold py-3 rounded-sm"
              >
                Entendi
              </Button>
            </div>
          </div>
        )}

        {/* Email Confirmation Alert */}
        {showEmailAlert && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-b from-zinc-900 to-black border border-amber-400/30 rounded-sm p-8 max-w-md w-full relative shadow-2xl">
              {/* Close button */}
              <button
                onClick={() => setShowEmailAlert(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-amber-400" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-center text-white mb-4">
                Confirme seu E-mail
              </h3>

              {/* Content */}
              <div className="space-y-4 text-white/90 text-center">
                <div className="bg-amber-400/10 border border-amber-400/30 rounded-lg p-4">
                  <p className="text-white/90 mb-3">
                    Enviamos um link de confirmação para:
                  </p>
                  <p className="text-amber-400 font-medium text-lg">
                    {user?.email}
                  </p>
                </div>
                
                <p className="text-white/70">
                  Por favor, clique no link enviado para seu email antes de fazer seus palpites.
                </p>
                
                <p className="text-sm text-white/50">
                  Não se esqueça de verificar a caixa de spam!
                </p>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="space-y-3 mt-6">
                <Button
                  onClick={handleCheckEmailConfirmation}
                  disabled={isCheckingEmail}
                  className="w-full bg-amber-400 text-black hover:bg-amber-500 font-semibold py-3 rounded-sm"
                >
                  {isCheckingEmail ? 'Verificando...' : 'Já confirmei meu email'}
                </Button>
                
                <Button
                  onClick={() => {
                    setShowEmailAlert(false)
                    setError("")
                  }}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/5 font-semibold py-3 rounded-sm"
                >
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
