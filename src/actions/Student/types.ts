// API Response Types (from GET /api/Students/All)
export interface StudentUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  nationalNo: string;
  profileImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  studentID: number;
  gpa: number;
  enrollmentDate: string;
  studentLevel: number;
  guidanceGroupID: number;
  user: StudentUser;
}

// Request Payload Types (for PUT /api/Students)
export interface StudentUserPayload {
  id: number;
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  phone: string;
  nationalNo: string;
  profileImage?: string;
}

export interface StudentPayload {
  studentID: number;
  gpa: number;
  studentLevel: number;
  guidanceGroupID: number;
  user: StudentUserPayload;
}

export const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bis.runasp.net';
