export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  success: boolean;
  token: string;
  user: AuthUser;
};
