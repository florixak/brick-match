import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '@lego-matcher/shared-types';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { DatabaseService } from 'src/database/database.service';
import { users } from 'src/database/schema';
import { JwtPayload } from './interfaces/jwt-payload.interface';

function isUniqueViolation(err: unknown): boolean {
  return (err as { code?: string })?.code === '23505';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginRequest): Promise<AuthResponse> {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const hashedPassword = await argon2.hash(data.password);

    let user;
    try {
      [user] = await this.databaseService.db
        .insert(users)
        .values({
          email: data.email,
          passwordHash: hashedPassword,
        })
        .returning();
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new BadRequestException('User with this email already exists');
      }
      throw error;
    }

    if (!user) {
      throw new InternalServerErrorException('Failed to register user');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }
}
