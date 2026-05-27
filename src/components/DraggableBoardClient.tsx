'use client'

import dynamic from 'next/dynamic'
import type { Post } from '@/payload-types'

const DraggableBoard = dynamic(() => import('./DraggableBoard'), {
  ssr: false,
  loading: () => <div className="w-screen h-screen bg-white" />,
})

interface Props {
  posts: Post[]
  videoSrc?: string
  videoPoster?: string
}

export default function DraggableBoardClient({ posts, videoSrc, videoPoster }: Props) {
  return <DraggableBoard posts={posts} videoSrc={videoSrc} videoPoster={videoPoster} />
}
