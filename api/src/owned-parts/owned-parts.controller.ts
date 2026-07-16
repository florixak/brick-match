import {
  AddOwnedPartApiResponse,
  AddOwnedPartApiResponseSchema,
  AddOwnedPartRequestSchema,
  GetOwnedPartsApiResponse,
  GetOwnedPartsApiResponseSchema,
  GetOwnedPartsQuerySchema,
  RemoveOwnedPartQuerySchema,
  type AddOwnedPartRequest,
  type GetOwnedPartsQuery,
  type RemoveOwnedPartQuery,
} from '@lego-matcher/shared-types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { OwnedPartsService } from './owned-parts.service';

@Controller({ path: 'owned-parts', version: '1' })
@ApiTags('Owned Parts')
@UseGuards(JwtAuthGuard)
export class OwnedPartsController {
  constructor(private readonly ownedPartsService: OwnedPartsService) {}

  @Post()
  @ApiOperation({ summary: 'Add an owned part' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body(new ZodValidationPipe(AddOwnedPartRequestSchema))
    request: AddOwnedPartRequest,
  ): Promise<AddOwnedPartApiResponse> {
    const data = await this.ownedPartsService.create(userId, request);
    return AddOwnedPartApiResponseSchema.parse({ data, meta: {} });
  }

  @Get()
  @ApiOperation({ summary: 'List owned parts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query(new ZodValidationPipe<GetOwnedPartsQuery>(GetOwnedPartsQuerySchema))
    query: GetOwnedPartsQuery,
  ): Promise<GetOwnedPartsApiResponse> {
    const result = await this.ownedPartsService.findAll(userId, query);
    return GetOwnedPartsApiResponseSchema.parse(result);
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove an owned part' })
  @ApiQuery({ name: 'partNum', required: true })
  @ApiQuery({ name: 'colorId', required: true, type: Number })
  async remove(
    @CurrentUser('sub') userId: string,
    @Query(
      new ZodValidationPipe<RemoveOwnedPartQuery>(RemoveOwnedPartQuerySchema),
    )
    query: RemoveOwnedPartQuery,
  ): Promise<void> {
    await this.ownedPartsService.remove(userId, query.partNum, query.colorId);
  }
}
