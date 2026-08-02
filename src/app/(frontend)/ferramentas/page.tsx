import type { Metadata } from 'next'
import Link from 'next/link'

import LogoLink from '@/components/LogoLink'
import { SITE_URL } from '@/lib/seo'
import { TOOLS } from '@/lib/tools'

export const metadata: Metadata = {
  title: 'ferramentas grátis pra quem cria',
  description:
    'Ferramentas gratuitas de vídeo, foto e texto pra criadores: organizador de roteiro pra reels, teleprompter online e mais. Direto no navegador, sem cadastro.',
  alternates: { canonical: '/ferramentas' },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/ferramentas`,
    title: 'ferramentas — brunodup',
    description: 'Ferramentas gratuitas de vídeo, foto e texto pra criadores.',
  },
}

function BackButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors duration-150"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M9 12L4 7l5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      voltar
    </Link>
  )
}

export default function FerramentasPage() {
  return (
    <div className="min-h-screen bg-white">
      <LogoLink className="board-title text-black select-none" />

      <div className="w-[95%] mx-auto pt-2 pb-24 md:w-auto md:max-w-[90vw] md:px-6">
        <nav className="mb-10">
          <BackButton />
        </nav>

        <h1 className="font-switzer text-[1.75rem] font-semibold leading-tight tracking-tight text-black mb-2">
          Ferramentas
        </h1>
        <p className="max-w-[680px] text-[1rem] leading-relaxed text-[#333] mb-10">
          Ferramentas gratuitas pra quem cria — vídeo, foto, texto. Tudo roda no seu
          navegador, sem cadastro e sem enviar nada pra servidor nenhum.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TOOLS.map((tool, i) => {
            const inner = (
              <>
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">
                  {tool.status === 'live' ? 'grátis' : 'em breve'}
                </p>
                <p className="text-base font-medium text-black leading-snug">{tool.name}</p>
                <p className="text-sm leading-relaxed text-[#555] mt-2">{tool.description}</p>
              </>
            )
            return (
              <div
                key={tool.slug}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {tool.status === 'live' ? (
                  <Link
                    href={`/ferramentas/${tool.slug}`}
                    className="block h-full border border-gray-200 rounded-md p-6 hover:border-black transition-colors"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="h-full border border-gray-100 rounded-md p-6 opacity-60">
                    {inner}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
