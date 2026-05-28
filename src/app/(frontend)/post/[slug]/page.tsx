import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@payload-config'
import type { Media, Post } from '@/payload-types'
import CodePlayground from '@/components/CodePlayground'
import ImageWithModal from '@/components/ImageWithModal'
import LogoLink from '@/components/LogoLink'
import type { JsMode } from '@/lib/playground'

export const revalidate = 60

// ── Helpers ───────────────────────────────────────────────────────────────────

function isMedia(m: unknown): m is Media {
  return typeof m === 'object' && m !== null && 'url' in m
}

// ── Back button ───────────────────────────────────────────────────────────────

function BackButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors duration-150"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M9 12L4 7l5-5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      voltar
    </Link>
  )
}

// ── Layout shell ──────────────────────────────────────────────────────────────

function PostShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <LogoLink className="board-title text-black select-none" />
      <div className="w-[95%] mx-auto pt-2 pb-24 md:w-auto md:max-w-[90vw] md:px-6">
        <nav className="mb-14">
          <BackButton />
        </nav>
        <article>{children}</article>
      </div>
    </div>
  )
}

// ── Post renderers ────────────────────────────────────────────────────────────

function PostTitle({ title }: { title?: string | null }) {
  if (!title) return null
  return (
    <h1 className="font-switzer text-[1.75rem] font-semibold leading-tight tracking-tight text-black mb-8">
      {title}
    </h1>
  )
}

function PostBody({ body }: { body: Post['body'] }) {
  if (!body?.root) return null
  return (
    <div className="prose prose-sm prose-gray max-w-none [&_p]:leading-relaxed [&_p]:text-[1rem] [&_p]:text-[#333]">
      <RichText data={body} />
    </div>
  )
}

function ImagePost({ post }: { post: Post }) {
  const media = isMedia(post.media) ? post.media : null
  const src = media?.sizes?.card?.url || media?.url
  const w = media?.sizes?.card?.width || media?.width || 800
  const h = media?.sizes?.card?.height || media?.height || 600

  return (
    <>
      {src && (
        <figure className="mb-8 rounded-md overflow-hidden bg-gray-100 -mx-6 sm:mx-0">
          <ImageWithModal
            src={src}
            alt={media?.alt || post.title || ''}
            width={w}
            height={h}
          />
        </figure>
      )}
      <PostTitle title={post.title} />
      <PostBody body={post.body} />
    </>
  )
}

function QuotePost({ post }: { post: Post }) {
  const hasBody = !!post.body?.root
  return (
    <blockquote className="border-l-[3px] border-black pl-7 py-1 my-0">
      <div className="text-[1.625rem] font-light italic leading-[1.35] text-black">
        {hasBody ? (
          <RichText data={post.body!} disableContainer />
        ) : (
          <p>{post.title}</p>
        )}
      </div>
      {hasBody && post.title && (
        <footer className="mt-5 text-xs tracking-widest uppercase text-gray-500 not-italic">
          {post.title}
        </footer>
      )}
    </blockquote>
  )
}

function VideoPost({ post }: { post: Post }) {
  const media = isMedia(post.media) ? post.media : null
  return (
    <>
      {media?.url && (
        <div className="mb-8 rounded-md overflow-hidden bg-black -mx-6 sm:mx-0">
          <video src={media.url} className="w-full" controls playsInline />
        </div>
      )}
      <PostTitle title={post.title} />
      <PostBody body={post.body} />
    </>
  )
}

function AudioPost({ post }: { post: Post }) {
  const media = isMedia(post.media) ? post.media : null
  return (
    <>
      <PostTitle title={post.title} />
      {media?.url && (
        <div className="mb-8">
          <audio src={media.url} controls className="w-full" />
        </div>
      )}
      <PostBody body={post.body} />
    </>
  )
}

function TextPost({ post }: { post: Post }) {
  return (
    <>
      <PostTitle title={post.title} />
      <PostBody body={post.body} />
    </>
  )
}

function SnippetPost({ post }: { post: Post }) {
  const p = post as Post & { html?: string; css?: string; js?: string; jsMode?: string }
  return (
    <>
      <PostTitle title={post.title} />
      <CodePlayground
        title={post.title ?? 'snippet'}
        html={p.html ?? ''}
        css={p.css ?? ''}
        js={p.js ?? ''}
        jsMode={(p.jsMode as JsMode) ?? 'vanilla'}
        className="h-[640px] rounded-lg overflow-hidden"
      />
      {post.body?.root && (
        <div className="max-w-[680px] mt-10">
          <PostBody body={post.body} />
        </div>
      )}
    </>
  )
}

function PostContent({ post }: { post: Post }) {
  switch (post.type) {
    case 'image':   return <ImagePost post={post} />
    case 'quote':   return <QuotePost post={post} />
    case 'video':   return <VideoPost post={post} />
    case 'audio':   return <AudioPost post={post} />
    case 'snippet': return <SnippetPost post={post} />
    default:        return <TextPost post={post} />
  }
}

// ── Veja também ───────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  text: 'texto', image: 'imagem', quote: 'citação',
  video: 'vídeo', audio: 'áudio', snippet: 'snippet',
}

function RelatedCard({ post }: { post: Post }) {
  const p = post as Post & { thumbnail?: unknown }
  const media   = isMedia(post.media)    ? post.media    : null
  const thumb   = isMedia(p.thumbnail)   ? p.thumbnail   : null
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
            sizes="(max-width: 680px) 50vw, 160px"
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

function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null
  return (
    <div className="mt-16 pt-10 border-t border-gray-100">
      <h2 className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-6">
        Veja também
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {posts.map((p) => (
          <RelatedCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  )
}

// ── SEO ───────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  const post = docs[0]
  if (!post) return {}

  return {
    title: post.title ? `${post.title} — brunodup` : 'brunodup',
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })

  const post = docs[0]
  if (!post) notFound()

  // Extrai IDs de categorias do post atual (depth:1 → objetos populados)
  type CatRef = { id: number } | number
  const catRefs = ((post as Post & { categories?: CatRef[] }).categories ?? [])
  const categoryIds = catRefs
    .map((c) => (typeof c === 'object' && c !== null ? (c as { id: number }).id : (c as number)))
    .filter(Boolean)

  // Só busca relacionados se o post tiver ao menos uma categoria
  let related: Post[] = []
  if (categoryIds.length > 0) {
    const { docs: relDocs } = await payload.find({
      collection: 'posts',
      where: {
        and: [
          { slug: { not_equals: slug } },
          { categories: { in: categoryIds } },
        ],
      },
      depth: 1,
      limit: 4,
      sort: '-createdAt',
      overrideAccess: true,
    })
    related = relDocs
  }

  return (
    <PostShell>
      <PostContent post={post} />
      <RelatedPosts posts={related} />
    </PostShell>
  )
}
