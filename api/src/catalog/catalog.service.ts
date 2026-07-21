import {
  ThemesApiResponse,
  type ColorsApiResponse,
  type SearchPartsApiResponse,
  type SearchPartsQuery,
  type SearchSetsApiResponse,
  type SearchSetsQuery,
} from '@lego-matcher/shared-types';
import { Injectable } from '@nestjs/common';
import { asc, eq, or, sql } from 'drizzle-orm';
import { DatabaseService } from 'src/database/database.service';
import {
  colors,
  partCategories,
  parts,
  sets,
  themes,
} from 'src/database/schema';

@Injectable()
export class CatalogService {
  constructor(private readonly databaseService: DatabaseService) {}

  async searchSets(query: SearchSetsQuery): Promise<SearchSetsApiResponse> {
    const term = (query.search ?? '')
      .trim()
      .toLowerCase()
      .replace(/[\\%_]/g, '\\$&');
    const limit = query.limit ?? 10;

    if (!term) {
      return {
        data: { sets: [] },
        meta: { count: 0, limit },
      };
    }

    const results = await this.databaseService.db
      .select({
        setNum: sets.setNum,
        name: sets.name,
        year: sets.year,
        numParts: sets.numParts,
        themeId: sets.themeId,
        themeName: themes.name,
      })
      .from(sets)
      .innerJoin(themes, eq(sets.themeId, themes.id))
      .where(
        or(
          sql`lower(${sets.name}) LIKE ${term + '%'}`,
          sql`lower(${sets.setNum}) LIKE ${term + '%'}`,
        ),
      )
      .orderBy(asc(sets.name))
      .limit(limit);

    return {
      data: { sets: results },
      meta: {
        count: results.length,
        limit,
      },
    };
  }

  async searchParts(query: SearchPartsQuery): Promise<SearchPartsApiResponse> {
    const term = (query.search ?? '')
      .trim()
      .toLowerCase()
      .replace(/[\\%_]/g, '\\$&');
    const limit = query.limit ?? 10;

    if (!term) {
      return {
        data: { parts: [] },
        meta: { count: 0, limit },
      };
    }

    const results = await this.databaseService.db
      .select({
        partNum: parts.partNum,
        name: parts.name,
        partCategoryId: parts.partCatId,
        partCategoryName: partCategories.name,
      })
      .from(parts)
      .innerJoin(partCategories, eq(parts.partCatId, partCategories.id))
      .where(
        or(
          sql`lower(${parts.name}) LIKE ${term + '%'}`,
          sql`lower(${parts.partNum}) LIKE ${term + '%'}`,
        ),
      )
      .orderBy(asc(parts.name))
      .limit(limit);

    return {
      data: { parts: results },
      meta: {
        count: results.length,
        limit,
      },
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
      meta: {
        count: results.length,
      },
    };
  }

  async getThemes(): Promise<ThemesApiResponse> {
    const results = await this.databaseService.db
      .select({
        id: themes.id,
        name: themes.name,
        parentId: themes.parentId,
      })
      .from(themes)
      .orderBy(asc(themes.name));

    return {
      data: { themes: results },
      meta: {
        count: results.length,
      },
    };
  }
}
