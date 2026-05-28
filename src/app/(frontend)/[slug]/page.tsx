import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@payload-config'
import LogoLink from '@/components/LogoLink'

export const revalidate = 60

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'pages' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    where: { slug: { equals: slug } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  const page = docs[0]
  if (!page) return {}
  return { title: page.title ? `${page.title} — brunodup` : 'brunodup' }
}

export default async function PageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'pages' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    where: { slug: { equals: slug } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  const page = docs[0]
  if (!page) notFound()

  return (
    <div className="min-h-screen bg-white">
      <LogoLink className="board-title text-black select-none" />

      <div className="w-[95%] mx-auto pt-2 pb-24 md:w-auto md:max-w-[90vw] md:px-6">
        <nav className="mb-14">
          <BackButton />
        </nav>

        <article className="max-w-[680px]">
          {page.title && (
            <h1 className="font-switzer text-[1.75rem] font-semibold leading-tight tracking-tight text-black mb-8">
              {page.title}
            </h1>
          )}
          {page.body?.root && (
            <div className="prose prose-sm prose-gray max-w-none [&_p]:leading-relaxed [&_p]:text-[1rem] [&_p]:text-[#333]">
              <RichText data={page.body} />
            </div>
          )}
        </article>
      </div>
    </div>
  )
}
