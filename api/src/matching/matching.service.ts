import {
  GetMatchesApiResponse,
  GetMatchesQuery,
  MatchResult,
  MissingPart,
  OwnedPart as OwnedPartRow,
} from '@lego-matcher/shared-types';
import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DatabaseService } from 'src/database/database.service';
import { userOwnedParts } from 'src/database/schema';

const DEFAULT_LIMIT = 50;
const DEFAULT_MIN_MATCH_PERCENTAGE = 0;

type RankedSetRow = Omit<MatchResult, 'missingParts'>;

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
        (
          SUM(LEAST(COALESCE(o.quantity, 0), r.required_qty))::float
          / NULLIF(SUM(r.required_qty), 0)
        ) AS match_percentage
      FROM required r
      LEFT JOIN owned o
        ON o.part_num = r.part_num AND o.color_id = r.color_id
      INNER JOIN sets s ON s.set_num = r.set_num
      WHERE (${themeIdFilter} IS NULL OR s.theme_id = ${themeIdFilter})
      GROUP BY r.set_num, s.name
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
        GREATEST(r.required_qty - COALESCE(o.quantity, 0), 0)::int AS missing_qty
      FROM required r
      LEFT JOIN owned o
        ON o.part_num = r.part_num AND o.color_id = r.color_id
      WHERE GREATEST(r.required_qty - COALESCE(o.quantity, 0), 0) > 0
      ORDER BY r.set_num, r.part_num
    `);

    const missingBySet = new Map<string, MissingPart[]>();

    for (const row of result.rows) {
      const missingPart: MissingPart = {
        partNum: row.part_num,
        colorId: Number(row.color_id),
        quantity: Number(row.missing_qty),
      };

      const existing = missingBySet.get(row.set_num) ?? [];
      existing.push(missingPart);
      missingBySet.set(row.set_num, existing);
    }

    return missingBySet;
  }
}
