"use client"

import Image from "next/image"
import { Award } from "lucide-react"

const nominations = [
  {
    title: "Marty Supreme",
    image: "/Marty-Supreme_Diamond-Films_2-scaled.jpg",
    totalNominations: 3,
    nominations: [
      "Melhor Filme",
      "Melhor Ator - Timothée Chalamet",
      "Melhor Roteiro Original"
    ]
  },
  {
    title: "Coração de Lutador - The Smashing Machine",
    image: "/smashing.jpg", // Usando imagem de fundo como placeholder temporário
    totalNominations: 2,
    nominations: [
      "Melhor Ator - Dwayne Johnson",
      "Melhor Edição"
    ]
  }
]

export function OscarNominations() {
  return (
    <section className="relative py-16 px-6 overflow-hidden bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent mb-12" />

        <div className="text-center mb-12 space-y-6">
          {/* Decorative line above */}
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
          
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl lg:text-5xl font-bold tracking-[0.08em] text-white drop-shadow-2xl leading-[1.15] uppercase">
              Filmes Indicados ao Oscar<sup className="text-[0.4em] align-super">®</sup>
            </h2>
            <p className="text-lg md:text-xl font-light text-white/70 tracking-wide">Diamond Films no Oscar® 2026</p>

          </div>
          
          {/* Decorative line below */}
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          {nominations.map((film, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-sm border border-white/10 hover:border-amber-400/50 transition-all duration-300 bg-black/50"
            >
              {/* Image container */}
              <div className="relative aspect-[16/9] max-h-64 overflow-hidden bg-black/50">
                <Image
                  src={film.image}
                  alt={film.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
                
                {/* Nomination badge */}
                <div className="absolute top-4 right-4 bg-amber-400/20 backdrop-blur-sm border border-amber-400/50 rounded-sm px-4 py-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-white tracking-wide">
                    {film.totalNominations} {film.totalNominations === 1 ? "Indicação" : "Indicações"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6 space-y-3">
                <h3 className="text-xl md:text-2xl font-light tracking-wide text-white">
                  {film.title}
                </h3>
                
                <div className="space-y-2">
                  <p className="text-sm text-amber-400/80 uppercase tracking-widest font-light">
                    Indicações
                  </p>
                  <ul className="space-y-2">
                    {film.nominations.map((nomination, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-white/80">
                        <span className="text-amber-400/60 mt-1">•</span>
                        <span className="text-sm md:text-base font-light tracking-wide">{nomination}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Gold accent on hover */}
              <div className="absolute inset-0 border-2 border-amber-400/0 group-hover:border-amber-400/30 rounded-sm transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Section divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent mt-16" />
      </div>
    </section>
  )
}

