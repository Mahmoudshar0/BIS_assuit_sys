export interface UserDto {
  id?: number;
  name: string;
  email: string;
  phone: string;
  nationalNo: string;
  profileImage?: string;
  password?: string;
  confirmPassword?: string;
  roleId?: number; // من Dropdown الـ Roles
}

export interface Student {
  studentID: number;
  gpa: number;
  enrollmentDate: string;
  studentLevel: number;
  guidanceGroupID: number;
  user: UserDto;
}

export interface StudentPayload {
  studentID?: number;
  gpa: number;
  enrollmentDate: string;
  studentLevel: number;
  guidanceGroupID: number;
  user: UserDto;
}

export const apiUrl = process.env.NEXT_PUBLIC_API_URL;
