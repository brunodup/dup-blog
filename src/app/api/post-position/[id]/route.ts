import type { NextRequest } from 'next/server'

import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@payload-config'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const numId = parseInt(id, 10)

  if (isNaN(numId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { position_x, position_y } = body as Record<string, unknown>
  const x = Number(position_x)
  const y = Number(position_y)

  if (isNaN(x) || isNaN(y) || x < 0 || x > 100 || y < 0 || y > 100) {
    return NextResponse.json({ error: 'position_x and position_y must be numbers 0–100' }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await payload.update({
      collection: 'posts',
      id: numId,
      data: { position_x: x, position_y: y },
      depth: 0,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const status = (err as { status?: number }).status === 404 ? 404 : 500
    const message = status === 404 ? 'Post not found' : 'Failed to update position'
    return NextResponse.json({ error: message }, { status })
  }
}
