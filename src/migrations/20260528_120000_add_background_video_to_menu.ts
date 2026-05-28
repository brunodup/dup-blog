import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "menu" ADD COLUMN "background_video_id" integer;
   ALTER TABLE "menu" ADD COLUMN "background_video_poster_id" integer;
   ALTER TABLE "menu" ADD CONSTRAINT "menu_background_video_id_media_id_fk" FOREIGN KEY ("background_video_id") REFERENCES "media"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "menu" ADD CONSTRAINT "menu_background_video_poster_id_media_id_fk" FOREIGN KEY ("background_video_poster_id") REFERENCES "media"("id") ON DELETE set null ON UPDATE no action;
   CREATE INDEX "menu_background_video_idx" ON "menu" USING btree ("background_video_id");
   CREATE INDEX "menu_background_video_poster_idx" ON "menu" USING btree ("background_video_poster_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "menu" DROP COLUMN IF EXISTS "background_video_id";
   ALTER TABLE "menu" DROP COLUMN IF EXISTS "background_video_poster_id";
  `)
}
