import {
  LoginApiResponse,
  LoginApiResponseSchema,
  type LoginRequest,
  LoginRequestSchema,
  MeApiResponse,
  MeApiResponseSchema,
  RegisterApiResponse,
  RegisterApiResponseSchema,
  type RegisterRequest,
  RegisterRequestSchema,
} from '@lego-matcher/shared-types';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { AuthThrottle } from 'src/common/decorators/throttle.decorator';
import type { Response } from 'express';
import { AppConfigService } from 'src/config/config.service';
import { clearAuthCookie, setAuthCookie } from './auth-cookie';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller({ path: 'auth', version: '1' })
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: AppConfigService,
  ) {}

  @Post('login')
  @AuthThrottle()
  @ApiOperation({ summary: 'Login a user' })
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(LoginRequestSchema)) loginRequest: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginApiResponse> {
    const { user, accessToken } = await this.authService.login(loginRequest);

    setAuthCookie(res, this.configService, accessToken);

    return LoginApiResponseSchema.parse({
      data: { user },
      meta: {},
    });
  }

  @Post('register')
  @AuthThrottle()
  @ApiOperation({ summary: 'Register a user' })
  @HttpCode(200)
  async register(
    @Body(new ZodValidationPipe(RegisterRequestSchema))
    registerRequest: RegisterRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterApiResponse> {
    const { user, accessToken } =
      await this.authService.register(registerRequest);

    setAuthCookie(res, this.configService, accessToken);

    return RegisterApiResponseSchema.parse({
      data: { user },
      meta: {},
    });
  }

  @Post('logout')
  @AuthThrottle()
  @ApiOperation({ summary: 'Logout a user' })
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response): void {
    clearAuthCookie(res, this.configService);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the current user' })
  async me(@CurrentUser('sub') userId: string): Promise<MeApiResponse> {
    const user = await this.authService.getCurrentUser(userId);
    return MeApiResponseSchema.parse({
      data: { user },
      meta: {},
    });
  }
}
