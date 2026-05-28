'use client'

import dynamic from 'next/dynamic'
import type { Post } from '@/payload-types'

const DraggableBoard = dynamic(() => import('./DraggableBoard'), {
  ssr: false,
  loading: () => <div className="w-screen h-screen bg-white" />,
})

export type MenuItem = { label: string; href: string; target: string }

interface Props {
  posts: Post[]
  videoSrc?: string
  videoPoster?: string
  menuItems: MenuItem[]
}

export default function DraggableBoardClient({ posts, videoSrc, videoPoster, menuItems }: Props) {
  return <DraggableBoard posts={posts} videoSrc={videoSrc} videoPoster={videoPoster} menuItems={menuItems} />
}
