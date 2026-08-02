import Link from 'next/link'

import LogoLink from '@/components/LogoLink'
import { SITE_URL } from '@/lib/seo'
import { TOOLS, type Tool } from '@/lib/tools'

export type Faq = { q: string; a: string }

function BackButton() {
  return (
    <Link
      href="/ferramentas"
      className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors duration-150"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M9 12L4 7l5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      voltar
    </Link>
  )
}

function ToolJsonLd({ tool, faq }: { tool: Tool; faq: Faq[] }) {
  const app = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    url: `${SITE_URL}/ferramentas/${tool.slug}`,
    description: tool.description,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    inLanguage: 'pt-BR',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    author: { '@type': 'Person', name: 'Bruno Dup', url: SITE_URL },
  }
  const faqLd =
    faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }} />
      {faqLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      )}
    </>
  )
}

export default function ToolShell({
  tool,
  intro,
  faq,
  children,
}: {
  tool: Tool
  /** Parágrafo de abertura — é o conteúdo que ranqueia, não a ferramenta. */
  intro: string
  faq: Faq[]
  children: React.ReactNode
}) {
  const others = TOOLS.filter((t) => t.slug !== tool.slug && t.status === 'live')

  return (
    <div className="min-h-screen bg-white">
      <ToolJsonLd tool={tool} faq={faq} />
      <LogoLink className="board-title text-black select-none" />

      <div className="w-[95%] mx-auto pt-2 pb-24 md:w-auto md:max-w-[90vw] md:px-6">
        <nav className="mb-10 flex items-center justify-between">
          <BackButton />
          <span className="text-[11px] font-mono uppercase tracking-widest text-gray-300">
            grátis · direto no navegador
          </span>
        </nav>

        <header className="max-w-[680px] mb-10">
          <h1 className="font-switzer text-[1.75rem] font-semibold leading-tight tracking-tight text-black mb-4">
            {tool.title}
          </h1>
          <p className="text-[1rem] leading-relaxed text-[#333]">{intro}</p>
        </header>

        {children}

        {faq.length > 0 && (
          <section className="max-w-[680px] mt-16 pt-10 border-t border-gray-100">
            <h2 className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-6">
              Perguntas frequentes
            </h2>
            <dl className="space-y-6">
              {faq.map((f) => (
                <div key={f.q}>
                  <dt className="text-sm font-medium text-black mb-1">{f.q}</dt>
                  <dd className="text-sm leading-relaxed text-[#555]">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {others.length > 0 && (
          <section className="max-w-[680px] mt-16 pt-10 border-t border-gray-100">
            <h2 className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-6">
              Vai bem com
            </h2>
            <div className="space-y-3">
            {others.map((t) => (
              <Link
                key={t.slug}
                href={`/ferramentas/${t.slug}`}
                className="group block border border-gray-200 rounded-md p-5 hover:border-black transition-colors"
              >
                <p className="text-sm font-medium text-black group-hover:underline underline-offset-2">
                  {t.name}
                </p>
                <p className="text-sm text-[#555] mt-1">{t.description}</p>
              </Link>
            ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
