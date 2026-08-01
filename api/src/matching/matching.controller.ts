import {
  CompleteSetResponse,
  GetMatchesApiResponse,
  GetMatchesApiResponseSchema,
  GetMatchesQuerySchema,
  type GetMatchesQuery,
} from '@lego-matcher/shared-types';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { type Response } from 'express';
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
  @ApiQuery({ name: 'themeId', required: false, type: Number })
  async findMatches(
    @CurrentUser('sub') userId: string,
    @Query(new ZodValidationPipe<GetMatchesQuery>(GetMatchesQuerySchema))
    query: GetMatchesQuery,
  ): Promise<GetMatchesApiResponse> {
    const response = await this.matchingService.findMatches(userId, query);
    return GetMatchesApiResponseSchema.parse(response);
  }

  @Get(':setNum/export')
  @MatchingThrottle()
  @ApiOperation({
    summary: 'Export missing parts for a set as Rebrickable CSV',
  })
  async exportMissingParts(
    @CurrentUser('sub') userId: string,
    @Param('setNum') setNum: string,
    @Res() res: Response,
  ) {
    const csv = await this.matchingService.buildMissingPartsCsv(userId, setNum);

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${setNum}-missing-parts.csv"`,
    });
    res.send(csv);
  }

  @Post(':setNum/build')
  @HttpCode(HttpStatus.OK)
  @MatchingThrottle()
  @ApiOperation({
    summary: 'Mark a set as built and remove its parts from inventory',
  })
  async buildSet(
    @CurrentUser('sub') userId: string,
    @Param('setNum') setNum: string,
  ): Promise<CompleteSetResponse> {
    return await this.matchingService.buildSet(userId, setNum);
  }
}
