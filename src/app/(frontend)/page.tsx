import { getPayload } from 'payload'

import config from '@payload-config'
import DraggableBoardClient, { type MenuItem } from '@/components/DraggableBoardClient'

// Always render fresh so dragged positions are up-to-date on each visit.
export const revalidate = 0

export default async function HomePage() {
  const payload = await getPayload({ config })

  const [{ docs: posts }, menuGlobal] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 100,
      sort: 'createdAt',
      overrideAccess: true,
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (payload as any).findGlobal({ slug: 'menu', depth: 1, overrideAccess: true }),
  ])

  const menuItems: MenuItem[] = ((menuGlobal as any)?.items ?? []).map( // eslint-disable-line @typescript-eslint/no-explicit-any
    (item: any) => ({ label: item.label ?? '', href: item.href ?? '/', target: item.target ?? '_self' }) // eslint-disable-line @typescript-eslint/no-explicit-any
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoSrc: string | undefined = (menuGlobal as any)?.backgroundVideo?.url || undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoPoster: string | undefined = (menuGlobal as any)?.backgroundVideoPoster?.url || undefined

  return (
    <main className="w-screen h-screen overflow-hidden">
      <DraggableBoardClient posts={posts} videoSrc={videoSrc} videoPoster={videoPoster} menuItems={menuItems} />
    </main>
  )
}
