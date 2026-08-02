import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@payload-config'
import LogoLink from '@/components/LogoLink'
import PostCard from '@/components/PostCard'
import VideoBackdrop from '@/components/tools/VideoBackdrop'
import { PUBLISHED } from '@/lib/seo'

export const revalidate = 60

// Conteúdo à esquerda sobre o vídeo de fundo, sem painel — mesma estrutura
// do hub /ferramentas: largura contida (70vw) e não centralizada, deixando
// o vídeo visível à direita.
const CONTENT = 'w-[95%] mx-auto pt-2 pb-24 md:w-auto md:max-w-[70vw] md:mx-0 md:ml-[5vw] md:pr-6'

// ── Shell ─────────────────────────────────────────────────────────────────────

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

// ── SEO ───────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const cat = docs[0]
  if (!cat) return {}
  return {
    title: cat.name,
    description: `Posts sobre ${cat.name.toLowerCase()} no mural de Bruno Dup.`,
    alternates: { canonical: `/categoria/${cat.slug}` },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs: cats } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  const category = cats[0]
  if (!category) notFound()

  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: { and: [{ categories: { in: [category.id] } }, PUBLISHED] },
    depth: 1,
    limit: 100,
    sort: '-publishedAt',
    overrideAccess: true,
  })

  return (
    <VideoBackdrop
      src="/bg-blog.mp4"
      poster="/bg-blog-poster.jpg"
      pauseAt={2.5}
      persistent={<LogoLink className="board-title text-black select-none" />}
    >
    <div className="min-h-screen">

      <div className={CONTENT}>
        <nav className="mb-10 flex items-center justify-between">
          <BackButton />
          <Link
            href="/blog"
            className="text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors duration-150"
          >
            todos os posts →
          </Link>
        </nav>

        <h1 className="font-switzer text-[1.75rem] font-semibold leading-tight tracking-tight text-black mb-2">
          {category.name}
        </h1>
        <p className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-10">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </p>

        {posts.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhum post nessa categoria ainda.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {posts.map((post, i) => (
              <div
                key={post.id}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </VideoBackdrop>
  )
}
