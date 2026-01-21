"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
import { RegistrationForm } from "@/components/registration-form"
import { LoginForm } from "@/components/login-form"
import { GameModeSelector } from "@/components/game-mode-selector"
import { OscarQuiz } from "@/components/oscar-quiz"
import { ConfirmationScreen } from "@/components/confirmation-screen"
import { RankingSection } from "@/components/ranking-section"
import { PrizeSection } from "@/components/prize-section"
import { OscarNominations } from "@/components/oscar-nominations"

type Step = "registration" | "game-mode" | "quiz" | "confirmation"
type GameMode = "individual" | "group"

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>("registration")
  const [gameMode, setGameMode] = useState<GameMode | null>(null)
  const [bolaoId, setBolaoId] = useState<string>("")
  const [userData, setUserData] = useState<any>(null)
  const [inviteCode, setInviteCode] = useState<string>("")
  const [showLogin, setShowLogin] = useState(false)
  const formSectionRef = useRef<HTMLDivElement>(null)

  const scrollToForm = () => {
    // Sempre rola até o formulário
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    
    // Se usuário estiver logado e estiver na tela de registration, muda para game-mode
    if (user && step === "registration") {
      setStep("game-mode")
    }
  }

  const handleRegistration = (data: any) => {
    setUserData(data)
    setStep("game-mode")
  }

  const handleGameMode = (mode: GameMode, id: string, code?: string) => {
    setGameMode(mode)
    setBolaoId(id)
    if (code) setInviteCode(code)
    
    // Se for individual, vai para quiz (fazer palpites)
    // Se for grupo, pula o quiz e vai direto para confirmation (palpites já copiados)
    if (mode === "individual") {
      setStep("quiz")
    } else {
      setStep("confirmation")
    }
  }

  const handleQuizComplete = () => {
    setStep("confirmation")
  }

  const handleBackToHome = () => {
    setStep("registration")
    setGameMode(null)
    setBolaoId("")
    setUserData(null)
    setGroupLink("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden w-full">
      <Navbar />
      
      <HeroSection onStart={scrollToForm} />
      
      <div id="como-funciona">
        <HowItWorks onStart={scrollToForm} />
      </div>
      
      {/* Ranking Geral - Temporariamente oculto */}
      <div id="ranking-geral" className="hidden">
        <RankingSection onStart={scrollToForm} />
      </div>
      
      <div id="premio-oficial">
        <PrizeSection onStart={scrollToForm} />
      </div>

      {/* Forms Section */}
      <div id="meu-palpite" ref={formSectionRef} className="scroll-mt-20">
        {!user && step === "registration" && (
          <>
            {showLogin ? (
              <div className="py-16 px-4">
                <LoginForm onSuccess={() => {
                  setStep("game-mode")
                  setTimeout(() => {
                    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }, 100)
                }} />
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowLogin(false)}
                    className="text-[#ffcc33] hover:underline text-sm"
                  >
                    Não tem uma conta? Cadastre-se aqui
                  </button>
                </div>
              </div>
            ) : (
              <>
                <RegistrationForm onComplete={handleRegistration} onBack={handleBackToHome} />
                <div className="text-center py-6">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="text-white hover:underline text-sm"
                  >
                    Já tem uma conta existente? <span className="text-[#ffcc33]">Clique aqui</span> para fazer login
                  </button>
                </div>
                <OscarNominations />
              </>
            )}
          </>
        )}

        {(step === "game-mode" || (user && step === "registration")) && (
          <GameModeSelector 
            onSelect={handleGameMode} 
            onBack={() => {
              if (user) {
                router.push('/meus-palpites')
              } else {
                handleBackToHome()
              }
            }} 
          />
        )}

        {step === "quiz" && bolaoId && <OscarQuiz bolaoId={bolaoId} onComplete={handleQuizComplete} onBack={handleBackToHome} />}

        {step === "confirmation" && <ConfirmationScreen gameMode={gameMode} inviteCode={inviteCode} onBack={handleBackToHome} />}
      </div>
    </main>
  )
}
