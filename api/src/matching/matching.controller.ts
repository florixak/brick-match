import {
  GetMatchesApiResponse,
  GetMatchesApiResponseSchema,
  GetMatchesQuerySchema,
  type GetMatchesQuery,
} from '@lego-matcher/shared-types';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { MatchingThrottle } from 'src/common/decorators/throttle.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { MatchingService } from './matching.service';

@Controller({ path: 'matching', version: '1' })
@ApiTags('Matching')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get()
  @MatchingThrottle()
  @ApiOperation({ summary: 'Find buildable sets ranked by match percentage' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'minMatchPercentage', required: false, type: Number })
  async findMatches(
    @CurrentUser('sub') userId: string,
    @Query(new ZodValidationPipe<GetMatchesQuery>(GetMatchesQuerySchema))
    query: GetMatchesQuery,
  ): Promise<GetMatchesApiResponse> {
    const response = await this.matchingService.findMatches(userId, query);
    return GetMatchesApiResponseSchema.parse(response);
  }
}
