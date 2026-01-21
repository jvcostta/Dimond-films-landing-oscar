"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

interface EmailConfirmationHandlerProps {
  onConfirmed: () => void
}

export function EmailConfirmationHandler({ onConfirmed }: EmailConfirmationHandlerProps) {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('confirmed') === 'true') {
      onConfirmed()
    }
  }, [searchParams, onConfirmed])

  return null
}
