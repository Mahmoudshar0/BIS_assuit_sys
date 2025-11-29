export enum EnAttendanceStatus {
  Present = 1,
  Late = 2,
  Absent = 3
}

export interface AttendanceItemDTO {
  studentId: number;
  enStatus: EnAttendanceStatus;
}

export interface CreateSessionDTO {
  sessionScheduleId: number;
  roomId: number;
  sessionGroupId: number;
  date: string; // "year-month-day"
  startTime: string;
  endTime: string;
  attendances: AttendanceItemDTO[];
}
