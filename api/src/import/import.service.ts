import { Injectable, Logger } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { parse } from 'csv-parse';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { createGunzip } from 'zlib';
import { DatabaseService } from '../database/database.service';
import {
  colors,
  inventoryParts,
  partCategories,
  parts,
  sets,
  themes,
} from '../database/schema/catalog';

const DATA_DIR = join(process.cwd(), 'data');
const BATCH_SIZE = 1000;

type CsvRecord = Record<string, string>;

function resolveCsvPath(filename: string): { path: string; gzip: boolean } {
  const filePath = join(DATA_DIR, filename);
  if (filename.endsWith('.gz')) {
    return { path: filePath, gzip: true };
  }
  const gzPath = `${filePath}.gz`;
  if (existsSync(gzPath)) {
    return { path: gzPath, gzip: true };
  }
  return { path: filePath, gzip: false };
}

function readCsv(filename: string): AsyncIterable<CsvRecord> {
  const { path, gzip } = resolveCsvPath(filename);
  const stream = createReadStream(path);
  const source = gzip ? stream.pipe(createGunzip()) : stream;
  return source.pipe(
    parse({ columns: true, skip_empty_lines: true, trim: true }),
  ) as AsyncIterable<CsvRecord>;
}

async function processBatched<T>(
  source: AsyncIterable<T>,
  batchSize: number,
  handler: (batch: T[]) => Promise<void>,
): Promise<number> {
  let batch: T[] = [];
  let total = 0;
  for await (const item of source) {
    batch.push(item);
    if (batch.length >= batchSize) {
      await handler(batch);
      total += batch.length;
      batch = [];
    }
  }
  if (batch.length > 0) {
    await handler(batch);
    total += batch.length;
  }
  return total;
}

function bool(value: string): boolean {
  return value.trim().toLowerCase() === 'true';
}

