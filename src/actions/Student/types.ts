export interface StudentUserInput {
  id?: number | null;
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  phone: string;
  nationalNo: string;
  profileImage?: string;
  roleId: number | "";
}

export interface StudentInput {
  id?: number | null;
  gpa: number | "";
  enrollmentDate: string;
  studentLevel: number | "";
  guidanceGroupID: number | "";
  user: StudentUserInput;
}

export interface StudentUserPayload {
  id: number;
  name: string;
  email: string;
  phone: string;
  nationalNo: string;
  profileImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentPayload {
  studentID: number;
  gpa: number;
  enrollmentDate: string;
  studentLevel: number;
  guidanceGroupID: number;
  user: StudentUserPayload;
}

export const apiUrl = process.env.NEXT_PUBLIC_API_URL;
