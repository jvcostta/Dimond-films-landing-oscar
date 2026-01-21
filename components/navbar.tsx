'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleMeuPalpiteClick = async () => {
    // Redireciona para a página Meus Palpites
    router.push('/meus-palpites')
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/80 backdrop-blur-md shadow-lg' 
          : 'bg-black/40 backdrop-blur-sm'
      }`}
    >
      <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-end h-16">
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('como-funciona')}
              className="text-white/90 hover:text-[#ffcc33] transition-colors text-sm font-medium"
            >
              Como Funciona
            </button>
            <button
              onClick={() => scrollToSection('premio-oficial')}
              className="text-white/90 hover:text-[#ffcc33] transition-colors text-sm font-medium"
            >
              Prêmio Oficial
            </button>
            <button
              onClick={handleMeuPalpiteClick}
              className="px-4 py-2 rounded-full bg-black border border-[#ffcc33] text-white hover:bg-[#ffcc33] hover:text-black transition-all duration-300 text-sm font-bold shadow-[0_0_6px_rgba(255,204,51,0.6)] hover:shadow-[0_0_12px_rgba(255,204,51,0.8)]"
            >
              Meu Palpite
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={handleMeuPalpiteClick}
              className="px-3 py-1.5 rounded-full bg-black border border-[#ffcc33] text-white text-xs font-bold"
            >
              Meu Palpite
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
