import type { Metadata } from 'next'
import { Caveat } from 'next/font/google'
import Link from 'next/link'

import LogoLink from '@/components/LogoLink'
import EmailCaptureCard from '@/components/tools/EmailCaptureCard'
import VideoBackdrop from '@/components/tools/VideoBackdrop'
import {
  DoodleArrow,
  DoodleCircle,
  DoodleSpark,
  DoodleStep,
  DoodleUnderline,
} from '@/components/tools/doodles'
import { SITE_URL } from '@/lib/seo'
import { TOOLS, getTool } from '@/lib/tools'

// Fonte manuscrita — só nas anotações desta landing.
const caveat = Caveat({ subsets: ['latin'], weight: ['500', '600'], display: 'swap' })

export const metadata: Metadata = {
  title: 'ferramentas grátis pra quem cria',
  description:
    'Bancada de criação: roteiro, teleprompter e legenda já no ar — análise de vídeo, storytelling e design tokens no rascunho. Grátis, direto no navegador.',
  alternates: { canonical: '/ferramentas' },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/ferramentas`,
    title: 'ferramentas — brunodup',
    description: 'Bancada de criação — audiovisual, texto, multimídia. Grátis, direto no navegador.',
  },
}

const FLUXO = [
  {
    n: 1,
    verbo: 'escreve',
    slug: 'roteiro-reels',
    nota: 'hook, desenvolvimento e cta — com a conta de quantos segundos o texto dá',
  },
  {
    n: 2,
    verbo: 'grava',
    slug: 'teleprompter',
    nota: 'lendo a tela, sem decorar nada',
  },
  {
    n: 3,
    verbo: 'posta',
    slug: 'legenda-instagram',
    nota: 'com legenda formatada e quebra de linha que fica',
  },
]

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

const CARD_TILT = ['-rotate-1', 'rotate-1', '-rotate-[0.5deg]']

export default function FerramentasPage() {
  return (
    <VideoBackdrop src="/bg-tools.mp4" poster="/bg-tools-poster.jpg">
    <div className="min-h-screen">
      <LogoLink className="board-title text-black select-none" />

      <div className="w-[95%] mx-auto pt-2 pb-24 md:w-auto md:max-w-[90vw] md:px-6">
        <nav className="mb-10">
          <BackButton />
        </nav>

        {/* ── hero ─────────────────────────────────────────────────────────── */}
        <header className="py-8 md:py-12 mb-14">
          <p className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-4">
            ferramentas · grátis
          </p>
          <h1 className="font-switzer text-[2rem] md:text-[2.6rem] font-semibold leading-tight tracking-tight text-black max-w-[680px]">
            ferramentas{' '}
            <span className="relative inline-block">
              grátis
              <DoodleUnderline className="absolute -bottom-1 left-0 w-full h-[10px] text-gray-500" />
            </span>{' '}
            pra quem cria
          </h1>
          <p className="max-w-[560px] text-[1rem] leading-relaxed text-[#333] mt-5">
            Uma bancada de criação — audiovisual, texto, multimídia. Começou pelo
            vídeo: roteiro, teleprompter e legenda. O resto tá no rascunho e vai
            saindo. Tudo direto no navegador, nada instalado.
          </p>
          <div className="flex items-center gap-2 mt-6 text-gray-500">
            <span className={`${caveat.className} text-xl -rotate-2`}>a trilha de vídeo, aqui embaixo</span>
            <DoodleArrow className="w-12 h-8 rotate-45" />
          </div>
        </header>

        {/* ── a trilha de vídeo ────────────────────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-8">
            A trilha de vídeo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 max-w-[900px]">
            {FLUXO.map((passo, i) => {
              const tool = getTool(passo.slug)
              return (
                <div key={passo.n} className="relative">
                  {i > 0 && (
                    <DoodleArrow className="hidden md:block absolute -left-8 top-2 w-10 h-7 text-gray-300" />
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <DoodleStep n={passo.n} className="text-gray-500" />
                    <span className={`${caveat.className} text-2xl text-black`}>{passo.verbo}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#555] mb-2">{passo.nota}</p>
                  {tool && tool.status === 'live' && (
                    <Link
                      href={`/ferramentas/${tool.slug}`}
                      className="text-[11px] font-mono uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                    >
                      {tool.name} →
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ── as ferramentas ───────────────────────────────────────────────── */}
        <section className="mb-20">
          <h2 className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-8">
            As ferramentas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[900px]">
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
                  className={`animate-slide-up ${CARD_TILT[i % CARD_TILT.length]}`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  {tool.status === 'live' ? (
                    <Link
                      href={`/ferramentas/${tool.slug}`}
                      className="block h-full border border-gray-200 rounded-md p-6 bg-white/90 backdrop-blur-sm hover:border-black hover:bg-white hover:rotate-0 transition-all duration-200"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="h-full border border-dashed border-gray-300 rounded-md p-6 bg-white/70 backdrop-blur-sm opacity-60">
                      {inner}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ── no rascunho ──────────────────────────────────────────────────── */}
        <section className="mb-20 max-w-[900px]">
          <h2 className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-6">
            No rascunho
          </h2>
          <ul className={`${caveat.className} text-xl md:text-2xl text-gray-500 space-y-2`}>
            {[
              'análise de vídeo — cortes, ritmo e hook, quadro a quadro',
              'roteiro com IA — ela pergunta, você responde, sai roteiro',
              'storytelling — pra vídeo e pra tom de voz de marca',
              'legenda sincronizada com o áudio do vídeo',
              'design tokens a partir das tuas imagens',
            ].map((idea, i) => (
              <li key={idea} className={`flex items-baseline gap-3 ${i % 2 ? 'rotate-[0.4deg]' : '-rotate-[0.4deg]'}`}>
                <span className="font-mono text-[11px] text-gray-300 shrink-0">○</span>
                {idea}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[11px] font-mono uppercase tracking-widest text-gray-300">
            sem data — vai saindo conforme fica pronto
          </p>
        </section>

        {/* ── captação ─────────────────────────────────────────────────────── */}
        <section className="relative max-w-[900px]">
          <div className="flex items-start gap-3 mb-4 text-gray-500">
            <DoodleSpark className="w-5 h-5 mt-1" />
            <span className={`${caveat.className} text-xl rotate-1`}>a parte do combinado</span>
          </div>
          <EmailCaptureCard handClass={caveat.className} />
          <div className="hidden md:block absolute right-[15%] top-8 text-gray-200 pointer-events-none">
            <DoodleCircle className="w-36 h-14" />
          </div>
        </section>
      </div>
    </div>
    </VideoBackdrop>
  )
}
