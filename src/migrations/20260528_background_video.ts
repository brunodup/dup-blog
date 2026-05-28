import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "menu" (
      "id" serial PRIMARY KEY NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "menu_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "href" varchar,
      "target" varchar DEFAULT '_self'
    );

    ALTER TABLE "menu" ADD COLUMN IF NOT EXISTS "background_video_id" integer;
    ALTER TABLE "menu" ADD COLUMN IF NOT EXISTS "background_video_poster_id" integer;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'menu_items_parent_id_fk'
      ) THEN
        ALTER TABLE "menu_items"
          ADD CONSTRAINT "menu_items_parent_id_fk"
          FOREIGN KEY ("_parent_id")
          REFERENCES "public"."menu"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;

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

    CREATE INDEX IF NOT EXISTS "menu_items_order_idx" ON "menu_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "menu_items_parent_id_idx" ON "menu_items" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "menu_background_video_idx" ON "menu" USING btree ("background_video_id");
    CREATE INDEX IF NOT EXISTS "menu_background_video_poster_idx" ON "menu" USING btree ("background_video_poster_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "menu" DROP COLUMN IF EXISTS "background_video_id";
    ALTER TABLE "menu" DROP COLUMN IF EXISTS "background_video_poster_id";
  `)
}
