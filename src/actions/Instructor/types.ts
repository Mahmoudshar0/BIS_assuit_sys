export interface UserDto {
  id?: number;
  name: string;
  email: string;
  phone: string;
  nationalNo: string;
  profileImage?: string;
  password?: string;
  confirmPassword?: string;
}

export interface Instructor {
  id: number;
  userDto: UserDto;
  enInstructorTitle: number;
  instructorTitle: string;
}

export interface InstructorPayload {
  id?: number;
  userDto: UserDto & { roleId?: number }; // ناخد roleId من Dropdown اللي عندنا
  enInstructorTitle: number;
}

export const apiUrl = process.env.NEXT_PUBLIC_API_URL;
