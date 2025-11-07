export interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  enCourseLevel: number;
  levelName: string;
  academiceYearId: number;
  yearLabel: string;
  semesterId: number;
  semesterLabel: string;
}

export type CoursePayload = Omit<
  Course,
  "id" | "levelName" | "yearLabel" | "semesterLabel"
> & {
  id?: number;
};

export const apiUrl = process.env.NEXT_PUBLIC_API_URL;
