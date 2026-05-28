import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const s = (process.env.DATABASE_SCHEMA || 'public').replace(/[^\w]/g, '')
  await db.execute(sql.raw(`
   ALTER TABLE "${s}"."menu" ADD COLUMN IF NOT EXISTS "background_video_id" integer;
   ALTER TABLE "${s}"."menu" ADD COLUMN IF NOT EXISTS "background_video_poster_id" integer;
   ALTER TABLE "${s}"."menu" DROP CONSTRAINT IF EXISTS "menu_background_video_id_media_id_fk";
   ALTER TABLE "${s}"."menu" ADD CONSTRAINT "menu_background_video_id_media_id_fk" FOREIGN KEY ("background_video_id") REFERENCES "${s}"."media"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "${s}"."menu" DROP CONSTRAINT IF EXISTS "menu_background_video_poster_id_media_id_fk";
   ALTER TABLE "${s}"."menu" ADD CONSTRAINT "menu_background_video_poster_id_media_id_fk" FOREIGN KEY ("background_video_poster_id") REFERENCES "${s}"."media"("id") ON DELETE set null ON UPDATE no action;
   DROP INDEX IF EXISTS "${s}"."menu_background_video_idx";
   CREATE INDEX "menu_background_video_idx" ON "${s}"."menu" USING btree ("background_video_id");
   DROP INDEX IF EXISTS "${s}"."menu_background_video_poster_idx";
   CREATE INDEX "menu_background_video_poster_idx" ON "${s}"."menu" USING btree ("background_video_poster_id");
  `))
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  const s = (process.env.DATABASE_SCHEMA || 'public').replace(/[^\w]/g, '')
  await db.execute(sql.raw(`
   ALTER TABLE "${s}"."menu" DROP COLUMN IF EXISTS "background_video_id";
   ALTER TABLE "${s}"."menu" DROP COLUMN IF EXISTS "background_video_poster_id";
  `))
}
