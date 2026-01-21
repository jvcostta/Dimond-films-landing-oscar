"use client"

import { GoldButton } from "@/components/ui/gold-button"

interface HeroSectionProps {
  onStart: () => void
}

export function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <section className="relative">
      <div className="slideshow">
        <div
          className="slide active"
          style={{ backgroundImage: `url("/background_image.jpeg")` }}
        />

        {/* Dark gradient overlay for text readability - top to bottom */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent" />
        </div>

        {/* Subtle film grain effect */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay z-[11] pointer-events-none">
          <div
            className="absolute inset-0 bg-repeat animate-grain"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulance type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            }}
          />
        </div>

        {/* Diamond Logo - Top Position */}
        <div className="absolute top-20 md:top-8 left-1/2 -translate-x-1/2 z-30">
          <img
            src="/DimondLogo.svg"
            alt="Diamond Films"
            className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl opacity-90"
          />
        </div>

        {/* Content Overlay - Centered */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pt-32 md:pt-40">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <div className="flex flex-col items-center space-y-8 md:space-y-10">
              {/* Elegant Title */}
              <div className="space-y-5">
                {/* Decorative line above */}
                <div className="w-16 h-[1px] bg-linear-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
                
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-[4.5rem] font-bold tracking-[0.08em] text-white drop-shadow-2xl leading-[1.15] uppercase">
                    <span className="block font-bold tracking-[0.12em]">Bolão do Oscar<sup className="text-[0.4em] align-super">®</sup></span>
                    <span className="block text-xl md:text-2xl lg:text-3xl xl:text-4xl font-thin tracking-[0.2em] text-amber-400/95 mt-3 md:mt-4">
                      2026
                    </span>
                  </h1>
                </div>
                
                {/* Decorative line below */}
                <div className="w-16 h-[1px] bg-linear-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
              </div>

              {/* Tagline */}
              <div className="max-w-2xl mx-auto space-y-5">
                <p className="text-lg md:text-xl lg:text-2xl font-light text-white/95 drop-shadow-lg leading-relaxed tracking-wide">
                  Adivinhe os vencedores.<br className="hidden md:block" /> Viva o cinema.
                </p>
              </div>

              {/* Description */}
              <div className="max-w-2xl mx-auto pt-2">
                <p className="text-sm md:text-base lg:text-lg text-white/70 leading-relaxed text-pretty drop-shadow-md tracking-normal font-light">
                  Mostre que você entende de cinema, dispute rankings, crie seu próprio bolão com amigos e concorra a um
                  ano inteiro de experiências Diamond.
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center pt-4">
                <GoldButton onClick={onStart} size="lg">
                  Participar do Bolão
                </GoldButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
