import { Injectable, Logger } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { parse } from 'csv-parse';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { createGunzip } from 'zlib';
import { DatabaseService } from '../database/database.service';
import { isFkViolation } from '../database/pg-error';
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

export type ComponentPart = {
  partNum: string;
  colorId: number;
  quantity: number;
  isSpare: boolean;
};

export type ExpandedPart = {
  setNum: string;
  partNum: string;
  colorId: number;
  quantity: number;
  isSpare: boolean;
};

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

/**
 * From inventories.csv rows, build a map of fig_num → latest inventoryId
 * for each fig_num in referencedFigNums. Applies the same MAX(version)/MAX(id)
 * tie-breaking strategy used for set inventories.
 */
export function buildMinifigInventoryMapFromRows(
  rows: Array<{ set_num: string; id: string; version: string }>,
  referencedFigNums: Set<string>,
): Map<string, number> {
  const latestByFig = new Map<string, { id: number; version: number }>();
  for (const r of rows) {
    if (!referencedFigNums.has(r.set_num)) continue;
    const id = parseInt(r.id);
    const version = parseInt(r.version);
    const existing = latestByFig.get(r.set_num);
    if (
      !existing ||
      version > existing.version ||
      (version === existing.version && id > existing.id)
    ) {
      latestByFig.set(r.set_num, { id, version });
    }
  }
  const result = new Map<string, number>();
  for (const [figNum, { id }] of latestByFig) {
    result.set(figNum, id);
  }
  return result;
}

/**
 * Expands a batch of inventory_minifigs rows into inventory_parts rows for the
 * parent set. Aggregates quantities for duplicate (setNum, partNum, colorId, isSpare)
 * within the batch so each key appears at most once in the output.
 */
