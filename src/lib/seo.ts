import { cache } from 'react'

import { getPayload } from 'payload'

import config from '@payload-config'
import type { Media, Post } from '@/payload-types'

// URL canônica do site. Em prod a Vercel tem NEXT_PUBLIC_SERVER_URL setada;
// o fallback cobre build local e preview.
export const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://brunodup.com'

export const SITE_NAME = 'brunodup'
export const SITE_DESCRIPTION =
  'Mural de Bruno Dup — design, código, fotografia e pensamentos visuais.'

// Só post publicado aparece no site, no sitemap e no feed.
export const PUBLISHED = { _status: { equals: 'published' } } as const

// ── Lexical → texto puro ──────────────────────────────────────────────────────

type LexicalNode = {
  text?: string
  children?: LexicalNode[]
  type?: string
}

function collectText(node: LexicalNode, out: string[]): void {
  if (typeof node.text === 'string') out.push(node.text)
  for (const child of node.children ?? []) collectText(child, out)
  if (node.type === 'paragraph' || node.type === 'heading') out.push('\n')
}

export function lexicalToPlainText(body: Post['body']): string {
  if (!body?.root) return ''
  const out: string[] = []
  collectText(body.root as LexicalNode, out)
  return out.join('').replace(/\s+/g, ' ').trim()
}

function truncate(text: string, max = 160): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

// ── Derivados de post ─────────────────────────────────────────────────────────

const TYPE_TITLE: Record<string, string> = {
  text: 'Texto',
  image: 'Imagem',
  quote: 'Citação',
  video: 'Vídeo',
  audio: 'Áudio',
  snippet: 'Snippet',
}

/** Título pra <title>/OG — post sem título (ex.: citação) usa o começo do corpo. */
export function postTitle(post: Post): string {
  if (post.title) return post.title
  const body = lexicalToPlainText(post.body)
  if (body) return truncate(body, 60)
  return `${TYPE_TITLE[post.type ?? 'text'] ?? 'Post'} — ${SITE_NAME}`
}

/** Meta description: excerpt manual, senão o início do conteúdo. */
export function postDescription(post: Post): string {
  const p = post as Post & { excerpt?: string | null }
  if (p.excerpt?.trim()) return truncate(p.excerpt.trim())
  const body = lexicalToPlainText(post.body)
  return body ? truncate(body) : SITE_DESCRIPTION
}

function isMedia(m: unknown): m is Media {
  return typeof m === 'object' && m !== null && 'url' in m
}

/** Imagem de OG/JSON-LD: mídia do post (imagem) ou thumbnail (snippet). */
export function postImage(post: Post): { url: string; width?: number; height?: number } | null {
  const p = post as Post & { thumbnail?: unknown }
  const media = isMedia(post.media) ? post.media : null
  const thumb = isMedia(p.thumbnail) ? p.thumbnail : null

  const candidate =
    post.type === 'image' && media
      ? { url: media.sizes?.card?.url ?? media.url, width: media.sizes?.card?.width ?? media.width, height: media.sizes?.card?.height ?? media.height }
      : thumb
        ? { url: thumb.sizes?.card?.url ?? thumb.url, width: thumb.sizes?.card?.width ?? thumb.width, height: thumb.sizes?.card?.height ?? thumb.height }
        : null

  if (!candidate?.url) return null
  return {
    url: candidate.url,
    width: candidate.width ?? undefined,
    height: candidate.height ?? undefined,
  }
}

// ── Queries (deduplicadas por request via React cache) ────────────────────────

/** Um único hit no banco por request, compartilhado entre generateMetadata e a página. */
export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [{ slug: { equals: slug } }, PUBLISHED] },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  return docs[0] ?? null
})

export const getPublishedPosts = cache(async (limit = 100): Promise<Post[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: PUBLISHED,
    depth: 1,
    limit,
    sort: '-publishedAt',
    overrideAccess: true,
  })
  return docs
})
