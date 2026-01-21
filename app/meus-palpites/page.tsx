'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Trophy, Users, TrendingUp, ChevronDown, ArrowLeft, Menu, X, Mail, Eye, List, Copy, Check } from 'lucide-react'

type Palpite = {
  id: string
  category: { name: string; display_order: number }
  nominee: { name: string; movie: string }
}

type Bolao = {
  id: string
  name: string
  type: 'individual' | 'group'
  invite_code?: string
}

type BolaoWithPalpites = Bolao & {
  palpites: Palpite[]
  groupRanking?: {
    position: number
    points: number
  }
}

type Ranking = {
  position: number
  points: number
  leader?: string  // Nome do 1º colocado do grupo (se aplicável)
}

type GroupPosition = {
  groupPosition: number
  groupPoints: number
  leaderName: string
}

type GlobalStats = {
  totalUsers: number
  averagePoints: number
}

type RankingEntry = {
  position: number
  user?: {
    id: string
    name: string
    state?: string
  }
  user_id?: string
  points: number
  // Para group_rankings
  bolao_id?: string
}

type ModalState = {
  type: 'palpite' | 'ranking-grupo' | 'ranking-geral' | 'codigo-grupo' | null
  bolaoId?: string
  bolaoName?: string
  bolaoInviteCode?: string
  palpites?: Palpite[]
}

