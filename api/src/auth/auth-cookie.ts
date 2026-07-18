import type { CookieOptions, Response } from 'express';
import { AppConfigService } from 'src/config/config.service';

export function getAuthCookieOptions(
  config: AppConfigService,
): CookieOptions & { maxAge: number } {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: config.jwtExpiresIn * 1000,
  };
}

export function setAuthCookie(
  res: Response,
  config: AppConfigService,
  accessToken: string,
): void {
  res.cookie(config.jwtCookieName, accessToken, getAuthCookieOptions(config));
}

export function clearAuthCookie(res: Response, config: AppConfigService): void {
  const { ...options } = getAuthCookieOptions(config);
  res.clearCookie(config.jwtCookieName, options);
}
