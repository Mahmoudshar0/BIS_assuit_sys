export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserClaims {
  name: string; 
  role: 'Admin' | 'Faculty' | 'Student'; 
}

export interface AuthData {
  token: string;
  fullName: string;
  role: 'Admin' | 'Faculty' | 'Student';
}

export interface SuccessResponse {
  successed: true;
  message: string;
  errors: any[];
  data: AuthData;
}

export interface ErrorResponse {
  successed: false;
  message: string;
  errors: any[];
  data: null;
}

export type ApiResponse = SuccessResponse | ErrorResponse;
