import { SessionsScheduleDTO } from "./types";
import { getAuthHeaders, getApiUrl } from "@/lib/api";

export async function fetchScheduleBySemester(
  semesterId: number
): Promise<SessionsScheduleDTO[]> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/SessionsSchedule/BySemester?semesterID=${semesterId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch schedule by semester");
  }

  return res.json();
}
