import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SINAL.',
  description: 'Radar de disponibilidade semanal para times de design',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}