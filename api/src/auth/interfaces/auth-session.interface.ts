import { AuthUser } from '@brick-match/shared-types';

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}
