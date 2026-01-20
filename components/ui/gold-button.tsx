"use client"

import type React from "react"

interface GoldButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  size?: "default" | "lg"
}

export function GoldButton({ children, onClick, className = "", size = "default" }: GoldButtonProps) {
  const sizeClasses = size === "lg" ? "px-12 py-4 text-lg" : "px-8 py-3 text-base"

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses}
        font-semibold
        tracking-wide
        rounded-full
        bg-black
        text-white
        border-2 border-[#ffcc33]
        shadow-[0_0_6px_rgba(255,204,51,0.6),0_0_12px_rgba(255,204,51,0.4)]
        ${className}
      `}
    >
      {children}
    </button>
  )
}
