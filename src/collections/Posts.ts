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

  const base =
    slugify(incomingSlug) ||
    slugify(data.title || originalDoc?.title || '') ||
    slugify(data.type || originalDoc?.type || '') ||
    'post'

  let candidate = base
  let suffix = 2

  while (true) {
    const existing = await req.payload.find({
      collection: 'posts',
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

const randomPercent = (): number => Math.round((12 + Math.random() * 76) * 100) / 100

const isSnippet = (data: Record<string, unknown>) => data?.type === 'snippet'
const notSnippet = (data: Record<string, unknown>) => data?.type !== 'snippet'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'slug', 'updatedAt'],
  },
  hooks: {
    beforeValidate: [ensureSlug],
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'text',
      options: [
        { label: 'Texto',   value: 'text'    },
        { label: 'Imagem',  value: 'image'   },
        { label: 'Citação', value: 'quote'   },
        { label: 'Vídeo',   value: 'video'   },
        { label: 'Áudio',   value: 'audio'   },
        { label: 'Snippet', value: 'snippet' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      label: 'Título',
    },
    // ── Non-snippet fields ──────────────────────────────────────────────────
    {
      name: 'body',
      type: 'richText',
      label: 'Conteúdo / descrição',
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => ['image', 'video', 'audio'].includes(data?.type),
      },
    },
    // ── Snippet fields ──────────────────────────────────────────────────────
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Thumbnail',
      admin: {
        condition: isSnippet,
        description: 'Imagem de capa exibida no card do mural.',
      },
    },
    // jsMode shown in sidebar; html/css/js hidden (managed by the playground UI).
    {
      name: 'jsMode',
      type: 'select',
      label: 'Modo JS',
      defaultValue: 'vanilla',
      options: [
        { label: 'Vanilla JS', value: 'vanilla' },
        { label: 'JSX (React)', value: 'jsx'    },
        { label: 'Three.js',   value: 'threejs' },
      ],
      admin: {
        position: 'sidebar',
        condition: isSnippet,
      },
    },
    {
      name: 'html',
      type: 'textarea',
      admin: { hidden: true },
    },
    {
      name: 'css',
      type: 'textarea',
      admin: { hidden: true },
    },
    {
      name: 'js',
      type: 'textarea',
      admin: { hidden: true },
    },
    // Playground editor — only rendered when type === 'snippet'
    {
      name: 'playground',
      type: 'ui',
      admin: {
        condition: isSnippet,
        components: {
          Field: '@/components/admin/CodeSnippetPlayground',
        },
      },
    },
    // ── Categories (sidebar, all types) ───────────────────────────────────
    {
      name: 'categories',
      type: 'relationship',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relationTo: 'categories' as any,
      hasMany: true,
      label: 'Categorias',
      admin: {
        position: 'sidebar',
      },
    },
    // ── Board position (sidebar, all types) ────────────────────────────────
    {
      name: 'position_x',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      defaultValue: randomPercent,
      admin: {
        position: 'sidebar',
        step: 0.01,
        description: 'Posição horizontal no mural (0–100%).',
      },
    },
    {
      name: 'position_y',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      defaultValue: randomPercent,
      admin: {
        position: 'sidebar',
        step: 0.01,
        description: 'Posição vertical no mural (0–100%).',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Gerado automaticamente a partir do título. Editável.',
      },
    },
  ],
}