export default function MeusPalpitesPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [boloes, setBoloes] = useState<BolaoWithPalpites[]>([])
  const [rankingIndividual, setRankingIndividual] = useState<Ranking | null>(null)
  const [rankingGroup, setRankingGroup] = useState<Ranking | null>(null)
  const [groupPositionInGlobal, setGroupPositionInGlobal] = useState<GroupPosition | null>(null)
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showEmailAlert, setShowEmailAlert] = useState(false)
  const [modalState, setModalState] = useState<ModalState>({ type: null })
  const [rankingData, setRankingData] = useState<RankingEntry[]>([])
  const [isLoadingRanking, setIsLoadingRanking] = useState(false)
  const [bolaoPositions, setBolaoPositions] = useState<Record<string, { position: number; isGroup: boolean }>>({})
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    fetchData()
  }, [user, router])

  const fetchData = async () => {
    try {
      // Busca palpites do usuário
      const palpitesRes = await fetch(`/api/palpites?user_id=${user?.id}`)
      const palpitesData = palpitesRes.ok ? await palpitesRes.json() : { palpites: [] }
      
      // Busca ranking global (Ranking Geral)
      let userGlobalPosition: number | null = null
      const rankingGlobalRes = await fetch('/api/ranking/global')
      if (rankingGlobalRes.ok) {
        const rankingResponse = await rankingGlobalRes.json()
        const rankingData = rankingResponse.ranking || []
        
        // Encontra a posição do usuário no ranking global
        const userGlobalRanking = rankingData.find((r: any) => r.user.id === user?.id)
        if (userGlobalRanking) {
          setRankingIndividual({
            position: userGlobalRanking.position,
            points: userGlobalRanking.points
          })
          userGlobalPosition = userGlobalRanking.position
        }
        
        // Calcula estatísticas globais
        if (rankingData.length > 0) {
          const totalPoints = rankingData.reduce((sum: number, r: any) => sum + r.points, 0)
          setGlobalStats({
            totalUsers: rankingData.length,
            averagePoints: Math.round(totalPoints / rankingData.length * 10) / 10
          })
        }
      }

      // Busca informações do usuário (posição em grupo + posição do grupo no global)
      let groupGlobalPosition: number | null = null
      const userRankingRes = await fetch('/api/ranking/usuario')
      if (userRankingRes.ok) {
        const userData = await userRankingRes.json()
        
        // Se tem grupo, busca dados do ranking do grupo
        if (userData.grupos && userData.grupos.length > 0) {
          const primeiroGrupo = userData.grupos[0]
          
          // Posição do usuário dentro do grupo
          if (primeiroGrupo.posicaoNoGrupo) {
            setRankingGroup({
              position: primeiroGrupo.posicaoNoGrupo.position,
              points: primeiroGrupo.posicaoNoGrupo.points
            })
          }
          
          // Posição do grupo no Ranking Geral
          if (primeiroGrupo.posicaoGrupoNoRankingGeral) {
            setGroupPositionInGlobal({
              groupPosition: primeiroGrupo.posicaoGrupoNoRankingGeral.posicao,
              groupPoints: primeiroGrupo.posicaoGrupoNoRankingGeral.pontos,
              leaderName: primeiroGrupo.posicaoGrupoNoRankingGeral.primeiroColocado
            })
            groupGlobalPosition = primeiroGrupo.posicaoGrupoNoRankingGeral.posicao
          }
        }
      } else {
        console.error('❌ Erro ao buscar dados do usuário:', await userRankingRes.text())
      }
      
      // Busca bolões do usuário
      const boloesRes = await fetch(`/api/boloes?userId=${user?.id}`)
      if (boloesRes.ok) {
        const boloesData = await boloesRes.json()
        if (boloesData.boloes && boloesData.boloes.length > 0) {
          const boloesComPalpites = boloesData.boloes.map((bolao: Bolao) => ({
            ...bolao,
            palpites: palpitesData.palpites || []
          }))
          setBoloes(boloesComPalpites)
          
          // Busca posições de cada bolão
          const positions: Record<string, { position: number; isGroup: boolean }> = {}
          for (const bolao of boloesComPalpites) {
            if (bolao.type === 'individual' && userGlobalPosition) {
              // Para bolão individual, usa a posição no ranking geral
              positions[bolao.id] = { position: userGlobalPosition, isGroup: false }
            } else if (bolao.type === 'group' && groupGlobalPosition) {
              // Para bolão de grupo, usa a posição do grupo no ranking geral
              positions[bolao.id] = { position: groupGlobalPosition, isGroup: true }
            }
          }
          setBolaoPositions(positions)
        }
      } else {
        console.error('Erro ao buscar bolões:', await boloesRes.text())
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPalpites = boloes.reduce((sum, bolao) => sum + bolao.palpites.length, 0)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const handleIniciarBolao = () => {
    // Verifica se o email foi confirmado
    if (user?.email_confirmed_at) {
      router.push('/#meu-palpite')
    } else {
      setShowEmailAlert(true)
    }
  }

  const handleOpenPalpiteModal = (bolao: BolaoWithPalpites) => {
    setModalState({
      type: 'palpite',
      bolaoId: bolao.id,
      bolaoName: bolao.name,
      palpites: bolao.palpites
    })
  }

  const handleOpenRankingGrupoModal = async (bolao: BolaoWithPalpites) => {
    if (bolao.type === 'individual') return
    
    setModalState({
      type: 'ranking-grupo',
      bolaoId: bolao.id,
      bolaoName: bolao.name
    })
    
    // Busca ranking do grupo
    setIsLoadingRanking(true)
    try {
      const response = await fetch(`/api/ranking/grupo/${bolao.id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Dados do ranking do grupo:', data)
        console.log('📊 Ranking entries:', data.ranking)
        setRankingData(data.ranking || [])
      } else {
        console.error('❌ Erro na resposta:', response.status, await response.text())
      }
    } catch (error) {
      console.error('Erro ao buscar ranking do grupo:', error)
    } finally {
      setIsLoadingRanking(false)
    }
  }

  const handleOpenRankingGeralModal = async (bolao?: BolaoWithPalpites) => {
    setModalState({
      type: 'ranking-geral',
      bolaoId: bolao?.id,
      bolaoName: bolao?.name
    })
    
    // Busca ranking geral
    setIsLoadingRanking(true)
    try {
      const response = await fetch('/api/ranking/global')
      if (response.ok) {
        const data = await response.json()
        setRankingData(data.ranking || [])
      }
    } catch (error) {
      console.error('Erro ao buscar ranking geral:', error)
    } finally {
      setIsLoadingRanking(false)
    }
  }

  const handleOpenCodigoGrupoModal = (bolao: BolaoWithPalpites) => {
    setModalState({
      type: 'codigo-grupo',
      bolaoId: bolao.id,
      bolaoName: bolao.name,
      bolaoInviteCode: bolao.invite_code
    })
    setCopiedCode(false)
  }

  const handleCopyCode = async () => {
    if (modalState.bolaoInviteCode) {
      try {
        await navigator.clipboard.writeText(modalState.bolaoInviteCode)
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      } catch (error) {
        console.error('Erro ao copiar código:', error)
      }
    }
  }

  const closeModal = () => {
    setModalState({ type: null })
    setRankingData([])
  }

  const renderRankingItem = (entry: RankingEntry, isCurrentUser: boolean, isGroup: boolean = false, userName?: string, showState: boolean = false) => {
    const displayName = userName || entry.user?.name || 'Participante'
    const userId = entry.user?.id || entry.user_id
    const userState = entry.user?.state
    
    return (
      <div
        key={userId}
        className={`flex items-center justify-between p-5 rounded-sm transition-all duration-200 ${
          isCurrentUser
            ? 'border-2 border-[#ffcc33] bg-white/5'
            : isGroup
            ? 'border-2 border-blue-400 bg-white/5'
            : 'border border-white/10 bg-white/5'
        }`}
      >
        <div className="flex items-center gap-6">
          {/* Position indicator */}
          <div
            className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-sm font-bold text-xl ${
              entry.position === 1
                ? 'bg-amber-400/90 text-white border-2 border-amber-400'
                : entry.position === 2
                ? 'bg-gray-300/90 text-white border-2 border-gray-300'
                : entry.position === 3
                ? 'bg-amber-600/90 text-white border-2 border-amber-600'
                : 'bg-white/5 text-white/70 border border-white/20'
            }`}
          >
            {entry.position === 1 ? (
              <Trophy className="w-6 h-6" />
            ) : (
              entry.position
            )}
          </div>

          {/* User info */}
          <div>
            <div className={`font-light text-lg tracking-wide ${
              isCurrentUser ? 'text-white font-semibold' : isGroup ? 'text-blue-400 font-semibold' : 'text-white'
            }`}>
              {displayName} {isCurrentUser && '(Você)'} {isGroup && '(Seu grupo)'}
            </div>
            {showState && userState && (
              <div className="text-sm text-white/60 font-light">{userState}</div>
            )}
          </div>
        </div>

        {/* Points */}
        <div className="text-right">
          <div className={`text-2xl font-bold tracking-wide ${
            entry.position <= 3 ? 'text-amber-400' : 'text-white'
          }`}>
            {entry.points}
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider font-light">pontos</div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-64 bg-black/95 backdrop-blur-md border-l border-[#ffcc33]/30 p-6 flex flex-col gap-6 z-50 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 left-4 text-white/80 hover:text-white cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center gap-4 pt-8">
          <div className="w-16 h-16 rounded-full bg-[#ffcc33]/20 flex items-center justify-center border-2 border-[#ffcc33]">
            <span className="text-2xl font-bold text-[#ffcc33]">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/60 mb-1">Bem-vindo</p>
            <p className="text-lg font-semibold text-white">{user?.name}</p>
          </div>
        </div>
        <div className="flex-1"></div>
        <Button
          onClick={handleLogout}
          className="w-full bg-[#ffcc33] text-black hover:bg-[#ffcc33]/90 font-semibold cursor-pointer"
        >
          Sair
        </Button>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Header */}
      <div className="bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="flex justify-center">
              <img
                src="/DimondLogo.svg"
                alt="Diamond Films"
                className="w-20 h-20 object-contain drop-shadow-xl"
              />
            </div>
            <Button
              onClick={() => setIsSidebarOpen(true)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2 text-white">
          Meus Palpites
        </h1>
        <p className="text-center text-sm md:text-base text-[#ffcc33] mb-6 md:mb-12">
          Acompanhe seus palpites e sua posição no ranking
        </p>

        {/* Seção de Bolões e Palpites */}
        <Card className="bg-black/40 backdrop-blur-sm border-[#ffcc33] border-2 p-4 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">
            Meus Bolões
          </h2>

          {boloes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 mb-4">
                Você ainda não está participando de nenhum bolão.
              </p>
              <Button
                onClick={handleIniciarBolao}
                className="bg-black border border-[#ffcc33] text-white hover:bg-[#ffcc33] hover:text-black cursor-pointer"
              >
                Iniciar Meu Bolão
              </Button>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {boloes.map((bolao) => (
                <AccordionItem 
                  key={bolao.id} 
                  value={bolao.id}
                  className="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
                >
                  <AccordionTrigger className="px-3 md:px-6 py-3 md:py-4 hover:bg-white/5 hover:no-underline">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-3 md:gap-0 md:pr-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-2">
                          {bolao.type === 'individual' ? (
                            <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[#ffcc33]" />
                          ) : (
                            <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                          )}
                          <h3 className="font-bold text-sm md:text-base text-white text-left">
                            {bolao.name}
                          </h3>
                        </div>
                        <span className="text-xs md:text-sm text-white/60">
                          {bolao.type === 'individual' ? 'Individual' : 'Em Grupo'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4">
                        {bolaoPositions[bolao.id] ? (
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                            <div className="flex items-center gap-1 md:gap-2">
                              <Trophy className="w-3 h-3 md:w-4 md:h-4 text-[#ffcc33]" />
                              <span className="text-xs md:text-sm font-semibold text-[#ffcc33]">
                                {bolaoPositions[bolao.id].position}° posição
                              </span>
                            </div>
                            <span className="text-[10px] md:text-xs text-white/40">
                              {bolaoPositions[bolao.id].isGroup ? '(grupo no ranking geral)' : '(individual)'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs md:text-sm text-white/60">
                            {bolao.palpites.length} palpites
                          </span>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 md:px-6 pb-3 md:pb-4">
                    {bolao.palpites.length === 0 ? (
                      <div className="text-center py-6 md:py-8">
                        <p className="text-sm md:text-base text-white/60 mb-3 md:mb-4">
                          Você ainda não fez palpites neste bolão.
                        </p>
                        <Button
                          onClick={() => router.push('/#meu-palpite')}
                          size="sm"
                          className="bg-[#ffcc33] text-black hover:bg-[#ffcc33]/90 text-xs md:text-sm cursor-pointer"
                        >
                          Fazer Palpites
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 md:space-y-4">
                        {/* Botões de ação */}
                        <div className="flex flex-col md:flex-row md:flex-wrap gap-2 pb-2 border-b border-white/10">
                          <Button
                            onClick={() => handleOpenPalpiteModal(bolao)}
                            size="sm"
                            className="w-full md:w-auto bg-white/5 text-white border border-white/20 hover:bg-white/10 gap-2 text-xs md:text-sm justify-center cursor-pointer"
                          >
                            <Eye className="w-3 h-3 md:w-4 md:h-4" />
                            Ver Palpite
                          </Button>
                          {bolao.type === 'group' && (
                            <>
                              <Button
                                onClick={() => handleOpenRankingGrupoModal(bolao)}
                                size="sm"
                                className="w-full md:w-auto bg-white/5 text-white border border-blue-400 hover:bg-white/10 gap-2 text-xs md:text-sm justify-center cursor-pointer"
                              >
                                <Users className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                                Ver Ranking do Grupo
                              </Button>
                              <Button
                                onClick={() => handleOpenCodigoGrupoModal(bolao)}
                                size="sm"
                                className="w-full md:w-auto bg-white/5 text-white border border-green-400 hover:bg-white/10 gap-2 text-xs md:text-sm justify-center cursor-pointer"
                              >
                                <Copy className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                                Ver Código do Grupo
                              </Button>
                            </>
                          )}
                          <Button
                            onClick={() => handleOpenRankingGeralModal(bolao)}
                            size="sm"
                            className="w-full md:w-auto bg-white/5 text-white border border-[#ffcc33] hover:bg-white/10 gap-2 text-xs md:text-sm justify-center cursor-pointer"
                          >
                            <Trophy className="w-3 h-3 md:w-4 md:h-4 text-[#ffcc33]" />
                            Ver Ranking Geral
                          </Button>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </Card>
      </div>

      {/* Email Confirmation Alert */}
      {showEmailAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-amber-400/30 rounded-sm max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Close button */}
            <button
              onClick={() => setShowEmailAlert(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors cursor-pointer"
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
            <div className="space-y-4 text-white/90">
              <p className="text-center text-lg">
                Confirme seu endereço de email clicando no link que enviamos pra você!
              </p>
              
              <div className="bg-amber-400/10 border border-amber-400/30 rounded-sm p-4">
                <p className="text-center text-amber-400 font-medium">
                  {user?.email}
                </p>
              </div>

              <p className="text-center text-sm text-white/70">
                Após confirmar, volte aqui e atualize a página para continuar.
              </p>

              <p className="text-center text-xs text-white/60 italic">
                Não se esqueça de verificar a caixa de spam!
              </p>
            </div>

            {/* Close button */}
            <Button
              onClick={() => setShowEmailAlert(false)}
              className="w-full mt-6 bg-amber-400 text-black hover:bg-amber-500 font-semibold py-3 rounded-sm cursor-pointer"
            >
              Entendi
            </Button>
          </div>
        </div>
      )}

      {/* Modal: Ver Palpite */}
      <Dialog open={modalState.type === 'palpite'} onOpenChange={closeModal}>
        <DialogContent className="bg-black border border-[#ffcc33]/30 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Eye className="w-6 h-6 text-[#ffcc33]" />
              {modalState.bolaoName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {modalState.palpites && modalState.palpites.length > 0 ? (
              modalState.palpites
                .sort((a, b) => a.category.display_order - b.category.display_order)
                .map((palpite) => (
                  <div
                    key={palpite.id}
                    className="flex items-start justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-[#ffcc33]/30 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#ffcc33] mb-1">
                        {palpite.category.name}
                      </h4>
                      <p className="text-white font-medium">
                        {palpite.nominee.name}
                      </p>
                      <p className="text-sm text-white/60 mt-1">
                        {palpite.nominee.movie}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-center text-white/60 py-8">Nenhum palpite encontrado</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Ver Ranking do Grupo */}
      <Dialog open={modalState.type === 'ranking-grupo'} onOpenChange={closeModal}>
        <DialogContent className="bg-black border border-blue-400/30 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              Ranking: {modalState.bolaoName}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isLoadingRanking ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                <p className="text-white/60 mt-4">Carregando ranking...</p>
              </div>
            ) : rankingData.length > 0 ? (
              <>
                <div className="space-y-2">
                  {rankingData.map((entry: any) => {
                    const isCurrentUser = entry.user_id === user?.id || entry.user?.id === user?.id
                    const userName = entry.user?.name || 'Participante'
                    return renderRankingItem(
                      { ...entry, user: entry.user || { id: entry.user_id, name: userName } },
                      isCurrentUser,
                      false,
                      undefined,
                      false
                    )
                  })}
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-xs text-white/60 leading-relaxed text-center">
                    Este ranking mostra a classificação apenas entre os participantes do grupo.
                    <br />
                    Ele não gera prêmios e existe apenas para acompanhar o desempenho entre amigos.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-center text-white/60 py-8">Nenhum participante no ranking ainda</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Ver Ranking Geral */}
      <Dialog open={modalState.type === 'ranking-geral'} onOpenChange={closeModal}>
        <DialogContent className="bg-black border border-[#ffcc33]/30 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#ffcc33]" />
              Ranking Geral
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isLoadingRanking ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-[#ffcc33]/30 border-t-[#ffcc33] rounded-full animate-spin"></div>
                <p className="text-white/60 mt-4">Carregando ranking...</p>
              </div>
            ) : rankingData.length > 0 ? (
              <div className="space-y-2">
                {/* Mostra top 3 */}
                {rankingData.slice(0, 3).map((entry) => {
                  const bolaoFromModal = boloes.find(b => b.id === modalState.bolaoId)
                  const isGroupEntry = bolaoFromModal?.type === 'group' && 
                    bolaoPositions[modalState.bolaoId || '']?.position === entry.position
                  const isCurrentUser = entry.user?.id === user?.id
                  
                  return renderRankingItem(
                    entry, 
                    isCurrentUser, 
                    isGroupEntry,
                    isGroupEntry ? modalState.bolaoName : undefined,
                    true
                  )
                })}
                
                {/* Se o usuário/grupo não está no top 3, mostra separado */}
                {(() => {
                  const bolaoFromModal = boloes.find(b => b.id === modalState.bolaoId)
                  
                  // Se for bolão de grupo, busca pela posição do grupo
                  if (bolaoFromModal?.type === 'group' && modalState.bolaoId) {
                    const groupPosition = bolaoPositions[modalState.bolaoId]?.position
                    if (groupPosition && groupPosition > 3) {
                      const groupEntry = rankingData.find(entry => entry.position === groupPosition)
                      if (groupEntry) {
                        return (
                          <>
                            <div className="flex items-center justify-center py-2">
                              <div className="flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-white/40"></div>
                                <div className="w-1 h-1 rounded-full bg-white/40"></div>
                                <div className="w-1 h-1 rounded-full bg-white/40"></div>
                              </div>
                            </div>
                            {renderRankingItem(groupEntry, false, true, modalState.bolaoName, true)}
                          </>
                        )
                      }
                    }
                  } else {
                    // Para bolão individual, busca pelo usuário
                    const userEntry = rankingData.find(entry => entry.user?.id === user?.id)
                    if (userEntry && userEntry.position > 3) {
                      return (
                        <>
                          <div className="flex items-center justify-center py-2">
                            <div className="flex gap-1">
                              <div className="w-1 h-1 rounded-full bg-white/40"></div>
                              <div className="w-1 h-1 rounded-full bg-white/40"></div>
                              <div className="w-1 h-1 rounded-full bg-white/40"></div>
                            </div>
                          </div>
                          {renderRankingItem(userEntry, true, false, undefined, true)}
                        </>
                      )
                    }
                  }
                  return null
                })()}
                
                {/* Mensagem informativa */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-xs text-white/60 leading-relaxed text-center">
                    Este é o ranking oficial do bolão.
                    <br />
                    Somente o 1º colocado deste ranking recebe o prêmio.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-white/60 py-8">Nenhum participante no ranking ainda</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Ver Código do Grupo */}
      <Dialog open={modalState.type === 'codigo-grupo'} onOpenChange={closeModal}>
        <DialogContent className="bg-gradient-to-br from-gray-900 to-black border border-green-400/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-green-400" />
              Código do Grupo
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6 space-y-6">
            {/* Nome do grupo */}
            <div className="space-y-2">
              <label className="text-sm text-white/60 font-medium">Nome do Grupo</label>
              <div className="bg-white/5 border border-white/20 rounded-sm p-4">
                <p className="text-white font-semibold text-lg">{modalState.bolaoName}</p>
              </div>
            </div>

            {/* Código do grupo */}
            <div className="space-y-2">
              <label className="text-sm text-white/60 font-medium">Código de Convite</label>
              <div className="bg-green-400/10 border-2 border-green-400/30 rounded-sm p-4 flex items-center justify-between gap-3">
                <code className="text-green-400 font-mono font-bold text-xl tracking-wider">
                  {modalState.bolaoInviteCode || 'N/A'}
                </code>
                <Button
                  onClick={handleCopyCode}
                  size="sm"
                  className={`${
                    copiedCode 
                      ? 'bg-green-500 hover:bg-green-500' 
                      : 'bg-green-400 hover:bg-green-500'
                  } text-black transition-all duration-200 cursor-pointer`}
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Instruções */}
            <div className="bg-white/5 border border-white/10 rounded-sm p-4">
              <p className="text-white/70 text-sm leading-relaxed">
                Compartilhe este código com seus amigos para que eles possam entrar no seu grupo. 
                Eles precisarão inserir este código ao criar sua conta ou na tela de seleção de modo de jogo.
              </p>
            </div>

            <Button
              onClick={closeModal}
              className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/20 cursor-pointer"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

