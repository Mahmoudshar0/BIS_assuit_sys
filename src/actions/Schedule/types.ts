// Enums based on Swagger
export enum EnSessionType {
  Lecture = 0,
  Section = 1,
}

export enum EnWeekDays {
  Saturday = 0,
  Sunday = 1,
  Monday = 2,
  Tuesday = 3,
  Wednesday = 4,
  Thursday = 5,
  Friday = 6,
}

// DTOs
export interface SessionsScheduleDTO {
  sessionId: number;
  courseId: number;
  courseName: string;
  sessionType: EnSessionType;
  roomId: number;
  roomName: string;
  guidanceGroupId: number;
  day: EnWeekDays;
  startTime: string; // "time" format in Swagger usually maps to string "HH:mm:ss"
  endTime: string;
  academiceYearId: number;
  semesterId: number;
}

export interface CreateSessionsScheduleDTO {
  courseId: number;
  sessionType: EnSessionType;
  roomId: number;
  guidanceGroupId: number;
  day: EnWeekDays;
  startTime: string;
  endTime: string;
  academiceYearId: number;
  semesterId: number;
}

export interface UpdateSessionsScheduleDTO {
  sessionId: number;
  courseId: number;
  sessionType: EnSessionType;
  roomId: number;
  guidanceGroupId: number;
  day: EnWeekDays;
  startTime: string;
  endTime: string;
  academiceYearId: number;
  semesterId: number;
}
