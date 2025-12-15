export interface AttendanceRecord {
  attendanceId: number;
  studentId: number;
  enStatus: number;
  status: string;
  sessionId: number;
  sessionDate: string;
  sessionStartTime: string;
  sessionEndTime: string;
  sessionScheduleId: number;
  sessionType: string;
  scheduledDay: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  roomId: number;
  roomName: string;
  roomLocation: string;
}
