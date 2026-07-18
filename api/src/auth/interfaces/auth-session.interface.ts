import { AuthUser } from '@lego-matcher/shared-types';

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}
