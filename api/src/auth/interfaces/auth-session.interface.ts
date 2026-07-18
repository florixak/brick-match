export interface AuthSession {
  user: {
    id: string;
    email: string;
  };
  accessToken: string;
}
