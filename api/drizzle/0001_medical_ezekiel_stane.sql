CREATE INDEX "parts_name_lower_idx" ON "parts" USING btree (lower("name"));--> statement-breakpoint
CREATE INDEX "sets_name_lower_idx" ON "sets" USING btree (lower("name"));