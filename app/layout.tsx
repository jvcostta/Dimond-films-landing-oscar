import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bolão do Oscar 2026 - Diamond Films",
  description:
    "Adivinhe os vencedores. Viva o cinema. Participe do bolão, dispute rankings e concorra a prêmios incríveis.",
  icons: {
    icon: [
      {
        url: "/DimondLogo.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/DimondLogo.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
