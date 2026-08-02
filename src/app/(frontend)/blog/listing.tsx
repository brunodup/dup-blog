import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@payload-config'
import LogoLink from '@/components/LogoLink'
import PostCard from '@/components/PostCard'
import { PUBLISHED } from '@/lib/seo'

export const PER_PAGE = 24

export const blogPageUrl = (page: number) => (page <= 1 ? '/blog' : `/blog/pagina/${page}`)

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

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null
  return (
    <nav className="mt-14 pt-6 border-t border-gray-100 flex items-center justify-between">
      {page > 1 ? (
        <Link
          href={blogPageUrl(page - 1)}
          className="text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors duration-150"
        >
          ← mais recentes
        </Link>
      ) : (
        <span />
      )}
      <span className="text-[11px] font-mono uppercase tracking-widest text-gray-300">
        página {page} de {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={blogPageUrl(page + 1)}
          className="text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors duration-150"
        >
          mais antigos →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}

export async function BlogListing({ page }: { page: number }) {
  const payload = await getPayload({ config })

  const [postsRes, catsRes] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: PUBLISHED,
      depth: 1,
      limit: PER_PAGE,
      page,
      sort: '-publishedAt',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'categories',
      depth: 0,
      limit: 100,
      sort: 'name',
      overrideAccess: true,
    }),
  ])

  const { docs: posts, totalDocs, totalPages } = postsRes
  if (page > 1 && posts.length === 0) notFound()

  return (
    <div className="min-h-screen bg-white">
      <LogoLink className="board-title text-black select-none" />

      <div className="w-[95%] mx-auto pt-2 pb-24 md:w-auto md:max-w-[90vw] md:px-6">
        <nav className="mb-10 flex items-center justify-between">
          <BackButton />
          <Link
            href="/ferramentas"
            className="text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors duration-150"
          >
            ferramentas →
          </Link>
        </nav>

        <h1 className="font-switzer text-[1.75rem] font-semibold leading-tight tracking-tight text-black mb-2">
          Blog
        </h1>
        <p className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-6">
          {totalDocs} {totalDocs === 1 ? 'post' : 'posts'}
        </p>

        {catsRes.docs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {catsRes.docs.map((cat) =>
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
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhum post publicado ainda.</p>
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

        <Pagination page={page} totalPages={totalPages} />
      </div>
    </div>
  )
}
