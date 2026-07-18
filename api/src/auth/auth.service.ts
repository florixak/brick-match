import { LoginRequest, RegisterRequest } from '@lego-matcher/shared-types';
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
import { isUniqueViolation } from 'src/database/pg-error';
import { users } from 'src/database/schema';
import { AuthSession } from './interfaces/auth-session.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

// Precomputed argon2id hash used when no user exists, to equalize login timing.
const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$XmNPV746wiJMtxTZarTY+Q$waq7RG3gYtLbmEzhTeisXZwj6vxcQPAuwOO1XMMpUgY';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginRequest): Promise<AuthSession> {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const isPasswordValid = await argon2.verify(
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
      password,
    );

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      user: { id: user.id, email: user.email },
      accessToken,
    };
  }

  async register(data: RegisterRequest): Promise<AuthSession> {
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
    return {
      user: { id: user.id, email: user.email },
      accessToken,
    };
  }
}
