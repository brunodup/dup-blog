import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    mimeTypes: ['image/*', 'video/*', 'audio/*'],
    imageSizes: [
      { name: 'thumbnail', width: 480, height: 480, position: 'centre' },
      { name: 'card', width: 1024 },
    ],
    adminThumbnail: 'thumbnail',
    limits: {
      fileSize: 10485760, // 10MB
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo',
    },
  ],
}
