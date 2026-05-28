import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "enum_posts_type" AS ENUM('text', 'image', 'quote', 'video', 'audio', 'snippet');
   CREATE TYPE "enum_posts_js_mode" AS ENUM('vanilla', 'jsx', 'threejs');
   CREATE TYPE "enum_menu_items_target" AS ENUM('_self', '_blank');

   CREATE TABLE "media" (
     "id" serial PRIMARY KEY NOT NULL,
     "alt" varchar,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "url" varchar,
     "thumbnail_u_r_l" varchar,
     "filename" varchar,
     "mime_type" varchar,
     "filesize" numeric,
     "width" numeric,
     "height" numeric,
     "focal_x" numeric,
     "focal_y" numeric,
     "sizes_thumbnail_url" varchar,
     "sizes_thumbnail_width" numeric,
     "sizes_thumbnail_height" numeric,
     "sizes_thumbnail_mime_type" varchar,
     "sizes_thumbnail_filesize" numeric,
     "sizes_thumbnail_filename" varchar,
     "sizes_card_url" varchar,
     "sizes_card_width" numeric,
     "sizes_card_height" numeric,
     "sizes_card_mime_type" varchar,
     "sizes_card_filesize" numeric,
     "sizes_card_filename" varchar
   );

   CREATE TABLE "users" (
     "id" serial PRIMARY KEY NOT NULL,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "email" varchar NOT NULL,
     "reset_password_token" varchar,
     "reset_password_expiration" timestamp(3) with time zone,
     "salt" varchar,
     "hash" varchar,
     "login_attempts" numeric DEFAULT 0,
     "lock_until" timestamp(3) with time zone
   );

   CREATE TABLE "users_sessions" (
     "_order" integer NOT NULL,
     "_parent_id" integer NOT NULL,
     "id" varchar PRIMARY KEY NOT NULL,
     "created_at" timestamp(3) with time zone,
     "expires_at" timestamp(3) with time zone NOT NULL
   );

   CREATE TABLE "categories" (
     "id" serial PRIMARY KEY NOT NULL,
     "name" varchar NOT NULL,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "slug" varchar
   );

   CREATE TABLE "posts" (
     "id" serial PRIMARY KEY NOT NULL,
     "type" "enum_posts_type" DEFAULT 'text' NOT NULL,
     "title" varchar,
     "body" jsonb,
     "media_id" integer,
     "position_x" numeric NOT NULL,
     "position_y" numeric NOT NULL,
     "slug" varchar,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "js_mode" "enum_posts_js_mode" DEFAULT 'vanilla',
     "html" varchar,
     "css" varchar,
     "js" varchar,
     "thumbnail_id" integer
   );

   CREATE TABLE "posts_rels" (
     "id" serial PRIMARY KEY NOT NULL,
     "order" integer,
     "parent_id" integer NOT NULL,
     "path" varchar NOT NULL,
     "categories_id" integer
   );

   CREATE TABLE "pages" (
     "id" serial PRIMARY KEY NOT NULL,
     "title" varchar NOT NULL,
     "body" jsonb,
     "slug" varchar,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE TABLE "menu" (
     "id" serial PRIMARY KEY NOT NULL,
     "updated_at" timestamp(3) with time zone,
     "created_at" timestamp(3) with time zone
   );

   CREATE TABLE "menu_items" (
     "id" varchar PRIMARY KEY NOT NULL,
     "_order" integer NOT NULL,
     "_parent_id" integer NOT NULL,
     "label" varchar NOT NULL,
     "href" varchar NOT NULL,
     "target" "enum_menu_items_target" DEFAULT '_self'
   );

   CREATE TABLE "payload_kv" (
     "id" serial PRIMARY KEY NOT NULL,
     "key" varchar NOT NULL,
     "data" jsonb NOT NULL
   );

   CREATE TABLE "payload_locked_documents" (
     "id" serial PRIMARY KEY NOT NULL,
     "global_slug" varchar,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE TABLE "payload_locked_documents_rels" (
     "id" serial PRIMARY KEY NOT NULL,
     "order" integer,
     "parent_id" integer NOT NULL,
     "path" varchar NOT NULL,
     "posts_id" integer,
     "media_id" integer,
     "users_id" integer,
     "categories_id" integer,
     "pages_id" integer
   );

   CREATE TABLE "payload_preferences" (
     "id" serial PRIMARY KEY NOT NULL,
     "key" varchar,
     "value" jsonb,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE TABLE "payload_preferences_rels" (
     "id" serial PRIMARY KEY NOT NULL,
     "order" integer,
     "parent_id" integer NOT NULL,
     "path" varchar NOT NULL,
     "users_id" integer
   );

   CREATE TABLE "payload_migrations" (
     "id" serial PRIMARY KEY NOT NULL,
     "name" varchar,
     "batch" numeric,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "posts" ADD CONSTRAINT "posts_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "posts" ADD CONSTRAINT "posts_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "media"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "posts"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "menu"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

   CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
   CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
   CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
   CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
   CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
   CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
   CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
   CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
   CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
   CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
   CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
   CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
   CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
   CREATE INDEX "posts_media_idx" ON "posts" USING btree ("media_id");
   CREATE INDEX "posts_thumbnail_idx" ON "posts" USING btree ("thumbnail_id");
   CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
   CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
   CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
   CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
   CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
   CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
   CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
   CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
   CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
   CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
   CREATE INDEX "menu_items_order_idx" ON "menu_items" USING btree ("_order");
   CREATE INDEX "menu_items_parent_id_idx" ON "menu_items" USING btree ("_parent_id");
   CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
   CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
   CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
   CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
   CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
   CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
   CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
   CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
   CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
   CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
   CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
   CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
   CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
   CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
   CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
   CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
   CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
   CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
   CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
   CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
   CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "posts_rels" CASCADE;
   DROP TABLE "posts" CASCADE;
   DROP TABLE "media" CASCADE;
   DROP TABLE "users_sessions" CASCADE;
   DROP TABLE "users" CASCADE;
   DROP TABLE "categories" CASCADE;
   DROP TABLE "pages" CASCADE;
   DROP TABLE "menu_items" CASCADE;
   DROP TABLE "menu" CASCADE;
   DROP TABLE "payload_kv" CASCADE;
   DROP TABLE "payload_locked_documents_rels" CASCADE;
   DROP TABLE "payload_locked_documents" CASCADE;
   DROP TABLE "payload_preferences_rels" CASCADE;
   DROP TABLE "payload_preferences" CASCADE;
   DROP TABLE "payload_migrations" CASCADE;
   DROP TYPE "enum_posts_type";
   DROP TYPE "enum_posts_js_mode";
   DROP TYPE "enum_menu_items_target";
  `)
}
