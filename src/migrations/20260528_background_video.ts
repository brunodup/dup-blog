import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "menu" ADD COLUMN IF NOT EXISTS "background_video_id" integer;
    ALTER TABLE "menu" ADD COLUMN IF NOT EXISTS "background_video_poster_id" integer;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'menu_background_video_id_media_id_fk'
      ) THEN
        ALTER TABLE "menu"
          ADD CONSTRAINT "menu_background_video_id_media_id_fk"
          FOREIGN KEY ("background_video_id")
          REFERENCES "public"."media"("id")
          ON DELETE set null ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'menu_background_video_poster_id_media_id_fk'
      ) THEN
        ALTER TABLE "menu"
          ADD CONSTRAINT "menu_background_video_poster_id_media_id_fk"
          FOREIGN KEY ("background_video_poster_id")
          REFERENCES "public"."media"("id")
          ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "menu" DROP COLUMN IF EXISTS "background_video_id";
    ALTER TABLE "menu" DROP COLUMN IF EXISTS "background_video_poster_id";
  `)
}
