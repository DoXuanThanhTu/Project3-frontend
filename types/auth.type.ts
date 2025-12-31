// types/user.type.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
  displayName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  confirmPassword?: string;
}
