"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  size?: "default" | "lg"
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, children, size = "default", ...props }, ref) => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
    const [isHovering, setIsHovering] = React.useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    return (
      <button
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={cn(
          "group relative inline-flex items-center justify-center overflow-hidden rounded-sm font-semibold transition-all duration-300 ease-out cursor-pointer",
          "hover:scale-105 active:scale-95",
          size === "lg" ? "px-8 py-6 text-lg" : "px-6 py-3 text-base",
          className
        )}
        {...props}
      >
        {/* Radial glow that follows mouse */}
        {isHovering && (
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,215,0,0.15), transparent 40%)`,
            }}
          />
        )}

        {/* Animated gradient background */}
        <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] bg-[length:200%_100%] animate-shimmer" />
        
        {/* Pulsing glow layers */}
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent blur-2xl animate-pulse" />
        </span>

        {/* Multiple shine effects */}
        <span className="absolute inset-0 overflow-hidden rounded-sm">
          <span className="absolute top-0 left-[-100%] h-full w-[30%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] group-hover:left-[150%] transition-all duration-1000 ease-out" />
          <span className="absolute top-0 left-[-100%] h-full w-[20%] bg-gradient-to-r from-transparent via-[#FFD700]/60 to-transparent skew-x-[-25deg] group-hover:left-[150%] transition-all duration-700 ease-out delay-150" />
        </span>

        {/* Animated border with particles effect */}
        <span className="absolute inset-0 rounded-sm">
          <span className="absolute inset-0 rounded-sm border-2 border-[#FFD700]/50 group-hover:border-[#FFD700] transition-colors duration-300" />
          <span className="absolute inset-0 rounded-sm border border-[#E6C97A]/30 animate-pulse" />
        </span>
        
        {/* Inner glow ring with gradient */}
        <span className="absolute inset-[3px] rounded-sm bg-gradient-to-b from-black/90 via-black/85 to-black/90 backdrop-blur-sm" />

        {/* Corner sparkles */}
        <span className="absolute top-0 left-0 w-2 h-2 bg-[#FFD700] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />
        <span className="absolute top-0 right-0 w-2 h-2 bg-[#FFD700] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 blur-[1px]" />
        <span className="absolute bottom-0 left-0 w-2 h-2 bg-[#FFD700] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 blur-[1px]" />
        <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#FFD700] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 blur-[1px]" />

        {/* Content with enhanced glow */}
        <span 
          className="relative z-10 flex items-center gap-2 text-white font-bold tracking-wide transition-all duration-300"
          style={{
            textShadow: isHovering
              ? "0 0 20px rgba(255,215,0,0.8), 0 0 30px rgba(255,215,0,0.4), 0 0 40px rgba(212,175,55,0.3)"
              : "0 0 10px rgba(255,215,0,0.5), 0 0 20px rgba(255,215,0,0.3)",
          }}
        >
          {children}
        </span>

        {/* Ripple effect on click */}
        <span className="absolute inset-0 rounded-sm opacity-0 group-active:opacity-100 bg-[#FFD700]/20 transition-opacity duration-150" />
      </button>
    )
  }
)
PremiumButton.displayName = "PremiumButton"

export { PremiumButton }
