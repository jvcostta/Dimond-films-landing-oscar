import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bolão do Oscar 2026 - Diamond Films",
  description:
    "Mostre que você domina o mundo do cinema, dispute o bolão principal com pessoas de todo o Brasil e tente ficar em primeiro lugar para ganhar",
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
      <body className={`font-sans antialiased overflow-x-hidden`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
