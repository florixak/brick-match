import {
  ColorsApiResponse,
  SearchPartsApiResponse,
  SearchPartsQuerySchema,
  SearchSetsApiResponse,
  SearchSetsQuerySchema,
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
  getSets(
    @Query(new ZodValidationPipe(SearchSetsQuerySchema))
    query: SearchSetsQuery,
  ): Promise<SearchSetsApiResponse> {
    return this.catalogService.searchSets(query);
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
  getParts(
    @Query(new ZodValidationPipe(SearchPartsQuerySchema))
    query: SearchPartsQuery,
  ): Promise<SearchPartsApiResponse> {
    return this.catalogService.searchParts(query);
  }

  @Get('colors')
  @ApiOperation({ summary: 'Get colors' })
  getColors(): Promise<ColorsApiResponse> {
    return this.catalogService.getColors();
  }
}
