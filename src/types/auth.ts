export interface LoginCredentials {
  email: string;
  password: string;
}

export type UserRole = 
  | 'Student'
  | 'SuperUser'
  | 'Admin'
  | 'StudentAffairsEmp'
  | 'LevelRegister'
  | 'GroupSupervisor'
  | 'Instructor';

export interface UserClaims {
  id: string;
  name: string; 
  role: UserRole; 
}

export interface AuthResponse {
  token: string;
  fullName: string;
  role: UserRole;
}

export interface ErrorResponse {
  message: string;
  [key: string]: any;
}

export type ApiResponse = AuthResponse | ErrorResponse;
