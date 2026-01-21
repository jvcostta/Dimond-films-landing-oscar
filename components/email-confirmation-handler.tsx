"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

interface EmailConfirmationHandlerProps {
  onConfirmed: () => void
}

export function EmailConfirmationHandler({ onConfirmed }: EmailConfirmationHandlerProps) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmed = searchParams.get('confirmed')
    const hasRefreshed = sessionStorage.getItem('email-confirmed-refreshed')
    
    if (confirmed === 'true' && !hasRefreshed) {
      // Marca que vai fazer o refresh
      sessionStorage.setItem('email-confirmed-refreshed', 'true')
      // Remove o parâmetro e recarrega a página
      window.location.href = '/'
      return
    }
    
    // Se já refreshou, mostra a confirmação e limpa a flag
    if (hasRefreshed === 'true') {
      sessionStorage.removeItem('email-confirmed-refreshed')
      onConfirmed()
    }
  }, [searchParams, onConfirmed])

  return null
}
