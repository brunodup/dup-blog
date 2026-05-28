import { fileURLToPath } from 'url'
import path from 'path'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'
import { Pages } from './collections/Pages'
import { Menu } from './globals/Menu'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const supabaseUrl = process.env.SUPABASE_URL || ''
const s3Bucket = process.env.S3_BUCKET || ''

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      title: 'brunodup — admin',
      titleSuffix: ' · brunodup',
    },
  },
  collections: [Posts, Media, Users, Categories, Pages],
  globals: [Menu],
  editor: lexicalEditor(),
  plugins: [
    s3Storage({
      collections: {
        media: {
          // Serve files directly from Supabase CDN instead of proxying via Payload.
          generateFileURL: ({ filename: fname }) =>
            `${supabaseUrl}/storage/v1/object/public/${s3Bucket}/${fname}`,
        },
      },
      bucket: s3Bucket,
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        // Required for Supabase Storage: it uses path-style S3 URLs.
        forcePathStyle: true,
      },
    }),
  ],
  graphQL: {
    disablePlaygroundInProduction: true,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    schemaName: process.env.DATABASE_SCHEMA || 'public',
    push: process.env.NODE_ENV === 'development',
  }),
  sharp,
})
