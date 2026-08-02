import Link from 'next/link'

import LogoLink from '@/components/LogoLink'
import ToolGate from '@/components/tools/ToolGate'
import VideoBackdrop from '@/components/tools/VideoBackdrop'
import { SITE_URL } from '@/lib/seo'
import { TOOLS, type Tool } from '@/lib/tools'

export type Faq = { q: string; a: string }

// Conteúdo à esquerda sobre o vídeo de fundo, sem painel — mesma estrutura
// do hub /ferramentas: largura contida (70vw) e não centralizada, deixando
// o vídeo visível à direita.
const CONTENT = 'w-[95%] mx-auto pt-2 pb-24 md:w-auto md:max-w-[70vw] md:mx-0 md:ml-[5vw] md:pr-6'

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
    <VideoBackdrop
      src="/bg-tools.mp4"
      poster="/bg-tools-poster.jpg"
      persistent={<LogoLink className="board-title text-black select-none" />}
    >
    <div className="min-h-screen">
      <ToolJsonLd tool={tool} faq={faq} />

      <div className={CONTENT}>
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

        <ToolGate source={tool.slug}>{children}</ToolGate>

        <aside className="max-w-[680px] mt-10 border border-dashed border-gray-300 rounded-md p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5">
            onde tuas coisas ficam salvas
          </p>
          <p className="text-sm leading-relaxed text-[#555]">
            O que você cria aqui fica guardado no teu navegador, como um cookie —
            voltando pelo mesmo navegador, tá tudo no lugar. Mas não existe conta
            nem histórico no servidor: se limpar os dados do navegador, perde tudo.
            Copia o que for importante pra um lugar seguro.
          </p>
        </aside>

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
    </VideoBackdrop>
  )
}
