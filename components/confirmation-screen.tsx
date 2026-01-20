"use client"

import { Button } from "@/components/ui/button"
import { Check, Share2, Home } from "lucide-react"

interface ConfirmationScreenProps {
  gameMode: "individual" | "group" | null
  inviteCode?: string
  onBack: () => void
}

export function ConfirmationScreen({ gameMode, inviteCode, onBack }: ConfirmationScreenProps) {
  const shareText = "Acabei de participar do Bolão do Oscar® 2026 - Diamond Films! 🎬"

  const shareOnWhatsApp = () => {
    const url = inviteCode ? `${shareText}\n\nCódigo do bolão: ${inviteCode}` : shareText
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank")
  }

  const shareOnTikTok = () => {
    window.open(`https://www.tiktok.com/`, "_blank")
  }

  const shareOnInstagram = () => {
    window.open(`https://www.instagram.com/`, "_blank")
  }

  const copyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode)
      alert('Código copiado!')
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-3xl">
        {/* Back to home button */}
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-8 text-white/60 hover:text-white hover:bg-white/5"
        >
          <Home className="w-4 h-4 mr-2" />
          Voltar para início
        </Button>
        
        <div className="text-center space-y-12">
          {/* Success icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-amber-400 bg-amber-400/10 flex items-center justify-center">
              <Check className="w-12 h-12 text-amber-400" strokeWidth={2} />
            </div>
          </div>

          {/* Main message */}
          <div className="space-y-8">
            {/* Decorative line above */}
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
            
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-[0.08em] text-white drop-shadow-2xl leading-[1.15] uppercase">
                Você está oficialmente participando
              </h2>
              <p className="text-2xl md:text-3xl font-light text-amber-400/95 tracking-[0.12em]">Bolão do Oscar® Diamond 2026</p>
              <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
                Agora é só torcer até o grande dia!
              </p>
            </div>
            
            {/* Decorative line below */}
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
          </div>

          {/* Group code section */}
          {gameMode === "group" && inviteCode && (
            <div className="p-8 border border-amber-400/30 bg-amber-400/5 rounded-sm space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-light tracking-wide text-amber-400/95">Código do seu Bolão</h3>
                <p className="text-white/70 font-light">Compartilhe este código com seus amigos</p>
              </div>

              <div className="p-6 bg-black/30 rounded-sm border border-white/10">
                <code className="text-3xl font-bold text-amber-400 tracking-widest">{inviteCode}</code>
              </div>

              <Button
                onClick={copyCode}
                variant="outline"
                className="w-full border-amber-400/50 text-amber-400 hover:bg-amber-400/10 font-semibold py-6 text-lg rounded-sm bg-transparent"
              >
                Copiar Código
              </Button>
            </div>
          )}

          {/* Share buttons */}
          <div className="space-y-4">
            <p className="text-white/70 font-light tracking-wide">Compartilhe sua participação</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={shareOnWhatsApp}
                className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-6 px-8 text-lg rounded-sm"
              >
                <Share2 className="w-5 h-5 mr-2" />
                WhatsApp
              </Button>

              <Button
                onClick={shareOnTikTok}
                className="bg-black hover:bg-black/80 text-white font-semibold py-6 px-8 text-lg rounded-sm border border-white/20"
              >
                <Share2 className="w-5 h-5 mr-2" />
                TikTok
              </Button>

              <Button
                onClick={shareOnInstagram}
                className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white font-semibold py-6 px-8 text-lg rounded-sm"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Instagram
              </Button>
            </div>
          </div>

          {/* Gold divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

          {/* Additional message */}
          <p className="text-white/60 text-sm font-light tracking-wide">Você receberá atualizações sobre o ranking e a premiação por e-mail</p>
        </div>
      </div>
    </section>
  )
}
