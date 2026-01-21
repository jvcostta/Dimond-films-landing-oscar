import { Crown } from "lucide-react"
import { GoldButton } from "@/components/ui/gold-button"
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

interface PrizeSectionProps {
  onStart: () => void
}

export function PrizeSection({ onStart }: PrizeSectionProps) {
  return (
    <section className="relative py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Gold spotlight effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center">
              <img
                src="/victory.svg"
                alt="Victory"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Title section */}
          <div className="space-y-6">
            {/* Decorative line above */}
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
            
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl lg:text-5xl font-bold tracking-[0.08em] text-white drop-shadow-2xl leading-[1.15] uppercase">
                Prêmio Oficial
              </h2>
              <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto text-pretty leading-relaxed font-light tracking-wide">
                Quem prevê o Oscar® prova que sabe tudo sobre cinema e merece viver essa experiência intensamente!
              </p>
            </div>
            
            {/* Decorative line below */}
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
          </div>

          {/* Prize Box Unificada */}
          <div className="max-w-4xl mx-auto pt-4">
            <div className="p-8 border border-amber-400/30 bg-amber-400/5 rounded-sm backdrop-blur-sm hover:border-amber-400/50 transition-all duration-300">
              
              {/* Grid com os dois prêmios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Golden Ticket */}
                <div className="space-y-4">
                
                {/* Golden Ticket Image */}
                <div className="my-6 flex justify-center">
                  <div className="relative w-full max-w-sm aspect-video overflow-hidden rounded-sm bg-gradient-to-br from-black via-gray-900 to-black">
                    <img
                      src="/ticket.png"
                      alt="Golden Ticket Diamond"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-4"
                    />
                  </div>
                </div>

                  <h3 className="text-2xl font-light tracking-wide text-amber-400/95">Golden Ticket Diamond</h3>
                  <p className="text-white/70 leading-relaxed font-light">
                    Um ano de cinema grátis*
                  </p>
                  <p className="text-white/70 leading-relaxed font-light">
                    52 entradas de cinema grátis para você (uma para cada semana do ano), basta escolher o seu cinema preferido e trocar o voucher.
                  </p>
                </div>
                
                {/* Apple Watch */}
                <div className="space-y-4">
                
                  {/* Apple Watch Image */}
                  <div className="my-6 flex justify-center">
                    <div className="relative w-full max-w-sm aspect-video overflow-hidden rounded-sm bg-black">
                      <img
                        src="/AppleWatch.jpg"
                        alt="Apple Watch SE"
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>

                  <h3 className="text-2xl font-light tracking-wide text-amber-400/95">Apple Watch SE</h3>
                  <p className="text-white/70 leading-relaxed font-light">O acessório perfeito para quem vive e respira cinema.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Closing message */}
          <div className="pt-6 space-y-4">
            
            {/* Ranking Geral notice */}
            <div className="max-w-2xl mx-auto pt-4">
              <div className="p-4 bg-amber-400/10 border border-amber-400/30 rounded-sm space-y-3">
                <p className="text-base text-white/90 font-medium">
                  Apenas quem ficar em 1º lugar no <span className="text-amber-400 font-bold">Ranking Geral</span> ganha os prêmios.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-sm text-amber-400/ hover:text-amber-400 underline underline-offset-4 font-medium">
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
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mt-8">
            <GoldButton
              onClick={onStart}
              size="lg"
            >
              PARTICIPAR DO BOLÃO OFICIAL
            </GoldButton>
          </div>
        </div>
      </div>
    </section>
  )
}
