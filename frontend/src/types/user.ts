export type UserRole = 'user' | 'admin' | 'superadmin';

export type UserRecord = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UserListResponse = {
  success: boolean;
  count: number;
  data: UserRecord[];
};
