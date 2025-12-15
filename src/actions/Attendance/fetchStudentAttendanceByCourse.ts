import { AttendanceRecord } from "./types";
import { getAuthHeaders, getApiUrl } from "@/lib/api";

export async function fetchStudentAttendanceByCourse(studentId: number, courseId: number): Promise<AttendanceRecord[]> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/Attendance/student/${studentId}/course/${courseId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    throw new Error("Failed to fetch student attendance by course");
  }

  return res.json();
}
