import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: `${SITE_NAME} — feed` }],
    },
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'pt_BR',
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  // Google Search Console: setar GOOGLE_SITE_VERIFICATION na Vercel com o token
  // do método "HTML tag" (ou verificar o domínio inteiro via DNS e ignorar isto).
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'pt-BR',
  author: {
    '@type': 'Person',
    name: 'Bruno Dup',
    url: SITE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geistSans.variable}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <NextTopLoader color="#38bdf8" height={3} showSpinner={false} />
        {children}
      </body>
    </html>
  )
}
