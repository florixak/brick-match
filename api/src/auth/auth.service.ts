import {
  AuthUser,
  ChangePasswordRequest,
  DeleteAccountRequest,
  LoginRequest,
  RegisterRequest,
  UpdateEmailRequest,
} from '@brick-match/shared-types';
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

    return this.createSession({ id: user.id, email: user.email });
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

    return this.createSession({ id: user.id, email: user.email });
  }

  async getCurrentUser(userId: string): Promise<AuthUser> {
    const [user] = await this.databaseService.db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async updateEmail(
    userId: string,
    updateEmailRequest: UpdateEmailRequest,
  ): Promise<AuthSession> {
    const user = await this.verifyCurrentPassword(
      userId,
      updateEmailRequest.currentPassword,
    );

    const currentUser: AuthUser = { id: user.id, email: user.email };

    if (user.email === updateEmailRequest.email) {
      return this.createSession(currentUser);
    }

    let updatedUser: AuthUser | undefined;
    try {
      [updatedUser] = await this.databaseService.db
        .update(users)
        .set({ email: updateEmailRequest.email })
        .where(eq(users.id, userId))
        .returning({ id: users.id, email: users.email });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new BadRequestException('User with this email already exists');
      }
      throw error;
    }

    if (!updatedUser) {
      throw new InternalServerErrorException('Failed to update email');
    }

    return this.createSession(updatedUser);
  }

  async changePassword(
    userId: string,
    changePasswordRequest: ChangePasswordRequest,
  ): Promise<void> {
    await this.verifyCurrentPassword(
      userId,
      changePasswordRequest.currentPassword,
    );

    const hashedPassword = await argon2.hash(changePasswordRequest.newPassword);

    const [updatedUser] = await this.databaseService.db
      .update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!updatedUser) {
      throw new InternalServerErrorException('Failed to change password');
    }
  }

  async deleteAccount(
    userId: string,
    deleteAccountRequest: DeleteAccountRequest,
  ): Promise<void> {
    await this.verifyCurrentPassword(
      userId,
      deleteAccountRequest.currentPassword,
    );

    const [deletedUser] = await this.databaseService.db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!deletedUser) {
      throw new InternalServerErrorException('Failed to delete account');
    }
  }

  private async createSession(user: AuthUser): Promise<AuthSession> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return { user, accessToken };
  }

  private async verifyCurrentPassword(userId: string, currentPassword: string) {
    const [user] = await this.databaseService.db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) throw new UnauthorizedException();
    const valid = await argon2.verify(user.passwordHash, currentPassword);
    if (!valid) throw new UnauthorizedException('Invalid password');
    return user;
  }
}
