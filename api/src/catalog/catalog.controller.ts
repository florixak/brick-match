import {
  ColorsApiResponse,
  SearchPartsApiResponse,
  SearchPartsQuerySchema,
  type SearchPartsQuery,
  SearchSetsApiResponse,
  SearchSetsQuerySchema,
  type SearchSetsQuery,
} from '@lego-matcher/shared-types';
import { Controller, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { CatalogService } from './catalog.service';
import { MatchingThrottle } from 'src/common/decorators/throttle.decorator';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller({ path: 'catalog', version: '1' })
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('sets')
  @MatchingThrottle()
  @ApiOperation({ summary: 'Search sets' })
  @ApiQuery({
    name: 'search',
    description: 'The search query',
    required: false,
  })
  getSets(
    @Query(new ZodValidationPipe(SearchSetsQuerySchema))
    query: SearchSetsQuery,
  ): Promise<SearchSetsApiResponse> {
    return this.catalogService.searchSets(query);
  }

  @Get('parts')
  @MatchingThrottle()
  @ApiOperation({ summary: 'Search parts' })
  @ApiQuery({
    name: 'search',
    description: 'The search query',
    required: false,
  })
  getParts(
    @Query(new ZodValidationPipe(SearchPartsQuerySchema))
    query: SearchPartsQuery,
  ): Promise<SearchPartsApiResponse> {
    return this.catalogService.searchParts(query);
  }

  @Get('colors')
  @MatchingThrottle()
  @ApiOperation({ summary: 'Get colors' })
  getColors(): Promise<ColorsApiResponse> {
    return this.catalogService.getColors();
  }
}
