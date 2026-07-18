import {
  ColorsApiResponse,
  ColorsApiResponseSchema,
  SearchPartsApiResponse,
  SearchPartsApiResponseSchema,
  SearchPartsQuerySchema,
  SearchSetsApiResponse,
  SearchSetsApiResponseSchema,
  SearchSetsQuerySchema,
  ThemesApiResponse,
  ThemesApiResponseSchema,
  type SearchPartsQuery,
  type SearchSetsQuery,
} from '@lego-matcher/shared-types';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { CatalogService } from './catalog.service';

@Controller({ path: 'catalog', version: '1' })
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('sets')
  @ApiOperation({ summary: 'Search sets' })
  @ApiQuery({
    name: 'search',
    description: 'The search query',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of results',
    required: false,
    type: Number,
  })
  async getSets(
    @Query(new ZodValidationPipe(SearchSetsQuerySchema))
    query: SearchSetsQuery,
  ): Promise<SearchSetsApiResponse> {
    const result = await this.catalogService.searchSets(query);
    return SearchSetsApiResponseSchema.parse(result);
  }

  @Get('parts')
  @ApiOperation({ summary: 'Search parts' })
  @ApiQuery({
    name: 'search',
    description: 'The search query',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of results',
    required: false,
    type: Number,
  })
  async getParts(
    @Query(new ZodValidationPipe(SearchPartsQuerySchema))
    query: SearchPartsQuery,
  ): Promise<SearchPartsApiResponse> {
    const result = await this.catalogService.searchParts(query);
    return SearchPartsApiResponseSchema.parse(result);
  }

  @Get('colors')
  @ApiOperation({ summary: 'Get colors' })
  async getColors(): Promise<ColorsApiResponse> {
    const result = await this.catalogService.getColors();
    return ColorsApiResponseSchema.parse(result);
  }

  @Get('themes')
  @ApiOperation({ summary: 'Get themes' })
  async getThemes(): Promise<ThemesApiResponse> {
    const result = await this.catalogService.getThemes();
    return ThemesApiResponseSchema.parse(result);
  }
}
