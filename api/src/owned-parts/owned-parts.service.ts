import {
  AddOwnedPartRequest,
  AddOwnedPartResponse,
  GetOwnedPartsApiResponse,
  GetOwnedPartsQuery,
} from '@lego-matcher/shared-types';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, eq, or, sql } from 'drizzle-orm';
import { DatabaseService } from 'src/database/database.service';
import { isFkViolation } from 'src/database/pg-error';
import { colors, parts, userOwnedParts } from 'src/database/schema';

@Injectable()
export class OwnedPartsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    userId: string,
    request: AddOwnedPartRequest,
  ): Promise<AddOwnedPartResponse> {
    const { partNum, colorId, quantity } = request;

    try {
      const [ownedPart] = await this.databaseService.db
        .insert(userOwnedParts)
        .values({ userId, partNum, colorId, quantity })
        .onConflictDoUpdate({
          target: [
            userOwnedParts.userId,
            userOwnedParts.partNum,
            userOwnedParts.colorId,
          ],
          set: {
            quantity: sql`${userOwnedParts.quantity} + excluded.quantity`,
          },
        })
        .returning({
          partNum: userOwnedParts.partNum,
          colorId: userOwnedParts.colorId,
          quantity: userOwnedParts.quantity,
        });

      if (!ownedPart) {
        throw new InternalServerErrorException('Failed to add owned part');
      }

      return ownedPart;
    } catch (error) {
      if (isFkViolation(error)) {
        throw new BadRequestException('Part or color not found in catalog');
      }
      throw error;
    }
  }

  async findAll(
    userId: string,
    { page, pageSize, search }: GetOwnedPartsQuery,
  ): Promise<GetOwnedPartsApiResponse> {
    const offset = (page - 1) * pageSize;
    const term = ((search as string) ?? '')
      .trim()
      .toLowerCase()
      .replace(/[\\%_]/g, '\\$&');

    const userFilter = eq(userOwnedParts.userId, userId);
    const whereClause = term
      ? and(
          userFilter,
          or(
            sql`lower(${parts.name}) LIKE ${term + '%'}`,
            sql`lower(${userOwnedParts.partNum}) LIKE ${term + '%'}`,
          ),
        )
      : userFilter;

    const [total, ownedParts] = await Promise.all([
      this.databaseService.db
        .select({ count: count() })
        .from(userOwnedParts)
        .innerJoin(parts, eq(userOwnedParts.partNum, parts.partNum))
        .where(whereClause),
      this.databaseService.db
        .select({
          partNum: userOwnedParts.partNum,
          colorId: userOwnedParts.colorId,
          quantity: userOwnedParts.quantity,
          partName: parts.name,
          colorName: colors.name,
          colorRgb: colors.rgb,
        })
        .from(userOwnedParts)
        .innerJoin(parts, eq(userOwnedParts.partNum, parts.partNum))
        .innerJoin(colors, eq(userOwnedParts.colorId, colors.colorId))
        .where(whereClause)
        .orderBy(asc(parts.name))
        .limit(pageSize)
        .offset(offset),
    ]);

    const totalItems = total[0].count;
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);

    return {
      data: { items: ownedParts },
      meta: {
        page,
        limit: pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  async remove(
    userId: string,
    partNum: string,
    colorId: number,
  ): Promise<void> {
    const [deleted] = await this.databaseService.db
      .delete(userOwnedParts)
      .where(
        and(
          eq(userOwnedParts.userId, userId),
          eq(userOwnedParts.partNum, partNum),
          eq(userOwnedParts.colorId, colorId),
        ),
      )
      .returning({ id: userOwnedParts.id });

    if (!deleted) {
      throw new NotFoundException('Owned part not found');
    }
  }
}
