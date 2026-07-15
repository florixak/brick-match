import {
  type ColorsApiResponse,
  type SearchPartsApiResponse,
  type SearchPartsQuery,
  type SearchSetsApiResponse,
  type SearchSetsQuery,
} from '@lego-matcher/shared-types';
import { Injectable } from '@nestjs/common';
import { asc, or, sql } from 'drizzle-orm';
import { DatabaseService } from 'src/database/database.service';
import { colors, parts, sets } from 'src/database/schema';

@Injectable()
export class CatalogService {
  constructor(private readonly databaseService: DatabaseService) {}

  async searchSets(query: SearchSetsQuery): Promise<SearchSetsApiResponse> {
    const term = (query.search ?? '').toLowerCase();
    const limit = query.limit ?? 10;

    const results = await this.databaseService.db
      .select({
        setNum: sets.setNum,
        name: sets.name,
        year: sets.year,
        numParts: sets.numParts,
      })
      .from(sets)
      .where(
        term
          ? or(
              sql`lower(${sets.name}) LIKE ${term + '%'}`,
              sql`lower(${sets.setNum}) LIKE ${term + '%'}`,
            )
          : undefined,
      )
      .orderBy(asc(sets.name))
      .limit(limit);

    return {
      data: { sets: results },
      meta: {},
    };
  }

  async searchParts(query: SearchPartsQuery): Promise<SearchPartsApiResponse> {
    const term = (query.search ?? '').toLowerCase();
    const limit = query.limit ?? 10;

    const results = await this.databaseService.db
      .select({
        partNum: parts.partNum,
        name: parts.name,
      })
      .from(parts)
      .where(
        term
          ? or(
              sql`lower(${parts.name}) LIKE ${term + '%'}`,
              sql`lower(${parts.partNum}) LIKE ${term + '%'}`,
            )
          : undefined,
      )
      .orderBy(asc(parts.name))
      .limit(limit);

    return {
      data: { parts: results },
      meta: {},
    };
  }

  async getColors(): Promise<ColorsApiResponse> {
    const results = await this.databaseService.db
      .select({
        colorId: colors.colorId,
        name: colors.name,
        rgb: colors.rgb,
        isTrans: colors.isTrans,
      })
      .from(colors)
      .orderBy(asc(colors.name));

    return {
      data: { colors: results },
      meta: {},
    };
  }
}
