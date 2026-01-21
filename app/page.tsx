"use client"

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
import { PrizeSection } from "@/components/prize-section"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/login-form"
import { RegistrationForm } from "@/components/registration-form"
import { useState, useEffect, Suspense } from "react"
import { OscarNominations } from "@/components/oscar-nominations"
import { GameModeSelector } from "@/components/game-mode-selector"
import { OscarQuiz } from "@/components/oscar-quiz"
import { ConfirmationScreen } from "@/components/confirmation-screen"
import { useSearchParams } from "next/navigation"

function HomeContent() {
  const { user, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [selectedGameMode, setSelectedGameMode] = useState<null | 'individual' | 'group'>(null)
  const [currentBolaoId, setCurrentBolaoId] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState<string | undefined>(undefined)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showEmailAlert, setShowEmailAlert] = useState(false)

  // Verifica se veio do link de confirmação de email
  useEffect(() => {
    if (searchParams.get('confirmed') === 'true' || searchParams.get('from') === 'email-confirmation') {
      setMode('login')
      setShowEmailAlert(true)
    }
  }, [searchParams])

  const scrollToForm = () => {
    const el = document.getElementById('meu-palpite')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden w-full">
      <Navbar />

      <HeroSection onStart={scrollToForm} />

      <div id="como-funciona">
        <HowItWorks onStart={scrollToForm} />
      </div>

      <div id="premio-oficial">
        <PrizeSection onStart={scrollToForm} />
      </div>


      <section id="meu-palpite" className="scroll-mt-20 py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {!user ? (
            <div className="bg-black/60 border border-white/10 rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-2">Entre para participar do bolão</h2>
              <p className="text-white/70 mb-6">Faça login ou crie sua conta para liberar seus palpites e participar dos rankings.</p>

              {/* Email/Password */}
              {mode === 'login' ? (
                <>
                  {showEmailAlert && (
                    <div className="mb-6 p-4 bg-amber-400/10 border border-amber-400/30 rounded-lg text-left">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-amber-400 font-semibold mb-1">Confirme seu email</h3>
                          <p className="text-white/80 text-sm">
                            Enviamos um link de confirmação para seu email. Por favor, clique no link antes de fazer login.
                          </p>
                          <button
                            onClick={() => setShowEmailAlert(false)}
                            className="text-amber-400/70 hover:text-amber-400 text-xs mt-2 underline"
                          >
                            Dispensar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <LoginForm onSuccess={() => setMode('login')} />
                  <div className="text-center mt-4">
                    <button
                      className="text-sm text-[#ffcc33] hover:text-[#ffcc33]/80"
                      onClick={() => setMode('signup')}
                    >
                      Não tem conta? Criar conta
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <RegistrationForm 
                    onComplete={() => {
                      setMode('login')
                      setShowEmailAlert(true)
                    }} 
                    onBack={() => setMode('login')} 
                  />
                  <div className="text-center mt-4">
                    <button
                      className="text-sm text-[#ffcc33] hover:text-[#ffcc33]/80"
                      onClick={() => setMode('login')}
                    >
                      Já tenho conta — Fazer login
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div>
              {showConfirmation ? (
                <ConfirmationScreen
                  gameMode={selectedGameMode}
                  inviteCode={inviteCode}
                  onBack={() => {
                    setShowConfirmation(false)
                    setSelectedGameMode(null)
                    setCurrentBolaoId(null)
                    setInviteCode(undefined)
                  }}
                />
              ) : !currentBolaoId ? (
                <GameModeSelector
                  onSelect={(modeSel, bolaoId, code) => {
                    setSelectedGameMode(modeSel)
                    setCurrentBolaoId(bolaoId)
                    setInviteCode(code)
                    
                    // Se for grupo (criar ou entrar), vai direto pra confirmação
                    if (modeSel === 'group') {
                      setShowConfirmation(true)
                    }
                    // Se for individual, vai pro quiz primeiro
                  }}
                  onBack={() => setSelectedGameMode(null)}
                />
              ) : (
                <OscarQuiz
                  bolaoId={currentBolaoId}
                  onComplete={() => {
                    // Após completar o quiz individual, mostra a tela de confirmação
                    setShowConfirmation(true)
                  }}
                  onBack={() => setCurrentBolaoId(null)}
                />
              )}
            </div>
          )}
        </div>
      </section>

      <div id="filmes-indicados">
        <OscarNominations />
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <HomeContent />
    </Suspense>
  )
}