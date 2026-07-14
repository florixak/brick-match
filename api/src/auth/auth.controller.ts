import {
  LoginApiResponse,
  type LoginRequest,
  LoginRequestSchema,
  RegisterApiResponse,
  type RegisterRequest,
  RegisterRequestSchema,
} from '@lego-matcher/shared-types';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { AuthThrottle } from 'src/common/decorators/throttle.decorator';

@Controller({ path: 'auth', version: '1' })
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @AuthThrottle()
  @ApiOperation({ summary: 'Login a user' })
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(LoginRequestSchema)) loginRequest: LoginRequest,
  ): Promise<LoginApiResponse> {
    const authResponse = await this.authService.login(loginRequest);
    return {
      data: { accessToken: authResponse.accessToken },
      meta: {},
    };
  }

  @Post('register')
  @AuthThrottle()
  @ApiOperation({ summary: 'Register a user' })
  async register(
    @Body(new ZodValidationPipe(RegisterRequestSchema))
    registerRequest: RegisterRequest,
  ): Promise<RegisterApiResponse> {
    const authResponse = await this.authService.register(registerRequest);
    return {
      data: { accessToken: authResponse.accessToken },
      meta: {},
    };
  }
}
