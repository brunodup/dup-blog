import type { CollectionConfig } from 'payload'

// E-mails captados pelo gate das ferramentas. Criação é pública (via /api/lead);
// leitura só no admin.
export const Leads: CollectionConfig = {
  slug: 'leads',
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'source', 'createdAt'],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'source',
      type: 'text',
      label: 'Origem',
      admin: { description: 'Slug da ferramenta onde o e-mail foi captado.' },
    },
  ],
}