/** PostgreSQL FK violation error code. */
function isFkViolation(err: unknown): boolean {
  return (err as { code?: string })?.code === '23503';
}

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async importAll(): Promise<void> {
    this.logger.log('Starting catalog import...');
    await this.importPartCategories();
    await this.importColors();
    await this.importThemes();
    await this.importParts();
    await this.importSets();
    const inventoryMap = await this.buildInventoryMap();
    await this.importInventoryParts(inventoryMap);
    this.logger.log('Catalog import complete.');
  }

  private async importPartCategories(): Promise<void> {
    this.logger.log('Importing part_categories...');
    const count = await processBatched(
      readCsv('part_categories.csv'),
      BATCH_SIZE,
      async (batch) => {
        const rows = batch.map((r) => ({
          id: parseInt(r.id),
          name: r.name,
        }));
        await this.db
          .insert(partCategories)
          .values(rows)
          .onConflictDoUpdate({
            target: partCategories.id,
            set: { name: sql`excluded.name` },
          });
      },
    );
    this.logger.log(`  → ${count} rows`);
  }

  private async importColors(): Promise<void> {
    this.logger.log('Importing colors...');
    const count = await processBatched(
      readCsv('colors.csv'),
      BATCH_SIZE,
      async (batch) => {
        const rows = batch.map((r) => ({
          colorId: parseInt(r.id),
          name: r.name,
          rgb: r.rgb.slice(0, 6),
          isTrans: bool(r.is_trans),
        }));
        await this.db
          .insert(colors)
          .values(rows)
          .onConflictDoUpdate({
            target: colors.colorId,
            set: {
              name: sql`excluded.name`,
              rgb: sql`excluded.rgb`,
              isTrans: sql`excluded.is_trans`,
            },
          });
      },
    );
    this.logger.log(`  → ${count} rows`);
  }

  private async importThemes(): Promise<void> {
    this.logger.log('Importing themes...');

    // Load everything into memory first — themes table is small (<= ~1000 rows)
    const allThemes: Array<{
      id: number;
      name: string;
      parentId: number | null;
    }> = [];
    for await (const r of readCsv('themes.csv')) {
      allThemes.push({
        id: parseInt(r.id),
        name: r.name,
        parentId: r.parent_id ? parseInt(r.parent_id) : null,
      });
    }

    // Pass 1: insert all with parentId = null to satisfy the self-referencing FK
    for (let i = 0; i < allThemes.length; i += BATCH_SIZE) {
      const batch = allThemes.slice(i, i + BATCH_SIZE).map((t) => ({
        id: t.id,
        name: t.name,
        parentId: null as number | null,
      }));
      await this.db
        .insert(themes)
        .values(batch)
        .onConflictDoUpdate({
          target: themes.id,
          set: { name: sql`excluded.name` },
        });
    }

    // Pass 2: sync parentId from source for every theme (null clears removed parents)
    for (const theme of allThemes) {
      await this.db
        .update(themes)
        .set({ parentId: theme.parentId })
        .where(eq(themes.id, theme.id));
    }

    const withParent = allThemes.filter((t) => t.parentId !== null);

    this.logger.log(
      `  → ${allThemes.length} rows (${withParent.length} with parent)`,
    );
  }

  private async importParts(): Promise<void> {
    this.logger.log('Importing parts...');
    const count = await processBatched(
      readCsv('parts.csv'),
      BATCH_SIZE,
      async (batch) => {
        const rows = batch.map((r) => ({
          partNum: r.part_num,
          name: r.name,
          partCatId: parseInt(r.part_cat_id),
        }));
        await this.db
          .insert(parts)
          .values(rows)
          .onConflictDoUpdate({
            target: parts.partNum,
            set: {
              name: sql`excluded.name`,
              partCatId: sql`excluded.part_cat_id`,
            },
          });
      },
    );
    this.logger.log(`  → ${count} rows`);
  }

  private async importSets(): Promise<void> {
    this.logger.log('Importing sets...');
    const count = await processBatched(
      readCsv('sets.csv'),
      BATCH_SIZE,
      async (batch) => {
        const rows = batch.map((r) => ({
          setNum: r.set_num,
          name: r.name,
          year: parseInt(r.year),
          themeId: parseInt(r.theme_id),
          numParts: parseInt(r.num_parts),
        }));
        await this.db
          .insert(sets)
          .values(rows)
          .onConflictDoUpdate({
            target: sets.setNum,
            set: {
              name: sql`excluded.name`,
              year: sql`excluded.year`,
              themeId: sql`excluded.theme_id`,
              numParts: sql`excluded.num_parts`,
            },
          });
      },
    );
    this.logger.log(`  → ${count} rows`);
  }

  /**
   * Reads inventories.csv and builds a map of inventory_id → set_num,
   * keeping only the latest inventory version per set_num (by MAX version,
   * tie-broken by MAX id). Filters to only set_nums that actually exist in
   * the sets table — this excludes minifigure sets (fig-XXXXXX) and other
   * Rebrickable-internal entries that don't appear in sets.csv.
   */
  private async buildInventoryMap(): Promise<Map<number, string>> {
    this.logger.log('Building inventory map from inventories.csv...');

    // Only keep inventories for set_nums we actually imported
    const importedSets = await this.db
      .select({ setNum: sets.setNum })
      .from(sets);
    const validSetNums = new Set(importedSets.map((s) => s.setNum));
    this.logger.log(`  Loaded ${validSetNums.size} valid set_nums from DB`);

    const latestBySet = new Map<string, { id: number; version: number }>();
    for await (const r of readCsv('inventories.csv')) {
      const setNum = r.set_num;
      if (!validSetNums.has(setNum)) continue;

      const id = parseInt(r.id);
      const version = parseInt(r.version);
      const existing = latestBySet.get(setNum);
      if (
        !existing ||
        version > existing.version ||
        (version === existing.version && id > existing.id)
      ) {
        latestBySet.set(setNum, { id, version });
      }
    }

    const inventoryMap = new Map<number, string>();
    for (const [setNum, { id }] of latestBySet) {
      inventoryMap.set(id, setNum);
    }

    this.logger.log(`  → ${inventoryMap.size} unique sets mapped`);
    return inventoryMap;
  }

  private async importInventoryParts(
    inventoryMap: Map<number, string>,
  ): Promise<void> {
    this.logger.log('Importing inventory_parts (streaming)...');
    let imported = 0;
    let skippedNonLatest = 0;
    let skippedFkViolation = 0;

    const upsertBatch = async (
      rows: (typeof inventoryParts.$inferInsert)[],
    ) => {
      await this.db
        .insert(inventoryParts)
        .values(rows)
        .onConflictDoUpdate({
          target: [
            inventoryParts.setNum,
            inventoryParts.partNum,
            inventoryParts.colorId,
            inventoryParts.isSpare,
          ],
          set: { quantity: sql`excluded.quantity` },
        });
    };

    await processBatched(
      readCsv('inventory_parts.csv'),
      BATCH_SIZE,
      async (batch) => {
        const rows: (typeof inventoryParts.$inferInsert)[] = [];

        for (const r of batch) {
          const inventoryId = parseInt(r.inventory_id);
          const setNum = inventoryMap.get(inventoryId);
          if (!setNum) {
            skippedNonLatest++;
            continue;
          }
          rows.push({
            setNum,
            partNum: r.part_num,
            colorId: parseInt(r.color_id),
            quantity: parseInt(r.quantity),
            isSpare: bool(r.is_spare),
          });
        }

        if (rows.length === 0) return;

        try {
          await upsertBatch(rows);
          imported += rows.length;
        } catch (batchErr) {
          // FK violation (e.g. color_id=9999 placeholder not in colors table):
          // fall back to row-by-row so valid rows in the batch are not lost.
          if (!isFkViolation(batchErr)) throw batchErr;

          for (const row of rows) {
            try {
              await upsertBatch([row]);
              imported++;
            } catch (rowErr) {
              if (!isFkViolation(rowErr)) throw rowErr;
              skippedFkViolation++;
            }
          }
        }
      },
    );

    this.logger.log(
      `  → ${imported} rows imported` +
        (skippedNonLatest
          ? `, ${skippedNonLatest} skipped (non-latest inventory)`
          : '') +
        (skippedFkViolation
          ? `, ${skippedFkViolation} skipped (FK violation — unknown color/part)`
          : ''),
    );
  }
}
