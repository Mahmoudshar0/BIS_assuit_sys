export enum EnAttendanceStatus {
  Present = 1,
  Late = 3,
  Absent = 2
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
