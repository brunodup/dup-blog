import { getPayload } from 'payload'

import config from '@payload-config'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Captação de e-mail das ferramentas. Sempre responde ok pra e-mail válido —
// duplicado conta como sucesso (a pessoa já é lead).
export async function POST(req: Request) {
  let body: { email?: unknown; source?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const source = typeof body.source === 'string' ? body.source.slice(0, 100) : ''

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Response.json({ ok: false }, { status: 400 })
  }

  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'leads',
    where: { email: { equals: email } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs.length === 0) {
    try {
      await payload.create({
        collection: 'leads',
        data: { email, source },
        overrideAccess: true,
      })
    } catch {
      // Corrida com outro request criando o mesmo e-mail — segue como sucesso.
    }
  }

  return Response.json({ ok: true })
}
