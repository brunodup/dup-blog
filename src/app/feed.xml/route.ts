import type { Post } from '@/payload-types'
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  getPublishedPosts,
  postDescription,
  postTitle,
} from '@/lib/seo'

export const revalidate = 3600

const escapeXml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

function itemXml(post: Post): string {
  const p = post as Post & { publishedAt?: string | null }
  const url = `${SITE_URL}/post/${post.slug}`
  const date = new Date(p.publishedAt ?? post.createdAt).toUTCString()
  return `    <item>
      <title>${escapeXml(postTitle(post))}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${escapeXml(postDescription(post))}</description>
    </item>`
}

export async function GET() {
  const posts = (await getPublishedPosts(50)).filter((p) => p.slug)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>pt-BR</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${posts.map(itemXml).join('\n')}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
