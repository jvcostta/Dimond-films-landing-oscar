"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Home, Mail } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface OscarQuizProps {
  bolaoId: string
  onComplete: () => void
  onBack: () => void
}

type Category = {
  id: string
  name: string
  nominees: Array<{
    id: string
    name: string
    movie: string
  }>
}

export function OscarQuiz({ bolaoId, onComplete, onBack }: OscarQuizProps) {
  const { user, refreshUser } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [tiebreakerAnswer, setTiebreakerAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [showEmailAlert, setShowEmailAlert] = useState(!user?.email_confirmed_at)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  useEffect(() => {
    if (user?.email_confirmed_at) {
      setShowEmailAlert(false)
      fetchCategories()
    }
  }, [user])

  const handleCheckEmailConfirmation = async () => {
    setIsCheckingEmail(true)
    await refreshUser()
    setIsCheckingEmail(false)
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?nominees=true')
      if (!response.ok) throw new Error('Erro ao buscar categorias')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (err: any) {
      setError(err.message || "Erro ao carregar categorias")
    } finally {
      setIsLoading(false)
    }
  }

  const currentCategory = categories[currentCategoryIndex]
  const progress = categories.length > 0 ? ((currentCategoryIndex + 1) / categories.length) * 100 : 0
  const isLastCategory = currentCategoryIndex === categories.length - 1

  const handleNext = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1)
    }
  }

  const handleSelect = (nomineeId: string) => {
    setSelections({
      ...selections,
      [currentCategory.id]: nomineeId,
    })
  }

  const handleSubmit = async () => {
    if (!user) {
      setError("Você precisa estar logado")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      // Salvar todos os palpites
      const promises = Object.entries(selections).map(([categoryId, nomineeId]) =>
        fetch('/api/palpites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            category_id: categoryId,
            nominee_id: nomineeId,
          }),
        }).then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Erro ao salvar palpite')
          }
          return response.json()
        })
      )

      await Promise.all(promises)

      // Salvar resposta do tiebreaker se foi preenchida
      if (tiebreakerAnswer.trim()) {
        const tiebreakerResponse = await fetch('/api/tiebreaker', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            bolao_id: bolaoId,
            answer: tiebreakerAnswer.trim(),
          }),
        })

        if (!tiebreakerResponse.ok) {
          const errorData = await tiebreakerResponse.json()
          console.error('Erro ao salvar tiebreaker:', errorData)
          // Não interrompe o fluxo se falhar o tiebreaker
        }
      }

      onComplete()
    } catch (err: any) {
      console.error('Erro ao salvar palpites:', err)
      setError(err.message || "Erro ao salvar palpites")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="text-white text-xl">Carregando categorias...</div>
      </section>
    )
  }

  // Verificar se o email foi confirmado
  if (showEmailAlert || !user?.email_confirmed_at) {
    return (
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-amber-400" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Confirme seu E-mail
              </h2>
              
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
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleCheckEmailConfirmation}
                disabled={isCheckingEmail}
                className="w-full bg-amber-400 text-black hover:bg-amber-500 font-semibold py-4"
              >
                {isCheckingEmail ? 'Verificando...' : 'Já confirmei meu email'}
              </Button>
              
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/5 font-semibold py-4"
              >
                Voltar para o Início
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return (
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="text-center space-y-4">
          <p className="text-white text-xl">Nenhuma categoria disponível</p>
          <Button onClick={onBack} variant="outline">
            Voltar
          </Button>
        </div>
      </section>
    )
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
            <span className="text-sm text-white/60 uppercase tracking-widest">
              Categoria {currentCategoryIndex + 1} de {categories.length}
            </span>
            <span className="text-sm text-white/60">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-px bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-400/50 to-amber-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-8">
          <div className="text-center space-y-6">
            {/* Decorative line above */}
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-[0.08em] text-white drop-shadow-2xl leading-[1.15] uppercase text-balance">
                {currentCategory.name}
              </h2>
              <p className="text-lg md:text-xl font-light text-white/70 tracking-wide">Escolha seu vencedor</p>
              
              {error && (
                <div className="max-w-md mx-auto p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}
            </div>
            
            {/* Decorative line below */}
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
          </div>

          <div className="space-y-3">
            {currentCategory.nominees && currentCategory.nominees.length > 0 ? (
              currentCategory.nominees.map((nominee) => (
                <button
                  key={nominee.id}
                  onClick={() => handleSelect(nominee.id)}
                  className={`w-full p-5 border rounded-sm transition-all duration-200 text-left relative ${
                    selections[currentCategory.id] === nominee.id
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-lg font-light tracking-wide block">{nominee.name}</span>
                    {nominee.movie && (
                    <span className="text-sm text-white/60">{nominee.movie}</span>
                  )}
                </div>

                {selections[currentCategory.id] === nominee.id && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-5 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))
            ) : (
              <p className="text-white/60 text-center py-4">Nenhum indicado disponível</p>
            )}
          </div>

          {/* Tiebreaker question - only shown on last category */}
          {isLastCategory && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="space-y-2">
                <Label htmlFor="tiebreaker" className="text-white text-base font-light tracking-wide">
                  Se você pudesse entregar um Oscar para alguém da história do cinema, quem seria e por quê?
                  <span className="text-amber-400 ml-1">*</span>
                </Label>
                <p className="text-xs text-white/50 italic">
                  * essa pergunta é <strong className="text-amber-400">obrigatória</strong> e pode ser usada como critério de desempate
                </p>
                <Textarea
                  id="tiebreaker"
                  value={tiebreakerAnswer}
                  onChange={(e) => setTiebreakerAnswer(e.target.value)}
                  placeholder="Digite sua resposta aqui..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[100px] focus:border-amber-400/50 focus:ring-amber-400/20"
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-xs text-amber-400/ hover:text-amber-400 underline underline-offset-4">
                      Em caso de empate consulte aqui as regras
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-900 border-white/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white text-xl">Regras de Desempate</AlertDialogTitle>
                      <div className="text-white/80 space-y-3 text-sm pt-2">
                        <p>Em caso de empate entre participantes com o mesmo número de acertos:</p>
                        <ol className="list-decimal list-inside space-y-2 pl-2">
                          <li>Quem acertar <strong className="text-amber-400">Melhor Filme</strong> tem prioridade.</li>
                          <li>Se persistir o empate, vale a <strong className="text-amber-400">data/hora de envio</strong> (quem enviou primeiro vence).</li>
                          <li>Se ainda houver empate, entra a <strong className="text-amber-400">pergunta criativa de desempate</strong>: "Se você pudesse entregar um Oscar para alguém da história do cinema, quem seria e por quê?"</li>
                        </ol>
                      </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction className="bg-amber-400 text-black hover:bg-amber-500">
                        Entendi
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentCategoryIndex === 0}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-semibold py-6 px-8 rounded-sm disabled:opacity-30 bg-transparent"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Anterior
            </Button>

            <Button
              onClick={isLastCategory ? handleSubmit : handleNext}
              disabled={!selections[currentCategory.id] || isSaving || (isLastCategory && !tiebreakerAnswer.trim())}
              className="flex-1 bg-white text-black hover:bg-white/90 font-semibold py-6 text-lg rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Salvando...' : isLastCategory ? "Finalizar" : "Próxima Categoria"}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
