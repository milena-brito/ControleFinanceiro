export type PublicUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthResult = {
  user: PublicUser;
  accessToken: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
};
