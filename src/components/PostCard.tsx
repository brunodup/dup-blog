import Image from 'next/image'
import Link from 'next/link'

import type { Media, Post } from '@/payload-types'

const TYPE_LABEL: Record<string, string> = {
  text: 'texto', image: 'imagem', quote: 'citação',
  video: 'vídeo', audio: 'áudio', snippet: 'snippet',
}

function isMedia(m: unknown): m is Media {
  return typeof m === 'object' && m !== null && 'url' in m
}

export default function PostCard({
  post,
  sizes = '(max-width: 680px) 50vw, 25vw',
}: {
  post: Post
  sizes?: string
}) {
  const p = post as Post & { thumbnail?: unknown }
  const media  = isMedia(post.media)  ? post.media  : null
  const thumb  = isMedia(p.thumbnail) ? p.thumbnail : null
  const imgSrc = media?.sizes?.card?.url ?? media?.url ?? thumb?.url ?? null

  return (
    <Link href={`/post/${post.slug}`} className="group block">
      <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-gray-100 mb-2">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={post.title || ''}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes={sizes}
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
