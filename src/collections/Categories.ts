import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g')

const slugify = (input: string): string =>
  input
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const ensureSlug: CollectionBeforeValidateHook = async ({ data, operation, originalDoc, req }) => {
  if (!data) return data

  const incomingSlug = typeof data.slug === 'string' ? data.slug.trim() : ''

  if (operation === 'update' && originalDoc?.slug && (!incomingSlug || incomingSlug === originalDoc.slug)) {
    data.slug = originalDoc.slug
    return data
  }

  const base = slugify(incomingSlug) || slugify(data.name || originalDoc?.name || '') || 'categoria'

  let candidate = base
  let suffix = 2

  while (true) {
    const existing = await req.payload.find({
      collection: 'categories',
      depth: 0,
      limit: 1,
      req,
      where: {
        and: [
          { slug: { equals: candidate } },
          ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
        ],
      },
    })
    if (existing.docs.length === 0) break
    candidate = `${base}-${suffix}`
    suffix += 1
  }

  data.slug = candidate
  return data
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },
  hooks: {
    beforeValidate: [ensureSlug],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nome',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Gerado automaticamente a partir do nome. Editável.',
      },
    },
  ],
}
