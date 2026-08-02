import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@payload-config'
import { PUBLISHED } from '@/lib/seo'

import { BlogListing, PER_PAGE } from '../../listing'

export const revalidate = 60

function parsePage(num: string): number | null {
  if (!/^\d+$/.test(num)) return null
  const n = Number(num)
  return n >= 1 ? n : null
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { totalDocs } = await payload.find({
    collection: 'posts',
    where: PUBLISHED,
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const totalPages = Math.max(1, Math.ceil(totalDocs / PER_PAGE))
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({ num: String(i + 2) }))
}

export async function generateMetadata({ params }: { params: Promise<{ num: string }> }): Promise<Metadata> {
  const { num } = await params
  const page = parsePage(num)
  if (!page || page < 2) return {}
  return {
    title: `Blog — página ${page}`,
    description: `Posts do mural de Bruno Dup, página ${page}.`,
    alternates: { canonical: `/blog/pagina/${page}` },
  }
}

export default async function BlogPaginatedPage({ params }: { params: Promise<{ num: string }> }) {
  const { num } = await params
  const page = parsePage(num)
  if (!page) notFound()
  // /blog/pagina/1 é a mesma coisa que /blog — redireciona pra não duplicar conteúdo.
  if (page === 1) redirect('/blog')
  return <BlogListing page={page} />
}
