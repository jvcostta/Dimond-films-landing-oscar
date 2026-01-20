import { Trophy, Medal } from "lucide-react"
import { GoldButton } from "@/components/ui/gold-button"

interface RankingSectionProps {
  onStart: () => void
}

const mockRankings = [
  { position: 1, name: "Maria Silva", points: 18, city: "São Paulo" },
  { position: 2, name: "João Santos", points: 17, city: "Rio de Janeiro" },
  { position: 3, name: "Ana Costa", points: 16, city: "Belo Horizonte" },
  { position: 4, name: "Pedro Oliveira", points: 15, city: "Brasília" },
  { position: 5, name: "Juliana Souza", points: 15, city: "Porto Alegre" },
  { position: 6, name: "Carlos Lima", points: 14, city: "Curitiba" },
  { position: 7, name: "Fernanda Rocha", points: 14, city: "Recife" },
  { position: 8, name: "Ricardo Alves", points: 13, city: "Salvador" },
  { position: 9, name: "Patricia Dias", points: 13, city: "Fortaleza" },
  { position: 10, name: "Lucas Ferreira", points: 12, city: "Manaus" },
]

export function RankingSection({ onStart }: RankingSectionProps) {
  return (
    <section className="relative py-16 px-6">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent mb-12" />

        <div className="text-center mb-12 space-y-6">
          {/* Decorative line above */}
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
          
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl lg:text-5xl font-bold tracking-[0.08em] text-white drop-shadow-2xl leading-[1.15] uppercase">
              Ranking Geral
            </h2>
            <p className="text-lg md:text-xl font-light text-white/70 tracking-wide">Quem previu os rumos do cinema</p>
          </div>
          
          {/* Decorative line below */}
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
        </div>

        <div className="max-w-4xl mx-auto space-y-2">
          {mockRankings.map((entry) => (
            <div
              key={entry.position}
              className={`flex items-center justify-between p-5 border rounded-sm transition-all duration-200 ${
                entry.position <= 3 ? "border-amber-400/40 bg-amber-400/5" : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center gap-6">
                {/* Position indicator */}
                <div
                  className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-sm font-bold ${
                    entry.position === 1
                      ? "bg-amber-400/20 text-amber-400 border border-amber-400/50"
                      : entry.position === 2
                        ? "bg-gray-300/20 text-gray-300 border border-gray-300/50"
                        : entry.position === 3
                          ? "bg-amber-600/20 text-amber-600 border border-amber-600/50"
                          : "bg-white/5 text-white/50 border border-white/10"
                  }`}
                >
                  {entry.position <= 3 ? (
                    entry.position === 1 ? (
                      <Trophy className="w-6 h-6" />
                    ) : (
                      <Medal className="w-6 h-6" />
                    )
                  ) : (
                    entry.position
                  )}
                </div>

                {/* User info */}
                <div>
                  <div className="font-light text-lg tracking-wide">{entry.name}</div>
                  <div className="text-sm text-white/60 font-light">{entry.city}</div>
                </div>
              </div>

              {/* Points */}
              <div className="text-right">
                <div className={`text-2xl font-bold tracking-wide ${entry.position <= 3 ? "text-amber-400/95" : "text-white"}`}>
                  {entry.points}
                </div>
                <div className="text-xs text-white/60 uppercase tracking-wider font-light">pontos</div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/60 text-sm mt-8 font-light tracking-wide">Rankings atualizados após a cerimônia do Oscar®</p>

        {/* CTA Button */}
        <div className="flex justify-center mt-8">
          <GoldButton
            onClick={onStart}
            size="lg"
          >
            Participar do Bolão
          </GoldButton>
        </div>

        {/* Section divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent mt-20" />
      </div>
    </section>
  )
}
