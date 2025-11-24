import { SessionsScheduleDTO } from "./types";
import { getAuthHeaders, getApiUrl } from "@/lib/api";

export async function fetchScheduleByAcademicYear(
  academicYearId: number
): Promise<SessionsScheduleDTO[]> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/SessionsSchedule/ByAcademiceYear?academiceYearID=${academicYearId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch schedule by academic year");
  }

  return res.json();
}
