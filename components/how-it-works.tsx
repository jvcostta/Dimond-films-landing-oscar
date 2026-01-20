import { User, Film, Trophy, Award } from "lucide-react"
import { GoldButton } from "@/components/ui/gold-button"

interface HowItWorksProps {
  onStart: () => void
}

const steps = [
  {
    icon: User,
    title: "Cadastre-se",
    description: "Crie sua conta em poucos segundos.",
  },
  {
    icon: Film,
    title: "Faça suas previsões",
    description: "Escolha os vencedores das 23 categorias do Oscar®.",
  },
  {
    icon: Trophy,
    title: "Dispute Rankings",
    description: "Acompanhe sua posição no ranking geral ou do seu bolão.",
  },
  {
    icon: Award,
    title: "Ganhe e Aproveite",
    description: "Quem acertar mais, leva o prêmio máximo.",
  },
]

export function HowItWorks({ onStart }: HowItWorksProps) {
  return (
    <section className="relative py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent mb-12" />

        <div className="text-center mb-12 space-y-6">
          {/* Decorative line above */}
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
          
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.08em] text-white drop-shadow-2xl leading-[1.15] uppercase">
              Como Funciona
            </h2>
            <p className="text-lg md:text-xl font-light text-white/70 tracking-wide">Em quatro passos simples</p>
          </div>
          
          {/* Decorative line below */}
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="flex flex-col items-center text-center space-y-4 p-6">
                {/* Icon container */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-sm border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm transition-all duration-300 group-hover:border-amber-400/50 group-hover:bg-white/10">
                    <step.icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                  {/* Step number */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-xl font-light tracking-wide">{step.title}</h3>
                <p className="text-white/70 leading-relaxed text-sm font-light">{step.description}</p>
              </div>

              {/* Connecting line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/4 -right-4 w-8 h-px bg-gradient-to-r from-white/20 to-transparent" />
              )}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-10">
          <GoldButton
            onClick={onStart}
            size="lg"
          >
            Participar do Bolão
          </GoldButton>
        </div>
      </div>
    </section>
  )
}
