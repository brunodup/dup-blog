import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ['image/*', 'video/*', 'audio/*'],
    imageSizes: [
      { name: 'thumbnail', width: 480, height: 480, position: 'centre' },
      { name: 'card', width: 1024 },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo',
    },
  ],
}
