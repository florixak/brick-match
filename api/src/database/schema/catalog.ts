import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  smallint,
  text,
  uniqueIndex,
  varchar,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

export const partCategories = pgTable('part_categories', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
});

export const colors = pgTable('colors', {
  colorId: integer('color_id').primaryKey(),
  name: text('name').notNull(),
  rgb: varchar('rgb', { length: 6 }).notNull(),
  isTrans: boolean('is_trans').notNull(),
});

export const themes = pgTable('themes', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  parentId: integer('parent_id').references((): AnyPgColumn => themes.id),
});

export const parts = pgTable(
  'parts',
  {
    partNum: text('part_num').primaryKey(),
    name: text('name').notNull(),
    partCatId: integer('part_cat_id')
      .notNull()
      .references(() => partCategories.id),
  },
  (table) => ({
    partsNameLowerIdx: index('parts_name_lower_idx').on(
      sql`lower(${table.name})`,
    ),
  }),
);

export const sets = pgTable(
  'sets',
  {
    setNum: text('set_num').primaryKey(),
    name: text('name').notNull(),
    year: smallint('year').notNull(),
    themeId: integer('theme_id')
      .notNull()
      .references(() => themes.id),
    numParts: integer('num_parts').notNull(),
  },
  (table) => ({
    setsNameLowerIdx: index('sets_name_lower_idx').on(
      sql`lower(${table.name})`,
    ),
  }),
);

export const inventoryParts = pgTable(
  'inventory_parts',
  {
    id: serial('id').primaryKey(),
    setNum: text('set_num')
      .notNull()
      .references(() => sets.setNum),
    partNum: text('part_num')
      .notNull()
      .references(() => parts.partNum),
    colorId: integer('color_id')
      .notNull()
      .references(() => colors.colorId),
    quantity: integer('quantity').notNull(),
    isSpare: boolean('is_spare').notNull().default(false),
  },
  (table) => ({
    uniqueInventoryRow: uniqueIndex('inventory_parts_unique').on(
      table.setNum,
      table.partNum,
      table.colorId,
      table.isSpare,
    ),
    partColorIdx: index('inventory_parts_part_color_idx').on(
      table.partNum,
      table.colorId,
    ),
  }),
);
