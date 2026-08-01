import {
  CompleteSetResponse,
  DEFAULT_MIN_MATCH_PERCENTAGE,
  GetMatchesApiResponse,
  GetMatchesQuery,
  MatchResult,
  MissingPart,
  OwnedPart as OwnedPartRow,
} from '@lego-matcher/shared-types';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DatabaseService } from 'src/database/database.service';
import { userOwnedParts } from 'src/database/schema';

const DEFAULT_LIMIT = 50;

type RankedSetRow = Omit<MatchResult, 'missingParts'>; // year, themeName, totalParts, ownedParts, matchPercentage

@Injectable()
export class MatchingService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findMatches(
    userId: string,
    query: GetMatchesQuery = {},
  ): Promise<GetMatchesApiResponse> {
    const limit = query.limit ?? DEFAULT_LIMIT;
    const minMatchPercentage =
      query.minMatchPercentage ?? DEFAULT_MIN_MATCH_PERCENTAGE;

    const ownedParts = await this.loadOwnedParts(userId);
    if (ownedParts.length === 0) {
      return { data: { results: [] }, meta: { count: 0, limit } };
    }

    const rankedSets = await this.rankSetsByMatch(
      userId,
      limit,
      minMatchPercentage,
      query.themeId,
    );
    if (rankedSets.length === 0) {
      return { data: { results: [] }, meta: { count: 0, limit } };
    }

    const missingBySet = await this.getMissingParts(
      userId,
      rankedSets.map((set) => set.setNum),
    );

    const results = rankedSets.map((set) => ({
      setNum: set.setNum,
      setName: set.setName,
      year: set.year,
      themeName: set.themeName,
      totalParts: set.totalParts,
      ownedParts: set.ownedParts,
      matchPercentage: set.matchPercentage,
      missingParts: missingBySet.get(set.setNum) ?? [],
    }));

    return {
      data: { results },
      meta: { count: results.length, limit },
    };
  }

  private async loadOwnedParts(userId: string): Promise<OwnedPartRow[]> {
    return this.databaseService.db
      .select({
        partNum: userOwnedParts.partNum,
        colorId: userOwnedParts.colorId,
        quantity: userOwnedParts.quantity,
      })
      .from(userOwnedParts)
      .where(eq(userOwnedParts.userId, userId));
  }

  private async rankSetsByMatch(
    userId: string,
    limit: number,
    minMatchPercentage: number,
    themeId?: number,
  ): Promise<RankedSetRow[]> {
    const themeIdFilter = themeId ?? null;

    const result = await this.databaseService.db.execute<{
      set_num: string;
      set_name: string;
      year: number;
      theme_name: string;
      total_parts: number;
      owned_parts: number;
      match_percentage: number;
    }>(sql`
      WITH owned AS (
        SELECT part_num, color_id, quantity
        FROM user_owned_parts
        WHERE user_id = ${userId}
      ),
      candidate_sets AS (
        SELECT DISTINCT ip.set_num
        FROM inventory_parts ip
        INNER JOIN owned o
          ON o.part_num = ip.part_num AND o.color_id = ip.color_id
        WHERE ip.is_spare = false
      ),
      required AS (
        SELECT
          ip.set_num,
          ip.part_num,
          ip.color_id,
          SUM(ip.quantity) AS required_qty
        FROM inventory_parts ip
        INNER JOIN candidate_sets cs ON cs.set_num = ip.set_num
        WHERE ip.is_spare = false
        GROUP BY ip.set_num, ip.part_num, ip.color_id
      )
      SELECT
        r.set_num,
        s.name AS set_name,
        s.year,
        t.name AS theme_name,
        SUM(r.required_qty)::int AS total_parts,
        SUM(LEAST(COALESCE(o.quantity, 0), r.required_qty))::int AS owned_parts,
        (
          SUM(LEAST(COALESCE(o.quantity, 0), r.required_qty))::float
          / NULLIF(SUM(r.required_qty), 0)
        ) AS match_percentage
      FROM required r
      LEFT JOIN owned o
        ON o.part_num = r.part_num AND o.color_id = r.color_id
      INNER JOIN sets s ON s.set_num = r.set_num
      INNER JOIN themes t ON t.id = s.theme_id
      ${themeIdFilter ? sql`WHERE s.theme_id = ${themeIdFilter}` : sql``}
      GROUP BY r.set_num, s.name, s.year, t.name
      HAVING
        SUM(LEAST(COALESCE(o.quantity, 0), r.required_qty)) > 0
        AND (
          SUM(LEAST(COALESCE(o.quantity, 0), r.required_qty))::float
          / NULLIF(SUM(r.required_qty), 0)
        ) >= ${minMatchPercentage}
      ORDER BY match_percentage DESC
      LIMIT ${limit}
    `);

    return result.rows.map((row) => ({
      setNum: row.set_num,
      setName: row.set_name,
      year: Number(row.year),
      themeName: row.theme_name,
      totalParts: Number(row.total_parts),
      ownedParts: Number(row.owned_parts),
      matchPercentage: Number(row.match_percentage),
    }));
  }

  private async getMissingParts(
    userId: string,
    setNums: string[],
  ): Promise<Map<string, MissingPart[]>> {
    if (setNums.length === 0) {
      return new Map();
    }

    const setNumList = sql.join(
      setNums.map((setNum) => sql`${setNum}`),
      sql`, `,
    );

    const result = await this.databaseService.db.execute<{
      set_num: string;
      part_num: string;
      color_id: number;
      part_name: string;
      color_name: string;
      color_rgb: string;
      color_is_trans: boolean;
      missing_qty: number;
    }>(sql`
      WITH owned AS (
        SELECT part_num, color_id, quantity
        FROM user_owned_parts
        WHERE user_id = ${userId}
      ),
      required AS (
        SELECT
          ip.set_num,
          ip.part_num,
          ip.color_id,
          SUM(ip.quantity) AS required_qty
        FROM inventory_parts ip
        WHERE ip.is_spare = false
          AND ip.set_num IN (${setNumList})
        GROUP BY ip.set_num, ip.part_num, ip.color_id
      )
      SELECT
        r.set_num,
        r.part_num,
        r.color_id,
        p.name AS part_name,
        c.name AS color_name,
        c.rgb AS color_rgb,
        c.is_trans AS color_is_trans,
        GREATEST(r.required_qty - COALESCE(o.quantity, 0), 0)::int AS missing_qty
      FROM required r
      LEFT JOIN owned o
        ON o.part_num = r.part_num AND o.color_id = r.color_id
      INNER JOIN parts p ON p.part_num = r.part_num
      INNER JOIN colors c ON c.color_id = r.color_id
      WHERE GREATEST(r.required_qty - COALESCE(o.quantity, 0), 0) > 0
      ORDER BY r.set_num, r.part_num
    `);

    const missingBySet = new Map<string, MissingPart[]>();

    for (const row of result.rows) {
      const missingPart: MissingPart = {
        partNum: row.part_num,
        colorId: Number(row.color_id),
        quantity: Number(row.missing_qty),
        partName: row.part_name,
        colorName: row.color_name,
        colorRgb: row.color_rgb,
        colorIsTrans: Boolean(row.color_is_trans),
      };

      const existing = missingBySet.get(row.set_num) ?? [];
      existing.push(missingPart);
      missingBySet.set(row.set_num, existing);
    }

    return missingBySet;
  }

  private async getMissingPartsForSet(
    userId: string,
    setNum: string,
  ): Promise<MissingPart[]> {
    await this.assertSetExists(setNum);
    const bySet = await this.getMissingParts(userId, [setNum]);
    return bySet.get(setNum) ?? [];
  }

  private async assertSetExists(setNum: string): Promise<void> {
    const result = await this.databaseService.db.execute(sql`
      SELECT 1 FROM inventory_parts
      WHERE set_num = ${setNum} AND is_spare = false
      LIMIT 1
    `);
    if (result.rows.length === 0) {
      throw new NotFoundException('Set not found');
    }
  }

  async buildMissingPartsCsv(userId: string, setNum: string): Promise<string> {
    const missingParts = await this.getMissingPartsForSet(userId, setNum);
    return [
      'Part,Color,Quantity',
      ...missingParts.map((p) => `${p.partNum},${p.colorId},${p.quantity}`),
    ].join('\n');
  }

  async buildSet(userId: string, setNum: string): Promise<CompleteSetResponse> {
    await this.assertSetExists(setNum);
    const result = await this.databaseService.db.execute<{
      can_build: boolean;
      required_parts: number;
      parts_affected: number;
    }>(sql`WITH required AS (
        SELECT part_num, color_id, SUM(quantity)::int AS required_qty
        FROM inventory_parts
        WHERE set_num = ${setNum} AND is_spare = false
        GROUP BY part_num, color_id
      ),
      locked AS (
        SELECT o.part_num, o.color_id, o.quantity
        FROM user_owned_parts o
        INNER JOIN required r
          ON o.part_num = r.part_num AND o.color_id = r.color_id
        WHERE o.user_id = ${userId}
        FOR UPDATE
      ),
      has_all AS (
        SELECT BOOL_AND(COALESCE(l.quantity, 0) >= r.required_qty) AS can_build
        FROM required r
        LEFT JOIN locked l
          ON l.part_num = r.part_num AND l.color_id = r.color_id
      ),
      deleted AS (
        DELETE FROM user_owned_parts uop
        USING required r, has_all
        WHERE has_all.can_build = true
          AND uop.user_id = ${userId}
          AND uop.part_num = r.part_num
          AND uop.color_id = r.color_id
          AND uop.quantity = r.required_qty
        RETURNING uop.id
      ),
      updated AS (
        UPDATE user_owned_parts uop
        SET quantity = uop.quantity - r.required_qty
        FROM required r, has_all
        WHERE has_all.can_build = true
          AND uop.user_id = ${userId}
          AND uop.part_num = r.part_num
          AND uop.color_id = r.color_id
          AND uop.quantity > r.required_qty
        RETURNING uop.id
      )
      SELECT
        (SELECT can_build FROM has_all) AS can_build,
        (SELECT COUNT(*)::int FROM required) AS required_parts,
        (
          (SELECT COUNT(*)::int FROM deleted)
          + (SELECT COUNT(*)::int FROM updated)
        ) AS parts_affected
`);

    const row = result.rows[0];

    if (!row?.can_build || row.parts_affected !== row.required_parts) {
      throw new UnprocessableEntityException(
        'Not enough parts to build this set',
      );
    }

    await this.databaseService.db.execute(sql`
      DELETE FROM user_owned_parts
      WHERE user_id = ${userId} AND quantity <= 0
    `);

    return { partsAffected: Number(row.parts_affected) };
  }
}
