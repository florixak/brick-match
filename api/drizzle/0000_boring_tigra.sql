CREATE TABLE "colors" (
	"color_id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"rgb" varchar(6) NOT NULL,
	"is_trans" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"set_num" text NOT NULL,
	"part_num" text NOT NULL,
	"color_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"is_spare" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "part_categories" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"part_num" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"part_cat_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sets" (
	"set_num" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"year" smallint NOT NULL,
	"theme_id" integer NOT NULL,
	"num_parts" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parent_id" integer
);
--> statement-breakpoint
CREATE TABLE "user_owned_parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"part_num" text NOT NULL,
	"color_id" integer NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "inventory_parts" ADD CONSTRAINT "inventory_parts_set_num_sets_set_num_fk" FOREIGN KEY ("set_num") REFERENCES "public"."sets"("set_num") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_parts" ADD CONSTRAINT "inventory_parts_part_num_parts_part_num_fk" FOREIGN KEY ("part_num") REFERENCES "public"."parts"("part_num") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_parts" ADD CONSTRAINT "inventory_parts_color_id_colors_color_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."colors"("color_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_part_cat_id_part_categories_id_fk" FOREIGN KEY ("part_cat_id") REFERENCES "public"."part_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "themes" ADD CONSTRAINT "themes_parent_id_themes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."themes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_owned_parts" ADD CONSTRAINT "user_owned_parts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_owned_parts" ADD CONSTRAINT "user_owned_parts_part_num_parts_part_num_fk" FOREIGN KEY ("part_num") REFERENCES "public"."parts"("part_num") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_owned_parts" ADD CONSTRAINT "user_owned_parts_color_id_colors_color_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."colors"("color_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_parts_unique" ON "inventory_parts" USING btree ("set_num","part_num","color_id","is_spare");--> statement-breakpoint
CREATE INDEX "inventory_parts_part_color_idx" ON "inventory_parts" USING btree ("part_num","color_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_owned_parts_unique" ON "user_owned_parts" USING btree ("user_id","part_num","color_id");