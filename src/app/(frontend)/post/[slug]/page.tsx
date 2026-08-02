import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@payload-config'
import type { Category, Media, Post } from '@/payload-types'
import CodePlayground from '@/components/CodePlayground'
import ImageWithModal from '@/components/ImageWithModal'
import LogoLink from '@/components/LogoLink'
import PostCard from '@/components/PostCard'
import type { JsMode } from '@/lib/playground'
import {
  PUBLISHED,
  SITE_NAME,
  SITE_URL,
  getPostBySlug,
  postDescription,
  postImage,
  postTitle,
} from '@/lib/seo'

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
        <nav className="mb-14 flex items-center justify-between">
          <BackButton />
          <Link
            href="/blog"
            className="text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors duration-150"
          >
            todos os posts →
          </Link>
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

function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null
  return (
    <div className="mt-16 pt-10 border-t border-gray-100">
      <h2 className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-6">
        Veja também
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} sizes="(max-width: 680px) 50vw, 160px" />
        ))}
      </div>
    </div>
  )
}

// ── Anterior / próximo ────────────────────────────────────────────────────────

function PagerLink({
  post,
  direction,
}: {
  post: Post | null
  direction: 'prev' | 'next'
}) {
  if (!post) return <span />
  const isNext = direction === 'next'
  return (
    <Link
      href={`/post/${post.slug}`}
      className={`group flex flex-col gap-1 ${isNext ? 'items-end text-right' : 'items-start'}`}
    >
      <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
        {isNext ? 'próximo →' : '← anterior'}
      </span>
      {post.title && (
        <span className="text-sm font-medium text-black leading-snug line-clamp-1 group-hover:underline underline-offset-2">
          {post.title}
        </span>
      )}
    </Link>
  )
}

function PostPager({ prev, next }: { prev: Post | null; next: Post | null }) {
  if (!prev && !next) return null
  return (
    <nav className="mt-10 pt-6 border-t border-gray-100 grid grid-cols-2 gap-6">
      <PagerLink post={prev} direction="prev" />
      <PagerLink post={next} direction="next" />
    </nav>
  )
}

// ── SEO ───────────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: PUBLISHED,
    depth: 0,
    limit: 500,
    select: { slug: true },
    overrideAccess: true,
  })
  return docs.filter((p) => p.slug).map((p) => ({ slug: p.slug as string }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  const title = postTitle(post)
  const description = postDescription(post)
  const image = postImage(post)
  const url = `/post/${post.slug}`
  const p = post as Post & { publishedAt?: string | null }

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      publishedTime: p.publishedAt ?? post.createdAt,
      modifiedTime: post.updatedAt,
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
    },
  }
}

function PostJsonLd({ post }: { post: Post }) {
  const p = post as Post & { publishedAt?: string | null }
  const image = postImage(post)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: postTitle(post),
    description: postDescription(post),
    url: `${SITE_URL}/post/${post.slug}`,
    datePublished: p.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    inLanguage: 'pt-BR',
    author: { '@type': 'Person', name: 'Bruno Dup', url: SITE_URL },
    ...(image ? { image: image.url } : {}),
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/post/${post.slug}` },
  }
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function PostMeta({ post }: { post: Post }) {
  const p = post as Post & { publishedAt?: string | null; categories?: unknown[] }
  const cats = (p.categories ?? []).filter(
    (c): c is Category => typeof c === 'object' && c !== null && 'name' in c,
  )
  const date = p.publishedAt ?? post.createdAt
  const formatted = date
    ? new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  if (!formatted && cats.length === 0) return null

  return (
    <footer className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-2">
      {formatted && (
        <time
          dateTime={date ?? undefined}
          className="text-[11px] font-mono uppercase tracking-widest text-gray-400"
        >
          {formatted}
        </time>
      )}
      {cats.map((cat) =>
        cat.slug ? (
          <Link
            key={cat.id}
            href={`/categoria/${cat.slug}`}
            className="text-[11px] font-mono uppercase tracking-widest text-gray-400 hover:text-black transition-colors border border-gray-200 rounded-full px-3 py-1"
          >
            {cat.name}
          </Link>
        ) : null,
      )}
    </footer>
  )
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  // Extrai IDs de categorias do post atual (depth:1 → objetos populados)
  type CatRef = { id: number } | number
  const catRefs = ((post as Post & { categories?: CatRef[] }).categories ?? [])
  const categoryIds = catRefs
    .map((c) => (typeof c === 'object' && c !== null ? (c as { id: number }).id : (c as number)))
    .filter(Boolean)

  const payload = await getPayload({ config })
  const pDate = (post as Post & { publishedAt?: string | null }).publishedAt ?? post.createdAt

  const [relatedRes, prevRes, nextRes] = await Promise.all([
    // Só busca relacionados se o post tiver ao menos uma categoria
    categoryIds.length > 0
      ? payload.find({
          collection: 'posts',
          where: {
            and: [
              { slug: { not_equals: slug } },
              { categories: { in: categoryIds } },
              PUBLISHED,
            ],
          },
          depth: 1,
          limit: 4,
          sort: '-publishedAt',
          overrideAccess: true,
        })
      : Promise.resolve({ docs: [] as Post[] }),
    payload.find({
      collection: 'posts',
      where: { and: [{ publishedAt: { less_than: pDate } }, { slug: { not_equals: slug } }, PUBLISHED] },
      depth: 0,
      limit: 1,
      sort: '-publishedAt',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'posts',
      where: { and: [{ publishedAt: { greater_than: pDate } }, { slug: { not_equals: slug } }, PUBLISHED] },
      depth: 0,
      limit: 1,
      sort: 'publishedAt',
      overrideAccess: true,
    }),
  ])

  return (
    <PostShell>
      <PostJsonLd post={post} />
      <PostContent post={post} />
      <PostMeta post={post} />
      <PostPager prev={prevRes.docs[0] ?? null} next={nextRes.docs[0] ?? null} />
      <RelatedPosts posts={relatedRes.docs} />
    </PostShell>
  )
}
