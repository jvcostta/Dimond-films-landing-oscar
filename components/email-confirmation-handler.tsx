"use client"

import { useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"

interface EmailConfirmationHandlerProps {
  onConfirmed: () => void
}

export function EmailConfirmationHandler({ onConfirmed }: EmailConfirmationHandlerProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasRefreshed = useRef(false)

  useEffect(() => {
    if (searchParams.get('confirmed') === 'true') {
      // Se ainda não refreshou, força o refresh
      if (!hasRefreshed.current) {
        hasRefreshed.current = true
        // Remove o parâmetro da URL
        router.replace('/')
        // Força o refresh da página
        router.refresh()
        // Chama o callback após um pequeno delay
        setTimeout(() => {
          onConfirmed()
        }, 100)
      }
    }
  }, [searchParams, onConfirmed, router])

  return null
}
