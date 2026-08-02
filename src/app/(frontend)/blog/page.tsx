import type { Metadata } from 'next'

import { SITE_URL } from '@/lib/seo'

import { BlogListing } from './listing'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Todos os posts do mural de Bruno Dup, em ordem cronológica — design, código, fotografia e pensamentos visuais.',
  alternates: {
    canonical: '/blog',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'brunodup — feed' }],
    },
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/blog`,
    title: 'Blog — brunodup',
    description: 'Todos os posts do mural de Bruno Dup, em ordem cronológica.',
  },
}

export default function BlogPage() {
  return <BlogListing page={1} />
}
