import type { Metadata } from 'next'
import { Geist } from 'next/font/google'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'brunodup',
  description: 'brunodup — portfólio e pensamentos visuais.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geistSans.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
