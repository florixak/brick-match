import {
  pgTable,
  integer,
  text,
  varchar,
  uuid,
  serial,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { parts, colors } from './catalog';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userOwnedParts = pgTable(
  'user_owned_parts',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    partNum: text('part_num')
      .notNull()
      .references(() => parts.partNum),
    colorId: integer('color_id')
      .notNull()
      .references(() => colors.colorId),
    quantity: integer('quantity').notNull(),
  },
  (table) => ({
    uniqueOwnedPart: uniqueIndex('user_owned_parts_unique').on(
      table.userId,
      table.partNum,
      table.colorId,
    ),
  }),
);
