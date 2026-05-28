import type { GlobalConfig } from 'payload'

export const Menu: GlobalConfig = {
  slug: 'menu',
  label: 'Menu',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'backgroundVideo',
      type: 'upload',
      relationTo: 'media',
      label: 'Vídeo de fundo',
    },
    {
      name: 'backgroundVideoPoster',
      type: 'upload',
      relationTo: 'media',
      label: 'Poster do vídeo',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Itens',
      admin: {
        components: {
          RowLabel: '@/components/admin/MenuRowLabel#MenuRowLabel',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Label',
              admin: { width: '30%' },
            },
            {
              name: 'href',
              type: 'text',
              required: true,
              label: 'URL',
              admin: { width: '50%' },
            },
            {
              name: 'target',
              type: 'select',
              label: 'Abrir em',
              defaultValue: '_self',
              admin: { width: '20%' },
              options: [
                { label: 'Mesma aba', value: '_self' },
                { label: 'Nova aba', value: '_blank' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