export function expandMinifigRows(
  rows: Array<{ inventory_id: string; fig_num: string; quantity: string }>,
  setInventoryMap: Map<number, string>,
  minifigInventoryMap: Map<string, number>,
  minifigComponents: Map<number, ComponentPart[]>,
): {
  expanded: ExpandedPart[];
  skippedUnknownFig: number;
  skippedNoComponents: number;
} {
  const aggregate = new Map<string, ExpandedPart>();
  let skippedUnknownFig = 0;
  let skippedNoComponents = 0;

  for (const r of rows) {
    const inventoryId = parseInt(r.inventory_id);
    const setNum = setInventoryMap.get(inventoryId);
    if (!setNum) continue; // not an inventory belonging to an imported set

    const figNum = r.fig_num;
    const minifigQty = parseInt(r.quantity);

    const minifigInventoryId = minifigInventoryMap.get(figNum);
    if (minifigInventoryId === undefined) {
      skippedUnknownFig++;
      continue;
    }

    const components = minifigComponents.get(minifigInventoryId);
    if (!components || components.length === 0) {
      skippedNoComponents++;
      continue;
    }

    for (const component of components) {
      const key = `${setNum}:${component.partNum}:${component.colorId}:${component.isSpare}`;
      const qty = minifigQty * component.quantity;
      const existing = aggregate.get(key);
      if (existing) {
        existing.quantity += qty;
      } else {
        aggregate.set(key, {
          setNum,
          partNum: component.partNum,
          colorId: component.colorId,
          quantity: qty,
          isSpare: component.isSpare,
        });
      }
    }
  }

  return {
    expanded: [...aggregate.values()],
    skippedUnknownFig,
    skippedNoComponents,
  };
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
    const setInventoryMap = await this.buildSetInventoryMap();
    await this.importInventoryParts(setInventoryMap);
    const referencedFigNums =
      await this.collectReferencedFigNums(setInventoryMap);
    const minifigInventoryMap =
      await this.buildMinifigInventoryMap(referencedFigNums);
    const minifigComponents =
      await this.preloadMinifigComponents(minifigInventoryMap);
    await this.importExpandedMinifigParts(
      setInventoryMap,
      minifigInventoryMap,
      minifigComponents,
    );
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
   * Reads inventories.csv and builds a map of inventoryId → set_num,
   * keeping only the latest inventory version per set_num (by MAX version,
   * tie-broken by MAX id). Filters to only set_nums that actually exist in
   * the sets table — this excludes minifigure inventories (fig-XXXXXX) and
   * other Rebrickable-internal entries that don't appear in sets.csv.
   */
  private async buildSetInventoryMap(): Promise<Map<number, string>> {
    this.logger.log('Building set inventory map from inventories.csv...');

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

  /**
   * Scans inventory_minifigs.csv to collect all fig_nums referenced by
   * inventories that belong to an imported set.
   */
  private async collectReferencedFigNums(
    setInventoryMap: Map<number, string>,
  ): Promise<Set<string>> {
    this.logger.log(
      'Collecting referenced fig_nums from inventory_minifigs.csv...',
    );
    const figNums = new Set<string>();
    for await (const r of readCsv('inventory_minifigs.csv')) {
      const inventoryId = parseInt(r.inventory_id);
      if (setInventoryMap.has(inventoryId)) {
        figNums.add(r.fig_num);
      }
    }
    this.logger.log(`  → ${figNums.size} unique fig_nums referenced`);
    return figNums;
  }

  /**
   * Reads inventories.csv a second time to resolve the latest inventoryId
   * for each referenced fig_num.
   */
  private async buildMinifigInventoryMap(
    referencedFigNums: Set<string>,
  ): Promise<Map<string, number>> {
    this.logger.log('Building minifig inventory map from inventories.csv...');
    const rows: Array<{ set_num: string; id: string; version: string }> = [];
    for await (const r of readCsv('inventories.csv')) {
      if (!referencedFigNums.has(r.set_num)) continue;
      rows.push({ set_num: r.set_num, id: r.id, version: r.version });
    }
    const result = buildMinifigInventoryMapFromRows(rows, referencedFigNums);
    this.logger.log(`  → ${result.size} minifig inventories resolved`);
    return result;
  }

  /**
   * Reads inventory_parts.csv a second time to preload the component parts
   * for every minifig inventory that will be expanded.
   */
  private async preloadMinifigComponents(
    minifigInventoryMap: Map<string, number>,
  ): Promise<Map<number, ComponentPart[]>> {
    this.logger.log(
      'Preloading minifig components from inventory_parts.csv...',
    );
    const minifigInventoryIds = new Set(minifigInventoryMap.values());
    const result = new Map<number, ComponentPart[]>();

    for await (const r of readCsv('inventory_parts.csv')) {
      const inventoryId = parseInt(r.inventory_id);
      if (!minifigInventoryIds.has(inventoryId)) continue;
      const component: ComponentPart = {
        partNum: r.part_num,
        colorId: parseInt(r.color_id),
        quantity: parseInt(r.quantity),
        isSpare: bool(r.is_spare),
      };
      const existing = result.get(inventoryId);
      if (existing) {
        existing.push(component);
      } else {
        result.set(inventoryId, [component]);
      }
    }

    const totalComponents = [...result.values()].reduce(
      (sum, c) => sum + c.length,
      0,
    );
    this.logger.log(
      `  → ${totalComponents} component rows preloaded for ${result.size} minifig inventories`,
    );
    return result;
  }

  /**
   * Reads inventory_minifigs.csv, expands each minifig into its component
   * parts scaled by the minifig quantity, and upserts into inventory_parts
   * using additive ON CONFLICT (quantity += excluded.quantity) so that sets
   * which share a part both directly and via a minifig accumulate correctly.
   */
  private async importExpandedMinifigParts(
    setInventoryMap: Map<number, string>,
    minifigInventoryMap: Map<string, number>,
    minifigComponents: Map<number, ComponentPart[]>,
  ): Promise<void> {
    this.logger.log('Importing expanded minifig parts...');
    let expanded = 0;
    let totalSkippedUnknownFig = 0;
    let totalSkippedNoComponents = 0;
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
          set: {
            quantity: sql`${inventoryParts.quantity} + excluded.quantity`,
          },
        });
    };

    await processBatched(
      readCsv('inventory_minifigs.csv'),
      BATCH_SIZE,
      async (batch) => {
        const {
          expanded: expandedRows,
          skippedUnknownFig,
          skippedNoComponents,
        } = expandMinifigRows(
          batch as Array<{
            inventory_id: string;
            fig_num: string;
            quantity: string;
          }>,
          setInventoryMap,
          minifigInventoryMap,
          minifigComponents,
        );

        totalSkippedUnknownFig += skippedUnknownFig;
        totalSkippedNoComponents += skippedNoComponents;

        if (expandedRows.length === 0) return;

        const rows: (typeof inventoryParts.$inferInsert)[] = expandedRows.map(
          (r) => ({
            setNum: r.setNum,
            partNum: r.partNum,
            colorId: r.colorId,
            quantity: r.quantity,
            isSpare: r.isSpare,
          }),
        );

        try {
          await upsertBatch(rows);
          expanded += rows.length;
        } catch (batchErr) {
          if (!isFkViolation(batchErr)) throw batchErr;

          for (const row of rows) {
            try {
              await upsertBatch([row]);
              expanded++;
            } catch (rowErr) {
              if (!isFkViolation(rowErr)) throw rowErr;
              skippedFkViolation++;
            }
          }
        }
      },
    );

    this.logger.log(
      `  → ${expanded} rows upserted` +
        (totalSkippedUnknownFig
          ? `, ${totalSkippedUnknownFig} skipped (unknown fig inventory)`
          : '') +
        (totalSkippedNoComponents
          ? `, ${totalSkippedNoComponents} skipped (no components found)`
          : '') +
        (skippedFkViolation
          ? `, ${skippedFkViolation} skipped (FK violation — unknown color/part)`
          : ''),
    );
  }
}
