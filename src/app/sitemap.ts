import type { MetadataRoute } from 'next'

import { getPayload } from 'payload'

import config from '@payload-config'
import { PUBLISHED, SITE_URL } from '@/lib/seo'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  const [{ docs: posts }, { docs: categories }] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: PUBLISHED,
      depth: 0,
      limit: 1000,
      select: { slug: true, updatedAt: true },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'categories',
      depth: 0,
      limit: 200,
      select: { slug: true, updatedAt: true },
      overrideAccess: true,
    }),
  ])

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...posts
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${SITE_URL}/post/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ...categories
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${SITE_URL}/categoria/${c.slug}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })),
  ]
}
