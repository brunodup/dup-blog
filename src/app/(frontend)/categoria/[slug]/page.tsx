import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@payload-config'
import type { Media, Post } from '@/payload-types'
import LogoLink from '@/components/LogoLink'

export const revalidate = 60

function isMedia(m: unknown): m is Media {
  return typeof m === 'object' && m !== null && 'url' in m
}

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

// ── Post card ─────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  text: 'texto', image: 'imagem', quote: 'citação',
  video: 'vídeo', audio: 'áudio', snippet: 'snippet',
}

function PostCard({ post }: { post: Post }) {
  const p = post as Post & { thumbnail?: unknown }
  const media   = isMedia(post.media)  ? post.media  : null
  const thumb   = isMedia(p.thumbnail) ? p.thumbnail : null
  const imgSrc  = media?.sizes?.card?.url ?? media?.url ?? thumb?.url ?? null

  return (
    <Link href={`/post/${post.slug}`} className="group block">
      <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-gray-100 mb-2">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={post.title || ''}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 680px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-300">
              {TYPE_LABEL[post.type ?? 'text'] ?? post.type}
            </span>
          </div>
        )}
      </div>
      {post.title && (
        <p className="text-sm font-medium text-black leading-snug line-clamp-2 group-hover:underline underline-offset-2">
          {post.title}
        </p>
      )}
      <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-widest">
        {TYPE_LABEL[post.type ?? 'text'] ?? post.type}
      </p>
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
  return { title: `${cat.name} — brunodup` }
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
    where: { categories: { in: [category.id] } },
    depth: 1,
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
  })

  return (
    <div className="min-h-screen bg-white">
      <LogoLink className="board-title text-black select-none" />

      <div className="w-[95%] mx-auto pt-2 pb-24 md:w-auto md:max-w-[90vw] md:px-6">
        <nav className="mb-10">
          <BackButton />
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
  )
}
