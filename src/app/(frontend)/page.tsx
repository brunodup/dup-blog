import { getPayload } from 'payload'

import config from '@payload-config'
import DraggableBoardClient from '@/components/DraggableBoardClient'

// Always render fresh so dragged positions are up-to-date on each visit.
export const revalidate = 0

export default async function HomePage() {
  const payload = await getPayload({ config })

  const { docs: posts } = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 100,
    sort: 'createdAt',
    overrideAccess: true,
  })

  const videoSrc = process.env.BACKGROUND_VIDEO_URL || undefined
  const videoPoster = process.env.BACKGROUND_VIDEO_POSTER_URL || undefined

  return (
    <main className="w-screen h-screen overflow-hidden">
      <DraggableBoardClient posts={posts} videoSrc={videoSrc} videoPoster={videoPoster} />
    </main>
  )
}
