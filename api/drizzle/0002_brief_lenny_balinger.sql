DROP INDEX IF EXISTS "parts_name_lower_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "sets_name_lower_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "parts_part_num_lower_idx" ON "parts" USING btree (lower("part_num") text_pattern_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sets_set_num_lower_idx" ON "sets" USING btree (lower("set_num") text_pattern_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "parts_name_lower_idx" ON "parts" USING btree (lower("name") text_pattern_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sets_name_lower_idx" ON "sets" USING btree (lower("name") text_pattern_ops);
