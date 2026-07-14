import { Throttle } from '@nestjs/throttler';
import { RATE_LIMITS } from 'src/config/rate-limit.config';

export const AuthThrottle = () => Throttle({ default: RATE_LIMITS.auth });
export const MatchingThrottle = () =>
  Throttle({ default: RATE_LIMITS.matching });
